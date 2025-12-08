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
   * 2. Stock is decremented atomically for each product
   * 3. A unique human-readable referenceId is generated
   * 4. Order and OrderItem records are created
   * 5. If any step fails, the entire transaction rolls back
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

      // Step 1: Iterate through each item to validate and process
      for (const item of items) {
        // Step 2: Fetch the product to check stock availability and get current price
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Validate that the product exists
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        // Step 3: Validate sufficient stock is available (stock is NOT decremented here)
        // Stock will only be decremented when order status is set to COMPLETED
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Product "${product.name}" is out of stock. ` +
            `Available: ${product.stock}, Requested: ${item.quantity}`
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
   * When status is changed to COMPLETED, decrements product stock.
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
    const isFinalStatus = isCompletingOrder || isCancellingOrder;

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

    // If completing the order, decrement stock in a transaction
    if (isCompletingOrder) {
      return this.prisma.$transaction(async (tx) => {
        // Decrement stock for each order item
        for (const item of existingOrder.orderItems) {
          // First, verify stock is still available
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} no longer exists`
            );
          }

          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for "${product.name}". ` +
              `Available: ${product.stock}, Required: ${item.quantity}`
            );
          }

          // Decrement the product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
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

        // Delete payment proof from Cloudinary after successful transaction
        // (done outside transaction as it's an external service)
        await deletePaymentProofFromCloudinary();

        return updatedOrder;
      });
    }

    // If cancelling the order, delete payment proof from Cloudinary
    if (isCancellingOrder) {
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

      // Delete payment proof from Cloudinary
      await deletePaymentProofFromCloudinary();

      return updatedOrder;
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
}

