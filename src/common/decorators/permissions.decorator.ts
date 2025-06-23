import { SetMetadata } from '@nestjs/common';
import { PermissionKeys } from '../const/PermissionConst';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionKeys[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
