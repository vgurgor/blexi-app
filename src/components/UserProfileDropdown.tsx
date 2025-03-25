'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, Key, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    icon: User,
    label: 'Profilim',
    description: 'Kişisel bilgilerinizi düzenleyin'
  },
  {
    icon: Settings,
    label: 'Hesap Ayarları',
    description: 'Tercihlerinizi yönetin'
  },
  {
    icon: Key,
    label: 'Şifre Değiştir',
    description: 'Güvenlik ayarlarınızı güncelleyin'
  },
  {
    icon: HelpCircle,
    label: 'Yardım',
    description: 'Destek alın'
  }
];

export default function UserProfileDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Kullanıcı'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role || 'Rol Yükleniyor...'}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={onClose}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
        >
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-400/10">
            <LogOut className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Çıkış Yap</div>
            <div className="text-xs text-red-500 dark:text-red-300">
              Oturumu sonlandır
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}