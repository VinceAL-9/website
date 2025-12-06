import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../prisma';
import { CloudinaryModule } from '../cloudinary';
import { AuthModule } from '../auth';

@Module({
  imports: [PrismaModule, CloudinaryModule, AuthModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
