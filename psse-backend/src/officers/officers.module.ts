import { Module } from '@nestjs/common';
import { OfficersService } from './officers.service';
import { OfficersController } from './officers.controller';
import { PrismaModule } from '../prisma';
import { AuthModule } from '../auth';
import { CloudinaryModule } from '../cloudinary';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [OfficersController],
  providers: [OfficersService],
})
export class OfficersModule {}
