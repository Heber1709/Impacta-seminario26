import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampanasService } from './campanas.service';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)

@Controller('campanas')
export class CampanasController {
  constructor(private readonly campanasService: CampanasService) {}

  @Post()
  @RequirePermission({ section: 'campanas', action: 'agregar' })
  create(@Body() createCampanaDto: CreateCampanaDto) {
    return this.campanasService.create(createCampanaDto);
  }

  @Get()
  @RequirePermission({ section: 'campanas', action: 'consultar' })
  findAll() {
    return this.campanasService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'campanas', action: 'consultar' },
    { section: 'campanas', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.campanasService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'campanas', action: 'editar' })
  update(@Param('id') id: string, @Body() updateCampanaDto: UpdateCampanaDto) {
    return this.campanasService.update(id, updateCampanaDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.campanasService.remove(id);
  }
}