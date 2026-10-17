import { SetMetadata } from '@nestjs/common';
import { RequiredPermission } from './permissions.types';

export const REQUIRED_PERMISSIONS = 'required-permissions';

export const RequirePermission = (...permissions: RequiredPermission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);
