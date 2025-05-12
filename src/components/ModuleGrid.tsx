'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home,
  DoorOpen,
  Users,
  Wallet,
  Bell,
  Clipboard,
  BarChart2,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/queries';
import { ClientOnly } from './ClientOnly';

type ModuleColor = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'yellow' | 'indigo' | 'gray';

interface Module {
  name: string;
  description: string;
  icon: React.ElementType;
  count: string;
  color: ModuleColor;
  details: string[];
  path: string;
  isLoading?: boolean;
}

// Başlangıç modülleri - veriler yüklenirken kullanılacak
const initialModules: Module[] = [
  {
    name: 'Apartlar',
    description: 'Toplam Apart Sayısı',
    icon: Home,
    count: '-',
    color: 'blue',
    details: [],
    path: '/dashboard/apartments',
    isLoading: true
  },
  {
    name: 'Odalar',
    description: 'Mevcut Odalar',
    icon: DoorOpen,
    count: '-',
    color: 'purple',
    details: [],
    path: '/dashboard/rooms',
    isLoading: true
  },
  {
    name: 'Öğrenciler',
    description: 'Kayıtlı Öğrenciler',
    icon: Users,
    count: '-',
    color: 'green',
    details: [],
    path: '/dashboard/students',
    isLoading: true
  },
  {
    name: 'Finans',
    description: 'Aylık Gelir',
    icon: Wallet,
    count: '-',
    color: 'orange',
    details: [],
    path: '/dashboard/finance',
    isLoading: true
  },
  {
    name: 'Bildirim & Duyurular',
    description: 'Aktif Duyurular',
    icon: Bell,
    count: '-',
    color: 'pink',
    details: [],
    path: '/dashboard/notifications',
    isLoading: true
  },
  {
    name: 'Envanter',
    description: 'Kayıtlı Envanter',
    icon: Clipboard,
    count: '-',
    color: 'yellow',
    details: [],
    path: '/dashboard/inventory',
    isLoading: true
  },
  {
    name: 'Raporlar',
    description: 'Aylık Raporlar',
    icon: BarChart2,
    count: '-',
    color: 'indigo',
    details: [],
    path: '/dashboard/reports',
    isLoading: true
  },
  {
    name: 'Ayarlar',
    description: 'Sistem Ayarları',
    icon: Settings,
    count: '-',
    color: 'gray',
    details: [],
    path: '/dashboard/settings',
    isLoading: true
  },
  {
    name: 'Destek',
    description: 'Açık Talepler',
    icon: HelpCircle,
    count: '-',
    color: 'blue',
    details: [],
    path: '/dashboard/support',
    isLoading: true
  }
];

const colorVariants: Record<ModuleColor, { bg: string; light: string; text: string; border: string; hover: string }> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    light: 'bg-gradient-to-br from-blue-400/10 to-blue-600/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-400/20',
    hover: 'hover:bg-blue-400/5'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    light: 'bg-gradient-to-br from-purple-400/10 to-purple-600/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-400/20',
    hover: 'hover:bg-purple-400/5'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    light: 'bg-gradient-to-br from-emerald-400/10 to-emerald-600/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-400/20',
    hover: 'hover:bg-emerald-400/5'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    light: 'bg-gradient-to-br from-orange-400/10 to-orange-600/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-400/20',
    hover: 'hover:bg-orange-400/5'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-400 to-red-600',
    light: 'bg-gradient-to-br from-red-400/10 to-red-600/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-400/20',
    hover: 'hover:bg-red-400/5'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-400 to-pink-600',
    light: 'bg-gradient-to-br from-pink-400/10 to-pink-600/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-400/20',
    hover: 'hover:bg-pink-400/5'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    light: 'bg-gradient-to-br from-yellow-400/10 to-yellow-600/10',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-400/20',
    hover: 'hover:bg-yellow-400/5'
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    light: 'bg-gradient-to-br from-indigo-400/10 to-indigo-600/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-400/20',
    hover: 'hover:bg-indigo-400/5'
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    light: 'bg-gradient-to-br from-gray-400/10 to-gray-600/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-400/20',
    hover: 'hover:bg-gray-400/5'
  }
};

