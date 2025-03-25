'use client';

import React from 'react';
import { Bell, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';

type NotificationType = 'warning' | 'success' | 'info' | 'pending';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Ödeme Gecikmeleri',
    message: 'A-12 ve B-05 numaralı odaların ödemeleri 3 gün gecikti',
    time: '10 dk önce'
  },
  {
    id: 2,
    type: 'success',
    title: 'Yeni Kayıt',
    message: 'Ahmet Yılmaz C-15 numaralı odaya yerleşti',
    time: '1 saat önce'
  },
  {
    id: 3,
    type: 'info',
    title: 'Bakım Talebi',
    message: 'D Blok çamaşırhane için bakım talebi oluşturuldu',
    time: '2 saat önce'
  },
  {
    id: 4,
    type: 'pending',
    title: 'Yeni Rezervasyon',
    message: 'B-08 odası için rezervasyon talebi bekliyor',
    time: '3 saat önce'
  }
];

const typeIcons = {
  warning: AlertCircle,
  success: CheckCircle2,
  info: Info,
  pending: Clock
};

const typeStyles = {
  warning: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-400/10',
  success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10',
  pending: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10'
};

export default function NotificationsDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">4 yeni bildirim</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type];
          return (
            <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${typeStyles[notification.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <button 
          className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          onClick={onClose}
        >
          Tümünü Gör
        </button>
      </div>
    </div>
  );
}