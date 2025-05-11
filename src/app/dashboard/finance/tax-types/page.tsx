'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Percent, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Hash,
  Info
} from 'lucide-react';
import { taxTypesApi } from '@/lib/api/taxTypes';
import { ITaxType } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function TaxTypesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [taxTypes, setTaxTypes] = useState<ITaxType[]>([]);
  const [filteredTaxTypes, setFilteredTaxTypes] = useState<ITaxType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taxTypeToDelete, setTaxTypeToDelete] = useState<ITaxType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTaxType, setCurrentTaxType] = useState<ITaxType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    taxCode: '',
    percentage: 0,
    priority: 1,
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    taxCode: '',
    percentage: ''
  });

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
      fetchTaxTypes();
    }
  }, [isAuthenticated, statusFilter, currentPage]);

  useEffect(() => {
    // Filter tax types based on search term
    if (taxTypes.length > 0) {
      const filtered = taxTypes.filter(taxType => {
        const matchesSearch = searchTerm === '' || 
          taxType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          taxType.taxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          taxType.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || taxType.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredTaxTypes(filtered);
    }
  }, [searchTerm, taxTypes, statusFilter]);

  const fetchTaxTypes = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const response = await taxTypesApi.getAll(status, currentPage, 10);
      
      if (response.success && response.data) {
        setTaxTypes(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Vergi türleri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Vergi türleri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTaxType = async () => {
    if (!taxTypeToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await taxTypesApi.delete(taxTypeToDelete.id);
      
      if (response.success) {
        setTaxTypes(prev => prev.filter(t => t.id !== taxTypeToDelete.id));
        setShowDeleteModal(false);
      } else {
        throw new Error(response.error || 'Vergi türü silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Vergi türü silme hatası:', error);
      setDeleteError(error.message || 'Vergi türü silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await taxTypesApi.updateStatus(id, status);
      
      if (response.success) {
        setTaxTypes(prev => prev.map(t => 
          t.id === id ? { ...t, status } : t
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleAddTaxType = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      taxCode: '',
      percentage: ''
    };
    
    if (!formData.name.trim()) {
      errors.name = 'Vergi türü adı zorunludur';
      hasError = true;
    }
    
    if (!formData.taxCode.trim()) {
      errors.taxCode = 'Vergi kodu zorunludur';
      hasError = true;
    }
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      errors.percentage = 'Vergi oranı 0-100 arasında olmalıdır';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await taxTypesApi.create({
        name: formData.name,
        tax_code: formData.taxCode,
        percentage: formData.percentage,
        priority: formData.priority,
        description: formData.description,
        status: formData.status
      });
      
      if (response.success && response.data) {
        setTaxTypes(prev => [...prev, response.data as ITaxType]);
        setShowAddModal(false);
        setFormData({
          name: '',
          taxCode: '',
          percentage: 0,
          priority: 1,
          description: '',
          status: 'active'
        });
      } else {
        console.error('Vergi türü oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Vergi türü oluşturma hatası:', error);
    }
  };

  const handleEditTaxType = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      taxCode: '',
      percentage: ''
    };
    
    if (!formData.name.trim()) {
      errors.name = 'Vergi türü adı zorunludur';
      hasError = true;
    }
    
    if (!formData.taxCode.trim()) {
      errors.taxCode = 'Vergi kodu zorunludur';
      hasError = true;
    }
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      errors.percentage = 'Vergi oranı 0-100 arasında olmalıdır';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError || !currentTaxType) return;
    
    try {
      const response = await taxTypesApi.update(currentTaxType.id, {
        name: formData.name,
        tax_code: formData.taxCode,
        percentage: formData.percentage,
        priority: formData.priority,
        description: formData.description,
        status: formData.status
      });
      
      if (response.success) {
        setTaxTypes(prev => prev.map(t => 
          t.id === currentTaxType.id ? { 
            ...t, 
            name: formData.name, 
            taxCode: formData.taxCode,
            percentage: formData.percentage,
            priority: formData.priority,
            description: formData.description,
            status: formData.status 
          } : t
        ));
        setShowEditModal(false);
      } else {
        console.error('Vergi türü güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Vergi türü güncelleme hatası:', error);
    }
  };

  const openEditModal = (taxType: ITaxType) => {
    setCurrentTaxType(taxType);
    setFormData({
      name: taxType.name,
      taxCode: taxType.taxCode,
      percentage: taxType.percentage,
      priority: taxType.priority,
      description: taxType.description || '',
      status: taxType.status
    });
    setFormErrors({
      name: '',
      taxCode: '',
      percentage: ''
    });
    setShowEditModal(true);
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
          Vergi Türleri
        </h1>
        <button 
          onClick={() => {
            setFormData({
              name: '',
              taxCode: '',
              percentage: 0,
              priority: 1,
              description: '',
              status: 'active'
            });
            setFormErrors({
              name: '',
              taxCode: '',
              percentage: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Vergi Türü</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Vergi türü ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      {/* Tax Types Table */}
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
                    Vergi Türü
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vergi Kodu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Oran (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Öncelik
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
                {filteredTaxTypes.length > 0 ? (
                  filteredTaxTypes.map((taxType) => (
                    <tr key={taxType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Percent className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{taxType.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{taxType.taxCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">%{taxType.percentage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{taxType.priority}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          taxType.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {taxType.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(taxType)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {taxType.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(taxType.id, 'inactive')}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Pasife Al"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(taxType.id, 'active')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Aktife Al"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTaxTypeToDelete(taxType);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                      {searchTerm ? 'Arama kriterlerine uygun vergi türü bulunamadı.' : 'Henüz vergi türü kaydı bulunmamaktadır.'}
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
        onConfirm={handleDeleteTaxType}
        title="Vergi Türü Silme"
        message={`"${taxTypeToDelete?.name}" vergi türünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Add Tax Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Vergi Türü Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Türü Adı*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="KDV"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Kodu*
                    </label>
                    <input
                      type="text"
                      id="taxCode"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.taxCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="KDV18"
                    />
                    {formErrors.taxCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.taxCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Oranı (%)*
                    </label>
                    <input
                      type="number"
                      id="percentage"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.percentage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    {formErrors.percentage && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.percentage}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Öncelik
                    </label>
                    <input
                      type="number"
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Öncelik, birden fazla vergi uygulandığında hesaplama sırasını belirler.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Vergi türü hakkında açıklama"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddTaxType}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tax Type Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Vergi Türü Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Türü Adı*
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-taxCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Kodu*
                    </label>
                    <input
                      type="text"
                      id="edit-taxCode"
                      value={formData.taxCode}
                      onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.taxCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.taxCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.taxCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vergi Oranı (%)*
                    </label>
                    <input
                      type="number"
                      id="edit-percentage"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.percentage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    {formErrors.percentage && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.percentage}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Öncelik
                    </label>
                    <input
                      type="number"
                      id="edit-priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="edit-status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditTaxType}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}