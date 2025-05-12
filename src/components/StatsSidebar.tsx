'use client';

import React, { useState, useEffect } from 'react';
import { Home, Wallet, Users, BedDouble } from 'lucide-react';
import { useDashboardStats } from '@/hooks/queries';
import { ClientOnly } from './ClientOnly';

type StatColor = 'blue' | 'purple' | 'green' | 'orange';

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: StatColor;
  detail: string;
  isLoading?: boolean;
}

// Başlangıç istatistikleri - veriler yüklenirken kullanılacak
const initialStats: StatItem[] = [
  {
    label: 'Doluluk Oranı',
    value: '-',
    change: '+0%',
    icon: Home,
    color: 'blue',
    detail: '-',
    isLoading: true
  },
  {
    label: 'Aylık Gelir',
    value: '-',
    change: '+0%',
    icon: Wallet,
    color: 'green',
    detail: '-',
    isLoading: true
  },
  {
    label: 'Yeni Kayıtlar',
    value: '-',
    change: '+0%',
    icon: Users,
    color: 'purple',
    detail: '-',
    isLoading: true
  },
  {
    label: 'Boş Odalar',
    value: '-',
    change: '+0%',
    icon: BedDouble,
    color: 'orange',
    detail: '-',
    isLoading: true
  }
];

const colorVariants: Record<StatColor, string> = {
  blue: 'bg-gradient-to-br from-blue-400/10 to-blue-600/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-gradient-to-br from-purple-400/10 to-purple-600/10 text-purple-600 dark:text-purple-400',
  green: 'bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-gradient-to-br from-orange-400/10 to-orange-600/10 text-orange-600 dark:text-orange-400'
};

export default function StatsSidebar() {
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  
  // Dashboard veri çağırma
  const { data: statsData } = useDashboardStats();
  
  // Formatlar
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  // İstatistikler güncellemesi
  useEffect(() => {
    if (statsData && statsData.stats) {
      const updatedStats = [...initialStats];
      
      // Doluluk Oranı
      if (statsData.stats.occupancyRate) {
        updatedStats[0] = {
          ...updatedStats[0],
          value: `%${statsData.stats.occupancyRate.percentage}`,
          change: statsData.stats.occupancyRate.change > 0 
            ? `+${statsData.stats.occupancyRate.change}%` 
            : `${statsData.stats.occupancyRate.change}%`,
          detail: `${statsData.stats.occupancyRate.occupied}/${statsData.stats.occupancyRate.total} Oda`,
          isLoading: false
        };
      }
      
      // Aylık Gelir
      if (statsData.stats.monthlyRevenue) {
        const formattedRevenue = formatCurrency(statsData.stats.monthlyRevenue.amount);
        const formattedPending = formatCurrency(statsData.stats.monthlyRevenue.pending);
        
        updatedStats[1] = {
          ...updatedStats[1],
          value: formattedRevenue,
          change: statsData.stats.monthlyRevenue.change > 0 
            ? `+${statsData.stats.monthlyRevenue.change}%` 
            : `${statsData.stats.monthlyRevenue.change}%`,
          detail: `${formattedPending} Bekleyen`,
          isLoading: false
        };
      }
      
      // Yeni Kayıtlar
      if (statsData.stats.newRegistrations) {
        updatedStats[2] = {
          ...updatedStats[2],
          value: statsData.stats.newRegistrations.count.toString(),
          change: statsData.stats.newRegistrations.change > 0 
            ? `+${statsData.stats.newRegistrations.change}%` 
            : `${statsData.stats.newRegistrations.change}%`,
          detail: statsData.stats.newRegistrations.period,
          isLoading: false
        };
      }
      
      // Boş Odalar
      if (statsData.stats.availableRooms) {
        updatedStats[3] = {
          ...updatedStats[3],
          value: statsData.stats.availableRooms.count.toString(),
          change: statsData.stats.availableRooms.change > 0 
            ? `+${statsData.stats.availableRooms.change}%` 
            : `${statsData.stats.availableRooms.change}%`,
          detail: `${statsData.stats.availableRooms.reserved} Rezerve`,
          isLoading: false
        };
      }
      
      setStats(updatedStats);
    }
  }, [statsData]);

  return (
    <ClientOnly fallback={
      <div className="w-80 space-y-6">
        {initialStats.map((stat, index) => (
          <div
            key={index}
            className="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4"
          >
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-9 w-9"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-5 w-24 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-5 w-12 rounded"></div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    }>
      <div className="w-80 space-y-6">
        {/* Ana İstatistikler */}
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`${colorVariants[stat.color]} p-2 rounded-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between mb-1">
              {stat.isLoading ? (
                <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              )}
              {stat.isLoading ? (
                <div className="h-5 w-12 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>{stat.change}</span>
              )}
            </div>
            {stat.isLoading ? (
              <div className="h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.detail}</div>
            )}
          </div>
        ))}
      </div>
    </ClientOnly>
  );
}