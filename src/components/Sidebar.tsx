'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  DoorOpen,
  Bed,
  Package,
  Settings,
  Users,
  BarChart,
  X,
  Home,
  AlertTriangle,
  Clipboard,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { RoleBasedAccess } from '@/components/auth';
import { UserRole } from '@/lib/roles';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const mainMenuItems: MenuItem[] = [
  {
    name: 'Ana Sayfa',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: 'Firmalar',
    href: '/dashboard/companies',
    icon: <Building2 className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    name: 'Apartlar',
    href: '/dashboard/apartments',
    icon: <DoorOpen className="h-5 w-5" />,
  },
  {
    name: 'Odalar',
    href: '/dashboard/rooms',
    icon: <Bed className="h-5 w-5" />,
  },
  {
    name: 'Envanter',
    href: '/dashboard/inventory',
    icon: <Package className="h-5 w-5" />,
  },
];

const additionalItems: MenuItem[] = [
  {
    name: 'Kullanıcılar',
    href: '/dashboard/users',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    name: 'Raporlar',
    href: '/dashboard/reports',
    icon: <BarChart className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    name: 'Duyurular',
    href: '/dashboard/announcements',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    name: 'Belgeler',
    href: '/dashboard/documents',
    icon: <Clipboard className="h-5 w-5" />,
  },
  {
    name: 'Ayarlar',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebar, toggleSidebar, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebar.isMobile && sidebar.isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
          sidebar.isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400">
                BLEXI
              </span>
            </Link>
            
            {/* Close button for mobile */}
            <button
              className="p-1 rounded-md lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Ana Menü
              </div>

              {mainMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                const menuItem = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
                
                if (item.roles) {
                  return (
                    <RoleBasedAccess key={item.name} allowedRoles={item.roles}>
                      {menuItem}
                    </RoleBasedAccess>
                  );
                }
                
                return menuItem;
              })}
            </nav>

            <nav className="space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Diğer
              </div>

              {additionalItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                const menuItem = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
                
                if (item.roles) {
                  return (
                    <RoleBasedAccess key={item.name} allowedRoles={item.roles}>
                      {menuItem}
                    </RoleBasedAccess>
                  );
                }
                
                return menuItem;
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 BLEXI
            </div>
          </div>
        </div>
      </div>
    </>
  );
}