import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonacionesService } from './donaciones.service';
import { CreateDonacionDto } from './dto/create-donaciones.dto';
import { UpdateDonacionesDto } from './dto/update-donaciones.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

@Controller('donaciones')
export class DonacionesController {
  constructor(private readonly donacionesService: DonacionesService) {}

  @Post()
  create(@Body() createDonacionDto: CreateDonacionDto) {
    return this.donacionesService.create(createDonacionDto);
  }

  @Get()
  findAll() {
    return this.donacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donacionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDonacionDto: UpdateDonacionesDto) {
    return this.donacionesService.update(id, updateDonacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donacionesService.remove(id);
  }
}