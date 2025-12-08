import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { Order } from '@prisma/client';

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
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: { id: string }): Promise<Order> {
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
  findMyOrders(@CurrentUser() user: { id: string }) {
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
   * PATCH /orders/:id/upload-proof - Upload payment proof for an order
   * Accepts multipart/form-data with a 'file' field containing the image
   * Protected by JWT authentication
   */
  @Patch(':id/upload-proof')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Order> {
    // Validate that a file was provided
    if (!file) {
      throw new BadRequestException('Payment proof image file is required');
    }

    // Validate file is an image
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('File must be an image (jpg, jpeg, png, gif, or webp)');
    }

    return this.ordersService.uploadPaymentProof(id, file);
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
