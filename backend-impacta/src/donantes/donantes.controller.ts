import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)

@Controller('donantes')
export class DonantesController {
  constructor(private readonly donantesService: DonantesService) {}

  @Post()
  create(@Body() createDonanteDto: CreateDonanteDto) {
    return this.donantesService.create(createDonanteDto);
  }

  @Get()
  findAll() {
    return this.donantesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donantesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDonanteDto: UpdateDonanteDto) {
    return this.donantesService.update(id, updateDonanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donantesService.remove(id);
  }
}