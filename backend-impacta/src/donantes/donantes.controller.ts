import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)

@Controller('donantes')
export class DonantesController {
  constructor(private readonly donantesService: DonantesService) {}

  @Post()
  @RequirePermission({ section: 'donantes', action: 'agregar' })
  create(@Body() createDonanteDto: CreateDonanteDto) {
    return this.donantesService.create(createDonanteDto);
  }

  @Get()
  @RequirePermission(
    { section: 'donantes', action: 'consultar' },
    { section: 'donaciones', action: 'consultar' },
    { section: 'donaciones', action: 'agregar' },
    { section: 'donaciones', action: 'editar' },
  )
  findAll() {
    return this.donantesService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'donantes', action: 'consultar' },
    { section: 'donantes', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.donantesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'donantes', action: 'editar' })
  update(@Param('id') id: string, @Body() updateDonanteDto: UpdateDonanteDto) {
    return this.donantesService.update(id, updateDonanteDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.donantesService.remove(id);
  }
}