import { ErrorCodes } from '@/common/const/ErrorCodes'
import { throwGqlError } from '@/common/helpers/GraphQLErrorHandling'
import { Permissions } from '@/entities/Permissions'
import { Role } from '@/entities/Role'
import { User } from '@/entities/User'
import { UserRole } from '@/entities/UserRole'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate'
import { In, IsNull, Repository } from 'typeorm'
import { CreateRoleDto, RoleStatusDto, UpdateRoleDto } from './role.dto'

@Injectable()
export class RoleService {
  // Inject the Role repository
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Create a new role
  async create(roleData: CreateRoleDto, authUser: User): Promise<Role> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      // get permissions
      const permissions = await manager.find(Permissions, {
        where: {
          id: In(roleData.permissionIds),
        },
      })

      if (!permissions || permissions.length === 0) {
        throwGqlError(ErrorCodes.PERMISSIONS_NOT_FOUND)
      }

      console.log('Creating role with:', roleData.name)

      const duplicateCheck = await manager.findOne(Role, {
        where: {
          name: roleData.name,
          organizationId: authUser.organizationId,
        },
      })

      if (duplicateCheck) {
        throwGqlError(ErrorCodes.ROLE_ALREADY_EXISTS)
      }

      const existingRole = await manager.findOne(Role, {
        where: { organizationId: authUser.organizationId },
      })

      // create role instance
      const role = manager.create(Role, {
        ...roleData,
        isPrimary: false,
        organizationId: authUser.organizationId,
        status: 'active',
        roleType: existingRole ? existingRole.roleType : 'other',
      })

      // assign permissions to role
      role.permissions = permissions

      // save role & return
      const savedRole = await manager.save(Role, role)

      console.log('Saved role ID:', savedRole.id)

      // commit transaction
      await queryRunner.commitTransaction()

