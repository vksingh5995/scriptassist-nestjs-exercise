import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, PermissionGroup, UpdatePermissionDto } from './permission.dto';
import { Permissions as AppPermissions } from './entities/permission.entity';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // GET /permissions/all
  @Get('all')
  async getAllPermissions(): Promise<AppPermissions[]> {
    return await this.permissionService.findAll();
  }

  // POST /permissions
  async createPermission(@Body() data: CreatePermissionDto): Promise<AppPermissions> {
    return await this.permissionService.create(data);
  }

  // GET /permissions/:id
  @Get(':id')
  async getPermissionById(@Param('id') id: number): Promise<AppPermissions> {
    const permission = await this.permissionService.findById(id);
    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }
    return permission;
  }

  @Put(':id')
  async updatePermission(
    @Param('id') id: number,
    @Body() data: UpdatePermissionDto,
  ): Promise<AppPermissions> {
    return await this.permissionService.update(id, data);
  }

  // DELETE /permissions/:id
  @Delete(':id')
  async deletePermission(@Param('id') id: number): Promise<boolean> {
    await this.permissionService.remove(id);
    return true;
  }

  // GET /permissions/grouped
  @Get('grouped')
  async getGroupedPermissions(): Promise<PermissionGroup> {
    return await this.permissionService.groupByPermission();
  }
}
