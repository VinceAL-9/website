import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders - Public endpoint to create a new order
   * Creates an order with transactional stock management
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * GET /orders - Retrieve all orders
   */
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * GET /orders/:id - Retrieve a specific order by ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  /**
   * PATCH /orders/:id - Update order status (Admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
