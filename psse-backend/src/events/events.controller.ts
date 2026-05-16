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
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CloudinaryService } from '../cloudinary';
import 'multer';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@Query('isUpcoming') isUpcoming?: string) {
    // Convert query string to boolean
    const isUpcomingBool =
      isUpcoming === 'true' ? true : isUpcoming === 'false' ? false : undefined;
    return this.eventsService.findAll(isUpcomingBool);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = createEventDto.imageUrl;

    // If a file is uploaded, upload it to Cloudinary and use that URL
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'psse-events',
        );
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        const uploadError =
          err instanceof Error ? err : new Error('Cloudinary upload failed');
        throw new BadRequestException(uploadError.message);
      }
    }

    // If no file uploaded and no imageUrl provided, throw error
    if (!imageUrl) {
      throw new BadRequestException(
        'Either upload an image file or provide an imageUrl',
      );
    }

    return this.eventsService.create({
      ...createEventDto,
      imageUrl,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = updateEventDto.imageUrl;

    // If a file is uploaded, upload it to Cloudinary and use that URL
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'psse-events',
        );
        imageUrl = uploadResult.secure_url;
      } catch {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
    }

    return this.eventsService.update(id, {
      ...updateEventDto,
      ...(imageUrl && { imageUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
