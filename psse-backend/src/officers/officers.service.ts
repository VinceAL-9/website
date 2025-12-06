import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOfficerDto, UpdateOfficerDto } from './dto';

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

  async findOne(id: number) {
    const officer = await this.prisma.officer.findUnique({
      where: { id },
    });

    if (!officer) {
      throw new NotFoundException(`Officer with ID ${id} not found`);
    }

    return officer;
  }

  async create(createOfficerDto: CreateOfficerDto) {
    return this.prisma.officer.create({
      data: {
        name: createOfficerDto.name,
        position: createOfficerDto.position,
        category: createOfficerDto.category,
        photoUrl: createOfficerDto.photoUrl || '',
        academicYear: createOfficerDto.academicYear,
        order: createOfficerDto.order,
      },
    });
  }

  async update(id: number, updateOfficerDto: UpdateOfficerDto) {
    await this.findOne(id);

    return this.prisma.officer.update({
      where: { id },
      data: updateOfficerDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.officer.delete({
      where: { id },
    });
  }
}
