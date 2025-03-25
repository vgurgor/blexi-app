/**
 * Define role-based permissions for the application
 */

// Define available roles
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

// Define available permissions
export enum Permission {
  // Companies
  COMPANY_CREATE = 'company:create',
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  
  // Apartments
  APARTMENT_CREATE = 'apartment:create',
  APARTMENT_READ = 'apartment:read',
  APARTMENT_UPDATE = 'apartment:update',
  APARTMENT_DELETE = 'apartment:delete',
  
  // Rooms
  ROOM_CREATE = 'room:create',
  ROOM_READ = 'room:read',
  ROOM_UPDATE = 'room:update',
  ROOM_DELETE = 'room:delete',
  
  // Beds
  BED_CREATE = 'bed:create',
  BED_READ = 'bed:read',
  BED_UPDATE = 'bed:update',
  BED_DELETE = 'bed:delete',
  
  // Inventory
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',
  
  // Features
  FEATURE_CREATE = 'feature:create',
  FEATURE_READ = 'feature:read',
  FEATURE_UPDATE = 'feature:update',
  FEATURE_DELETE = 'feature:delete',
  
  // Reports
  REPORT_VIEW = 'report:view',
  
  // Settings
  SETTINGS_MANAGE = 'settings:manage',
  
  // Users
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
}

// Define permission sets for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.MANAGER]: [
    // Companies
    Permission.COMPANY_READ,
    
    // Apartments
    Permission.APARTMENT_CREATE,
    Permission.APARTMENT_READ,
    Permission.APARTMENT_UPDATE,
    
    // Rooms
    Permission.ROOM_CREATE,
    Permission.ROOM_READ,
    Permission.ROOM_UPDATE,
    
    // Beds
    Permission.BED_CREATE,
    Permission.BED_READ,
    Permission.BED_UPDATE,
    
    // Inventory
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_READ,
    Permission.INVENTORY_UPDATE,
    
    // Features
    Permission.FEATURE_READ,
    
    // Reports
    Permission.REPORT_VIEW,
    
    // Users
    Permission.USER_READ,
  ],
  [UserRole.USER]: [
    // Only read permissions for regular users
    Permission.APARTMENT_READ,
    Permission.ROOM_READ,
    Permission.BED_READ,
    Permission.INVENTORY_READ,
    Permission.FEATURE_READ,
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  if (!role || !permission) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) || false;
};

/**
 * Get all permissions for a role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Get a user-friendly name for a role
 */
export const getRoleName = (role: UserRole): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    case UserRole.ADMIN:
      return 'Yönetici';
    case UserRole.MANAGER:
      return 'Apartman Yöneticisi';
    case UserRole.USER:
      return 'Kullanıcı';
    default:
      return 'Bilinmeyen Rol';
  }
};