import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class OfficersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.officer.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }
}
