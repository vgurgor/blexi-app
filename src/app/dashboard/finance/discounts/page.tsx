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
  Tag,
  Calendar,
  Package,
  Folder,
  DollarSign,
  Info
} from 'lucide-react';
import { discountCategoriesApi } from '@/lib/api/discountCategories';
import { discountRulesApi } from '@/lib/api/discountRules';
import { productsApi } from '@/lib/api/products';
import { productCategoriesApi } from '@/lib/api/productCategories';
import { IDiscountCategory, IDiscountRule, IProduct, IProductCategory } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function DiscountsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'rules'>('categories');
  
  // Categories state
  const [categories, setCategories] = useState<IDiscountCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<IDiscountCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<IDiscountCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryDeleteError, setCategoryDeleteError] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<IDiscountCategory | null>(null);
  
  // Rules state
  const [rules, setRules] = useState<IDiscountRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<IDiscountRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('all');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [rulePage, setRulePage] = useState(1);
  const [ruleTotalPages, setRuleTotalPages] = useState(1);
  const [showRuleDeleteModal, setShowRuleDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<IDiscountRule | null>(null);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [ruleDeleteError, setRuleDeleteError] = useState('');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [currentRule, setCurrentRule] = useState<IDiscountRule | null>(null);
  
  // Reference data
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([]);
  
  // Category form data
  const [categoryFormData, setCategoryFormData] = useState({
    code: '',
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [categoryFormErrors, setCategoryFormErrors] = useState({
    code: '',
    name: ''
  });
  
  // Rule form data
  const [ruleFormData, setRuleFormData] = useState({
    discountCategoryId: '',
    productId: '',
    productCategoryId: '',
    startDate: '',
    endDate: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minPrice: 0,
    maxPrice: 0,
    minNights: 0,
    maxNights: 0,
    priority: 1,
    status: 'active' as 'active' | 'inactive'
  });
  
  const [ruleFormErrors, setRuleFormErrors] = useState({
    discountCategoryId: '',
    startDate: '',
    endDate: '',
    discountValue: ''
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
        fetchRules();
        if (products.length === 0) {
          fetchProducts();
        }
        if (productCategories.length === 0) {
          fetchProductCategories();
        }
      }
    }
  }, [isAuthenticated, activeTab, categoryStatusFilter, categoryPage, ruleCategoryFilter, ruleStatusFilter, rulePage]);

  useEffect(() => {
    // Filter categories based on search term
    if (categories.length > 0) {
      const filtered = categories.filter(category => {
        const matchesSearch = categorySearchTerm === '' || 
          category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          category.code.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()));
        
        const matchesStatus = categoryStatusFilter === 'all' || category.status === categoryStatusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredCategories(filtered);
    }
  }, [categorySearchTerm, categories, categoryStatusFilter]);

  useEffect(() => {
    // Filter rules based on search term
    if (rules.length > 0) {
      const filtered = rules.filter(rule => {
        const matchesSearch = ruleSearchTerm === '' || 
          (rule.discountCategory?.name && rule.discountCategory.name.toLowerCase().includes(ruleSearchTerm.toLowerCase())) ||
          (rule.product?.name && rule.product.name.toLowerCase().includes(ruleSearchTerm.toLowerCase())) ||
          (rule.productCategory?.name && rule.productCategory.name.toLowerCase().includes(ruleSearchTerm.toLowerCase()));
        
        const matchesCategory = ruleCategoryFilter === 'all' || rule.discountCategoryId === ruleCategoryFilter;
        
        const matchesStatus = ruleStatusFilter === 'all' || rule.status === ruleStatusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
      });
      
      setFilteredRules(filtered);
    }
  }, [ruleSearchTerm, rules, ruleCategoryFilter, ruleStatusFilter]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const status = categoryStatusFilter !== 'all' ? categoryStatusFilter : undefined;
      const response = await discountCategoriesApi.getAll(status, categoryPage, 10);
      
      if (response.success && response.data) {
        setCategories(response.data);
        setCategoryTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('İndirim kategorileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('İndirim kategorileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchRules = async () => {
    setIsLoadingRules(true);
    try {
      const categoryId = ruleCategoryFilter !== 'all' ? ruleCategoryFilter : undefined;
      const response = await discountRulesApi.getAll(categoryId, rulePage, 10);
      
      if (response.success && response.data) {
        setRules(response.data);
        setRuleTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('İndirim kuralları alınamadı:', response.error);
      }
    } catch (error) {
      console.error('İndirim kuralları çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll('active');
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        console.error('Ürünler alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Ürünler çekilirken hata oluştu:', error);
    }
  };

  const fetchProductCategories = async () => {
    try {
      const response = await productCategoriesApi.getAll('active');
      
      if (response.success && response.data) {
        setProductCategories(response.data);
      } else {
        console.error('Ürün kategorileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Ürün kategorileri çekilirken hata oluştu:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setIsDeletingCategory(true);
    setCategoryDeleteError('');
    
    try {
      const response = await discountCategoriesApi.delete(categoryToDelete.id);
      
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        setShowCategoryDeleteModal(false);
      } else {
        throw new Error(response.error || 'İndirim kategorisi silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('İndirim kategorisi silme hatası:', error);
      setCategoryDeleteError(error.message || 'İndirim kategorisi silinirken bir hata oluştu');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    
    setIsDeletingRule(true);
    setRuleDeleteError('');
    
    try {
      const response = await discountRulesApi.delete(ruleToDelete.id);
      
      if (response.success) {
        setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
        setShowRuleDeleteModal(false);
      } else {
        throw new Error(response.error || 'İndirim kuralı silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('İndirim kuralı silme hatası:', error);
      setRuleDeleteError(error.message || 'İndirim kuralı silinirken bir hata oluştu');
    } finally {
      setIsDeletingRule(false);
    }
  };

  const handleCategoryStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await discountCategoriesApi.updateStatus(id, status);
      
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

  const handleRuleStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await discountRulesApi.updateStatus(id, status);
      
      if (response.success) {
        setRules(prev => prev.map(r => 
          r.id === id ? { ...r, status } : r
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
      code: '',
      name: ''
    };
    
    if (!categoryFormData.code.trim()) {
      errors.code = 'Kategori kodu zorunludur';
      hasError = true;
    } else if (!/^[A-Z0-9_]+$/.test(categoryFormData.code)) {
      errors.code = 'Kategori kodu sadece büyük harf, rakam ve alt çizgi içerebilir';
      hasError = true;
    }
    
    if (!categoryFormData.name.trim()) {
      errors.name = 'Kategori adı zorunludur';
      hasError = true;
    }
    
    setCategoryFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await discountCategoriesApi.create({
        code: categoryFormData.code,
        name: categoryFormData.name,
        description: categoryFormData.description,
        status: categoryFormData.status
      });
      
      if (response.success && response.data) {
        setCategories(prev => [...prev, response.data]);
        setShowAddCategoryModal(false);
        resetCategoryForm();
      } else {
        console.error('İndirim kategorisi oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('İndirim kategorisi oluşturma hatası:', error);
    }
  };

  const handleEditCategory = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      code: '',
      name: ''
    };
    
    if (!categoryFormData.code.trim()) {
      errors.code = 'Kategori kodu zorunludur';
      hasError = true;
    } else if (!/^[A-Z0-9_]+$/.test(categoryFormData.code)) {
      errors.code = 'Kategori kodu sadece büyük harf, rakam ve alt çizgi içerebilir';
      hasError = true;
    }
    
    if (!categoryFormData.name.trim()) {
      errors.name = 'Kategori adı zorunludur';
      hasError = true;
    }
    
    setCategoryFormErrors(errors);
    
    if (hasError || !currentCategory) return;
    
    try {
      const response = await discountCategoriesApi.update(currentCategory.id, {
        code: categoryFormData.code,
        name: categoryFormData.name,
        description: categoryFormData.description,
        status: categoryFormData.status
      });
      
      if (response.success && response.data) {
        setCategories(prev => prev.map(c => 
          c.id === currentCategory.id ? response.data : c
        ));
        setShowEditCategoryModal(false);
      } else {
        console.error('İndirim kategorisi güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('İndirim kategorisi güncelleme hatası:', error);
    }
  };

  const handleAddRule = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      discountCategoryId: '',
      startDate: '',
      endDate: '',
      discountValue: ''
    };
    
    if (!ruleFormData.discountCategoryId) {
      errors.discountCategoryId = 'İndirim kategorisi seçimi zorunludur';
      hasError = true;
    }
    
    if (!ruleFormData.startDate) {
      errors.startDate = 'Başlangıç tarihi zorunludur';
      hasError = true;
    }
    
    if (!ruleFormData.endDate) {
      errors.endDate = 'Bitiş tarihi zorunludur';
      hasError = true;
    } else if (ruleFormData.endDate < ruleFormData.startDate) {
      errors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      hasError = true;
    }
    
    if (ruleFormData.discountValue <= 0) {
      errors.discountValue = 'İndirim değeri 0\'dan büyük olmalıdır';
      hasError = true;
    } else if (ruleFormData.discountType === 'percentage' && ruleFormData.discountValue > 100) {
      errors.discountValue = 'Yüzde olarak indirim değeri 100\'den büyük olamaz';
      hasError = true;
    }
    
    setRuleFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await discountRulesApi.create({
        discount_category_id: parseInt(ruleFormData.discountCategoryId),
        product_id: ruleFormData.productId ? parseInt(ruleFormData.productId) : undefined,
        product_category_id: ruleFormData.productCategoryId ? parseInt(ruleFormData.productCategoryId) : undefined,
        start_date: ruleFormData.startDate,
        end_date: ruleFormData.endDate,
        discount_type: ruleFormData.discountType,
        discount_value: ruleFormData.discountValue,
        min_price: ruleFormData.minPrice > 0 ? ruleFormData.minPrice : undefined,
        max_price: ruleFormData.maxPrice > 0 ? ruleFormData.maxPrice : undefined,
        min_nights: ruleFormData.minNights > 0 ? ruleFormData.minNights : undefined,
        max_nights: ruleFormData.maxNights > 0 ? ruleFormData.maxNights : undefined,
        priority: ruleFormData.priority,
        status: ruleFormData.status
      });
      
      if (response.success && response.data) {
        setRules(prev => [...prev, response.data]);
        setShowAddRuleModal(false);
        resetRuleForm();
      } else {
        console.error('İndirim kuralı oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('İndirim kuralı oluşturma hatası:', error);
    }
  };

  const handleEditRule = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      discountCategoryId: '',
      startDate: '',
      endDate: '',
      discountValue: ''
    };
    
    if (!ruleFormData.discountCategoryId) {
      errors.discountCategoryId = 'İndirim kategorisi seçimi zorunludur';
      hasError = true;
    }
    
    if (!ruleFormData.startDate) {
      errors.startDate = 'Başlangıç tarihi zorunludur';
      hasError = true;
    }
    
    if (!ruleFormData.endDate) {
      errors.endDate = 'Bitiş tarihi zorunludur';
      hasError = true;
    } else if (ruleFormData.endDate < ruleFormData.startDate) {
      errors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
      hasError = true;
    }
    
    if (ruleFormData.discountValue <= 0) {
      errors.discountValue = 'İndirim değeri 0\'dan büyük olmalıdır';
      hasError = true;
    } else if (ruleFormData.discountType === 'percentage' && ruleFormData.discountValue > 100) {
      errors.discountValue = 'Yüzde olarak indirim değeri 100\'den büyük olamaz';
      hasError = true;
    }
    
    setRuleFormErrors(errors);
    
    if (hasError || !currentRule) return;
    
    try {
      const response = await discountRulesApi.update(currentRule.id, {
        discount_category_id: parseInt(ruleFormData.discountCategoryId),
        product_id: ruleFormData.productId ? parseInt(ruleFormData.productId) : undefined,
        product_category_id: ruleFormData.productCategoryId ? parseInt(ruleFormData.productCategoryId) : undefined,
        start_date: ruleFormData.startDate,
        end_date: ruleFormData.endDate,
        discount_type: ruleFormData.discountType,
        discount_value: ruleFormData.discountValue,
        min_price: ruleFormData.minPrice > 0 ? ruleFormData.minPrice : undefined,
        max_price: ruleFormData.maxPrice > 0 ? ruleFormData.maxPrice : undefined,
        min_nights: ruleFormData.minNights > 0 ? ruleFormData.minNights : undefined,
        max_nights: ruleFormData.maxNights > 0 ? ruleFormData.maxNights : undefined,
        priority: ruleFormData.priority,
        status: ruleFormData.status
      });
      
      if (response.success && response.data) {
        setRules(prev => prev.map(r => 
          r.id === currentRule.id ? response.data : r
        ));
        setShowEditRuleModal(false);
      } else {
        console.error('İndirim kuralı güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('İndirim kuralı güncelleme hatası:', error);
    }
  };

  const openEditCategoryModal = (category: IDiscountCategory) => {
    setCurrentCategory(category);
    setCategoryFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      status: category.status
    });
    setCategoryFormErrors({
      code: '',
      name: ''
    });
    setShowEditCategoryModal(true);
  };

  const openEditRuleModal = (rule: IDiscountRule) => {
    setCurrentRule(rule);
    setRuleFormData({
      discountCategoryId: rule.discountCategoryId,
      productId: rule.productId || '',
      productCategoryId: rule.productCategoryId || '',
      startDate: rule.startDate,
      endDate: rule.endDate,
      discountType: rule.discountType,
      discountValue: rule.discountValue,
      minPrice: rule.minPrice || 0,
      maxPrice: rule.maxPrice || 0,
      minNights: rule.minNights || 0,
      maxNights: rule.maxNights || 0,
      priority: rule.priority,
      status: rule.status
    });
    setRuleFormErrors({
      discountCategoryId: '',
      startDate: '',
      endDate: '',
      discountValue: ''
    });
    setShowEditRuleModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      code: '',
      name: '',
      description: '',
      status: 'active'
    });
    setCategoryFormErrors({
      code: '',
      name: ''
    });
  };

  const resetRuleForm = () => {
    setRuleFormData({
      discountCategoryId: '',
      productId: '',
      productCategoryId: '',
      startDate: '',
      endDate: '',
      discountType: 'percentage',
      discountValue: 0,
      minPrice: 0,
      maxPrice: 0,
      minNights: 0,
      maxNights: 0,
      priority: 1,
      status: 'active'
    });
    setRuleFormErrors({
      discountCategoryId: '',
      startDate: '',
      endDate: '',
      discountValue: ''
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
            <span>İndirim Kategorileri</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'rules'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>İndirim Kuralları</span>
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
              resetRuleForm();
              setShowAddRuleModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni İndirim Kuralı</span>
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
                        Kod
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
                            <div className="text-sm text-gray-500 dark:text-gray-400">{category.code}</div>
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
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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

      {/* Rules Tab Content */}
      {activeTab === 'rules' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="İndirim kuralı ara..."
                value={ruleSearchTerm}
                onChange={(e) => setRuleSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <select
                value={ruleCategoryFilter}
                onChange={(e) => setRuleCategoryFilter(e.target.value)}
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
                value={ruleStatusFilter}
                onChange={(e) => setRuleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* Rules Table */}
          {isLoadingRules ? (
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
                        Kategori
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uygulama Alanı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İndirim
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Geçerlilik
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
                    {filteredRules.length > 0 ? (
                      filteredRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Folder className="flex-shrink-0 mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {rule.discountCategory?.name || 'Bilinmeyen Kategori'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {rule.product ? (
                                <div className="flex items-center">
                                  <Package className="flex-shrink-0 mr-1 h-4 w-4" />
                                  <span>{rule.product.name}</span>
                                </div>
                              ) : rule.productCategory ? (
                                <div className="flex items-center">
                                  <Folder className="flex-shrink-0 mr-1 h-4 w-4" />
                                  <span>{rule.productCategory.name}</span>
                                </div>
                              ) : (
                                'Tüm Ürünler'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Percent className="flex-shrink-0 mr-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {rule.discountType === 'percentage' ? (
                                  `%${rule.discountValue}`
                                ) : (
                                  `${rule.discountValue.toLocaleString('tr-TR')} TL`
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(rule.startDate).toLocaleDateString('tr-TR')} - {new Date(rule.endDate).toLocaleDateString('tr-TR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rule.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {rule.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditRuleModal(rule)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {rule.status === 'active' ? (
                                <button
                                  onClick={() => handleRuleStatusChange(rule.id, 'inactive')}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Pasife Al"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRuleStatusChange(rule.id, 'active')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Aktife Al"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setRuleToDelete(rule);
                                  setShowRuleDeleteModal(true);
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
                          {ruleSearchTerm || ruleCategoryFilter !== 'all' || ruleStatusFilter !== 'all' 
                            ? 'Arama kriterlerine uygun indirim kuralı bulunamadı.' 
                            : 'Henüz indirim kuralı kaydı bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules Pagination */}
          {ruleTotalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setRulePage(prev => Math.max(prev - 1, 1))}
                  disabled={rulePage === 1}
                  className={`p-2 rounded-md ${
                    rulePage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: ruleTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setRulePage(page)}
                    className={`px-3 py-1 rounded-md ${
                      rulePage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setRulePage(prev => Math.min(prev + 1, ruleTotalPages))}
                  disabled={rulePage === ruleTotalPages}
                  className={`p-2 rounded-md ${
                    rulePage === ruleTotalPages
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
        title="İndirim Kategorisi Silme"
        message={`"${categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingCategory}
        error={categoryDeleteError}
      />

      {/* Delete Rule Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showRuleDeleteModal}
        onClose={() => setShowRuleDeleteModal(false)}
        onConfirm={handleDeleteRule}
        title="İndirim Kuralı Silme"
        message={`Bu indirim kuralını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingRule}
        error={ruleDeleteError}
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
                  Yeni İndirim Kategorisi Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Kodu*
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={categoryFormData.code}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 border ${
                        categoryFormErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="OGRENCI_INDIRIMI"
                    />
                    {categoryFormErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{categoryFormErrors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Sadece büyük harf, rakam ve alt çizgi (_) kullanabilirsiniz.
                    </p>
                  </div>
                  
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
                      placeholder="Öğrenci İndirimi"
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
                  İndirim Kategorisi Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kategori Kodu*
                    </label>
                    <input
                      type="text"
                      id="edit-code"
                      value={categoryFormData.code}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 border ${
                        categoryFormErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {categoryFormErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{categoryFormErrors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Sadece büyük harf, rakam ve alt çizgi (_) kullanabilirsiniz.
                    </p>
                  </div>
                  
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

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni İndirim Kuralı Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="discountCategoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İndirim Kategorisi*
                    </label>
                    <select
                      id="discountCategoryId"
                      value={ruleFormData.discountCategoryId}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, discountCategoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        ruleFormErrors.discountCategoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.filter(c => c.status === 'active').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {ruleFormErrors.discountCategoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.discountCategoryId}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ürün (İsteğe Bağlı)
                      </label>
                      <select
                        id="productId"
                        value={ruleFormData.productId}
                        onChange={(e) => setRuleFormData({ 
                          ...ruleFormData, 
                          productId: e.target.value,
                          productCategoryId: '' // Reset product category when product is selected
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Ürün Seçin</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Belirli bir ürüne indirim uygulamak için seçin
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="productCategoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ürün Kategorisi (İsteğe Bağlı)
                      </label>
                      <select
                        id="productCategoryId"
                        value={ruleFormData.productCategoryId}
                        onChange={(e) => setRuleFormData({ 
                          ...ruleFormData, 
                          productCategoryId: e.target.value,
                          productId: '' // Reset product when product category is selected
                        })}
                        disabled={!!ruleFormData.productId}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      >
                        <option value="">Kategori Seçin</option>
                        {productCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Bir ürün kategorisine indirim uygulamak için seçin
                      </p>
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
                        value={ruleFormData.startDate}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, startDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {ruleFormErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.startDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bitiş Tarihi*
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={ruleFormData.endDate}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, endDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {ruleFormErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        İndirim Tipi
                      </label>
                      <select
                        id="discountType"
                        value={ruleFormData.discountType}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit Tutar (TL)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        İndirim Değeri*
                      </label>
                      <input
                        type="number"
                        id="discountValue"
                        value={ruleFormData.discountValue}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, discountValue: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.discountValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                        min="0"
                        step={ruleFormData.discountType === 'percentage' ? '0.01' : '1'}
                      />
                      {ruleFormErrors.discountValue && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.discountValue}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Fiyat (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="minPrice"
                        value={ruleFormData.minPrice}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, minPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maksimum Fiyat (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="maxPrice"
                        value={ruleFormData.maxPrice}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, maxPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minNights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Gece (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="minNights"
                        value={ruleFormData.minNights}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, minNights: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxNights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maksimum Gece (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="maxNights"
                        value={ruleFormData.maxNights}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, maxNights: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Öncelik
                      </label>
                      <input
                        type="number"
                        id="priority"
                        value={ruleFormData.priority}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                        step="1"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Daha yüksek öncelik değeri, çakışma durumunda öncelikli olarak uygulanır.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Durum
                      </label>
                      <select
                        id="status"
                        value={ruleFormData.status}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {showEditRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  İndirim Kuralı Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-discountCategoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İndirim Kategorisi*
                    </label>
                    <select
                      id="edit-discountCategoryId"
                      value={ruleFormData.discountCategoryId}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, discountCategoryId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        ruleFormErrors.discountCategoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.filter(c => c.status === 'active').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {ruleFormErrors.discountCategoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.discountCategoryId}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ürün (İsteğe Bağlı)
                      </label>
                      <select
                        id="edit-productId"
                        value={ruleFormData.productId}
                        onChange={(e) => setRuleFormData({ 
                          ...ruleFormData, 
                          productId: e.target.value,
                          productCategoryId: '' // Reset product category when product is selected
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Ürün Seçin</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-productCategoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ürün Kategorisi (İsteğe Bağlı)
                      </label>
                      <select
                        id="edit-productCategoryId"
                        value={ruleFormData.productCategoryId}
                        onChange={(e) => setRuleFormData({ 
                          ...ruleFormData, 
                          productCategoryId: e.target.value,
                          productId: '' // Reset product when product category is selected
                        })}
                        disabled={!!ruleFormData.productId}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      >
                        <option value="">Kategori Seçin</option>
                        {productCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
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
                        value={ruleFormData.startDate}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, startDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {ruleFormErrors.startDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.startDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bitiş Tarihi*
                      </label>
                      <input
                        type="date"
                        id="edit-endDate"
                        value={ruleFormData.endDate}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, endDate: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {ruleFormErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.endDate}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-discountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        İndirim Tipi
                      </label>
                      <select
                        id="edit-discountType"
                        value={ruleFormData.discountType}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="percentage">Yüzde (%)</option>
                        <option value="fixed">Sabit Tutar (TL)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-discountValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        İndirim Değeri*
                      </label>
                      <input
                        type="number"
                        id="edit-discountValue"
                        value={ruleFormData.discountValue}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, discountValue: parseFloat(e.target.value) })}
                        className={`w-full px-3 py-2 border ${
                          ruleFormErrors.discountValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                        min="0"
                        step={ruleFormData.discountType === 'percentage' ? '0.01' : '1'}
                      />
                      {ruleFormErrors.discountValue && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{ruleFormErrors.discountValue}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Fiyat (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="edit-minPrice"
                        value={ruleFormData.minPrice}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, minPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maksimum Fiyat (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="edit-maxPrice"
                        value={ruleFormData.maxPrice}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, maxPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-minNights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Gece (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="edit-minNights"
                        value={ruleFormData.minNights}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, minNights: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-maxNights" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maksimum Gece (İsteğe Bağlı)
                      </label>
                      <input
                        type="number"
                        id="edit-maxNights"
                        value={ruleFormData.maxNights}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, maxNights: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Öncelik
                      </label>
                      <input
                        type="number"
                        id="edit-priority"
                        value={ruleFormData.priority}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Durum
                      </label>
                      <select
                        id="edit-status"
                        value={ruleFormData.status}
                        onChange={(e) => setRuleFormData({ ...ruleFormData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditRule}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditRuleModal(false)}
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