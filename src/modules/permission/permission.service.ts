import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Permissions } from './entities/permission.entity';
import {
  CreatePermissionDto,
  Group,
  Module,
  PermissionGroup,
  UpdatePermissionDto,
} from './permission.dto';

@Injectable()
export class PermissionService {
  // Inject the Permission repository
  constructor(
    @InjectRepository(Permissions)
    private permissionRepository: Repository<Permissions>,
  ) {}

  // Create a new Permission
  async create(permissionData: Partial<CreatePermissionDto>): Promise<Permissions> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // create permission instance
      const permission = manager.create(Permissions, permissionData);

      // save permission & return
      const savedPermission = await manager.save(permission);

      // commit transaction
      await queryRunner.commitTransaction();

      return savedPermission;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // List all Permission
  async findAll(): Promise<Permissions[]> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // get all permissions
      const permissions = await manager.find(Permissions);

      if (!permissions) {
        throw new Error('Permission not found');
      }

      // commit transaction
      await queryRunner.commitTransaction();

      return permissions;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // Find a Permission by ID
  async findById(id: number): Promise<Permissions | undefined> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // get permission
      const permission = await manager.findOne(Permissions, {
        where: { id: id ?? null },
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      // commit transaction
      await queryRunner.commitTransaction();

      return permission;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // Update a Permission
  async update(id: number, permissionData: Partial<UpdatePermissionDto>): Promise<Permissions> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      const permission = await manager.findOne(Permissions, {
        where: { id: id ?? null },
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      // update permission
      await manager.update(Permissions, id, {
        ...permissionData,
        slug: slugify(
          `${permissionData.module}:${permissionData.permissionGroup}:${permissionData.name}`,
          { lower: true },
        ),
      });

      // commit transaction
      await queryRunner.commitTransaction();

      return permission;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // Find a Permission by Slug
  async findPermissionBySlug(slug: string): Promise<Permissions> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // get permission
      const permission = await manager.findOne(Permissions, {
        where: { slug: slug ?? null },
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      // commit transaction
      await queryRunner.commitTransaction();

      return permission;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // Delete a Permission
  async remove(id: number): Promise<void> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    // connect to the database
    await queryRunner.connect();
    // start transaction
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    // try-catch-finally block
    try {
      // delete permission
      await manager.softDelete(Permissions, id);

      // commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // release queryRunner
      await queryRunner.release();
    }
  }

  // group by permission
  async groupByPermission(): Promise<PermissionGroup> {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const permissions = await manager.find(Permissions);

      if (!permissions || permissions.length === 0) {
        throw new Error('No permissions found');
      }

      const moduleMap: Map<string, Map<string, Permissions[]>> = new Map();

      // Organize permissions into module -> group -> list
      for (const permission of permissions) {
        if (!moduleMap.has(permission.module)) {
          moduleMap.set(permission.module, new Map());
        }

        const groupMap = moduleMap.get(permission.module)!;

        if (!groupMap.has(permission.permissionGroup)) {
          groupMap.set(permission.permissionGroup, []);
        }

        groupMap.get(permission.permissionGroup)!.push(permission);
      }

      // Build final structured response
      const modules: Module[] = [];

      for (const [moduleName, groupMap] of moduleMap.entries()) {
        const groups: Group[] = [];

        for (const [groupName, perms] of groupMap.entries()) {
          groups.push({
            name: groupName,
            permissions: perms,
          });
        }

        modules.push({
          name: moduleName,
          groups,
        });
      }

      await queryRunner.commitTransaction();

      return { modules }; // conforms to PermissionGroup DTO
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
