'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  Package,
  Tag
} from 'lucide-react';
import { pricesApi } from '@/lib/api/prices';
import { productsApi } from '@/lib/api/products';
import { seasonsApi } from '@/lib/api/seasons';
import { apartsApi } from '@/lib/api/apartments';
import { taxTypesApi } from '@/lib/api/taxTypes';
import { IPrice, IProduct, ISeason, ITaxType } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function PricesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [prices, setPrices] = useState<IPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<IPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [apartFilter, setApartFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<IPrice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<IPrice | null>(null);
  
  // Reference data
  const [products, setProducts] = useState<IProduct[]>([]);
  const [seasons, setSeasons] = useState<ISeason[]>([]);
  const [aparts, setAparts] = useState<any[]>([]);
  const [taxTypes, setTaxTypes] = useState<ITaxType[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    apartId: '',
    seasonCode: '',
    productId: '',
    price: 0,
    currency: 'TRY',
    startDate: '',
    endDate: '',
    selectedTaxes: [] as string[]
  });
  
  const [formErrors, setFormErrors] = useState({
    apartId: '',
    seasonCode: '',
    productId: '',
    price: '',
    startDate: '',
    endDate: ''
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
      fetchPrices();
      fetchReferenceData();
    }
  }, [isAuthenticated, apartFilter, seasonFilter, productFilter, currentPage]);

  useEffect(() => {
    // Filter prices based on search term
    if (prices.length > 0) {
      const filtered = prices.filter(price => {
        const matchesSearch = searchTerm === '' || 
          price.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          price.apart?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          price.seasonCode.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
      });
      
      setFilteredPrices(filtered);
    }
  }, [searchTerm, prices]);

  const fetchReferenceData = async () => {
    try {
      // Fetch products
      const productsResponse = await productsApi.getAll('active');
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
      }
      
      // Fetch seasons
      const seasonsResponse = await seasonsApi.getAll('active');
      if (seasonsResponse.success && seasonsResponse.data) {
        setSeasons(seasonsResponse.data);
      }
      
      // Fetch aparts
      const apartsResponse = await apartsApi.getAll();
      if (apartsResponse.success && apartsResponse.data) {
        setAparts(apartsResponse.data);
      }
      
      // Fetch tax types
      const taxTypesResponse = await taxTypesApi.getAll('active');
      if (taxTypesResponse.success && taxTypesResponse.data) {
        setTaxTypes(taxTypesResponse.data);
      }
    } catch (error) {
      console.error('Referans verileri çekilirken hata oluştu:', error);
    }
  };

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const apartId = apartFilter !== 'all' ? apartFilter : undefined;
      const seasonCode = seasonFilter !== 'all' ? seasonFilter : undefined;
      const productId = productFilter !== 'all' ? productFilter : undefined;
      
      const response = await pricesApi.getAll(apartId, seasonCode, productId, currentPage, 10);
      
      if (response.success && response.data) {
        setPrices(response.data);
        setTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Fiyat verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Fiyat verileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await pricesApi.delete(priceToDelete.id);
      
      if (response.success) {
        setPrices(prev => prev.filter(p => p.id !== priceToDelete.id));
        setShowDeleteModal(false);
      } else {
        throw new Error(response.error || 'Fiyat silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Fiyat silme hatası:', error);
      setDeleteError(error.message || 'Fiyat silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPrice = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      apartId: '',
      seasonCode: '',
      productId: '',
      price: '',
      startDate: '',
      endDate: ''
    };
    
    if (!formData.apartId) {
      errors.apartId = 'Apart seçimi zorunludur';
      hasError = true;
    }
    
    if (!formData.seasonCode) {
      errors.seasonCode = 'Sezon seçimi zorunludur';
      hasError = true;
    }
    
    if (!formData.productId) {
      errors.productId = 'Ürün seçimi zorunludur';
      hasError = true;
    }
    
    if (formData.price <= 0) {
      errors.price = 'Fiyat 0\'dan büyük olmalıdır';
      hasError = true;
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Başlangıç tarihi zorunludur';
      hasError = true;
    }
    
    if (!formData.endDate) {
      errors.endDate = 'Bitiş tarihi zorunludur';
      hasError = true;
    } else if (formData.endDate < formData.startDate) {
      errors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await pricesApi.create({
        apart_id: parseInt(formData.apartId),
        season_code: formData.seasonCode,
        product_id: parseInt(formData.productId),
        price: formData.price,
        currency: formData.currency,
        start_date: formData.startDate,
        end_date: formData.endDate
      });
      
      if (response.success && response.data) {
        // Add taxes if selected
        if (formData.selectedTaxes.length > 0) {
          for (const taxTypeId of formData.selectedTaxes) {
            await pricesApi.addTax(response.data.id, parseInt(taxTypeId));
          }
        }
        
        setPrices(prev => [...prev, response.data]);
        setShowAddModal(false);
        resetForm();
      } else {
        console.error('Fiyat oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Fiyat oluşturma hatası:', error);
    }
  };

  const handleEditPrice = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      apartId: '',
      seasonCode: '',
      productId: '',
      price: '',
      startDate: '',
      endDate: ''
    };
    
    if (!formData.apartId) {
      errors.apartId = 'Apart seçimi zorunludur';
      hasError = true;
    }
    
    if (!formData.seasonCode) {
      errors.seasonCode = 'Sezon seçimi zorunludur';
      hasError = true;
    }
    
    if (!formData.productId) {
      errors.productId = 'Ürün seçimi zorunludur';
      hasError = true;
    }
    
    if (formData.price <= 0) {
      errors.price = 'Fiyat 0\'dan büyük olmalıdır';
      hasError = true;
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Başlangıç tarihi zorunludur';
      hasError = true;
    }
    
    if (!formData.endDate) {
      errors.endDate = 'Bitiş tarihi zorunludur';
      hasError = true;
    } else if (formData.endDate < formData.startDate) {
      errors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (hasError || !currentPrice) return;
    
    try {
      const response = await pricesApi.update(currentPrice.id, {
        apart_id: parseInt(formData.apartId),
        season_code: formData.seasonCode,
        product_id: parseInt(formData.productId),
        price: formData.price,
        currency: formData.currency,
        start_date: formData.startDate,
        end_date: formData.endDate
      });
      
      if (response.success) {
        // Update taxes
        // First remove all existing taxes
        if (currentPrice.taxes) {
          for (const tax of currentPrice.taxes) {
            await pricesApi.removeTax(currentPrice.id, tax.id);
          }
        }
        
        // Then add selected taxes
        if (formData.selectedTaxes.length > 0) {
          for (const taxTypeId of formData.selectedTaxes) {
            await pricesApi.addTax(currentPrice.id, parseInt(taxTypeId));
          }
        }
        
        // Update local state
        setPrices(prev => prev.map(p => 
          p.id === currentPrice.id ? { 
            ...p, 
            apartId: formData.apartId,
            seasonCode: formData.seasonCode,
            productId: formData.productId,
            price: formData.price,
            currency: formData.currency,
            startDate: formData.startDate,
            endDate: formData.endDate
          } : p
        ));
        
        setShowEditModal(false);
      } else {
        console.error('Fiyat güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Fiyat güncelleme hatası:', error);
    }
  };

  const openEditModal = (price: IPrice) => {
    setCurrentPrice(price);
    
    // Set form data
    setFormData({
      apartId: price.apartId,
      seasonCode: price.seasonCode,
      productId: price.productId,
      price: price.price,
      currency: price.currency,
      startDate: price.startDate,
      endDate: price.endDate,
      selectedTaxes: price.taxes ? price.taxes.map(tax => tax.taxTypeId) : []
    });
    
    setFormErrors({
      apartId: '',
      seasonCode: '',
      productId: '',
      price: '',
      startDate: '',
      endDate: ''
    });
    
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      apartId: '',
      seasonCode: '',
      productId: '',
      price: 0,
      currency: 'TRY',
      startDate: '',
      endDate: '',
      selectedTaxes: []
    });
    
    setFormErrors({
      apartId: '',
      seasonCode: '',
      productId: '',
      price: '',
      startDate: '',
      endDate: ''
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fiyat Yönetimi
        </h1>
        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Fiyat</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Fiyat ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <select
            value={apartFilter}
            onChange={(e) => setApartFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Apartlar</option>
            {aparts.map(apart => (
              <option key={apart.id} value={apart.id}>
                {apart.name}
              </option>
            ))}
          </select>
          
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Sezonlar</option>
            {seasons.map(season => (
              <option key={season.id} value={season.code}>
                {season.name}
              </option>
            ))}
          </select>
          
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Ürünler</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prices Table */}
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
                    Ürün
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Apart
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sezon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Geçerlilik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vergiler
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPrices.length > 0 ? (
                  filteredPrices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {price.product?.name || 'Bilinmeyen Ürün'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {price.apart?.name || 'Bilinmeyen Apart'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {price.season?.name || price.seasonCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="flex-shrink-0 mr-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {price.price.toLocaleString('tr-TR')} {price.currency}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(price.startDate).toLocaleDateString('tr-TR')} - {new Date(price.endDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {price.taxes && price.taxes.length > 0 ? (
                            price.taxes.map((tax, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tax.name} ({tax.percentage}%)
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Vergi yok</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(price)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setPriceToDelete(price);
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || apartFilter !== 'all' || seasonFilter !== 'all' || productFilter !== 'all' 
                        ? 'Arama kriterlerine uygun fiyat bulunamadı.' 
                        : 'Henüz fiyat kaydı bulunmamaktadır.'}
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
        onConfirm={handleDeletePrice}
        title="Fiyat Silme"
        message={`Bu fiyat kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />

      {/* Add Price Modal */}
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
                  Yeni Fiyat Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="apartId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Apart*
                    </label>
                    <select
                      id="apartId"
                      value={formData.apartId}
                      onChange={(e) => setFormData({ ...formData, apartId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.apartId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Apart Seçin</option>
                      {aparts.map(apart => (
                        <option key={apart.id} value={apart.id}>
                          {apart.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.apartId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.apartId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="seasonCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sezon*
                    </label>
                    <select
                      id="seasonCode"
                      value={formData.seasonCode}
                      onChange={(e) => setFormData({ ...formData, seasonCode: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.seasonCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Sezon Seçin</option>
                      {seasons.map(season => (
                        <option key={season.id} value={season.code}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.seasonCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.seasonCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ürün*
                    </label>
                    <select
                      id="productId"
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.productId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Ürün Seçin</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.productId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.productId}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fiyat*
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.price}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Para Birimi
                      </label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">İngiliz Sterlini (£)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Başlangıç Tarihi*
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {formErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.startDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bitiş Tarihi*
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {formErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vergiler
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                      {taxTypes.length > 0 ? (
                        taxTypes.map(taxType => (
                          <div key={taxType.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`tax-${taxType.id}`}
                              value={taxType.id}
                              checked={formData.selectedTaxes.includes(taxType.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedTaxes: [...formData.selectedTaxes, taxType.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedTaxes: formData.selectedTaxes.filter(id => id !== taxType.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`tax-${taxType.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {taxType.name} ({taxType.percentage}%)
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vergi türü bulunamadı.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddPrice}
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

      {/* Edit Price Modal */}
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
                  Fiyat Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-apartId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Apart*
                    </label>
                    <select
                      id="edit-apartId"
                      value={formData.apartId}
                      onChange={(e) => setFormData({ ...formData, apartId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.apartId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Apart Seçin</option>
                      {aparts.map(apart => (
                        <option key={apart.id} value={apart.id}>
                          {apart.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.apartId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.apartId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-seasonCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sezon*
                    </label>
                    <select
                      id="edit-seasonCode"
                      value={formData.seasonCode}
                      onChange={(e) => setFormData({ ...formData, seasonCode: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.seasonCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Sezon Seçin</option>
                      {seasons.map(season => (
                        <option key={season.id} value={season.code}>
                          {season.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.seasonCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.seasonCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ürün*
                    </label>
                    <select
                      id="edit-productId"
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.productId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Ürün Seçin</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.productId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.productId}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fiyat*
                      </label>
                      <input
                        type="number"
                        id="edit-price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.price}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="edit-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Para Birimi
                      </label>
                      <select
                        id="edit-currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">İngiliz Sterlini (£)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Başlangıç Tarihi*
                      </label>
                      <input
                        type="date"
                        id="edit-startDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {formErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.startDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bitiş Tarihi*
                      </label>
                      <input
                        type="date"
                        id="edit-endDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          formErrors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {formErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vergiler
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                      {taxTypes.length > 0 ? (
                        taxTypes.map(taxType => (
                          <div key={taxType.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`edit-tax-${taxType.id}`}
                              value={taxType.id}
                              checked={formData.selectedTaxes.includes(taxType.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedTaxes: [...formData.selectedTaxes, taxType.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedTaxes: formData.selectedTaxes.filter(id => id !== taxType.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`edit-tax-${taxType.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {taxType.name} ({taxType.percentage}%)
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vergi türü bulunamadı.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditPrice}
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