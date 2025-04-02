'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Tag,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { productCategoriesApi } from '@/lib/api/productCategories';
import { IProduct, IProductCategory } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<IProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    categoryId: ''
  });

  // Category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [categoryFormErrors, setCategoryFormErrors] = useState({
    name: ''
  });
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<IProductCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deleteCategoryError, setDeleteCategoryError] = useState('');
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<IProductCategory | null>(null);

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
      fetchCategories();
      fetchProducts();
    }
  }, [isAuthenticated, statusFilter, categoryFilter, currentPage]);

  useEffect(() => {
    // Filter products based on search term and filters
    if (products.length > 0) {
      const filtered = products.filter(product => {
        const matchesSearch = searchTerm === '' || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
        
        return matchesSearch && matchesStatus && matchesCategory;
      });
      
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products, statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await productCategoriesApi.getAll();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('Kategori verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Kategori verileri çekilirken hata oluştu:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const categoryId = categoryFilter !== 'all' ? categoryFilter : undefined;
      
      const response = await productsApi.getAll(status, categoryId, currentPage, 10);
      
      if (response.success && response.data) {
        setProducts(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Ürün verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Ürün verileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await productsApi.delete(productToDelete.id);
      
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setShowDeleteModal(false);
      } else {
        throw new Error(response.error || 'Ürün silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Ürün silme hatası:', error);
      setDeleteError(error.message || 'Ürün silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProductStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await productsApi.updateStatus(id, status);
      
      if (response.success) {
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, status } : p
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleAddProduct = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      categoryId: ''
    };
    
    if (!formData.name.trim()) {
      errors.name = 'Ürün adı zorunludur';
      hasError = true;
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Kategori seçimi zorunludur';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await productsApi.create({
        name: formData.name,
        category_id: parseInt(formData.categoryId),
        description: formData.description,
        status: formData.status
      });
      
      if (response.success && response.data) {
        setProducts(prev => [...prev, response.data]);
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          status: 'active'
        });
      } else {
        console.error('Ürün oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
    }
  };

  const handleEditProduct = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      categoryId: ''
    };
    
    if (!formData.name.trim()) {
      errors.name = 'Ürün adı zorunludur';
      hasError = true;
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Kategori seçimi zorunludur';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError || !currentProduct) return;
    
    try {
      const response = await productsApi.update(currentProduct.id, {
        name: formData.name,
        category_id: parseInt(formData.categoryId),
        description: formData.description,
        status: formData.status
      });
      
      if (response.success) {
        setProducts(prev => prev.map(p => 
          p.id === currentProduct.id ? { 
            ...p, 
            name: formData.name, 
            description: formData.description,
            categoryId: formData.categoryId,
            status: formData.status 
          } : p
        ));
        setShowEditModal(false);
      } else {
        console.error('Ürün güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
    }
  };

  const openEditModal = (product: IProduct) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId,
      status: product.status
    });
    setFormErrors({
      name: '',
      categoryId: ''
    });
    setShowEditModal(true);
  };

  // Category management functions
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
      const response = await productCategoriesApi.create({
        name: categoryFormData.name,
        description: categoryFormData.description,
        status: categoryFormData.status
      });
      
      if (response.success && response.data) {
        setCategories(prev => [...prev, response.data]);
        setShowCategoryModal(false);
        setCategoryFormData({
          name: '',
          description: '',
          status: 'active'
        });
        // Refresh categories
        fetchCategories();
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
      const response = await productCategoriesApi.update(currentCategory.id, {
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
        // Refresh categories
        fetchCategories();
      } else {
        console.error('Kategori güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Kategori güncelleme hatası:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeletingCategory(true);
    setDeleteCategoryError('');
    
    try {
      const response = await productCategoriesApi.delete(categoryToDelete.id);
      
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        setShowDeleteCategoryModal(false);
        // Refresh categories
        fetchCategories();
      } else {
        throw new Error(response.error || 'Kategori silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kategori silme hatası:', error);
      setDeleteCategoryError(error.message || 'Kategori silinirken bir hata oluştu');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const openEditCategoryModal = (category: IProductCategory) => {
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

  const handleCategoryStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await productCategoriesApi.updateStatus(id, status);
      
      if (response.success) {
        setCategories(prev => prev.map(c => 
          c.id === id ? { ...c, status } : c
        ));
        // Refresh categories
        fetchCategories();
      } else {
        console.error('Kategori durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Kategori durum değiştirme hatası:', error);
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
          Ürün Yönetimi
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setCategoryFormData({
                name: '',
                description: '',
                status: 'active'
              });
              setCategoryFormErrors({
                name: ''
              });
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Kategori</span>
          </button>
          <button 
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                categoryId: '',
                status: 'active'
              });
              setFormErrors({
                name: '',
                categoryId: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
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
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Ürün Kategorileri
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show dropdown menu
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  {/* Dropdown menu would go here */}
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {category.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditCategoryModal(category)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  {category.status === 'active' ? (
                    <button
                      onClick={() => handleCategoryStatusChange(category.id, 'inactive')}
                      className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCategoryStatusChange(category.id, 'active')}
                      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setCategoryToDelete(category);
                      setShowDeleteCategoryModal(true);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Ürünler
      </h2>
      
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
                    Ürün Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
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
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const category = categories.find(c => c.id === product.categoryId);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tag className="flex-shrink-0 mr-2 h-5 w-5 text-purple-500 dark:text-purple-400" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {category ? category.name : 'Kategori Bulunamadı'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {product.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {product.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {product.status === 'active' ? (
                              <button
                                onClick={() => handleProductStatusChange(product.id, 'inactive')}
                                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                title="Pasife Al"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleProductStatusChange(product.id, 'active')}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Aktife Al"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setProductToDelete(product);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                        ? 'Arama kriterlerine uygun ürün bulunamadı.' 
                        : 'Henüz ürün kaydı bulunmamaktadır.'}
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

      {/* Delete Product Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduct}
        title="Ürün Silme"
        message={`"${productToDelete?.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Delete Category Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteCategoryModal}
        onClose={() => setShowDeleteCategoryModal(false)}
        onConfirm={handleDeleteCategory}
        title="Kategori Silme"
        message={`"${categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz? Bu kategoriye ait tüm ürünler de silinecektir. Bu işlem geri alınamaz.`}
        isLoading={isDeletingCategory}
        error={deleteCategoryError}
      />

      {/* Add Product Modal */}
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
                  Yeni Ürün Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ürün Adı*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Ürün adı"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori*
                    </label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoryId}</p>
                    )}
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
                      placeholder="Ürün açıklaması"
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
                  onClick={handleAddProduct}
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

      {/* Edit Product Modal */}
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
                  Ürün Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ürün Adı*
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
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori*
                    </label>
                    <select
                      id="edit-category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categoryId}</p>
                    )}
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
                  onClick={handleEditProduct}
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

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Kategori Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Adı*
                    </label>
                    <input
                      type="text"
                      id="category-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        categoryFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Kategori adı"
                    />
                    {categoryFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{categoryFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="category-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Kategori açıklaması"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="category-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="category-status"
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
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
                  Kategori Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Adı*
                    </label>
                    <input
                      type="text"
                      id="edit-category-name"
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
                    <label htmlFor="edit-category-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      id="edit-category-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-category-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="edit-category-status"
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
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
    </div>
  );
}