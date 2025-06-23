import { JwtAuthGuard } from '@/common/auth/jwt.guard'
import { CurrentUser } from '@/common/decorators/CurrentUser'
import { Permissions } from '@/common/decorators/PermissionDecorator'
import { ListInputDTO } from '@/common/paginationDto/withPagination'
import { PaginatedRoles, Role, RoleArray, RoleUnion } from '@/entities/Role'
import { User } from '@/entities/User'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql'
import { CreateRoleDto, RoleStatusDto, UpdateRoleDto } from './role.dto'
import { RoleService } from './role.service'
import { throwGqlError } from '@/common/helpers/GraphQLErrorHandling'
import { ErrorCodes } from '@/common/const/ErrorCodes'

@Resolver(() => Role)
@UseGuards(JwtAuthGuard)
export class RoleResolver {
  roleService: RoleService

  constructor(private readonly role: RoleService) {
    // Inject the roleService
    this.roleService = role
  }

  // List all roles with pagination
  @Query(() => PaginatedRoles)
  @Permissions('MasterApp:Role:Read')
  async paginatedRoles(
    @Args('ListInputDTO') listInputDTO: ListInputDTO,
    @CurrentUser() user: User,
  ): Promise<PaginatedRoles> {
    // Call updated pagination function

    const paginationResult = await this.roleService.listWithPagination(
      listInputDTO,
      user,
    )
    return {
      data: paginationResult.data,
      meta: {
        totalItems: paginationResult.meta.totalItems,
        totalPages: paginationResult.meta.totalPages,
        currentPage: paginationResult.meta.currentPage,
        limit: paginationResult.meta.itemsPerPage,
      },
    }
  }

  // roles list without permission
  @Query(() => PaginatedRoles)
  async dropdownRoles(
    @Args('ListInputDTO') listInputDTO: ListInputDTO,
    @CurrentUser() user: User,
  ): Promise<PaginatedRoles> {
    // Call updated pagination function

    const paginationResult = await this.roleService.dropdownWithPagination(
      listInputDTO,
      user,
    )
    return {
      data: paginationResult.data,
      meta: {
        totalItems: paginationResult.meta.totalItems,
        totalPages: paginationResult.meta.totalPages,
        currentPage: paginationResult.meta.currentPage,
        limit: paginationResult.meta.itemsPerPage,
      },
    }
  }

  // Create a new role
  @Mutation(() => Role)
  @Permissions('MasterApp:User:Create')
  async createRole(
    @Args('data') data: CreateRoleDto,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return await this.roleService.create(data, user)
  }

  // Find a role by ID
  @Query(() => Role)
  @Permissions('MasterApp:Role:Read')
  async findRoleById(
    @Args('id') id: number,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return await this.roleService.findById(id, user)
  }

  // Update a role
  @Mutation(() => Role)
  @Permissions('MasterApp:Role:Update')
  async updateRole(
    @Args('data') data: UpdateRoleDto,
    @CurrentUser() user: User,
  ): Promise<Role> {
    return await this.roleService.update(data, user)
  }

  // Delete a role
  @Mutation(() => Boolean)
  @Permissions('MasterApp:Role:Delete')
  async deleteRole(
    @Args('ids', { type: () => [Int] }) ids: number[],
  ): Promise<boolean> {
    await this.roleService.remove(ids)
    return true
  }

  // Hard Delete
  @Mutation(() => Boolean)
  @Permissions('MasterApp:Role:Delete')
  async hardDeleteRole(
    @Args('ids', { type: () => [Int] }) ids: number[],
  ): Promise<boolean> {
    await this.roleService.hardDelete(ids)
    return true
  }

  // Assign all permissions to a role
  @Mutation(() => Role)
  async assignPermissionsToRole(
    @Args('roleId', { type: () => Int }) roleId: number,
    @Args('permissionIds', { type: () => [Int] }) permissionIds: number[],
  ): Promise<Role> {
    return this.roleService.assignAllPermissionsToRole(roleId, permissionIds)
  }

  // Restore Role
  @Mutation(() => Boolean)
  @Permissions('MasterApp:Role:Restore')
  async restoreRole(
    @Args('ids', { type: () => [Int] }) ids: number[],
    @CurrentUser() authUser: User,
  ): Promise<boolean> {
    await this.roleService.restore(ids, authUser)
    return true
  }

  // change status
  @Mutation(() => RoleUnion)
  @UseGuards(JwtAuthGuard)
  @Permissions('MasterApp:Role:Action')
  async changeRoleStatus(
    @Args('data') data: RoleStatusDto,
  ): Promise<Role | RoleArray> {
    const roles = await this.roleService.enableRole(data)

    if (!roles.length || roles.some((r) => !r || !r.id)) {
      throwGqlError(ErrorCodes.ROLE_NOT_FOUND)
    }

    return roles.length === 1 ? roles[0] : { data: roles }
  }

  @Query(() => PaginatedRoles)
  @Permissions('MasterApp:Role:Read')
  async listTrashedRoles(
    @Args('ListInputDTO') listInputDTO: ListInputDTO,
    @CurrentUser() user: User,
  ): Promise<PaginatedRoles> {
    // Call updated pagination function

    const paginationResult = await this.roleService.listTrashedWithPagination(
      listInputDTO,
      user,
    )
    return {
      data: paginationResult.data,
      meta: {
        totalItems: paginationResult.meta.totalItems,
        totalPages: paginationResult.meta.totalPages,
        currentPage: paginationResult.meta.currentPage,
        limit: paginationResult.meta.itemsPerPage,
      },
    }
  }

  //Ref Resolver
  @ResolveReference()
  async resolveReference(
    reference: {
      __typename: string
      id: number
    },
    @CurrentUser() user: User,
  ): Promise<Role> {
    return await this.roleService.findById(reference.id, user)
  }
}
