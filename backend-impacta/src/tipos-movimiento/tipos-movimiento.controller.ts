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
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';
import { CreateTipoMovimientoDto } from './dto/create-tipo-movimiento.dto';
import { UpdateTipoMovimientoDto } from './dto/update-tipo-movimiento.dto';
import { TiposMovimientoService } from './tipos-movimiento.service';

@ApiTags('Tipos de movimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tipos-movimiento')
export class TiposMovimientoController {
  constructor(private readonly service: TiposMovimientoService) {}

  @Post()
  @RequirePermission({ section: 'tipos_movimiento', action: 'agregar' })
  create(@Body() dto: CreateTipoMovimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermission(
    { section: 'tipos_movimiento', action: 'consultar' },
    { section: 'inventario', action: 'consultar' },
  )
  findAll() {
    return this.service.findAll();
  }

  @Get(':codigo')
  @RequirePermission(
    { section: 'tipos_movimiento', action: 'consultar' },
    { section: 'tipos_movimiento', action: 'editar' },
  )
  findOne(@Param('codigo') codigo: string) {
    return this.service.findOne(codigo);
  }

  @Patch(':codigo')
  @RequirePermission({ section: 'tipos_movimiento', action: 'editar' })
  update(
    @Param('codigo') codigo: string,
    @Body() dto: UpdateTipoMovimientoDto,
  ) {
    return this.service.update(codigo, dto);
  }

  @Delete(':codigo')
  @UseGuards(AdminGuard)
  remove(@Param('codigo') codigo: string) {
    return this.service.remove(codigo);
  }
}
