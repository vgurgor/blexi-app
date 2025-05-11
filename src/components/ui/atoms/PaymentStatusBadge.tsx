import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Info } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: string;
  size?: 'xs' | 'sm' | 'md';
  label?: string;
}

export default function PaymentStatusBadge({ 
  status, 
  size = 'xs',
  label
}: PaymentStatusBadgeProps) {
  
  const sizeClasses = {
    xs: 'text-xs py-1 px-2.5 gap-1',
    sm: 'text-sm py-1 px-2.5 gap-1',
    md: 'text-md py-1.5 px-3 gap-1.5'
  };
  
  const iconSize = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };
  
  const getStatusLabel = () => {
    if (label) return label;
    
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'overdue':
        return 'Gecikmiş';
      case 'partial_paid':
        return 'Kısmi Ödeme';
      case 'planned':
        return 'Planlandı';
      default:
        return status;
    }
  };
  
  switch (status) {
    case 'paid':
      return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`}>
          <CheckCircle className={iconSize[size]} />
          {getStatusLabel()}
        </span>
      );
    case 'overdue':
      return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300`}>
          <AlertTriangle className={iconSize[size]} />
          {getStatusLabel()}
        </span>
      );
    case 'partial_paid':
      return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300`}>
          <AlertTriangle className={iconSize[size]} />
          {getStatusLabel()}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300`}>
          <Clock className={iconSize[size]} />
          {getStatusLabel()}
        </span>
      );
  }
}