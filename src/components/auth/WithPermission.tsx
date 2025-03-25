'use client';

import { ReactNode } from 'react';
import { getUserRole } from '@/lib/auth';
import { hasPermission, Permission, UserRole } from '@/lib/roles';

interface WithPermissionProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
export default function WithPermission({
  children,
  permission,
  fallback = null,
}: WithPermissionProps) {
  const userRole = getUserRole() as UserRole;
  
  if (!userRole) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(userRole, permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}