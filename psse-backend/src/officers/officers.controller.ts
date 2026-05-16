import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OfficersService } from './officers.service';
import { CreateOfficerDto, UpdateOfficerDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CloudinaryService } from '../cloudinary';
import 'multer';

@Controller('officers')
export class OfficersController {
  constructor(
    private readonly officersService: OfficersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.officersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createOfficerDto: CreateOfficerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let photoUrl = createOfficerDto.photoUrl;

    // If a file is uploaded, validate and upload it to Cloudinary
    if (file) {
      // Validate file is an image
      const validImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!validImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'File must be an image (jpg, jpeg, png, or gif)',
        );
      }

      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'psse-officers',
        );
        photoUrl = uploadResult.secure_url;
      } catch {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
    }

    // If no file uploaded and no photoUrl provided, use placeholder
    if (!photoUrl) {
      photoUrl = 'https://via.placeholder.com/150';
    }

    return this.officersService.create({
      ...createOfficerDto,
      photoUrl,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id') id: string,
    @Body() updateOfficerDto: UpdateOfficerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let photoUrl = updateOfficerDto.photoUrl;

    // If a file is uploaded, validate and upload it to Cloudinary
    if (file) {
      // Validate file is an image
      const validImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!validImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'File must be an image (jpg, jpeg, png, or gif)',
        );
      }

      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          file,
          'psse-officers',
        );
        photoUrl = uploadResult.secure_url;
      } catch {
        throw new BadRequestException('Failed to upload image to Cloudinary');
      }
    }

    return this.officersService.update(id, {
      ...updateOfficerDto,
      ...(photoUrl && { photoUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.officersService.remove(id);
  }
}
