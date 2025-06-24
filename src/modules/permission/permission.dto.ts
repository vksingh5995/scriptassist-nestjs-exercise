import { IsInt, IsOptional, IsString } from 'class-validator';
import { Permissions } from './entities/permission.entity';

// DTO for creating a permission
export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  permissionGroup: string;

  @IsString()
  module: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// DTO for updating a permission
export class UpdatePermissionDto extends CreatePermissionDto {
  @IsInt()
  id: number;
}

// Types for grouping permissions (used for response shaping or service logic)
export class PermissionGroup {
  modules: Module[];
}

export class Module {
  name: string;
  groups: Group[];
}

export class Group {
  name: string;
  permissions: Permissions[];
}
