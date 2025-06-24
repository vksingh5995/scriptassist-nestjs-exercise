import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { Permissions } from './entities/permission.entity';
import { PermissionController } from './permission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  providers: [PermissionController, PermissionService],
  exports: [TypeOrmModule, PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
