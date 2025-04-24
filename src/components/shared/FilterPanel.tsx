import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  filters: Record<string, any>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onClose: () => void;
  filterOptions?: {
    students?: FilterOption[];
    apartments?: FilterOption[];
    seasons?: FilterOption[];
    statuses?: FilterOption[];
    genders?: FilterOption[];
    academicStatuses?: FilterOption[];
  };
  showAdvancedFilters?: boolean;
  advancedFilters?: Record<string, any>;
  onAdvancedFilterChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  onClose,
  filterOptions = {},
  showAdvancedFilters = false,
  advancedFilters = {},
  onAdvancedFilterChange
}: FilterPanelProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtreler</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Öğrenci
          </label>
          <select
            name="studentId"
            value={filters.studentId}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="">Tüm Öğrenciler</option>
            {filterOptions.students?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apart
          </label>
          <select
            name="apartId"
            value={filters.apartId}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="">Tüm Apartlar</option>
            {filterOptions.apartments?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sezon
          </label>
          <select
            name="seasonCode"
            value={filters.seasonCode}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="">Tüm Sezonlar</option>
            {filterOptions.seasons?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durum
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && onAdvancedFilterChange && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Gelişmiş Filtreler
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cinsiyet
              </label>
              <select
                name="gender"
                value={advancedFilters.gender}
                onChange={onAdvancedFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Tümü</option>
                <option value="MALE">Erkek</option>
                <option value="FEMALE">Kadın</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Yaş
              </label>
              <input
                type="number"
                name="ageMin"
                value={advancedFilters.ageMin}
                onChange={onAdvancedFilterChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maksimum Yaş
              </label>
              <input
                type="number"
                name="ageMax"
                value={advancedFilters.ageMax}
                onChange={onAdvancedFilterChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bölüm/Program
              </label>
              <input
                type="text"
                name="department"
                value={advancedFilters.department}
                onChange={onAdvancedFilterChange}
                placeholder="Bölüm adı..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Akademik Durum
              </label>
              <select
                name="academicStatus"
                value={advancedFilters.academicStatus}
                onChange={onAdvancedFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Tümü</option>
                {filterOptions.academicStatuses?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Veli Adı
              </label>
              <input
                type="text"
                name="guardianName"
                value={advancedFilters.guardianName}
                onChange={onAdvancedFilterChange}
                placeholder="Veli adı..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-3 mt-4">
        <Button
          onClick={onClearFilters}
          variant="secondary"
        >
          Filtreleri Temizle
        </Button>
        <Button
          onClick={onApplyFilters}
          variant="primary"
        >
          Filtrele
        </Button>
      </div>
    </div>
  );
}