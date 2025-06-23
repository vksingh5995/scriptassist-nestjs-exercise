import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleResolver } from './role.resolver'
import { RoleService } from './role.service'
import { Role } from '@/entities/Role'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleResolver, RoleService],
  exports: [TypeOrmModule, RoleService],
})
export class RoleModule {}
