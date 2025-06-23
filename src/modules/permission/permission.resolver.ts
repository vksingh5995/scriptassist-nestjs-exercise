import { JwtAuthGuard } from '@/common/auth/jwt.guard'
import { ListInputDTO } from '@/common/paginationDto/withPagination'
import { PaginatedPermissions, Permissions } from '@/entities/Permissions'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql'
import {
  CreatePermissionDto,
  DynamicPermissionsDto,
  PermissionGroup,
  UpdatePermissionDto,
} from './permission.dto'
import { PermissionService } from './permission.service'

@Resolver(() => Permissions)
@UseGuards(JwtAuthGuard)
export class PermissionResolver {
  permissionService: PermissionService
  constructor(private readonly permission: PermissionService) {
    // Inject the permissionService
    this.permissionService = permission
  }

  // list all permissions
  @Query(() => DynamicPermissionsDto)
  async allPermissions(): Promise<DynamicPermissionsDto> {
    const per = await this.permissionService.findAll()
    return per
  }

  // List all with pagination
  @Query(() => PaginatedPermissions)
  async paginatedPermissions(
    @Args('ListInputDTO') listInputDTO: ListInputDTO,
  ): Promise<PaginatedPermissions> {
    // Call updated pagination function
    const paginationResult =
      await this.permissionService.listWithPagination(listInputDTO)

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

  // Create a new permission
  @Mutation(() => Permissions)
  async createPermission(
    @Args('data') data: CreatePermissionDto,
  ): Promise<Permissions> {
    return await this.permissionService.create(data)
  }

  // Find a permission by ID
  @Query(() => Permissions)
  async findPermissionById(@Args('id') id: number): Promise<Permissions> {
    return await this.permissionService.findById(id)
  }

  // Update a permission
  @Mutation(() => Permissions)
  async updatePermission(
    @Args('data') data: UpdatePermissionDto,
  ): Promise<Permissions> {
    return await this.permissionService.update(data.id, data)
  }

  // Delete a permission
  @Mutation(() => Boolean)
  async deletePermission(@Args('id') id: number): Promise<boolean> {
    await this.permissionService.remove(id)
    return true
  }

  // Group permissions by permission
  @Query(() => PermissionGroup)
  async permissionGroup(): Promise<PermissionGroup> {
    return await this.permissionService.groupByPermission()
  }

  //Ref Resolver
  @ResolveReference()
  async resolveReference(reference: {
    __typename: string
    id: number
  }): Promise<Permissions> {
    return await this.permissionService.findById(reference.id)
  }
}
