import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../prisma';
import { CloudinaryModule } from '../cloudinary';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
