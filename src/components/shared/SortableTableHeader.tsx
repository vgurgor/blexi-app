import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableTableHeaderProps {
  label: string;
  field: string;
  currentSortField: string;
  currentSortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function SortableTableHeader({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort
}: SortableTableHeaderProps) {
  const getSortIcon = () => {
    if (currentSortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return currentSortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1 text-blue-500" /> : 
      <ArrowDown className="w-4 h-4 ml-1 text-blue-500" />;
  };

  return (
    <button 
      onClick={() => onSort(field)}
      className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      {label} {getSortIcon()}
    </button>
  );
}