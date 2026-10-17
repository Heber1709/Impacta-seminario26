import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { CreateEntregaDto } from './dto/create-entregas.dto';
import { UpdateEntregasDto } from './dto/update-entregas.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';
import { UseGuards } from '@nestjs/common';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)

@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Post()
  @RequirePermission({ section: 'beneficiarios', action: 'agregar' })
  create(@Body() createEntregaDto: CreateEntregaDto) {
    return this.entregasService.create(createEntregaDto);
  }

  @Get()
  @RequirePermission({ section: 'beneficiarios', action: 'consultar' })
  findAll() {
    return this.entregasService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'beneficiarios', action: 'consultar' },
    { section: 'beneficiarios', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.entregasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'beneficiarios', action: 'editar' })
  update(@Param('id') id: string, @Body() updateEntregaDto: UpdateEntregasDto) {
    return this.entregasService.update(id, updateEntregaDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.entregasService.remove(id);
  }
}