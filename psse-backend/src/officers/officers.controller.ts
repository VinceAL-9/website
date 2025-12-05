import { Controller, Get } from '@nestjs/common';
import { OfficersService } from './officers.service';

@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @Get()
  findAll() {
    return this.officersService.findAll();
  }
}
