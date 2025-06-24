import { Permissions } from '@modules/permission/entities/permission.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Main Role Entity
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar' })
  slug: string;

  @ManyToMany(() => Permissions, permissions => permissions.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId' },
    inverseJoinColumn: { name: 'permissionId' },
  })
  permissions: Permissions[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar' })
  status: 'active' | 'inactive' | 'blocked' | 'pending';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // Virtual field for permission count (not stored in DB)
  permissionCount: number;

  @OneToMany(() => User, user => user.role)
  users: User[];
}
