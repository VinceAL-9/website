import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CloudinaryService } from '../cloudinary';
import { CreateEventDto, UpdateEventDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(isUpcoming?: boolean) {
    const where: Prisma.EventWhereInput = {};

    if (isUpcoming !== undefined) {
      where.isUpcoming = isUpcoming;
    }

    return this.prisma.event.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto & { imageUrl: string }) {
    return this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        date: new Date(createEventDto.date),
        location: createEventDto.location,
        imageUrl: createEventDto.imageUrl,
        isUpcoming: createEventDto.isUpcoming ?? true,
      },
    });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.findOne(id);

    // If a new imageUrl is provided and it's different from the existing one,
    // delete the old image from Cloudinary
    if (
      updateEventDto.imageUrl &&
      updateEventDto.imageUrl !== existingEvent.imageUrl
    ) {
      try {
        await this.cloudinaryService.deleteImage(existingEvent.imageUrl);
      } catch (error) {
        console.error('Failed to delete old image from Cloudinary:', error);
        // Continue with update even if deletion fails
      }
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        date: updateEventDto.date ? new Date(updateEventDto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    const event = await this.findOne(id);

    // Delete the image from Cloudinary before removing the event
    if (event.imageUrl) {
      try {
        await this.cloudinaryService.deleteImage(event.imageUrl);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }
}
