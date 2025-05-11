import React, { ReactNode } from 'react';

interface DataItemProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

interface DataCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DataItem({ label, value, valueClassName = '' }: DataItemProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className={`font-medium ${valueClassName || 'text-gray-900 dark:text-white'}`}>{value}</span>
    </div>
  );
}

export default function DataCard({ title, children, className = '' }: DataCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h4>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}