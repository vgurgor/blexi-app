'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Calendar,
  Building2,
  Download,
  SlidersHorizontal,
  X,
  Check,
  FileDown,
  FileSpreadsheet,
  FileIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Bed,
  DollarSign,
  Tag,
  BarChart
} from 'lucide-react';
import RegistrationStats from '@/components/registrations/RegistrationStats';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { guestsApi } from '@/lib/api/guests';
import { apartsApi } from '@/lib/api/apartments';
import { seasonsApi } from '@/lib/api/seasons';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/atoms/Button';
import { FormInput, FormSelect } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { downloadCSV, downloadExcel, formatDataForExport, getStudentRegistrationExportHeaders } from '@/utils/export';

// Yardımcı fonksiyon - professionDepartment alanı için
const formatProfessionDepartment = (prof: any): string => {
  if (!prof) return '';
  
  // Nesne ise
  if (typeof prof === 'object' && prof !== null) {
    try {
      // school_name ve education_level'i kullan
      const schoolName = prof.school_name || '';
      const educationLevel = prof.education_level || '';
      if (schoolName && educationLevel) {
        return `${schoolName} / ${educationLevel}`;
      } else if (schoolName) {
        return schoolName;
      } else if (educationLevel) {
        return educationLevel;
      }
      
      // Diğer durumlarda JSON'a dönüştür
      return JSON.stringify(prof);
    } catch {
      return String(prof);
    }
  }
  
  // String ise ve JSON olabilir
  if (typeof prof === 'string') {
    try {
      const parsed = JSON.parse(prof);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatProfessionDepartment(parsed);
      }
      return prof;
    } catch {
      return prof;
    }
  }
  
  // Son çare - her zaman string'e dönüştür
  return String(prof);
};

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const toast = useToast();

  // Reference data
  const [students, setStudents] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);

  // Pagination
  const [perPage, setPerPage] = useState(10);
  
  // Sorting
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Basic filters
  const [filters, setFilters] = useState({
    search: '',
    studentId: '',
    apartId: '',
    seasonCode: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    ageMin: '',
    ageMax: '',
    gender: '',
    department: '',
    academicStatus: '',
    guardianName: '',
  });

  // Selected items for bulk actions
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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
      fetchReferenceData();
    }
  }, [isAuthenticated, currentPage, perPage, sortField, sortDirection]);

  // Fetch reference data (students, apartments, seasons)
  const fetchReferenceData = async () => {
    setIsLoadingReferenceData(true);
    try {
      // Fetch students with error handling
      try {
        const studentsResponse = await guestsApi.getAll(1, 100);
        if (studentsResponse.success && studentsResponse.data) {
          setStudents(studentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }

      // Fetch apartments with error handling
      try {
        const apartmentsResponse = await apartsApi.getAll();
        if (apartmentsResponse.success && apartmentsResponse.data) {
          setApartments(apartmentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching apartments:', error);
      }

      // Fetch seasons with error handling
      try {
        const seasonsResponse = await seasonsApi.getAll();
        if (seasonsResponse.success && seasonsResponse.data) {
          setSeasons(seasonsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    } catch (error) {
      console.error('Reference data fetch error:', error);
      toast.error('Referans verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingReferenceData(false);
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      // Prepare API parameters
      const guestId = filters.studentId || undefined;
      const apartId = filters.apartId || undefined;
      const seasonCode = filters.seasonCode || undefined;
      const status = filters.status || undefined;
      const startDate = filters.startDate || undefined;
      const endDate = filters.endDate || undefined;
      
      const response = await seasonRegistrationsApi.getAll(
        guestId,
        apartId,
        seasonCode,
        status as any,
        startDate,
        endDate,
        currentPage,
        perPage
      );
      
      if (response.success && response.data) {
        setRegistrations(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
        setTotalRecords(response.total);
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

  const handleAdvancedFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRegistrations();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      studentId: '',
      apartId: '',
      seasonCode: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setAdvancedFilters({
      ageMin: '',
      ageMax: '',
      gender: '',
      department: '',
      academicStatus: '',
      guardianName: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(registrations.map(reg => reg.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast.warning('Lütfen en az bir kayıt seçin');
      return;
    }

    switch (action) {
      case 'export-excel':
        const formattedData = formatDataForExport(
          registrations.filter(reg => selectedItems.includes(reg.id))
        );
        const headers = getStudentRegistrationExportHeaders();
        downloadExcel(formattedData, headers, 'ogrenci-kayitlari.xlsx');
        toast.success(`${selectedItems.length} kayıt Excel'e aktarıldı`);
        break;
      case 'export-pdf':
        toast.info(`${selectedItems.length} kayıt PDF'e aktarılıyor...`);
        // Implement PDF export logic
        break;
      case 'complete':
        toast.info(`${selectedItems.length} kayıt tamamlanıyor...`);
        // Implement bulk completion logic
        break;
      case 'cancel':
        toast.info(`${selectedItems.length} kayıt iptal ediliyor...`);
        // Implement bulk cancellation logic
        break;
      default:
        break;
    }
  };

  // Navigate to student details page
  const handleViewStudentDetails = (registration: any) => {
    if (registration.guest?.id) {
      router.push(`/dashboard/students/registrations/${registration.id}`);
    } else {
      toast.error('Öğrenci bilgisi bulunamadı');
    }
  };

  // Navigate to registration details page
  const handleViewRegistrationDetails = (registrationId: string) => {
    router.push(`/dashboard/students/registrations/${registrationId}`);
  };

  // Filter registrations by search term
  const filteredRegistrations = useMemo(() => {
    if (!filters.search) return registrations;
    
    return registrations.filter(registration => {
      // Search in guest name, apart name, or season name
      return (
        (registration.guest?.person?.name && 
         registration.guest.person.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        ((registration.bed?.room?.apart?.name || registration.apart?.name) && 
         (registration.bed?.room?.apart?.name || registration.apart?.name).toLowerCase().includes(filters.search.toLowerCase())) ||
        (registration.season?.name && 
         registration.season.name.toLowerCase().includes(filters.search.toLowerCase()))
      );
    });
  }, [registrations, filters.search]);

  // Apply advanced filters client-side
  const finalFilteredRegistrations = useMemo(() => {
    if (!showAdvancedFilters) return filteredRegistrations;
    
    return filteredRegistrations.filter(registration => {
      let matches = true;
      
      // Gender filter
      if (advancedFilters.gender && registration.guest?.person?.gender) {
        matches = matches && registration.guest.person.gender === advancedFilters.gender;
      }
      
      // Department filter
      if (advancedFilters.department && registration.guest?.professionDepartment) {
        const formattedDept = formatProfessionDepartment(registration.guest.professionDepartment);
        matches = matches && formattedDept.toLowerCase().includes(advancedFilters.department.toLowerCase());
      }
      
      // Age filter
      if ((advancedFilters.ageMin || advancedFilters.ageMax) && registration.guest?.person?.birthDate) {
        const birthDate = new Date(registration.guest.person.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (advancedFilters.ageMin && parseInt(advancedFilters.ageMin) > 0) {
          matches = matches && age >= parseInt(advancedFilters.ageMin);
        }
        
        if (advancedFilters.ageMax && parseInt(advancedFilters.ageMax) > 0) {
          matches = matches && age <= parseInt(advancedFilters.ageMax);
        }
      }
      
      // Guardian name filter
      if (advancedFilters.guardianName && registration.guest?.guardians?.length > 0) {
        const guardianMatch = registration.guest.guardians.some((guardian: any) => 
          guardian.person?.name?.toLowerCase().includes(advancedFilters.guardianName.toLowerCase()) ||
          guardian.person?.surname?.toLowerCase().includes(advancedFilters.guardianName.toLowerCase())
        );
        matches = matches && guardianMatch;
      }
      
      return matches;
    });
  }, [filteredRegistrations, showAdvancedFilters, advancedFilters]);

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

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Öğrenci Kayıtları
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard/students/registrations/new')}
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Yeni Öğrenci Kaydı
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowStats(!showStats)}
              variant={showStats ? "primary" : "secondary"}
              leftIcon={<BarChart className="w-5 h-5" />}
            >
              {showStats ? "İstatistikleri Gizle" : "İstatistikler"}
            </Button>

            <div className="relative group">
              <Button
                onClick={() => {}}
                variant="secondary"
                leftIcon={<Download className="w-5 h-5" />}
              >
                Dışa Aktar
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleBulkAction('export-excel')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel'e Aktar
                  </button>
                  <button
                    onClick={() => handleBulkAction('export-pdf')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileIcon className="w-4 h-4 mr-2" />
                    PDF'e Aktar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      {showStats && (
        <div className="mb-6">
          <RegistrationStats />
        </div>
      )}

      {/* Search and Basic Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Öğrenci adı, apart veya sezon ara..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "primary" : "secondary"}
            leftIcon={showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          >
            {showFilters ? "Filtreleri Gizle" : "Filtreler"}
          </Button>
          
          <Button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            variant={showAdvancedFilters ? "primary" : "secondary"}
            leftIcon={<SlidersHorizontal className="w-5 h-5" />}
          >
            {showAdvancedFilters ? "Basit Filtreler" : "Gelişmiş Filtreler"}
          </Button>
        </div>
      </div>

      {/* Basic Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci
              </label>
              <select
                name="studentId"
                value={filters.studentId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Tüm Öğrenciler</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.person?.name} {student.person?.surname}
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
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Tüm Apartlar</option>
                {apartments.map(apart => (
                  <option key={apart.id} value={apart.id}>
                    {apart.name}
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
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="">Tüm Sezonlar</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.code}>
                    {season.name}
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
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
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
                    onChange={handleAdvancedFilterChange}
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
                    onChange={handleAdvancedFilterChange}
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
                    onChange={handleAdvancedFilterChange}
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
                    onChange={handleAdvancedFilterChange}
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
                    onChange={handleAdvancedFilterChange}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  >
                    <option value="">Tümü</option>
                    <option value="good">İyi</option>
                    <option value="average">Orta</option>
                    <option value="poor">Zayıf</option>
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
                    onChange={handleAdvancedFilterChange}
                    placeholder="Veli adı..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sayfa Başına
                </label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sıralama
                </label>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction as 'asc' | 'desc');
                  }}
                  
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  <option value="created_at-desc">Kayıt Tarihi (Yeni-Eski)</option>
                  <option value="created_at-asc">Kayıt Tarihi (Eski-Yeni)</option>
                  <option value="guest.person.name-asc">İsim (A-Z)</option>
                  <option value="guest.person.name-desc">İsim (Z-A)</option>
                  <option value="check_in_date-asc">Giriş Tarihi (Eski-Yeni)</option>
                  <option value="check_in_date-desc">Giriş Tarihi (Yeni-Eski)</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleClearFilters}
                variant="secondary"
              >
                Filtreleri Temizle
              </Button>
              <Button
                onClick={handleSearch}
                variant="primary"
              >
                Filtrele
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300">
              {selectedItems.length} kayıt seçildi
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkAction('export-excel')}
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Excel'e Aktar
            </Button>
            <Button
              onClick={() => handleBulkAction('export-pdf')}
              variant="secondary"
              size="sm"
              leftIcon={<FileIcon className="w-4 h-4" />}
            >
              PDF'e Aktar
            </Button>
            <Button
              onClick={() => handleBulkAction('complete')}
              variant="success"
              size="sm"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Tamamla
            </Button>
            <Button
              onClick={() => handleBulkAction('cancel')}
              variant="danger"
              size="sm"
              leftIcon={<X className="w-4 h-4" />}
            >
              İptal Et
            </Button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Toplam <span className="font-medium">{totalRecords}</span> kayıt bulundu
          {filters.search && (
            <span> - Arama: "<span className="font-medium">{filters.search}</span>"</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Sayfa {currentPage} / {totalPages}
          </span>
        </div>
      </div>

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
                  <th scope="col" className="px-3 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('id')}
                      className="flex items-center"
                    >
                      ID {sortField === 'id' && getSortIcon('id')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('guest.person.name')}
                      className="flex items-center"
                    >
                      Öğrenci {sortField === 'guest.person.name' && getSortIcon('guest.person.name')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('bed.room.apart.name')}
                      className="flex items-center"
                    >
                      Konaklama {sortField === 'bed.room.apart.name' && getSortIcon('bed.room.apart.name')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('check_in_date')}
                      className="flex items-center"
                    >
                      Tarih Aralığı {sortField === 'check_in_date' && getSortIcon('check_in_date')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('status')}
                      className="flex items-center"
                    >
                      Durum {sortField === 'status' && getSortIcon('status')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {finalFilteredRegistrations.length > 0 ? (
                  finalFilteredRegistrations.map((registration) => (
                    <tr 
                      key={registration.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="px-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(registration.id)}
                          onChange={() => handleSelectItem(registration.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => handleViewRegistrationDetails(registration.id)}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{registration.id}</div>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => registration.guest?.id && handleViewStudentDetails(registration)}
                      >
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {registration.guest?.person?.name+' '+registration.guest?.person?.surname || 'Bilinmeyen Öğrenci'}
                          </div>
                        </div>
                        
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => handleViewRegistrationDetails(registration.id)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Building2 className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {registration.bed?.room?.apart?.name || registration.apart?.name || 'Bilinmeyen Apart'}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <Bed className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {registration.bed?.room?.name+'-'+registration.bed?.bedNumber || 'Yatak belirtilmemiş'}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <Tag className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {registration.season?.name || registration.seasonCode || 'Sezon belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => handleViewRegistrationDetails(registration.id)}
                      >
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(registration.checkInDate).toLocaleDateString('tr-TR')} - {new Date(registration.checkOutDate).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        {registration.depositAmount > 0 && (
                          <div className="flex items-center mt-1">
                            <DollarSign className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Depozito: {formatCurrency(registration.depositAmount)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={() => handleViewRegistrationDetails(registration.id)}
                      >
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewStudentDetails(registration)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Öğrenci Detayları"
                          >
                            <User className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleViewRegistrationDetails(registration.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Kayıt Detayları"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {filters.search || filters.studentId || filters.apartId || filters.seasonCode || filters.status || filters.startDate || filters.endDate || 
                       advancedFilters.gender || advancedFilters.ageMin || advancedFilters.ageMax || advancedFilters.department || advancedFilters.academicStatus || advancedFilters.guardianName
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
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Gösterilen: {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalRecords)} / {totalRecords}
          </div>
          
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
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
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