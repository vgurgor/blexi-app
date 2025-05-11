'use client';

import React from 'react';
import { Home, Wallet, Users, BedDouble } from 'lucide-react';

type StatColor = 'blue' | 'purple' | 'green' | 'orange';

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: StatColor;
  detail: string;
}

const stats: StatItem[] = [
  {
    label: 'Doluluk Oranı',
    value: '%92',
    change: '+5.3%',
    icon: Home,
    color: 'blue',
    detail: '142/156 Oda'
  },
  {
    label: 'Aylık Gelir',
    value: '₺248K',
    change: '+12.5%',
    icon: Wallet,
    color: 'green',
    detail: '₺28K Bekleyen'
  },
  {
    label: 'Yeni Kayıtlar',
    value: '24',
    change: '+8.2%',
    icon: Users,
    color: 'purple',
    detail: 'Bu Ay'
  },
  {
    label: 'Boş Odalar',
    value: '14',
    change: '-2.3%',
    icon: BedDouble,
    color: 'orange',
    detail: '8 Rezerve'
  }
];

const colorVariants: Record<StatColor, string> = {
  blue: 'bg-gradient-to-br from-blue-400/10 to-blue-600/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-gradient-to-br from-purple-400/10 to-purple-600/10 text-purple-600 dark:text-purple-400',
  green: 'bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-gradient-to-br from-orange-400/10 to-orange-600/10 text-orange-600 dark:text-orange-400'
};

export default function StatsSidebar() {
  return (
    <div className="w-80 space-y-6">
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
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
            <span className={`text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>{stat.change}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{stat.detail}</div>
        </div>
      ))}
    </div>
  );
}