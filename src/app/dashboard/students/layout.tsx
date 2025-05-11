'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Calendar,
  List, 
  
} from 'lucide-react';

interface StudentsLayoutProps {
  children: ReactNode;
}

export default function StudentsLayout({ children }: StudentsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Öğrenci Kayıtları',
      path: '/dashboard/students/registrations',
      icon: <List className="w-5 h-5" />,
      exact: false
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
            <Calendar  onClick={() => setCollapsed(!collapsed)}  className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            {!collapsed && <span onClick={() => router.push('/dashboard/students')} className="ml-2 cursor-pointer font-semibold text-gray-900 dark:text-white">Öğrenci Yönetimi</span>}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${collapsed ? 'hidden' : ''}`}
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center' : 'justify-start'
              } p-3 mb-1 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div className={isActive(item.path, item.exact) ? 'text-blue-500 dark:text-blue-400' : ''}>
                {item.icon}
              </div>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}