'use client';

import React from 'react';
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

const modules = [
  {
    name: 'Apartlar',
    description: 'Toplam Apart Sayısı',
    icon: Home,
    count: '12',
    color: 'blue',
    details: ['8 Aktif', '4 Bakımda'],
    path: '/dashboard/apartments'
  },
  {
    name: 'Odalar',
    description: 'Mevcut Odalar',
    icon: DoorOpen,
    count: '156',
    color: 'purple',
    details: ['142 Dolu', '14 Boş'],
    path: '/dashboard/rooms'
  },
  {
    name: 'Öğrenciler',
    description: 'Kayıtlı Öğrenciler',
    icon: Users,
    count: '342',
    color: 'green',
    details: ['298 Aktif', '44 Yeni'],
    path: '/dashboard/students'
  },
  {
    name: 'Finans',
    description: 'Aylık Gelir',
    icon: Wallet,
    count: '₺248K',
    color: 'orange',
    details: ['₺220K Tahsilat', '₺28K Bekleyen'],
    path: '/dashboard/finance'
  },
  {
    name: 'Bildirim & Duyurular',
    description: 'Aktif Duyurular',
    icon: Bell,
    count: '18',
    color: 'pink',
    details: ['12 Genel', '6 Acil'],
    path: '/dashboard/notifications'
  },
  {
    name: 'Envanter',
    description: 'Kayıtlı Envanter',
    icon: Clipboard,
    count: '524',
    color: 'yellow',
    details: ['486 Aktif', '38 Onarımda'],
    path: '/dashboard/inventory'
  },
  {
    name: 'Raporlar',
    description: 'Aylık Raporlar',
    icon: BarChart2,
    count: '6',
    color: 'indigo',
    details: ['4 Finansal', '2 Operasyonel'],
    path: '/dashboard/reports'
  },
  {
    name: 'Ayarlar',
    description: 'Sistem Ayarları',
    icon: Settings,
    count: '12',
    color: 'gray',
    details: ['8 Genel', '4 Özel'],
    path: '/dashboard/settings'
  },
  {
    name: 'Destek',
    description: 'Açık Talepler',
    icon: HelpCircle,
    count: '3',
    color: 'blue',
    details: ['2 Bekleyen', '1 İşlemde'],
    path: '/dashboard/support'
  }
];

const colorVariants = {
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

  return (
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
                {module.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`text-xs px-2.5 py-1 rounded-lg ${colorVariants[module.color].light} ${colorVariants[module.color].text}`}
                  >
                    {detail}
                  </div>
                ))}
              </div>

              {/* Count Section */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{module.count}</span>
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
  );
}