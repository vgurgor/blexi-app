'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Plus, Building2, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import ApartmentCard from '@/components/apartments/ApartmentCard';
import CompanyCard from '@/components/companies/CompanyCard';
import SearchAndFilters from '@/components/shared/SearchAndFilters';

interface Apartment {
  id: number;
  name: string;
  address: string;
  firm_id: number;
  gender_type: string;
  opening_date: string;
  status: 'active' | 'inactive';
  rooms_count?: number;
  total_rooms?: number;
  occupied_rooms?: number;
  internet_speed?: string;
}

interface Company {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  aparts_count: number;
  aparts: {
    id: number;
    firm_id: number;
    name: string;
    address: string;
    gender_type: string;
    opening_date: string;
    status: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

type TabType = 'apartments' | 'companies';

interface Filters {
  status: string[];
  occupancyRange: string;
  apartmentCount: string;
  genderType?: string;
  firmId?: string;
}

export default function ApartmentsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('apartments');
  const [searchTerm, setSearchTerm] = useState('');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    occupancyRange: 'all',
    apartmentCount: 'all',
    genderType: 'all',
    firmId: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

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
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token, activeTab, currentPage, filters]);

  const fetchData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      let url = '';
      let queryParams = new URLSearchParams();
      
      queryParams.append('page', currentPage.toString());
      queryParams.append('per_page', '9');
      
      if (activeTab === 'apartments') {
        url = 'https://api.blexi.co/api/v1/aparts';
        
        if (filters.genderType && filters.genderType !== 'all') {
          queryParams.append('gender_type', filters.genderType);
        }
        
        if (filters.firmId && filters.firmId !== 'all') {
          queryParams.append('firm_id', filters.firmId);
        }
        
        // Fix: Send status as a single parameter if only one is selected
        if (filters.status.length === 1) {
          queryParams.append('status', filters.status[0]);
        } 
        // If multiple statuses are selected, we'll handle filtering client-side
      } else {
        url = 'https://api.blexi.co/api/v1/firms';
        
        // Fix: Send status as a single parameter if only one is selected
        if (filters.status.length === 1) {
          queryParams.append('status', filters.status[0]);
        }
        // If multiple statuses are selected, we'll handle filtering client-side
      }
      
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        if (activeTab === 'apartments') {
          // If we have multiple status filters, filter client-side
          if (filters.status.length > 1) {
            setApartments(data.data.filter((apartment: Apartment) => 
              filters.status.includes(apartment.status)
            ));
          } else {
            setApartments(data.data);
          }
        } else {
          // If we have multiple status filters, filter client-side
          if (filters.status.length > 1) {
            setCompanies(data.data.filter((company: Company) => 
              filters.status.includes(company.status)
            ));
          } else {
            setCompanies(data.data);
          }
        }
        
        // Set pagination meta
        if (data.meta) {
          setPaginationMeta(data.meta);
        }
      } else {
        console.error('Veri çekme hatası:', data);
      }
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Also fetch companies for the dropdown when in apartments tab
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token || activeTab !== 'apartments') return;
      
      try {
        const response = await fetch('https://api.blexi.co/api/v1/firms?per_page=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok) {
          setCompanies(data.data);
        } else {
          console.error('Firma verileri alınamadı:', data);
        }
      } catch (error) {
        console.error('Firma verileri çekilirken hata oluştu:', error);
      }
    };

    if (isAuthenticated && token && activeTab === 'apartments') {
      fetchCompanies();
    }
  }, [isAuthenticated, token, activeTab]);

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilters({
      status: [],
      occupancyRange: 'all',
      apartmentCount: 'all',
      genderType: 'all',
      firmId: 'all'
    });
    setCurrentPage(1);
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Bilinmiyor';
  };

  const handleApartmentStatusChange = async (id: number, status: 'active' | 'inactive') => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/aparts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setApartments(prev => prev.map(a => 
          a.id === id ? { ...a, status } : a
        ));
        // Refresh data from server
        fetchData();
      } else {
        console.error('Durum değiştirme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleCompanyStatusChange = async (id: number, status: 'active' | 'inactive') => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/firms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setCompanies(prev => prev.map(c => 
          c.id === id ? { ...c, status } : c
        ));
        // Refresh data from server
        fetchData();
      } else {
        console.error('Durum değiştirme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleApartmentDelete = async (id: number) => {
    if (!token) return;
    
    try {
      await fetch(`https://api.blexi.co/api/v1/aparts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      // Update local state
      setApartments(prev => prev.filter(a => a.id !== id));
      // Refresh data from server
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleCompanyDelete = async (id: number) => {
    if (!token) return;
    
    try {
      await fetch(`https://api.blexi.co/api/v1/firms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      // Update local state
      setCompanies(prev => prev.filter(c => c.id !== id));
      // Refresh data from server
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.last_page)) return;
    setCurrentPage(page);
  };

  // Filter only by search term locally, all other filters are handled by the API
  const filteredApartments = apartments.filter(apartment => {
    if (!searchTerm) return true;
    
    return apartment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCompanyName(apartment.firm_id).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    return company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.address && company.address.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-8 pt-24">
      {/* Enhanced Tabs with New Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => handleTabChange('apartments')}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-base transition-all ${
              activeTab === 'apartments'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Building2 className={`w-5 h-5 ${
              activeTab === 'apartments' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <span className="relative">
              Apartlar
              {activeTab === 'apartments' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full" />
              )}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('companies')}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-base transition-all ${
              activeTab === 'companies'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Building className={`w-5 h-5 ${
              activeTab === 'companies' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <span className="relative">
              Firmalar
              {activeTab === 'companies' && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full" />
              )}
            </span>
          </button>
        </div>
        <button 
          onClick={() => router.push(activeTab === 'apartments' ? '/dashboard/apartments/new' : '/dashboard/companies/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
            {activeTab === 'apartments' ? 'Yeni Apart' : 'Yeni Firma'}
          </span>
        </button>
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filters={filters}
        onFilterChange={setFilters}
        activeTab={activeTab}
        companies={companies}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'apartments' ? (
              filteredApartments.length > 0 ? (
                filteredApartments.map(apartment => (
                  <ApartmentCard
                    key={apartment.id}
                    apartment={apartment}
                    getCompanyName={getCompanyName}
                    onStatusChange={handleApartmentStatusChange}
                    onDelete={handleApartmentDelete}
                  />
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-gray-500 dark:text-gray-400">
                  Henüz apart kaydı bulunmamaktadır.
                </div>
              )
            ) : (
              filteredCompanies.length > 0 ? (
                filteredCompanies.map(company => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onStatusChange={handleCompanyStatusChange}
                    onDelete={handleCompanyDelete}
                  />
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-gray-500 dark:text-gray-400">
                  Henüz firma kaydı bulunmamaktadır.
                </div>
              )
            )}
          </div>

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
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {paginationMeta.links
                  .filter(link => !link.label.includes('Previous') && !link.label.includes('Next'))
                  .map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(parseInt(link.label))}
                      className={`min-w-[36px] h-9 px-3 rounded-md font-medium ${
                        link.active
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {link.label}
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
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}