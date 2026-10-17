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
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { VoluntariosService } from './voluntarios.service';

@ApiTags('Voluntarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('voluntarios')
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Post()
  @RequirePermission({ section: 'voluntarios', action: 'agregar' })
  create(@Body() createVoluntarioDto: CreateVoluntarioDto) {
    return this.voluntariosService.create(createVoluntarioDto);
  }

  @Get()
  @RequirePermission({ section: 'voluntarios', action: 'consultar' })
  findAll() {
    return this.voluntariosService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'voluntarios', action: 'consultar' },
    { section: 'voluntarios', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.voluntariosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'voluntarios', action: 'editar' })
  update(
    @Param('id') id: string,
    @Body() updateVoluntarioDto: UpdateVoluntarioDto,
  ) {
    return this.voluntariosService.update(id, updateVoluntarioDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.voluntariosService.remove(id);
  }
}