      return savedRole
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }

  // All roles with pagination
  async listWithPagination(
    query: PaginateQuery,
    user: User,
  ): Promise<Paginated<Role>> {
    // Create a query builder with a subquery to count permissions
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .loadRelationCountAndMap('role.permissionCount', 'role.permissions')
      .where('role.isPrimary = false')
      .andWhere('role.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })

    // Use the paginate function correctly
    return paginate(query, qb, {
      defaultLimit: 10,
      maxLimit: 50,
      defaultSortBy: [['createdAt', 'DESC']],
      sortableColumns: ['id', 'name', 'roleType', 'createdAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        roleType: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
      searchableColumns: ['name', 'roleType'],
      where: { deletedAt: IsNull() },
    })
  }

  // Dropdown roles
  async dropdownWithPagination(
    query: PaginateQuery,
    user: User,
  ): Promise<Paginated<Role>> {
    // Create a query builder with a subquery to count permissions
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .loadRelationCountAndMap('role.permissionCount', 'role.permissions')
      .where('role.isPrimary = false')
      .andWhere('role.status = :status', { status: 'active' })
      .andWhere('role.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })

    // Use the paginate function correctly
    return paginate(query, qb, {
      defaultLimit: 10,
      maxLimit: 50,
      defaultSortBy: [['createdAt', 'DESC']],
      sortableColumns: ['id', 'name', 'roleType', 'createdAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        roleType: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
      searchableColumns: ['name', 'roleType'],
      where: { deletedAt: IsNull() },
    })
  }

  // Find a role by ID
  async findById(id: number, user: User): Promise<Role | undefined> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      // get role
      const role = await manager.findOne(Role, {
        where: { id: id ?? null, organizationId: user.organizationId },
        relations: ['permissions'],
      })

      if (!role) {
        throwGqlError(ErrorCodes.INVALID_ROLE)
      }

      role.permissionCount = role.permissions.length

      // commit transaction
      await queryRunner.commitTransaction()

      return role
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }

  // Update a role
  async update(roleData: UpdateRoleDto, _authUser: User): Promise<Role> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      // get permissions
      const permissions = await manager.find(Permissions, {
        where: {
          id: In(roleData.permissionIds),
        },
      })

      if (!permissions) {
        throwGqlError(ErrorCodes.PERMISSIONS_NOT_FOUND)
      }

      // find role
      const role = await manager.findOne(Role, {
        where: { id: roleData.id ?? null },
      })

      if (!role) {
        throwGqlError(ErrorCodes.INVALID_ROLE)
      }

      const newRole = manager.create(Role, {
        ...role,
        ...roleData,
        isPrimary: false,
        organizationId: _authUser.organizationId,
        roleType: role.roleType || 'other',
      })

      // assign permissions to role
      newRole.permissions = permissions

      // save role
      const savedRole = await manager.save(newRole)

      // commit transaction
      await queryRunner.commitTransaction()

      return savedRole
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }

  // Delete a role
  async remove(ids: number | number[]): Promise<void> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      const idArray = Array.isArray(ids) ? ids : [ids]
      // find role
      const role = await manager
        .createQueryBuilder(Role, 'role')
        .where('role.id IN (:...ids)', { ids: idArray })
        .getMany()

      if (role.length !== idArray.length) {
        throwGqlError(ErrorCodes.INVALID_ROLE)
      }

      if (role.some((ro) => ro.isPrimary)) {
        throwGqlError(ErrorCodes.CANNOT_DELETE_PRIMARY_ROLE)
      }

      const user = await manager.find(UserRole, {
        where: { roleId: In(role.map((r) => r.id)) },
      })

      // if role is assigned to any user, throw error and prevent deletion
      if (user.length !== 0) {
        throwGqlError(ErrorCodes.ROLE_ASSIGNED_TO_USER)
      }

      // commit transaction
      await queryRunner.commitTransaction()

      // delete role
      await manager.softDelete(Role, ids)
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }

  // Hard Delete a user
  async hardDelete(ids: number | number[]): Promise<void> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      const idArray = Array.isArray(ids) ? ids : [ids]
      // find role
      const role = await manager.find(Role, {
        where: idArray.map((id) => ({ id })),
        withDeleted: true,
      })

      if (role.length !== idArray.length) {
        throwGqlError(ErrorCodes.INVALID_ROLE)
      }

      if (role.some((ro) => ro.isPrimary)) {
        throwGqlError(ErrorCodes.CANNOT_DELETE_PRIMARY_ROLE)
      }

      // commit transaction
      await queryRunner.commitTransaction()

      // delete role
      await manager.delete(Role, ids)
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }

  // Restore a user
  async restore(ids: number | number[], _authUser: User): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids]

    const user = await this.roleRepository.find({
      where: {
        id: In(idArray),
        organizationId: _authUser.organizationId,
      },
      withDeleted: true,
    })

    if (!user) {
      throwGqlError(ErrorCodes.ROLE_NOT_FOUND)
    }
    await this.roleRepository.restore(ids)
  }

  // Paginated list of all trashed users
  async listTrashedWithPagination(
    query: PaginateQuery,
    user: User,
  ): Promise<Paginated<Role>> {
    // Create a query builder with a subquery to count permissions
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .loadRelationCountAndMap('role.permissionCount', 'role.permissions')
      .where('role.isPrimary = false & role.deletedAt IS NOT NULL')
      .andWhere('role.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })

    // Use the paginate function correctly
    return paginate(query, qb, {
      defaultLimit: 10,
      maxLimit: 50,
      defaultSortBy: [['createdAt', 'DESC']],
      sortableColumns: ['id', 'name', 'roleType', 'createdAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        roleType: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
      searchableColumns: ['name', 'roleType'],
      withDeleted: true,
    })
  }

  // Change Role status
  async enableRole(data: RoleStatusDto): Promise<Role[]> {
    // new query runner
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // Connect to the database using the query runner
    await queryRunner.connect()

    // start transaction
    await queryRunner.startTransaction()

    // manager
    const manager = queryRunner.manager
    // try catch
    try {
      const idArray = Array.isArray(data.ids) ? data.ids : [data.ids]
      // check if exists
      const roles = await manager.find(Role, {
        where: idArray.map((id) => ({ id })),
      })

      if (roles.length !== idArray.length || roles.some((p) => !p || !p.id)) {
        throwGqlError(ErrorCodes.ROLE_NOT_FOUND)
      }

      // update status
      const updatedRole = await manager.save(
        roles.map((role) =>
          manager.merge(Role, role, {
            status: data.status,
          }),
        ),
      )

      // Commit the transaction
      await queryRunner.commitTransaction()

      return updatedRole
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release the query runner
      await queryRunner.release()
    }
  }

  // Assign all permissions to a role
  async assignAllPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner()

    // connect to the database
    await queryRunner.connect()
    // start transaction
    await queryRunner.startTransaction()

    const manager = queryRunner.manager

    // try-catch-finally block
    try {
      // get role
      const role = await manager.findOne(Role, {
        where: { id: roleId },
        relations: ['permissions'],
      })

      if (!role) {
        throwGqlError(ErrorCodes.INVALID_ROLE)
      }

      // get permissions
      const allPermissions = await manager.find(Permissions, {
        where: {
          id: In(permissionIds),
        },
      })

      if (!allPermissions) {
        throwGqlError(ErrorCodes.PERMISSIONS_NOT_FOUND)
      }

      // assign permissions to role
      role.permissions = allPermissions

      // save role
      const savedRole = await manager.save(role)

      // commit transaction
      await queryRunner.commitTransaction()

      return savedRole
    } catch (error) {
      // rollback transaction
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // release queryRunner
      await queryRunner.release()
    }
  }
}
