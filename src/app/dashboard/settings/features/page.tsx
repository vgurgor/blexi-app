'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { featuresApi, type FeatureFilters } from '@/lib/api/features';
import { IFeature } from '@/types/models';
import { Settings, Plus, Edit, Trash2, Search, Filter, ArrowLeft, Wifi, Tv, Bed, Home, Coffee, Utensils, ShowerHead as Shower, Wind, Check, X } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

// Interface to extend IFeature with additional properties from API
interface FeatureWithAssignments extends IFeature {
  assignments_count?: number;
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

export default function FeaturesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [features, setFeatures] = useState<FeatureWithAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<FeatureWithAssignments | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureWithAssignments | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    code: '',
    type: 'ROOM',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    code: '',
    type: '',
    status: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      fetchFeatures();
    }
  }, [isAuthenticated, token, currentPage, selectedType, selectedStatus]);

  // Reset success state when modal is closed
  useEffect(() => {
    if (!showAddEditModal) {
      setSubmitSuccess(false);
    }
  }, [showAddEditModal]);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      // Prepare filters for API
      const filters: FeatureFilters = {
        page: currentPage,
        per_page: 10
      };
      
      if (selectedType !== 'all') {
        filters.type = selectedType as 'ROOM' | 'BED' | 'APART' | 'MIXED';
      }
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus as 'active' | 'inactive';
      }
      
      // Use the API service instead of direct fetch
      const response = await featuresApi.getAll(filters);
      
      if (response.success) {
        // Add assignments_count if missing (to satisfy our extended interface)
        const featuresWithAssignments = response.data.map(feature => ({
          ...feature,
          assignments_count: (feature as any).assignments_count || 0
        }));
        
        setFeatures(featuresWithAssignments);
        
        // Set pagination meta
        if (response.meta) {
          setPaginationMeta(response.meta as PaginationMeta);
        }
      } else {
        console.error('Veri çekme hatası:', response.error);
      }
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.last_page)) return;
    setCurrentPage(page);
  };

  const handleDeleteClick = (feature: FeatureWithAssignments) => {
    setFeatureToDelete(feature);
    setShowDeleteModal(true);
  };

  const handleDeleteFeature = async () => {
    if (!featureToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // Use the API service instead of direct fetch
      const response = await featuresApi.delete(featureToDelete.id);

      if (response.success) {
        setFeatures(prev => prev.filter(f => f.id !== featureToDelete.id));
        setShowDeleteModal(false);
        fetchFeatures(); // Refresh the list
      } else {
        throw new Error(response.error || 'Özellik silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Özellik silme hatası:', error);
      setDeleteError(error.message || 'Özellik silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentFeature(null);
    setFormData({
      id: 0,
      name: '',
      code: '',
      type: 'ROOM',
      status: 'active'
    });
    setFormErrors({
      name: '',
      code: '',
      type: '',
      status: ''
    });
    setSubmitSuccess(false); // Reset success state
    setShowAddEditModal(true);
  };

  const handleEditClick = (feature: FeatureWithAssignments) => {
    if (!feature) return;
    
    setIsEditing(true);
    setCurrentFeature(feature);
    setFormData({
      id: Number(feature.id),
      name: feature.name,
      code: feature.code,
      type: feature.type,
      status: feature.status
    });
    setFormErrors({
      name: '',
      code: '',
      type: '',
      status: ''
    });
    setSubmitSuccess(false); // Reset success state
    setShowAddEditModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowAddEditModal(false);
    setSubmitSuccess(false); // Reset success state when closing modal
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      code: '',
      type: '',
      status: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'İsim alanı zorunludur';
      valid = false;
    }

    if (!formData.code.trim()) {
      errors.code = 'Kod alanı zorunludur';
      valid = false;
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      errors.code = 'Kod sadece büyük harf, rakam ve alt çizgi içerebilir';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // Create a clean request object without the id field
      const { id, ...requestData } = formData;
      
      // Map form data to IFeature format
      const featureData: Partial<IFeature> = {
        name: requestData.name,
        code: requestData.code,
        type: requestData.type as 'ROOM' | 'BED' | 'APART' | 'MIXED',
        status: requestData.status as 'active' | 'inactive'
      };
      
      let response;
      
      if (isEditing && currentFeature) {
        // Use update API method
        response = await featuresApi.update(currentFeature.id, featureData);
      } else {
        // Use create API method
        response = await featuresApi.create(featureData);
      }
      
      if (response.success) {
        setSubmitSuccess(true);
        fetchFeatures(); // Refresh the list
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowAddEditModal(false);
        }, 1500);
      } else {
        // Handle validation errors
        if (response.errors) {
          const serverErrors = {
            name: response.errors.name?.[0] || '',
            code: response.errors.code?.[0] || '',
            type: response.errors.type?.[0] || '',
            status: response.errors.status?.[0] || ''
          };
          setFormErrors(serverErrors);
        } else {
          throw new Error(response.error || 'İşlem sırasında bir hata oluştu');
        }
      }
    } catch (error: any) {
      console.error('Form gönderme hatası:', error);
      // Show a more user-friendly error message
      const errorMessage = error?.message || 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setFormErrors({
        ...formErrors,
        name: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeatureIcon = (type: string, code: string) => {
    // Based on common feature codes, return an appropriate icon
    if (code.includes('WIFI') || code.includes('INTERNET')) return Wifi;
    if (code.includes('TV')) return Tv;
    if (code.includes('BED')) return Bed;
    if (code.includes('KITCHEN') || code.includes('MUTFAK')) return Utensils;
    if (code.includes('COFFEE') || code.includes('KAHVE')) return Coffee;
    if (code.includes('SHOWER') || code.includes('DUS')) return Shower;
    if (code.includes('AC') || code.includes('KLIMA')) return Wind;
    
    // Default icons based on type
    switch (type) {
      case 'ROOM': return Bed;
      case 'BED': return Bed;
      case 'APART': return Home;
      default: return Settings;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ROOM': return 'Oda';
      case 'BED': return 'Yatak';
      case 'APART': return 'Apart';
      case 'MIXED': return 'Karma';
      default: return type;
    }
  };

  const filteredFeatures = features.filter(feature => {
    if (!searchTerm) return true;
    
    return (
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.code.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen p-8 animate-slideLeft">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Özellik Yönetimi
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Özellik ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            >
              <option value="all">Tüm Tipler</option>
              <option value="ROOM">Oda</option>
              <option value="BED">Yatak</option>
              <option value="APART">Apart</option>
              <option value="MIXED">Karma</option>
            </select>
            
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
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Özellik</span>
            </button>
          </div>
        </div>

        {/* Features List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Özellik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kod</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tip</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kullanım</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFeatures.length > 0 ? (
                      filteredFeatures.map((feature) => {
                        const FeatureIcon = getFeatureIcon(feature.type, feature.code);
                        return (
                          <tr key={feature.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                  <FeatureIcon className="w-5 h-5" />
                                </div>
                                <span className="text-gray-900 dark:text-white font-medium">{feature.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {feature.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                                {getTypeLabel(feature.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                feature.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {feature.status === 'active' ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                              {feature.assignments_count || 0} kullanım
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(feature)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Düzenle"
                                >
                                  <Edit className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(feature)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Arama kriterlerine uygun özellik bulunamadı.' : 'Henüz özellik kaydı bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {paginationMeta && paginationMeta.last_page > 1 && (
              <div className="mt-6 flex justify-center">
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
                    <ArrowLeft className="w-5 h-5" />
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
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteFeature}
        title="Özellik Silme"
        message={`"${featureToDelete?.name}" özelliğini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Add/Edit Feature Modal */}
      {showAddEditModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {submitSuccess ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {isEditing ? 'Özellik güncellendi!' : 'Özellik eklendi!'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Özellik Adı*
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                          formErrors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        placeholder="Wi-Fi"
                        disabled={isSubmitting}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Özellik Kodu*
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                          formErrors.code ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        placeholder="WIFI"
                        disabled={isSubmitting}
                      />
                      {formErrors.code && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Sadece büyük harf, rakam ve alt çizgi (_) kullanabilirsiniz.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Özellik Tipi*
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                          formErrors.type ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isSubmitting}
                      >
                        <option value="ROOM">Oda</option>
                        <option value="BED">Yatak</option>
                        <option value="APART">Apart</option>
                        <option value="MIXED">Karma</option>
                      </select>
                      {formErrors.type && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.type}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Durum*
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                          formErrors.status ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isSubmitting}
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                      </select>
                      {formErrors.status && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.status}</p>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Footer */}
              {!submitSuccess && (
                <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Güncelle' : 'Ekle'}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}