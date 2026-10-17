import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonacionesService } from './donaciones.service';
import { CreateDonacionDto } from './dto/create-donaciones.dto';
import { UpdateDonacionesDto } from './dto/update-donaciones.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)

@Controller('donaciones')
export class DonacionesController {
  constructor(private readonly donacionesService: DonacionesService) {}

  @Post()
  @RequirePermission({ section: 'donaciones', action: 'agregar' })
  create(@Body() createDonacionDto: CreateDonacionDto) {
    return this.donacionesService.create(createDonacionDto);
  }

  @Get()
  @RequirePermission(
    { section: 'donaciones', action: 'consultar' },
    { section: 'inventario', action: 'consultar' },
    { section: 'inventario', action: 'agregar' },
    { section: 'inventario', action: 'editar' },
  )
  findAll() {
    return this.donacionesService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'donaciones', action: 'consultar' },
    { section: 'donaciones', action: 'editar' },
    { section: 'inventario', action: 'consultar' },
    { section: 'inventario', action: 'agregar' },
    { section: 'inventario', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.donacionesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'donaciones', action: 'editar' })
  update(@Param('id') id: string, @Body() updateDonacionDto: UpdateDonacionesDto) {
    return this.donacionesService.update(id, updateDonacionDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.donacionesService.remove(id);
  }
}