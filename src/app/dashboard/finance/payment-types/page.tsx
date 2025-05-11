'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Tag, Folder, Ban as Bank, Info } from 'lucide-react';
import { paymentTypeCategoriesApi } from '@/lib/api/paymentTypeCategories';
import { paymentTypesApi } from '@/lib/api/paymentTypes';
import { IPaymentType, IPaymentTypeCategory } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function PaymentTypesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'types'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<IPaymentTypeCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<IPaymentTypeCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<IPaymentTypeCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryDeleteError, setCategoryDeleteError] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<IPaymentTypeCategory | null>(null);
  
  // Payment Types state
  const [paymentTypes, setPaymentTypes] = useState<IPaymentType[]>([]);
  const [filteredPaymentTypes, setFilteredPaymentTypes] = useState<IPaymentType[]>([]);
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false);
  const [paymentTypeSearchTerm, setPaymentTypeSearchTerm] = useState('');
  const [paymentTypeStatusFilter, setPaymentTypeStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [paymentTypeCategoryFilter, setPaymentTypeCategoryFilter] = useState<string>('all');
  const [paymentTypePage, setPaymentTypePage] = useState(1);
  const [paymentTypeTotalPages, setPaymentTypeTotalPages] = useState(1);
  const [showPaymentTypeDeleteModal, setShowPaymentTypeDeleteModal] = useState(false);
  const [paymentTypeToDelete, setPaymentTypeToDelete] = useState<IPaymentType | null>(null);
  const [isDeletingPaymentType, setIsDeletingPaymentType] = useState(false);
  const [paymentTypeDeleteError, setPaymentTypeDeleteError] = useState('');
  const [showAddPaymentTypeModal, setShowAddPaymentTypeModal] = useState(false);
  const [showEditPaymentTypeModal, setShowEditPaymentTypeModal] = useState(false);
  const [currentPaymentType, setCurrentPaymentType] = useState<IPaymentType | null>(null);
  
  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [categoryFormErrors, setCategoryFormErrors] = useState({
    name: ''
  });
  
  // Payment Type form data
  const [paymentTypeFormData, setPaymentTypeFormData] = useState({
    name: '',
    categoryId: '',
    bankName: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [paymentTypeFormErrors, setPaymentTypeFormErrors] = useState({
    name: '',
    categoryId: ''
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
      if (activeTab === 'categories') {
        fetchCategories();
      } else {
        fetchPaymentTypes();
      }
    }
  }, [isAuthenticated, activeTab, categoryStatusFilter, categoryPage, paymentTypeStatusFilter, paymentTypeCategoryFilter, paymentTypePage]);

  useEffect(() => {
    // Filter categories based on search term
    if (categories.length > 0) {
      const filtered = categories.filter(category => {
        const matchesSearch = categorySearchTerm === '' || 
          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()));
        
        const matchesStatus = categoryStatusFilter === 'all' || category.status === categoryStatusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredCategories(filtered);
    }
  }, [categorySearchTerm, categories, categoryStatusFilter]);

  useEffect(() => {
    // Filter payment types based on search term
    if (paymentTypes.length > 0) {
      const filtered = paymentTypes.filter(paymentType => {
        const matchesSearch = paymentTypeSearchTerm === '' || 
          paymentType.name.toLowerCase().includes(paymentTypeSearchTerm.toLowerCase()) ||
          (paymentType.bankName && paymentType.bankName.toLowerCase().includes(paymentTypeSearchTerm.toLowerCase())) ||
          (paymentType.description && paymentType.description.toLowerCase().includes(paymentTypeSearchTerm.toLowerCase()));
        
        const matchesStatus = paymentTypeStatusFilter === 'all' || paymentType.status === paymentTypeStatusFilter;
        
        const matchesCategory = paymentTypeCategoryFilter === 'all' || paymentType.categoryId === paymentTypeCategoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
      });
      
      setFilteredPaymentTypes(filtered);
    }
  }, [paymentTypeSearchTerm, paymentTypes, paymentTypeStatusFilter, paymentTypeCategoryFilter]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const status = categoryStatusFilter !== 'all' ? categoryStatusFilter : undefined;
      const response = await paymentTypeCategoriesApi.getAll(status, categoryPage, 10);
      
      if (response.success && response.data) {
        setCategories(response.data);
        setCategoryTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Ödeme tipi kategorileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Ödeme tipi kategorileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchPaymentTypes = async () => {
    setIsLoadingPaymentTypes(true);
    try {
      const categoryId = paymentTypeCategoryFilter !== 'all' ? paymentTypeCategoryFilter : undefined;
      const status = paymentTypeStatusFilter !== 'all' ? paymentTypeStatusFilter : undefined;
      const response = await paymentTypesApi.getAll(categoryId, status, undefined, paymentTypePage, 10);
      
      if (response.success && response.data) {
        setPaymentTypes(response.data);
        setPaymentTypeTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Ödeme tipleri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Ödeme tipleri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingPaymentTypes(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeletingCategory(true);
    setCategoryDeleteError('');
    
    try {
      const response = await paymentTypeCategoriesApi.delete(categoryToDelete.id);
      
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        setShowCategoryDeleteModal(false);
      } else {
        throw new Error(response.error || 'Kategori silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kategori silme hatası:', error);
      setCategoryDeleteError(error.message || 'Kategori silinirken bir hata oluştu');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleDeletePaymentType = async () => {
    if (!paymentTypeToDelete) return;
    
    setIsDeletingPaymentType(true);
    setPaymentTypeDeleteError('');
    
    try {
      const response = await paymentTypesApi.delete(paymentTypeToDelete.id);
      
      if (response.success) {
        setPaymentTypes(prev => prev.filter(p => p.id !== paymentTypeToDelete.id));
        setShowPaymentTypeDeleteModal(false);
      } else {
        throw new Error(response.error || 'Ödeme tipi silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Ödeme tipi silme hatası:', error);
      setPaymentTypeDeleteError(error.message || 'Ödeme tipi silinirken bir hata oluştu');
    } finally {
      setIsDeletingPaymentType(false);
    }
  };

  const handleCategoryStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await paymentTypeCategoriesApi.updateStatus(id, status);
      
      if (response.success) {
        setCategories(prev => prev.map(c => 
          c.id === id ? { ...c, status } : c
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handlePaymentTypeStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await paymentTypesApi.updateStatus(id, status);
      
      if (response.success) {
        setPaymentTypes(prev => prev.map(p => 
          p.id === id ? { ...p, status } : p
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleAddCategory = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: ''
    };
    
    if (!categoryFormData.name.trim()) {
      errors.name = 'Kategori adı zorunludur';
      hasError = true;
    }
    
    setCategoryFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await paymentTypeCategoriesApi.create({
        name: categoryFormData.name,
        description: categoryFormData.description,
        status: categoryFormData.status
      });
      
      if (response.success && response.data) {
        setCategories(prev => [...prev, response.data as IPaymentTypeCategory]);
        setShowAddCategoryModal(false);
        resetCategoryForm();
      } else {
        console.error('Kategori oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
    }
  };

  const handleEditCategory = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: ''
    };
    
    if (!categoryFormData.name.trim()) {
      errors.name = 'Kategori adı zorunludur';
      hasError = true;
    }
    
    setCategoryFormErrors(errors);
    
    if (hasError || !currentCategory) return;
    
    try {
      const response = await paymentTypeCategoriesApi.update(currentCategory.id, {
        name: categoryFormData.name,
        description: categoryFormData.description,
        status: categoryFormData.status
      });
      
      if (response.success) {
        setCategories(prev => prev.map(c => 
          c.id === currentCategory.id ? { 
            ...c, 
            name: categoryFormData.name, 
            description: categoryFormData.description,
            status: categoryFormData.status 
          } : c
        ));
        setShowEditCategoryModal(false);
      } else {
        console.error('Kategori güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
    }
  };

  const handleAddPaymentType = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      categoryId: ''
    };
    
    if (!paymentTypeFormData.name.trim()) {
      errors.name = 'Ödeme tipi adı zorunludur';
      hasError = true;
    }
    
    if (!paymentTypeFormData.categoryId) {
      errors.categoryId = 'Kategori seçimi zorunludur';
      hasError = true;
    }
    
    setPaymentTypeFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await paymentTypesApi.create({
        payment_type_category_id: parseInt(paymentTypeFormData.categoryId),
        name: paymentTypeFormData.name,
        bank_name: paymentTypeFormData.bankName,
        description: paymentTypeFormData.description,
        status: paymentTypeFormData.status
      });
      
      if (response.success && response.data) {
        setPaymentTypes(prev => [...prev, response.data as IPaymentType]);
        setShowAddPaymentTypeModal(false);
        resetPaymentTypeForm();
      } else {
        console.error('Ödeme tipi oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Ödeme tipi oluşturma hatası:', error);
    }
  };

  const handleEditPaymentType = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      categoryId: ''
    };
    
    if (!paymentTypeFormData.name.trim()) {
      errors.name = 'Ödeme tipi adı zorunludur';
      hasError = true;
    }
    
    if (!paymentTypeFormData.categoryId) {
      errors.categoryId = 'Kategori seçimi zorunludur';
      hasError = true;
    }
    
    setPaymentTypeFormErrors(errors);
    
    if (hasError || !currentPaymentType) return;
    
    try {
      const response = await paymentTypesApi.update(currentPaymentType.id, {
        payment_type_category_id: parseInt(paymentTypeFormData.categoryId),
        name: paymentTypeFormData.name,
        bank_name: paymentTypeFormData.bankName,
        description: paymentTypeFormData.description,
        status: paymentTypeFormData.status
      });
      
      if (response.success && response.data) {
        setPaymentTypes(prev => prev.map(p =>
          p.id === currentPaymentType.id ? response.data as IPaymentType : p
        ));
        setShowEditPaymentTypeModal(false);
      } else {
        console.error('Ödeme tipi güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Ödeme tipi güncelleme hatası:', error);
    }
  };

  const openEditCategoryModal = (category: IPaymentTypeCategory) => {
    setCurrentCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      status: category.status
    });
    setCategoryFormErrors({
      name: ''
    });
    setShowEditCategoryModal(true);
  };

  const openEditPaymentTypeModal = (paymentType: IPaymentType) => {
    setCurrentPaymentType(paymentType);
    setPaymentTypeFormData({
      name: paymentType.name,
      categoryId: paymentType.categoryId,
      bankName: paymentType.bankName || '',
      description: paymentType.description || '',
      status: paymentType.status
    });
    setPaymentTypeFormErrors({
      name: '',
      categoryId: ''
    });
    setShowEditPaymentTypeModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setCategoryFormErrors({
      name: ''
    });
  };

  const resetPaymentTypeForm = () => {
    setPaymentTypeFormData({
      name: '',
      categoryId: '',
      bankName: '',
      description: '',
      status: 'active'
    });
    setPaymentTypeFormErrors({
      name: '',
      categoryId: ''
    });
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
      {/* Tabs */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'categories'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Ödeme Kategorileri</span>
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'types'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Ödeme Tipleri</span>
          </button>
        </div>
        
        {activeTab === 'categories' ? (
          <button 
            onClick={() => {
              resetCategoryForm();
              setShowAddCategoryModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Kategori</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              resetPaymentTypeForm();
              setShowAddPaymentTypeModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Ödeme Tipi</span>
          </button>
        )}
      </div>

      {/* Categories Tab Content */}
      {activeTab === 'categories' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={categoryStatusFilter}
                onChange={(e) => setCategoryStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* Categories Table */}
          {isLoadingCategories ? (
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
                        Kategori Adı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
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
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Folder className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{category.description || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {category.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditCategoryModal(category)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {category.status === 'active' ? (
                                <button
                                  onClick={() => handleCategoryStatusChange(category.id, 'inactive')}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Pasife Al"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCategoryStatusChange(category.id, 'active')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Aktife Al"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setCategoryToDelete(category);
                                  setShowCategoryDeleteModal(true);
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
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {categorySearchTerm ? 'Arama kriterlerine uygun kategori bulunamadı.' : 'Henüz kategori kaydı bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Pagination */}
          {categoryTotalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCategoryPage(prev => Math.max(prev - 1, 1))}
                  disabled={categoryPage === 1}
                  className={`p-2 rounded-md ${
                    categoryPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: categoryTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCategoryPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      categoryPage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCategoryPage(prev => Math.min(prev + 1, categoryTotalPages))}
                  disabled={categoryPage === categoryTotalPages}
                  className={`p-2 rounded-md ${
                    categoryPage === categoryTotalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Payment Types Tab Content */}
      {activeTab === 'types' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ödeme tipi ara..."
                value={paymentTypeSearchTerm}
                onChange={(e) => setPaymentTypeSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <select
                value={paymentTypeCategoryFilter}
                onChange={(e) => setPaymentTypeCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.filter(c => c.status === 'active').map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={paymentTypeStatusFilter}
                onChange={(e) => setPaymentTypeStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* Payment Types Table */}
          {isLoadingPaymentTypes ? (
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
                        Ödeme Tipi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Banka
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
                    {filteredPaymentTypes.length > 0 ? (
                      filteredPaymentTypes.map((paymentType) => (
                        <tr key={paymentType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{paymentType.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Folder className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {paymentType.category?.name || 'Bilinmeyen Kategori'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {paymentType.bankName ? (
                                <>
                                  <Bank className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{paymentType.bankName}</div>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              paymentType.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {paymentType.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditPaymentTypeModal(paymentType)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {paymentType.status === 'active' ? (
                                <button
                                  onClick={() => handlePaymentTypeStatusChange(paymentType.id, 'inactive')}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Pasife Al"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePaymentTypeStatusChange(paymentType.id, 'active')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Aktife Al"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setPaymentTypeToDelete(paymentType);
                                  setShowPaymentTypeDeleteModal(true);
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
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {paymentTypeSearchTerm || paymentTypeCategoryFilter !== 'all' || paymentTypeStatusFilter !== 'all' 
                            ? 'Arama kriterlerine uygun ödeme tipi bulunamadı.' 
                            : 'Henüz ödeme tipi kaydı bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Types Pagination */}
          {paymentTypeTotalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPaymentTypePage(prev => Math.max(prev - 1, 1))}
                  disabled={paymentTypePage === 1}
                  className={`p-2 rounded-md ${
                    paymentTypePage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: paymentTypeTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPaymentTypePage(page)}
                    className={`px-3 py-1 rounded-md ${
                      paymentTypePage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setPaymentTypePage(prev => Math.min(prev + 1, paymentTypeTotalPages))}
                  disabled={paymentTypePage === paymentTypeTotalPages}
                  className={`p-2 rounded-md ${
                    paymentTypePage === paymentTypeTotalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete Category Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showCategoryDeleteModal}
        onClose={() => setShowCategoryDeleteModal(false)}
        onConfirm={handleDeleteCategory}
        title="Kategori Silme"
        message={`"${categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingCategory}
        error={categoryDeleteError}
      />

      {/* Delete Payment Type Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showPaymentTypeDeleteModal}
        onClose={() => setShowPaymentTypeDeleteModal(false)}
        onConfirm={handleDeletePaymentType}
        title="Ödeme Tipi Silme"
        message={`"${paymentTypeToDelete?.name}" ödeme tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingPaymentType}
        error={paymentTypeDeleteError}
      />

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Ödeme Kategorisi Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Adı*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        categoryFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Banka Kartları"
                    />
                    {categoryFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{categoryFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Kategori hakkında açıklama"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="status"
                      value={categoryFormData.status}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleAddCategory}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Ödeme Kategorisi Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Adı*
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        categoryFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {categoryFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{categoryFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="edit-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
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
                      value={categoryFormData.status}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleEditCategory}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Type Modal */}
      {showAddPaymentTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Ödeme Tipi Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori*
                    </label>
                    <select
                      id="categoryId"
                      value={paymentTypeFormData.categoryId}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, categoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        paymentTypeFormErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.filter(c => c.status === 'active').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {paymentTypeFormErrors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentTypeFormErrors.categoryId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ödeme Tipi Adı*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={paymentTypeFormData.name}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        paymentTypeFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Kredi Kartı"
                    />
                    {paymentTypeFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentTypeFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Banka Adı
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      value={paymentTypeFormData.bankName}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ziraat Bankası"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Banka ile ilgili ödeme tipleri için banka adını girin (isteğe bağlı).
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      value={paymentTypeFormData.description}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ödeme tipi hakkında açıklama"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="status"
                      value={paymentTypeFormData.status}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleAddPaymentType}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentTypeModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Type Modal */}
      {showEditPaymentTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Ödeme Tipi Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori*
                    </label>
                    <select
                      id="edit-categoryId"
                      value={paymentTypeFormData.categoryId}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, categoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        paymentTypeFormErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.filter(c => c.status === 'active').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {paymentTypeFormErrors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentTypeFormErrors.categoryId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ödeme Tipi Adı*
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={paymentTypeFormData.name}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        paymentTypeFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {paymentTypeFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentTypeFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-bankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Banka Adı
                    </label>
                    <input
                      type="text"
                      id="edit-bankName"
                      value={paymentTypeFormData.bankName}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="edit-description"
                      value={paymentTypeFormData.description}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, description: e.target.value })}
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
                      value={paymentTypeFormData.status}
                      onChange={(e) => setPaymentTypeFormData({ ...paymentTypeFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleEditPaymentType}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPaymentTypeModal(false)}
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