import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Prisma, Order, OrderStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  /**
   * Generates a human-readable reference ID for orders
   * Format: ORD-YYYYMMDDHHMMSS-XXXX (where XXXX is 4 random alphanumeric chars)
   * Example: ORD-20251206143022-A7K9
   */
  private generateReferenceId(): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14); // YYYYMMDDHHmmss

    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    return `ORD-${timestamp}-${randomSuffix}`;
  }

  /**
   * Creates a new order with atomic transactional logic to prevent overselling.
   *
   * This method uses Prisma's $transaction to ensure:
   * 1. Stock is validated for each product
   * 2. Stock is IMMEDIATELY decremented atomically for each product (reserves stock)
   * 3. A unique human-readable referenceId is generated
   * 4. Order and OrderItem records are created
   * 5. If any step fails, the entire transaction rolls back (including stock changes)
   */
  async create(createOrderDto: CreateOrderDto, userId?: string) {
    const { customerName, studentId, contactNumber, customerEmail, items } = createOrderDto;

    // Generate unique reference ID for this order
    const referenceId = this.generateReferenceId();

    // Use an atomic transaction to handle the complex order creation
    return this.prisma.$transaction(async (tx) => {
      // Array to store order items data for the final order creation
      const orderItemsData: {
        productId: string;
        quantity: number;
        priceAtTime: Prisma.Decimal;
      }[] = [];

      // Variable to accumulate the total order amount
      let totalAmount = new Prisma.Decimal(0);

      // Step 1: Iterate through each item to validate, process, and RESERVE stock
      for (const item of items) {
        // Step 2: Fetch the product to check stock availability and get current price
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Validate that the product exists
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        // Step 3: Validate sufficient stock is available
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Product "${product.name}" is out of stock. ` +
            `Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        // Step 4: CRITICAL - Immediately decrement stock to RESERVE it
        // This prevents race conditions where multiple users order the last item
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Safety check: Ensure stock didn't go negative (shouldn't happen due to above check,
        // but handles concurrent edge cases where Prisma constraint might not catch it)
        if (updatedProduct.stock < 0) {
          throw new BadRequestException(
            `Product "${product.name}" is out of stock. Unable to reserve requested quantity.`
          );
        }

        // Calculate the subtotal for this item (price * quantity)
        const itemTotal = product.price.mul(item.quantity);
        totalAmount = totalAmount.add(itemTotal);

        // Store the order item data for later creation
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: product.price, // Capture the price at the time of order
        });
      }

      // Step 5: Create the Order with referenceId and all OrderItems
      // Status is explicitly set to AWAITING_PAYMENT for new orders
      const order = await tx.order.create({
        data: {
          referenceId,
          // Connect to user using Prisma relation syntax
          user: {
            connect: { id: userId },
          },
          customerName,
          studentId,
          contactNumber,
          customerEmail,
          totalAmount,
          status: OrderStatus.AWAITING_PAYMENT,
          // Create all order items in a single nested write
          orderItems: {
            create: orderItemsData,
          },
        },
        // Include order items with product details in the response
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return order;
    });
  }

  /**
   * Retrieves all orders with their associated items.
   */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Retrieves a single order by ID.
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Updates an order's status.
   * Stock is already decremented at order creation, so:
   * - COMPLETED: No stock changes needed (already reserved)
   * - CANCELLED/REJECTED: Restore (increment) the stock back to the products
   * COMPLETED and CANCELLED statuses are final and cannot be changed.
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // Verify the order exists and get current data including items
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Prevent status changes from COMPLETED or CANCELLED (these are final statuses)
    if (
      existingOrder.status === OrderStatus.COMPLETED ||
      existingOrder.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot update order with status '${existingOrder.status}'. This status is final.`
      );
    }

    // Check if status is being changed to a final status (COMPLETED or CANCELLED)
    const isCompletingOrder = updateOrderDto.status === OrderStatus.COMPLETED;
    const isCancellingOrder = updateOrderDto.status === OrderStatus.CANCELLED;
    // Check for REJECTED status if it exists in your OrderStatus enum
    const isRejectingOrder = (updateOrderDto.status as string) === 'REJECTED';
    const shouldRestoreStock = isCancellingOrder || isRejectingOrder;

    // Helper function to delete payment proof from Cloudinary (if exists)
    // Note: We keep the URL in the database for record-keeping
    const deletePaymentProofFromCloudinary = async () => {
      if (existingOrder.paymentProofUrl) {
        try {
          await this.cloudinaryService.deleteImage(existingOrder.paymentProofUrl);
        } catch (error) {
          // Log but don't fail the operation if Cloudinary deletion fails
          console.error('Failed to delete payment proof from Cloudinary:', error);
        }
      }
    };

    // If completing the order, just update the status (stock already reserved at creation)
    if (isCompletingOrder) {
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      // Delete payment proof from Cloudinary after successful update
      await deletePaymentProofFromCloudinary();

      return updatedOrder;
    }

    // If cancelling or rejecting the order, RESTORE stock in a transaction
    if (shouldRestoreStock) {
      return this.prisma.$transaction(async (tx) => {
        // Restore stock for each order item
        for (const item of existingOrder.orderItems) {
          // Check if the product still exists before trying to restock
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          // Only restore stock if product still exists (handle deleted products gracefully)
          if (product) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            // Log warning but don't fail - product may have been deleted
            console.warn(
              `Product with ID ${item.productId} no longer exists. ` +
              `Cannot restore ${item.quantity} units of stock.`
            );
          }
        }

        // Update the order status
        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateOrderDto,
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        });

        return updatedOrder;
      }).then(async (updatedOrder) => {
        // Delete payment proof from Cloudinary after successful transaction
        // (done outside transaction as it's an external service)
        await deletePaymentProofFromCloudinary();
        return updatedOrder;
      });
    }

    // For non-final status changes, just update the order
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves all orders for a specific user (transaction history).
   */
  async findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { user: { id: userId } },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Uploads a payment proof image for an order.
   * 
   * @param orderId - The ID of the order to upload payment proof for
   * @param file - The Express Multer file containing the image
   * @returns The updated Order record with paymentProofUrl set
   * @throws NotFoundException if the order does not exist
   * @throws BadRequestException if the image upload fails
   */
  async uploadPaymentProof(orderId: string, file: Express.Multer.File): Promise<Order> {
    // Step 1: Find the order by ID
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    // Throw NotFoundException if order doesn't exist
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Step 2: Upload the image to Cloudinary
    let paymentProofUrl: string;
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(file, 'psse-payment-proofs');
      paymentProofUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('Failed to upload payment proof image to Cloudinary');
    }

    // Step 3: Update the Order record with the payment proof URL
    // Status remains AWAITING_PAYMENT (or is explicitly set to ensure consistency)
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl,
        status: OrderStatus.AWAITING_PAYMENT,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Allows a user to cancel their own order.
   * 
   * Conditions for cancellation:
   * 1. Order must exist
   * 2. Order must belong to the requesting user
   * 3. Order must not have a payment proof uploaded
   * 4. Order must not already be in a final status (COMPLETED/CANCELLED)
   * 
   * Upon cancellation, stock is restored for all order items.
   * 
   * @param orderId - The ID of the order to cancel
   * @param userId - The ID of the user requesting cancellation
   * @returns The updated Order with status CANCELLED
   * @throws NotFoundException if the order does not exist
   * @throws BadRequestException if cancellation conditions are not met
   */
  async cancelOrderByUser(orderId: string, userId: string): Promise<Order> {
    // Step 1: Find the order with its items
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    // Verify order exists
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Step 2: Verify the order belongs to the current user
    if (existingOrder.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    // Step 3: Check if order is already in a final status
    if (
      existingOrder.status === OrderStatus.COMPLETED ||
      existingOrder.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status '${existingOrder.status}'. This status is final.`
      );
    }

    // Step 4: Check if payment proof has been uploaded
    if (existingOrder.paymentProofUrl) {
      throw new BadRequestException(
        'Cannot cancel order after payment proof has been submitted. Please contact support.'
      );
    }

    // Step 5: Cancel the order and restore stock in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Restore stock for each order item
      for (const item of existingOrder.orderItems) {
        // Check if the product still exists before trying to restock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Only restore stock if product still exists
        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        } else {
          // Log warning but don't fail - product may have been deleted
          console.warn(
            `Product with ID ${item.productId} no longer exists. ` +
            `Cannot restore ${item.quantity} units of stock.`
          );
        }
      }

      // Update the order status to CANCELLED
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return cancelledOrder;
    });
  }
}

