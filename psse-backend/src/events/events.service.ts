import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({
      orderBy: {
        date: 'desc',
      },
    });
  }
}
