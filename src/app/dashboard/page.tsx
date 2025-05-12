'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsSidebar from '@/components/StatsSidebar';
import ModuleGrid from '@/components/ModuleGrid';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid) {
          router.replace('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAuth, router]);

  // Auth kontrolü yapılıyor
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth yok veya user yok
  if (!isAuthenticated || !user) {
    return null; // Router.replace yerine null döndürüyoruz
  }

  return (
    <div className="flex gap-8 p-8 relative">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 dark:bg-clip-text transition-colors">
              Merhaba, {user.name}
            </h1>
          </div>
        </div>
        <ModuleGrid />
      </div>

      <StatsSidebar />
    </div>
  );
}