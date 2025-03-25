'use client';

import { ReactNode } from 'react';
import { hasRole } from '@/lib/auth';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: string | string[];
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders content based on user roles
 */
export default function RoleBasedAccess({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedAccessProps) {
  const hasAccess = hasRole(allowedRoles);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}