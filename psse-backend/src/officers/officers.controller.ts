import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OfficersService } from './officers.service';
import { CreateOfficerDto, UpdateOfficerDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @Get()
  findAll() {
    return this.officersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.officersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createOfficerDto: CreateOfficerDto) {
    return this.officersService.create(createOfficerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOfficerDto: UpdateOfficerDto) {
    return this.officersService.update(id, updateOfficerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.officersService.remove(id);
  }
}
