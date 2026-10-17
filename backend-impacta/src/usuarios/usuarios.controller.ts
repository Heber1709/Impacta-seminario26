
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { UpdatePermisosDto } from './dto/update-permisos.dto';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    rol: string;
  };
}

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  findMe(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.findOne(req.user.sub);
  }

  @Patch('me')
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.usuariosService.update(req.user.sub, {
      nombre: dto.nombre,
    });
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission({ section: 'usuarios', action: 'consultar' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Get(':id/permisos')
  @UseGuards(AdminGuard)
  findPermissions(@Param('id') id: string) {
    return this.usuariosService.findPermissions(id);
  }

  @Patch(':id/permisos')
  @UseGuards(AdminGuard)
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermisosDto,
  ) {
    return this.usuariosService.updatePermissions(id, dto.permisos);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
