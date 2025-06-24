import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { User } from '@modules/users/entities/user.entity';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Role } from './entities/roles.entity';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('list')
  async getAllPermissions(): Promise<Role[]> {
    return await this.roleService.findAll();
  }

  @Post()
  @Permissions('MasterApp:User:Create')
  async createRole(@Body() data: CreateRoleDto, @CurrentUser() user: User) {
    return await this.roleService.create(data, user);
  }

  @Get(':id')
  @Permissions('MasterApp:Role:Read')
  async getRoleById(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.roleService.findById(id);
  }

  @Patch()
  @Permissions('MasterApp:Role:Update')
  async updateRole(
    @Param('id') id: number,
    @Body() data: UpdateRoleDto,
    @CurrentUser() user: User,
  ) {
    return await this.roleService.update(id, data, user);
  }

  @Delete()
  @Permissions('MasterApp:Role:Delete')
  async deleteRoles(@Body('ids') id: number) {
    await this.roleService.remove(id);
    return { success: true };
  }

  @Post('assign-permissions')
  async assignPermissionsToRole(@Body() body: { roleId: number; permissionIds: number[] }) {
    return await this.roleService.assignAllPermissionsToRole(body.roleId, body.permissionIds);
  }
}
