import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionResolver } from './permission.resolver'
import { PermissionService } from './permission.service'
import { Permissions } from '@/entities/Permissions'

@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  providers: [PermissionResolver, PermissionService],
  exports: [TypeOrmModule, PermissionService],
})
export class PermissionModule {}
