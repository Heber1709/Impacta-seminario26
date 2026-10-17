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
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';
import { CatalogosService } from './catalogos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@ApiTags('Catálogos de ubicación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('departamentos')
  @RequirePermission(
    { section: 'departamentos', action: 'consultar' },
    { section: 'departamentos', action: 'agregar' },
    { section: 'departamentos', action: 'editar' },
    { section: 'beneficiarios', action: 'consultar' },
    { section: 'beneficiarios', action: 'agregar' },
    { section: 'beneficiarios', action: 'editar' },
    { section: 'voluntarios', action: 'consultar' },
    { section: 'voluntarios', action: 'agregar' },
    { section: 'voluntarios', action: 'editar' },
    { section: 'municipios', action: 'consultar' },
    { section: 'municipios', action: 'agregar' },
    { section: 'municipios', action: 'editar' },
  )
  findDepartamentos() {
    return this.catalogosService.findDepartamentos();
  }

  @Post('departamentos')
  @RequirePermission({ section: 'departamentos', action: 'agregar' })
  createDepartamento(@Body() dto: CreateDepartamentoDto) {
    return this.catalogosService.createDepartamento(dto);
  }

  @Patch('departamentos/:codigo')
  @RequirePermission({ section: 'departamentos', action: 'editar' })
  updateDepartamento(
    @Param('codigo') codigo: string,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.catalogosService.updateDepartamento(codigo, dto);
  }

  @Delete('departamentos/:codigo')
  @UseGuards(AdminGuard)
  removeDepartamento(@Param('codigo') codigo: string) {
    return this.catalogosService.removeDepartamento(codigo);
  }

  @Get('municipios')
  @RequirePermission(
    { section: 'municipios', action: 'consultar' },
    { section: 'beneficiarios', action: 'consultar' },
    { section: 'beneficiarios', action: 'agregar' },
    { section: 'beneficiarios', action: 'editar' },
    { section: 'voluntarios', action: 'consultar' },
    { section: 'voluntarios', action: 'agregar' },
    { section: 'voluntarios', action: 'editar' },
  )
  findMunicipios(@Query('codigo_departamento') codigoDepartamento?: string) {
    return this.catalogosService.findMunicipios(codigoDepartamento);
  }

  @Post('municipios')
  @RequirePermission({ section: 'municipios', action: 'agregar' })
  createMunicipio(@Body() dto: CreateMunicipioDto) {
    return this.catalogosService.createMunicipio(dto);
  }

  @Patch('municipios/:codigo')
  @RequirePermission({ section: 'municipios', action: 'editar' })
  updateMunicipio(
    @Param('codigo') codigo: string,
    @Body() dto: UpdateMunicipioDto,
  ) {
    return this.catalogosService.updateMunicipio(codigo, dto);
  }

  @Delete('municipios/:codigo')
  @UseGuards(AdminGuard)
  removeMunicipio(@Param('codigo') codigo: string) {
    return this.catalogosService.removeMunicipio(codigo);
  }
}
