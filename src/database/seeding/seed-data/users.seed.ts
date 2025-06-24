// import * as bcrypt from 'bcrypt';

// export const users = [
//   {
//     id: '550e8400-e29b-41d4-a716-446655440000',
//     email: 'admin@example.com',
//     name: 'Admin User',
//     password: bcrypt.hashSync('admin123', 10),
//     role: 'admin',
//   },
//   {
//     id: '550e8400-e29b-41d4-a716-446655440001',
//     email: 'user@example.com',
//     name: 'Normal User',
//     password: bcrypt.hashSync('user123', 10),
//     role: 'user',
//   },
// ];

import { DataSource } from 'typeorm';
import slugify from 'slugify';
import * as bcrypt from 'bcryptjs';
import { Permissions } from '@modules/permission/entities/permission.entity';
import { Role } from '@modules/role/entities/roles.entity';
import { User } from '@modules/users/entities/user.entity';
import { PermissionKeys } from '@common/const/PermissionConst';

export const users = async (AppDataSource: DataSource) => {
  const permissionRepository = AppDataSource.getRepository(Permissions);
  const roleRepository = AppDataSource.getRepository(Role);
  const userRepository = AppDataSource.getRepository(User);

  // 1. Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 2. Clean all data (optional: use truncate if available in your env)
  await permissionRepository.delete({});
  await roleRepository.delete({});
  await userRepository.delete({});

  // 3. Seed Permissions
  const permissionsToInsert: Partial<Permissions>[] = Object.entries(Permissions).map(
    ([slug, perm]) => ({
      name: perm.name,
      slug,
      permissionGroup: perm.group,
      description: perm.description,
      module: perm.module,
    }),
  );

  const savedPermissions = await permissionRepository.save(
    permissionRepository.create(permissionsToInsert),
  );

  const AllSavedPermissions: Record<PermissionKeys, Permissions> = {} as Record<
    PermissionKeys,
    Permissions
  >;

  savedPermissions.forEach(p => {
    AllSavedPermissions[p.slug as PermissionKeys] = p;
  });

  // 4. Create Admin Role
  const adminRole = roleRepository.create({
    name: 'Admin',
    slug: slugify('Admin', { lower: true }),
    description: 'Admin Role with all permissions',
    status: 'active',
    permissions: Object.values(AllSavedPermissions),
    isPrimary: true,
  });

  const savedAdminRole = await roleRepository.save(adminRole);

  // Create User Role
  const userRole = roleRepository.create({
    name: 'User',
    slug: slugify('User', { lower: true }),
    description: 'User Role with limited permissions',
    status: 'active',
    permissions: Object.values(AllSavedPermissions),
    isPrimary: true,
  });

  const savedUserRole = await roleRepository.save(userRole);

  // 5. Create Super Admin
  const superAdminUser = userRepository.create({
    name: 'Admin User',
    email: 'admin@example.com',
    status: 'active',
    password: adminPassword,
    slug: savedAdminRole.slug,
    role: savedAdminRole,
  });

  await userRepository.save(superAdminUser);

  // 5. Create User
  const normalUser = userRepository.create({
    name: 'Normal User',
    email: 'user@example.com',
    status: 'active',
    password: userPassword,
    slug: savedUserRole.slug,
    role: savedUserRole,
  });

  await userRepository.save(normalUser);
};
