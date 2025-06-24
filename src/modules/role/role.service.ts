import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/roles.entity';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { User } from '@modules/users/entities/user.entity';
import { Permissions } from '@modules/permission/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Create a new role
  async create(roleData: Partial<CreateRoleDto>, authUser: User): Promise<Role> {
    const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const permissions = await manager.find(Permissions, {
        where: { id: In(roleData.permissionIds ?? []) },
      });

      if (!permissions?.length) {
        throw new NotFoundException('Permissions not found.');
      }

      const role = manager.create(Role, {
        ...roleData,
        secondary: true,
      });
      role.permissions = permissions;

      const savedRole = await manager.save(role);
      await queryRunner.commitTransaction();
      return savedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // List all role
  async findAll(): Promise<Role[]> {
    const queryRunner = this.roleRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // get all roles
      const roles = await manager.find(Role);

      if (!roles) {
        throw new Error('Role not found');
      }

      // commit transaction
      await queryRunner.commitTransaction();

      return roles;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // Find by ID
  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }

  // Update role
  async update(id: number, roleData: Partial<UpdateRoleDto>, authUser: User): Promise<Role> {
    const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const permissions = await manager.find(Permissions, {
        where: { id: In(roleData.permissionIds ?? []) },
      });

      if (!permissions?.length) {
        throw new NotFoundException('Permissions not found.');
      }

      const role = await manager.findOne(Role, { where: { id } });
      if (!role) throw new NotFoundException('Role not found.');

      role.permissions = permissions;
      if (roleData.name !== undefined) {
        role.name = roleData.name;
      }
      if (roleData.description !== undefined) {
        role.description = roleData.description;
      }

      const savedRole = await manager.save(role);
      await queryRunner.commitTransaction();
      return savedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Delete role
  async remove(id: number): Promise<void> {
    const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const role = await manager.findOne(Role, { where: { id } });
      if (!role) throw new NotFoundException('Role not found.');

      const user = await manager.findOne(User, {
        where: { role: role },
      });

      if (user) {
        throw new BadRequestException('Role is assigned to a user. Cannot delete.');
      }

      await manager.softDelete(Role, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Assign all permissions to role
  async assignAllPermissionsToRole(roleId: number, permissionIds: number[]): Promise<Role> {
    const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    try {
      const role = await manager.findOne(Role, {
        where: { id: roleId },
        relations: ['permissions'],
      });
      if (!role) throw new NotFoundException('Role not found.');

      const allPermissions = await manager.find(Permissions, {
        where: { id: In(permissionIds) },
      });
      if (!allPermissions?.length) {
        throw new NotFoundException('Permissions not found.');
      }

      role.permissions = allPermissions;
      const savedRole = await manager.save(role);
      await queryRunner.commitTransaction();

      return savedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
