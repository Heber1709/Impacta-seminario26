import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogosService } from './catalogos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@ApiTags('Catálogos de ubicación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('departamentos')
  findDepartamentos() {
    return this.catalogosService.findDepartamentos();
  }

  @Post('departamentos')
  createDepartamento(@Body() dto: CreateDepartamentoDto) {
    return this.catalogosService.createDepartamento(dto);
  }

  @Patch('departamentos/:codigo')
  updateDepartamento(
    @Param('codigo') codigo: string,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.catalogosService.updateDepartamento(codigo, dto);
  }

  @Delete('departamentos/:codigo')
  removeDepartamento(@Param('codigo') codigo: string) {
    return this.catalogosService.removeDepartamento(codigo);
  }

  @Get('municipios')
  findMunicipios(@Query('codigo_departamento') codigoDepartamento?: string) {
    return this.catalogosService.findMunicipios(codigoDepartamento);
  }

  @Post('municipios')
  createMunicipio(@Body() dto: CreateMunicipioDto) {
    return this.catalogosService.createMunicipio(dto);
  }

  @Patch('municipios/:codigo')
  updateMunicipio(
    @Param('codigo') codigo: string,
    @Body() dto: UpdateMunicipioDto,
  ) {
    return this.catalogosService.updateMunicipio(codigo, dto);
  }

  @Delete('municipios/:codigo')
  removeMunicipio(@Param('codigo') codigo: string) {
    return this.catalogosService.removeMunicipio(codigo);
  }
}
