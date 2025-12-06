import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { Category } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CloudinaryService } from '../cloudinary';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Get()
  findAll(@Query('category') category?: Category) {
    return this.productsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = createProductDto.imageUrl;

    // If a file is uploaded, upload it to Cloudinary and use that URL
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file, 'psse-products');
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
    }

    // If no file uploaded and no imageUrl provided, throw error
    if (!imageUrl) {
      throw new BadRequestException('Either upload an image file or provide an imageUrl');
    }

    return this.productsService.create({
      ...createProductDto,
      imageUrl: imageUrl as string,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = updateProductDto.imageUrl;

    // If a file is uploaded, upload it to Cloudinary and use that URL
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file, 'psse-products');
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
    }

    return this.productsService.update(id, {
      ...updateProductDto,
      ...(imageUrl && { imageUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
