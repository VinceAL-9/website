import { Module } from '@nestjs/common';
import { OfficersService } from './officers.service';
import { OfficersController } from './officers.controller';
import { PrismaModule } from '../prisma';
import { AuthModule } from '../auth';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OfficersController],
  providers: [OfficersService],
})
export class OfficersModule {}
