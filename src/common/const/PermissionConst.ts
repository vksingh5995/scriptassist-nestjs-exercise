export const PermissionConst = {
  // Dashboard
  'MasterApp:Dashboard:Read': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Dashboard',
    action: 'Read',
    description: 'Anyone with this permission can read dashboard',
  },
  // User Permissions
  'MasterApp:User:Create': {
    app: 'MasterApp',
    group: 'Default',
    module: 'User',
    action: 'Create',
    description: 'Anyone with this permission can create user',
  },
  'MasterApp:User:Read': {
    app: 'MasterApp',
    group: 'Default',
    module: 'User',
    action: 'Read',
    description: 'Anyone with this permission can read user',
  },
  'MasterApp:User:Update': {
    app: 'MasterApp',
    group: 'Default',
    module: 'User',
    action: 'Update',
    description: 'Anyone with this permission can update user',
  },
  'MasterApp:User:Delete': {
    app: 'MasterApp',
    group: 'Default',
    module: 'User',
    action: 'Delete',
    description: 'Anyone with this permission can delete user',
  },

  // Role Permissions
  'MasterApp:Role:Create': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Role',
    action: 'Create',
    description: 'Anyone with this permission can create role',
  },
  'MasterApp:Role:Read': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Role',
    action: 'Read',
    description: 'Anyone with this permission can read role',
  },
  'MasterApp:Role:Update': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Role',
    action: 'Update',
    description: 'Anyone with this permission can update role',
  },
  'MasterApp:Role:Delete': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Role',
    action: 'Delete',
    description: 'Anyone with this permission can delete role',
  },

  // Task Permissions
  'MasterApp:Task:Create': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Task',
    action: 'Create',
    description: 'Anyone with this permission can create Task',
  },
  'MasterApp:Task:Read': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Task',
    action: 'Read',
    description: 'Anyone with this permission can read Task',
  },
  'MasterApp:Task:Update': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Task',
    action: 'Update',
    description: 'Anyone with this permission can update Task',
  },
  'MasterApp:Task:Delete': {
    app: 'MasterApp',
    group: 'Default',
    module: 'Task',
    action: 'Delete',
    description: 'Anyone with this permission can delete Task',
  },
};

export type PermissionKeys = keyof typeof PermissionConst;
