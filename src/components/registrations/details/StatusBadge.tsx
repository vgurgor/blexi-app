import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="w-4 h-4" />
          Aktif
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <CheckCircle className="w-4 h-4" />
          Tamamlandı
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <XCircle className="w-4 h-4" />
          İptal Edildi
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          {status}
        </span>
      );
  }
}