import { IsObject } from 'class-validator';
import type { UserPermissions } from '../../permissions/permissions.types';

export class UpdatePermisosDto {
  @IsObject()
  permisos: UserPermissions;
}
