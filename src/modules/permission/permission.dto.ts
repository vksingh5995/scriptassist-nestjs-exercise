import { IsInt, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ENUM
export enum AppName {
  MasterApp = 'MasterApp',
  TaskManagement = 'TaskManagement',
  MaterialManagement = 'MaterialManagement',
  VehicleManagement = 'VehicleManagement',
}

// Create DTO
export class CreatePermissionDto {
  @IsEnum(AppName)
  appName: AppName;

  @IsString()
  action: string;

  @IsString()
  module: string;

  @IsString()
  description: string;
}

// Update DTO (extends Create with `id`)
export class UpdatePermissionDto extends CreatePermissionDto {
  @IsInt()
  id: number;
}

// PERMISSION GROUP STRUCTURES

export class PermissionDto {
  @IsInt()
  id: number;

  @IsString()
  module: string;

  @IsString()
  action: string;

  @IsString()
  description: string;

  @IsString()
  slug: string;
}

export class PermissionGroupDto {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}

export class AppPermissionsDto {
  @IsString()
  appName: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionGroupDto)
  modules: PermissionGroupDto[];
}

export class DynamicPermissionsDto {
  @ValidateNested({ each: true })
  @Type(() => AppPermissionsDto)
  apps: AppPermissionsDto[];
}

// OPTIONAL - Hierarchical Grouping DTOs (no decorators needed for internal use)

export class Group {
  name: string;
  permissions: Permissions[];
}

export class Module {
  name: string;
  groups: Group[];
}

export class PermissionGroup {
  modules: Module[];
}
