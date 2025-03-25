'use client';

import { Search, Filter, X } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: {
    status: string[];
    occupancyRange: string;
    apartmentCount: string;
    genderType?: string;
    firmId?: string;
  };
  onFilterChange: (filters: any) => void;
  activeTab: 'apartments' | 'companies';
  companies?: any[];
}

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  activeTab,
  companies = []
}: SearchAndFiltersProps) {
  const toggleFilter = (type: 'status', value: string) => {
    onFilterChange({
      ...filters,
      status: filters.status.includes(value)
        ? filters.status.filter(s => s !== value)
        : [...filters.status, value]
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'apartments' ? "Apart ara..." : "Firma ara..."}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        <button 
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          Filtreler
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Durum</h3>
              <div className="flex gap-2">
                {activeTab === 'apartments' ? (
                  <>
                    <button
                      onClick={() => toggleFilter('status', 'active')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.status.includes('active')
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      onClick={() => toggleFilter('status', 'inactive')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.status.includes('inactive')
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      Pasif
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleFilter('status', 'active')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.status.includes('active')
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      onClick={() => toggleFilter('status', 'inactive')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.status.includes('inactive')
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      Pasif
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Additional Filters */}
            {activeTab === 'apartments' ? (
              <>
                {/* Gender Type Filter for Apartments */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Cinsiyet Tipi
                  </h3>
                  <select
                    value={filters.genderType || 'all'}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      genderType: e.target.value
                    })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="MALE">Erkek</option>
                    <option value="FEMALE">Kız</option>
                    <option value="MIXED">Karma</option>
                  </select>
                </div>

                {/* Firm Filter for Apartments */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Firma
                  </h3>
                  <select
                    value={filters.firmId || 'all'}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      firmId: e.target.value
                    })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Firmalar</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Occupancy Filter for Apartments */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Doluluk Oranı
                  </h3>
                  <select
                    value={filters.occupancyRange}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      occupancyRange: e.target.value
                    })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="high">%80 ve üzeri</option>
                    <option value="medium">%50-%80 arası</option>
                    <option value="low">%50 altı</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Apart Sayısı
                </h3>
                <select
                  value={filters.apartmentCount}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    apartmentCount: e.target.value
                  })}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="high">3 ve üzeri</option>
                  <option value="medium">2 apart</option>
                  <option value="low">1 apart</option>
                </select>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => onFilterChange({
                  status: [],
                  occupancyRange: 'all',
                  apartmentCount: 'all',
                  genderType: 'all',
                  firmId: 'all'
                })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}