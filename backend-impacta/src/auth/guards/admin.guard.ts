import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    rol: string;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const usuario = request.user;

    if (!usuario || usuario.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'No tienes permisos de administrador para realizar esta operación.',
      );
    }

    return true;
  }
}
