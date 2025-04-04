'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, FileText, User, Calendar, Building2, Pencil, Trash2 } from 'lucide-react';
import { guestsApi } from '@/lib/api/guests';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/atoms/Button';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function StudentsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'ACTIVE',
    guestType: 'STUDENT',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
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
      fetchStudents();
    }
  }, [isAuthenticated, currentPage, filters]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await guestsApi.search(
        searchTerm || undefined,
        filters.guestType as any,
        filters.status as any,
        currentPage,
        10
      );
      
      if (response.success && response.data) {
        setStudents(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } else {
        toast.error('Öğrenciler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Öğrenciler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents();
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'ACTIVE',
      guestType: 'STUDENT',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // Update status to INACTIVE instead of deleting
      const response = await guestsApi.updateStatus(studentToDelete.id, 'INACTIVE');
      
      if (response.success) {
        toast.success('Öğrenci kaydı başarıyla pasife alındı');
        setShowDeleteModal(false);
        fetchStudents(); // Refresh the list
      } else {
        throw new Error(response.error || 'Öğrenci kaydı pasife alınırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error deactivating student:', error);
      setDeleteError(error.message || 'Öğrenci kaydı pasife alınırken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            Aktif
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            Pasif
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
            Askıda
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Öğrenciler
        </h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/students/new')}
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Yeni Öğrenci
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/students/registrations/new')}
            variant="secondary"
            leftIcon={<Calendar className="w-5 h-5" />}
          >
            Yeni Kayıt
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Öğrenci ara..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Pasif</option>
                <option value="SUSPENDED">Askıda</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğrenci Tipi
              </label>
              <select
                name="guestType"
                value={filters.guestType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="STUDENT">Öğrenci</option>
                <option value="EMPLOYEE">Çalışan</option>
                <option value="OTHER">Diğer</option>
              </select>
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

      {/* Students Table */}
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
                    İletişim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bölüm/Fakülte
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
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.person?.name || 'Bilinmeyen Öğrenci'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.person?.phone || '-'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.person?.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.professionDepartment || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/students/${student.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Detaylar"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/students/${student.id}/edit`)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Düzenle"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Pasife Al"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? 'Arama kriterlerine uygun öğrenci bulunamadı.'
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteStudent}
        title="Öğrenci Pasife Alma"
        message={`"${studentToDelete?.person?.name}" isimli öğrenciyi pasife almak istediğinizden emin misiniz? Bu işlem geri alınabilir.`}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
}