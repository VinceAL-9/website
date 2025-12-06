import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  /**
   * POST /orders - Create a new order (requires authentication)
   * Creates an order with transactional stock management
   * The userId is extracted from the JWT token
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  /**
   * GET /orders - Retrieve all orders
   */
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * GET /orders/mine - Get all orders for the authenticated user
   * Returns transaction history for the logged-in user
   * NOTE: This route MUST be defined before /:id to avoid "mine" being treated as an ID
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findByUserId(user.id);
  }

  /**
   * GET /orders/:id - Retrieve a specific order by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  /**
   * PATCH /orders/:id - Update order status (Admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
