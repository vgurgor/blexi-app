'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { Plus, Search, Filter } from 'lucide-react';
import { firmsApi, type FirmDto, type FirmFilters } from '@/lib/api/firms';
import { ICompany } from '@/types/models';
import CompanyCard from '@/components/companies/CompanyCard';

export default function CompaniesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<any>(null);
  const [error, setError] = useState('');

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
      fetchCompanies();
    }
  }, [isAuthenticated, currentPage, selectedStatus]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const filters: FirmFilters = {
        page: currentPage,
        per_page: 9
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      const response = await firmsApi.getAll(filters);
      setCompanies(response.data);
      setPaginationMeta(response.meta);
    } catch (error: any) {
      console.error('Firma verileri çekilirken hata oluştu:', error);
      setError(error.message || 'Firma verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'inactive') => {
    try {
      await firmsApi.update(id, { status });
      // Update local state
      setCompanies(prev => prev.map(company => 
        company.id === id ? { ...company, status } : company
      ));
      // Refresh data from server
      fetchCompanies();
    } catch (error: any) {
      console.error('Durum değiştirme hatası:', error);
      setError(error.message || 'Durum güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await firmsApi.delete(id);
      // Update local state
      setCompanies(prev => prev.filter(company => company.id !== id));
      // Refresh data from server
      fetchCompanies();
    } catch (error: any) {
      console.error('Silme hatası:', error);
      setError(error.message || 'Firma silinirken bir hata oluştu');
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.last_page)) return;
    setCurrentPage(page);
  };

  // Filter companies by search term
  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    return (
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.address && company.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.phone && company.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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

  return (
    <div className="p-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Firmalar
        </h1>
        <button 
          onClick={() => router.push('/dashboard/companies/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Yeni Firma</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Firma ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          
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
      </div>

      {/* Companies List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Arama kriterlerine uygun firma bulunamadı.' : 'Henüz firma kaydı bulunmamaktadır.'}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {paginationMeta && paginationMeta.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[36px] h-9 px-3 rounded-md font-medium ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationMeta.last_page}
              className={`p-2 rounded-md ${
                currentPage === paginationMeta.last_page
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}