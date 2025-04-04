'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, FileText, User, Calendar, Building2 } from 'lucide-react';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { useToast } from '@/hooks/useToast';

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    guestId: '',
    apartId: '',
    seasonCode: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid) {
          router.replace('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAuth, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, currentPage, filters]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await seasonRegistrationsApi.getAll(
        filters.guestId || undefined,
        filters.apartId || undefined,
        filters.seasonCode || undefined,
        currentPage,
        10
      );
      
      if (response.success && response.data) {
        setRegistrations(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } else {
        toast.error('Öğrenci kayıtları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      toast.error('Öğrenci kayıtları yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRegistrations();
  };

  const handleClearFilters = () => {
    setFilters({
      guestId: '',
      apartId: '',
      seasonCode: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            Aktif
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            İptal Edildi
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            Tamamlandı
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter registrations by search term
  const filteredRegistrations = registrations.filter(registration => {
    if (!searchTerm) return true;
    
    // Search in guest name, apart name, or season name
    return (
      (registration.guest?.person?.name && registration.guest.person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (registration.apart?.name && registration.apart.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (registration.season?.name && registration.season.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Öğrenci Kayıtları
        </h1>
        <button 
          onClick={() => router.push('/dashboard/students/registrations/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Öğrenci Kaydı</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Öğrenci kaydı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtreler
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci ID
              </label>
              <input
                type="text"
                name="guestId"
                value={filters.guestId}
                onChange={handleFilterChange}
                placeholder="Öğrenci ID"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apart ID
              </label>
              <input
                type="text"
                name="apartId"
                value={filters.apartId}
                onChange={handleFilterChange}
                placeholder="Apart ID"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sezon Kodu
              </label>
              <input
                type="text"
                name="seasonCode"
                value={filters.seasonCode}
                onChange={handleFilterChange}
                placeholder="Sezon Kodu"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Temizle
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Filtrele
            </button>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Öğrenci
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Apart
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sezon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tarih Aralığı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{registration.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {registration.guest?.person?.name || 'Bilinmeyen Öğrenci'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {registration.apart?.name || 'Bilinmeyen Apart'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {registration.season?.name || registration.seasonCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(registration.checkInDate).toLocaleDateString('tr-TR')} - {new Date(registration.checkOutDate).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/students/registrations/${registration.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filters.guestId || filters.apartId || filters.seasonCode
                        ? 'Arama kriterlerine uygun öğrenci kaydı bulunamadı.'
                        : 'Henüz öğrenci kaydı bulunmamaktadır.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}