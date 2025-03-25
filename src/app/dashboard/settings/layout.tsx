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
      allowedRoles={UserRole.ADMIN}
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ayarlar
              </h2>
              <nav className="space-y-1">
                <a
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Genel
                </a>
                <a
                  href="/dashboard/settings/features"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Özellikler
                </a>
                <a
                  href="/dashboard/settings/users"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Kullanıcılar
                </a>
                <a
                  href="/dashboard/settings/roles"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Roller ve İzinler
                </a>
              </nav>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </RoleBasedAccess>
  );
}