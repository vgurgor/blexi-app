'use client';

import { ReactNode } from 'react';
import { RoleBasedAccess } from '@/components/auth';
import { UserRole } from '@/lib/roles';

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleBasedAccess 
      allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}
      fallback={
        <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Erişim Engellendi
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekmektedir.
          </p>
        </div>
      }
    >

              {children}

    </RoleBasedAccess>
  );
}