import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

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

        // Step 3: Validate sufficient stock is available
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Product "${product.name}" is out of stock. ` +
            `Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        // Step 4: Decrement the product stock atomically within the transaction
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

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
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // Verify the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

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
}
