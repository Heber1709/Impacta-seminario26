import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import {
  REQUIRED_PERMISSIONS,
} from './require-permission.decorator';
import { RequiredPermission } from './permissions.types';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    rol: string;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<RequiredPermission[]>(
        REQUIRED_PERMISSIONS,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (required.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No fue posible identificar al usuario.');
    }

    if (user.rol === 'ADMINISTRADOR') {
      return true;
    }

    const usuario = await this.dataSource.getRepository(Usuario).findOne({
      where: { id: user.sub, estado: true },
      select: { id: true, permisos: true },
    });

    if (
      !usuario ||
      !required.some(
        ({ section, action }) =>
          usuario.permisos?.[section]?.[action] === true,
      )
    ) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta operación.',
      );
    }

    return true;
  }
}
