import { Role } from '@modules/role/entities/roles.entity';
import slugify from 'slugify';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class Permissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  permissionGroup: string;

  @Column({ type: 'varchar' })
  module: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  async makeSlug() {
    if (this.name && !this.slug) {
      this.slug = slugify(`${this.module}:${this.permissionGroup}:${this.name}`, { lower: true });
    }
  }
}

export type PermissionKey = keyof Permissions;
