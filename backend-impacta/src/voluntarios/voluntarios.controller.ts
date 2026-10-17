import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { VoluntariosService } from './voluntarios.service';

@ApiTags('Voluntarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('voluntarios')
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Post()
  create(@Body() createVoluntarioDto: CreateVoluntarioDto) {
    return this.voluntariosService.create(createVoluntarioDto);
  }

  @Get()
  findAll() {
    return this.voluntariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voluntariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVoluntarioDto: UpdateVoluntarioDto,
  ) {
    return this.voluntariosService.update(id, updateVoluntarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voluntariosService.remove(id);
  }
}
