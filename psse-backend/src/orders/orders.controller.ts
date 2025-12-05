import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';

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
}
