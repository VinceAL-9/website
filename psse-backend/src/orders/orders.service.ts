import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOrderDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new order with transactional logic to prevent overselling.
   *
   * This method uses Prisma's interactive transaction to ensure:
   * 1. Stock is checked and decremented atomically for each product
   * 2. All order items are created within the same transaction
   * 3. If any item fails (e.g., insufficient stock), the entire transaction rolls back
   */
  async create(createOrderDto: CreateOrderDto) {
    const { customerName, studentId, contactNumber, customerEmail, items } = createOrderDto;

    // Use an interactive transaction to handle the complex order creation
    return this.prisma.$transaction(async (tx) => {
      // Array to store created order items data for the final order creation
      const orderItemsData: {
        productId: number;
        quantity: number;
        priceAtTime: Prisma.Decimal;
      }[] = [];

      // Variable to accumulate the total order amount
      let totalAmount = new Prisma.Decimal(0);

      // Step 1: Iterate through each item in the order
      for (const item of items) {
        // Step 2: Fetch the product to check availability and get current price
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // Validate that the product exists
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        // Step 3: Check if sufficient stock is available
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". ` +
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

      // Step 5: Create the parent Order record with all OrderItems connected
      const order = await tx.order.create({
        data: {
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
  async findOne(id: number) {
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
}
