import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma';
import { AuthModule } from '../auth';
import { CloudinaryModule } from '../cloudinary';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