export default function ModuleGrid() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>(initialModules);
  
  // Dashboard veri çağırma
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();

  // Veriler geldiğinde modülleri güncelle
  useEffect(() => {
    if (statsData && statsData.modules) {
      const updatedModules = [...initialModules];
      
      // Apartlar
      if (statsData.modules.apartments) {
        updatedModules[0] = {
          ...updatedModules[0],
          count: statsData.modules.apartments.total.toString(),
          details: [
            `${statsData.modules.apartments.active} Aktif`, 
            `${statsData.modules.apartments.maintenance} Bakımda`
          ],
          isLoading: false
        };
      }
      
      // Odalar
      if (statsData.modules.rooms) {
        updatedModules[1] = {
          ...updatedModules[1],
          count: statsData.modules.rooms.total.toString(),
          details: [
            `${statsData.modules.rooms.occupied} Dolu`, 
            `${statsData.modules.rooms.available} Boş`
          ],
          isLoading: false
        };
      }
      
      // Öğrenciler
      if (statsData.modules.students) {
        updatedModules[2] = {
          ...updatedModules[2],
          count: statsData.modules.students.total.toString(),
          details: [
            `${statsData.modules.students.active} Aktif`, 
            `${statsData.modules.students.new} Yeni`
          ],
          isLoading: false
        };
      }
      
      // Finans
      if (statsData.modules.finance) {
        const formattedRevenue = new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          maximumFractionDigits: 0,
          notation: 'compact'
        }).format(statsData.modules.finance.monthlyRevenue);
        
        const formattedCollected = new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          maximumFractionDigits: 0,
          notation: 'compact'
        }).format(statsData.modules.finance.collected);
        
        const formattedPending = new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          maximumFractionDigits: 0,
          notation: 'compact'
        }).format(statsData.modules.finance.pending);
        
        updatedModules[3] = {
          ...updatedModules[3],
          count: formattedRevenue,
          details: [
            `${formattedCollected} Tahsilat`, 
            `${formattedPending} Bekleyen`
          ],
          isLoading: false
        };
      }
      
      // Bildirim & Duyurular
      if (statsData.modules.notifications) {
        updatedModules[4] = {
          ...updatedModules[4],
          count: statsData.modules.notifications.total.toString(),
          details: [
            `${statsData.modules.notifications.general} Genel`, 
            `${statsData.modules.notifications.urgent} Acil`
          ],
          isLoading: false
        };
      } else {
        // Varsayılan değerler
        updatedModules[4] = {
          ...updatedModules[4],
          count: '18',
          details: ['12 Genel', '6 Acil'],
          isLoading: false
        };
      }
      
      // Envanter
      if (statsData.modules.inventory) {
        updatedModules[5] = {
          ...updatedModules[5],
          count: statsData.modules.inventory.total.toString(),
          details: [
            `${statsData.modules.inventory.active} Aktif`, 
            `${statsData.modules.inventory.repair} Onarımda`
          ],
          isLoading: false
        };
      } else {
        updatedModules[5] = {
          ...updatedModules[5],
          count: '524',
          details: ['486 Aktif', '38 Onarımda'],
          isLoading: false
        };
      }
      
      // Raporlar
      if (statsData.modules.reports) {
        updatedModules[6] = {
          ...updatedModules[6],
          count: statsData.modules.reports.total.toString(),
          details: [
            `${statsData.modules.reports.financial} Finansal`, 
            `${statsData.modules.reports.operational} Operasyonel`
          ],
          isLoading: false
        };
      } else {
        updatedModules[6] = {
          ...updatedModules[6],
          count: '6',
          details: ['4 Finansal', '2 Operasyonel'],
          isLoading: false
        };
      }
      
      // Ayarlar
      if (statsData.modules.settings) {
        updatedModules[7] = {
          ...updatedModules[7],
          count: statsData.modules.settings.total.toString(),
          details: [
            `${statsData.modules.settings.general} Genel`, 
            `${statsData.modules.settings.custom} Özel`
          ],
          isLoading: false
        };
      } else {
        updatedModules[7] = {
          ...updatedModules[7],
          count: '12',
          details: ['8 Genel', '4 Özel'],
          isLoading: false
        };
      }
      
      // Destek
      if (statsData.modules.support) {
        updatedModules[8] = {
          ...updatedModules[8],
          count: statsData.modules.support.total.toString(),
          details: [
            `${statsData.modules.support.pending} Bekleyen`, 
            `${statsData.modules.support.inProgress} İşlemde`
          ],
          isLoading: false
        };
      } else {
        updatedModules[8] = {
          ...updatedModules[8],
          count: '3',
          details: ['2 Bekleyen', '1 İşlemde'],
          isLoading: false
        };
      }
      
      setModules(updatedModules);
    }
  }, [statsData]);

  return (
    <ClientOnly fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialModules.map((module) => (
          <div key={module.name} className="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 h-40">
            <div className="animate-pulse h-full flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-10"></div>
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-5 w-32 rounded"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-16 rounded"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-8 w-12 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.name}
            onClick={() => router.push(module.path)}
            className="group backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Content */}
            <div className="relative p-5">
              {/* Header Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`${colorVariants[module.color].light} rounded-lg p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <module.icon className={`h-5 w-5 ${colorVariants[module.color].text}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-200">{module.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{module.description}</p>
                </div>
              </div>
              
              {/* Bottom Section with Tags and Count */}
              <div className="flex items-center justify-between">
                {/* Detail Pills */}
                <div className="flex gap-2">
                  {module.isLoading ? (
                    <div className="h-6 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ) : (
                    module.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`text-xs px-2.5 py-1 rounded-lg ${colorVariants[module.color].light} ${colorVariants[module.color].text}`}
                      >
                        {detail}
                      </div>
                    ))
                  )}
                </div>

                {/* Count Section */}
                <div className="flex items-center gap-2">
                  {module.isLoading ? (
                    <div className="h-8 w-12 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{module.count}</span>
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colorVariants[module.color].light} group-hover:scale-110 transition-transform duration-300`}>
                    <svg 
                      className={`w-4 h-4 ${colorVariants[module.color].text} transform group-hover:translate-x-0.5 transition-transform`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ClientOnly>
  );
}