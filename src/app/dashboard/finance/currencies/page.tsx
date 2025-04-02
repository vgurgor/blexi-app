'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeftRight,
  Globe,
  Star,
  Coins
} from 'lucide-react';
import { currenciesApi } from '@/lib/api/currencies';
import { exchangeRatesApi } from '@/lib/api/exchangeRates';
import { ICurrency, IExchangeRate } from '@/types/models';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function CurrenciesPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'currencies' | 'exchange-rates'>('currencies');
  
  // Currencies state
  const [currencies, setCurrencies] = useState<ICurrency[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<ICurrency[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const [currencyStatusFilter, setCurrencyStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currencyPage, setCurrencyPage] = useState(1);
  const [currencyTotalPages, setCurrencyTotalPages] = useState(1);
  const [showCurrencyDeleteModal, setShowCurrencyDeleteModal] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<ICurrency | null>(null);
  const [isDeletingCurrency, setIsDeletingCurrency] = useState(false);
  const [currencyDeleteError, setCurrencyDeleteError] = useState('');
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [showEditCurrencyModal, setShowEditCurrencyModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<ICurrency | null>(null);
  
  // Exchange Rates state
  const [exchangeRates, setExchangeRates] = useState<IExchangeRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);
  const [updateRatesSuccess, setUpdateRatesSuccess] = useState(false);
  const [updateRatesError, setUpdateRatesError] = useState('');
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [currentRate, setCurrentRate] = useState<IExchangeRate | null>(null);
  const [showRateDeleteModal, setShowRateDeleteModal] = useState(false);
  const [rateToDelete, setRateToDelete] = useState<IExchangeRate | null>(null);
  const [isDeletingRate, setIsDeletingRate] = useState(false);
  const [rateDeleteError, setRateDeleteError] = useState('');
  
  // Currency form data
  const [currencyFormData, setCurrencyFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    decimalPlaces: 2,
    isDefault: false,
    status: 'active' as 'active' | 'inactive'
  });
  
  const [currencyFormErrors, setCurrencyFormErrors] = useState({
    code: '',
    name: '',
    symbol: ''
  });
  
  // Exchange Rate form data
  const [rateFormData, setRateFormData] = useState({
    baseCurrencyId: '',
    targetCurrencyId: '',
    rate: 0,
    effectiveDate: new Date().toISOString().split('T')[0]
  });
  
  const [rateFormErrors, setRateFormErrors] = useState({
    baseCurrencyId: '',
    targetCurrencyId: '',
    rate: ''
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
      if (activeTab === 'currencies') {
        fetchCurrencies();
      } else {
        fetchExchangeRates();
      }
    }
  }, [isAuthenticated, activeTab, currencyStatusFilter, currencyPage]);

  useEffect(() => {
    // Filter currencies based on search term
    if (currencies.length > 0) {
      const filtered = currencies.filter(currency => {
        const matchesSearch = currencySearchTerm === '' || 
          currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
          currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase());
        
        const matchesStatus = currencyStatusFilter === 'all' || currency.status === currencyStatusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      setFilteredCurrencies(filtered);
    }
  }, [currencySearchTerm, currencies, currencyStatusFilter]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (updateRatesSuccess) {
      const timer = setTimeout(() => {
        setUpdateRatesSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateRatesSuccess]);

  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true);
    try {
      const status = currencyStatusFilter !== 'all' ? currencyStatusFilter : undefined;
      const response = await currenciesApi.getAll(currencyPage, 10);
      
      if (response.success && response.data) {
        setCurrencies(response.data);
        setCurrencyTotalPages(Math.ceil(response.total / response.limit));
      } else {
        console.error('Para birimi verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Para birimi verileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      const response = await exchangeRatesApi.getLatest();
      
      if (response.success && response.data) {
        setExchangeRates(response.data);
      } else {
        console.error('Döviz kuru verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Döviz kuru verileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleUpdateRatesFromApi = async () => {
    setIsUpdatingRates(true);
    setUpdateRatesError('');
    setUpdateRatesSuccess(false);
    
    try {
      const response = await exchangeRatesApi.updateFromApi();
      
      if (response.success) {
        setUpdateRatesSuccess(true);
        fetchExchangeRates();
      } else {
        setUpdateRatesError(response.error || 'Döviz kurları güncellenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Döviz kuru güncelleme hatası:', error);
      setUpdateRatesError(error.message || 'Döviz kurları güncellenirken bir hata oluştu');
    } finally {
      setIsUpdatingRates(false);
    }
  };

  const handleDeleteCurrency = async () => {
    if (!currencyToDelete) return;
    
    setIsDeletingCurrency(true);
    setCurrencyDeleteError('');
    
    try {
      const response = await currenciesApi.delete(currencyToDelete.id);
      
      if (response.success) {
        setCurrencies(prev => prev.filter(c => c.id !== currencyToDelete.id));
        setShowCurrencyDeleteModal(false);
      } else {
        throw new Error(response.error || 'Para birimi silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Para birimi silme hatası:', error);
      setCurrencyDeleteError(error.message || 'Para birimi silinirken bir hata oluştu');
    } finally {
      setIsDeletingCurrency(false);
    }
  };

  const handleDeleteRate = async () => {
    if (!rateToDelete) return;
    
    setIsDeletingRate(true);
    setRateDeleteError('');
    
    try {
      const response = await exchangeRatesApi.delete(rateToDelete.id);
      
      if (response.success) {
        setExchangeRates(prev => prev.filter(r => r.id !== rateToDelete.id));
        setShowRateDeleteModal(false);
      } else {
        throw new Error(response.error || 'Döviz kuru silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Döviz kuru silme hatası:', error);
      setRateDeleteError(error.message || 'Döviz kuru silinirken bir hata oluştu');
    } finally {
      setIsDeletingRate(false);
    }
  };

  const handleCurrencyStatusChange = async (id: string, status: 'active' | 'inactive') => {
    try {
      const response = await currenciesApi.updateStatus(id, status);
      
      if (response.success) {
        setCurrencies(prev => prev.map(c => 
          c.id === id ? { ...c, status } : c
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleSetDefaultCurrency = async (id: string) => {
    try {
      const response = await currenciesApi.setAsDefault(id);
      
      if (response.success) {
        setCurrencies(prev => prev.map(c => 
          c.id === id ? { ...c, isDefault: true } : { ...c, isDefault: false }
        ));
      } else {
        console.error('Varsayılan para birimi ayarlama hatası:', response.error);
      }
    } catch (error) {
      console.error('Varsayılan para birimi ayarlama hatası:', error);
    }
  };

  const handleAddCurrency = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      code: '',
      name: '',
      symbol: ''
    };
    
    if (!currencyFormData.code.trim()) {
      errors.code = 'Para birimi kodu zorunludur';
      hasError = true;
    } else if (currencyFormData.code.length !== 3) {
      errors.code = 'Para birimi kodu 3 karakter olmalıdır (örn: TRY, USD)';
      hasError = true;
    }
    
    if (!currencyFormData.name.trim()) {
      errors.name = 'Para birimi adı zorunludur';
      hasError = true;
    }
    
    if (!currencyFormData.symbol.trim()) {
      errors.symbol = 'Para birimi sembolü zorunludur';
      hasError = true;
    }
    
    setCurrencyFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await currenciesApi.create({
        code: currencyFormData.code,
        name: currencyFormData.name,
        symbol: currencyFormData.symbol,
        decimal_places: currencyFormData.decimalPlaces,
        status: currencyFormData.status
      });
      
      if (response.success && response.data) {
        setCurrencies(prev => [...prev, response.data]);
        setShowAddCurrencyModal(false);
        resetCurrencyForm();
      } else {
        console.error('Para birimi oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Para birimi oluşturma hatası:', error);
    }
  };

  const handleEditCurrency = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      code: '',
      name: '',
      symbol: ''
    };
    
    if (!currencyFormData.code.trim()) {
      errors.code = 'Para birimi kodu zorunludur';
      hasError = true;
    } else if (currencyFormData.code.length !== 3) {
      errors.code = 'Para birimi kodu 3 karakter olmalıdır (örn: TRY, USD)';
      hasError = true;
    }
    
    if (!currencyFormData.name.trim()) {
      errors.name = 'Para birimi adı zorunludur';
      hasError = true;
    }
    
    if (!currencyFormData.symbol.trim()) {
      errors.symbol = 'Para birimi sembolü zorunludur';
      hasError = true;
    }
    
    setCurrencyFormErrors(errors);
    
    if (hasError || !currentCurrency) return;
    
    try {
      const response = await currenciesApi.update(currentCurrency.id, {
        code: currencyFormData.code,
        name: currencyFormData.name,
        symbol: currencyFormData.symbol,
        decimal_places: currencyFormData.decimalPlaces,
        status: currencyFormData.status
      });
      
      if (response.success) {
        setCurrencies(prev => prev.map(c => 
          c.id === currentCurrency.id ? { 
            ...c, 
            code: currencyFormData.code,
            name: currencyFormData.name,
            symbol: currencyFormData.symbol,
            decimalPlaces: currencyFormData.decimalPlaces,
            status: currencyFormData.status
          } : c
        ));
        setShowEditCurrencyModal(false);
      } else {
        console.error('Para birimi güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Para birimi güncelleme hatası:', error);
    }
  };

  const handleAddExchangeRate = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      baseCurrencyId: '',
      targetCurrencyId: '',
      rate: ''
    };
    
    if (!rateFormData.baseCurrencyId) {
      errors.baseCurrencyId = 'Baz para birimi seçimi zorunludur';
      hasError = true;
    }
    
    if (!rateFormData.targetCurrencyId) {
      errors.targetCurrencyId = 'Hedef para birimi seçimi zorunludur';
      hasError = true;
    } else if (rateFormData.baseCurrencyId === rateFormData.targetCurrencyId) {
      errors.targetCurrencyId = 'Baz ve hedef para birimi aynı olamaz';
      hasError = true;
    }
    
    if (rateFormData.rate <= 0) {
      errors.rate = 'Kur oranı 0\'dan büyük olmalıdır';
      hasError = true;
    }
    
    setRateFormErrors(errors);
    
    if (hasError) return;
    
    try {
      const response = await exchangeRatesApi.create({
        base_currency_id: parseInt(rateFormData.baseCurrencyId),
        target_currency_id: parseInt(rateFormData.targetCurrencyId),
        rate: rateFormData.rate,
        effective_date: rateFormData.effectiveDate
      });
      
      if (response.success && response.data) {
        setExchangeRates(prev => [...prev, response.data]);
        setShowAddRateModal(false);
        resetRateForm();
      } else {
        console.error('Döviz kuru oluşturma hatası:', response.error);
      }
    } catch (error) {
      console.error('Döviz kuru oluşturma hatası:', error);
    }
  };

  const handleEditExchangeRate = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      baseCurrencyId: '',
      targetCurrencyId: '',
      rate: ''
    };
    
    if (rateFormData.rate <= 0) {
      errors.rate = 'Kur oranı 0\'dan büyük olmalıdır';
      hasError = true;
    }
    
    setRateFormErrors(errors);
    
    if (hasError || !currentRate) return;
    
    try {
      const response = await exchangeRatesApi.update(currentRate.id, {
        rate: rateFormData.rate,
        effective_date: rateFormData.effectiveDate
      });
      
      if (response.success) {
        setExchangeRates(prev => prev.map(r => 
          r.id === currentRate.id ? { 
            ...r, 
            rate: rateFormData.rate,
            effectiveDate: rateFormData.effectiveDate
          } : r
        ));
        setShowEditRateModal(false);
      } else {
        console.error('Döviz kuru güncelleme hatası:', response.error);
      }
    } catch (error) {
      console.error('Döviz kuru güncelleme hatası:', error);
    }
  };

  const openEditCurrencyModal = (currency: ICurrency) => {
    setCurrentCurrency(currency);
    setCurrencyFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimalPlaces: currency.decimalPlaces,
      isDefault: currency.isDefault,
      status: currency.status
    });
    setCurrencyFormErrors({
      code: '',
      name: '',
      symbol: ''
    });
    setShowEditCurrencyModal(true);
  };

  const openEditRateModal = (rate: IExchangeRate) => {
    setCurrentRate(rate);
    setRateFormData({
      baseCurrencyId: rate.baseCurrency.id,
      targetCurrencyId: rate.targetCurrency.id,
      rate: rate.rate,
      effectiveDate: rate.effectiveDate
    });
    setRateFormErrors({
      baseCurrencyId: '',
      targetCurrencyId: '',
      rate: ''
    });
    setShowEditRateModal(true);
  };

  const resetCurrencyForm = () => {
    setCurrencyFormData({
      code: '',
      name: '',
      symbol: '',
      decimalPlaces: 2,
      isDefault: false,
      status: 'active'
    });
    setCurrencyFormErrors({
      code: '',
      name: '',
      symbol: ''
    });
  };

  const resetRateForm = () => {
    setRateFormData({
      baseCurrencyId: '',
      targetCurrencyId: '',
      rate: 0,
      effectiveDate: new Date().toISOString().split('T')[0]
    });
    setRateFormErrors({
      baseCurrencyId: '',
      targetCurrencyId: '',
      rate: ''
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
            onClick={() => setActiveTab('currencies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'currencies'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Para Birimleri</span>
          </button>
          <button
            onClick={() => setActiveTab('exchange-rates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'exchange-rates'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Döviz Kurları</span>
          </button>
        </div>
        
        {activeTab === 'currencies' ? (
          <button 
            onClick={() => {
              resetCurrencyForm();
              setShowAddCurrencyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Para Birimi</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleUpdateRatesFromApi}
              disabled={isUpdatingRates}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isUpdatingRates ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Kurları Güncelle</span>
                </>
              )}
            </button>
            <button 
              onClick={() => {
                resetRateForm();
                setShowAddRateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Kur Ekle</span>
            </button>
          </div>
        )}
      </div>

      {updateRatesSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
          Döviz kurları başarıyla güncellendi.
        </div>
      )}

      {updateRatesError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {updateRatesError}
        </div>
      )}

      {/* Currencies Tab Content */}
      {activeTab === 'currencies' && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Para birimi ara..."
                value={currencySearchTerm}
                onChange={(e) => setCurrencySearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={currencyStatusFilter}
                onChange={(e) => setCurrencyStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          {/* Currencies Table */}
          {isLoadingCurrencies ? (
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
                        Para Birimi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kod
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sembol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ondalık
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
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((currency) => (
                        <tr key={currency.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-3">
                                {currency.isDefault && (
                                  <Star className="h-5 w-5 text-yellow-500" />
                                )}
                                {!currency.isDefault && (
                                  <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{currency.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{currency.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{currency.symbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{currency.decimalPlaces}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              currency.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {currency.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {!currency.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultCurrency(currency.id)}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Varsayılan Yap"
                                >
                                  <Star className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => openEditCurrencyModal(currency)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {currency.status === 'active' ? (
                                <button
                                  onClick={() => handleCurrencyStatusChange(currency.id, 'inactive')}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Pasife Al"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCurrencyStatusChange(currency.id, 'active')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Aktife Al"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              {!currency.isDefault && (
                                <button
                                  onClick={() => {
                                    setCurrencyToDelete(currency);
                                    setShowCurrencyDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {currencySearchTerm ? 'Arama kriterlerine uygun para birimi bulunamadı.' : 'Henüz para birimi kaydı bulunmamaktadır.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {currencyTotalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrencyPage(prev => Math.max(prev - 1, 1))}
                  disabled={currencyPage === 1}
                  className={`p-2 rounded-md ${
                    currencyPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: currencyTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrencyPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currencyPage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrencyPage(prev => Math.min(prev + 1, currencyTotalPages))}
                  disabled={currencyPage === currencyTotalPages}
                  className={`p-2 rounded-md ${
                    currencyPage === currencyTotalPages
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

      {/* Exchange Rates Tab Content */}
      {activeTab === 'exchange-rates' && (
        <>
          {/* Exchange Rates Table */}
          {isLoadingRates ? (
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
                        Baz Para Birimi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hedef Para Birimi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kur Oranı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Geçerlilik Tarihi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kaynak
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {exchangeRates.length > 0 ? (
                      exchangeRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {rate.baseCurrency.code} ({rate.baseCurrency.symbol})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {rate.targetCurrency.code} ({rate.targetCurrency.symbol})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {rate.rate.toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(rate.effectiveDate).toLocaleDateString('tr-TR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rate.source === 'api'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                : rate.source === 'manual'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {rate.source === 'api' ? 'API' : rate.source === 'manual' ? 'Manuel' : 'Sistem'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditRateModal(rate)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setRateToDelete(rate);
                                  setShowRateDeleteModal(true);
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
                          Henüz döviz kuru kaydı bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Currency Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showCurrencyDeleteModal}
        onClose={() => setShowCurrencyDeleteModal(false)}
        onConfirm={handleDeleteCurrency}
        title="Para Birimi Silme"
        message={`"${currencyToDelete?.name}" para birimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingCurrency}
        error={currencyDeleteError}
      />

      {/* Delete Exchange Rate Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showRateDeleteModal}
        onClose={() => setShowRateDeleteModal(false)}
        onConfirm={handleDeleteRate}
        title="Döviz Kuru Silme"
        message={`${rateToDelete?.baseCurrency.code} - ${rateToDelete?.targetCurrency.code} döviz kurunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeletingRate}
        error={rateDeleteError}
      />

      {/* Add Currency Modal */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Para Birimi Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Adı*
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={currencyFormData.name}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="Türk Lirası"
                    />
                    {currencyFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Kodu*
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={currencyFormData.code}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="TRY"
                      maxLength={3}
                    />
                    {currencyFormErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      3 karakterlik ISO para birimi kodu (örn: TRY, USD, EUR)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Sembolü*
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      value={currencyFormData.symbol}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, symbol: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.symbol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="₺"
                    />
                    {currencyFormErrors.symbol && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.symbol}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="decimalPlaces" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ondalık Basamak Sayısı
                    </label>
                    <input
                      type="number"
                      id="decimalPlaces"
                      value={currencyFormData.decimalPlaces}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, decimalPlaces: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                      max="4"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="status"
                      value={currencyFormData.status}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleAddCurrency}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCurrencyModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Currency Modal */}
      {showEditCurrencyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Para Birimi Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Adı*
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={currencyFormData.name}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {currencyFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Kodu*
                    </label>
                    <input
                      type="text"
                      id="edit-code"
                      value={currencyFormData.code}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, code: e.target.value.toUpperCase() })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      maxLength={3}
                    />
                    {currencyFormErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      3 karakterlik ISO para birimi kodu (örn: TRY, USD, EUR)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para Birimi Sembolü*
                    </label>
                    <input
                      type="text"
                      id="edit-symbol"
                      value={currencyFormData.symbol}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, symbol: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        currencyFormErrors.symbol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {currencyFormErrors.symbol && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{currencyFormErrors.symbol}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-decimalPlaces" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ondalık Basamak Sayısı
                    </label>
                    <input
                      type="number"
                      id="edit-decimalPlaces"
                      value={currencyFormData.decimalPlaces}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, decimalPlaces: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                      max="4"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum
                    </label>
                    <select
                      id="edit-status"
                      value={currencyFormData.status}
                      onChange={(e) => setCurrencyFormData({ ...currencyFormData, status: e.target.value as 'active' | 'inactive' })}
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
                  onClick={handleEditCurrency}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCurrencyModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exchange Rate Modal */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Yeni Döviz Kuru Ekle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="baseCurrencyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Baz Para Birimi*
                    </label>
                    <select
                      id="baseCurrencyId"
                      value={rateFormData.baseCurrencyId}
                      onChange={(e) => setRateFormData({ ...rateFormData, baseCurrencyId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        rateFormErrors.baseCurrencyId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Baz Para Birimi Seçin</option>
                      {currencies.filter(c => c.status === 'active').map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                    {rateFormErrors.baseCurrencyId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{rateFormErrors.baseCurrencyId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="targetCurrencyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hedef Para Birimi*
                    </label>
                    <select
                      id="targetCurrencyId"
                      value={rateFormData.targetCurrencyId}
                      onChange={(e) => setRateFormData({ ...rateFormData, targetCurrencyId: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        rateFormErrors.targetCurrencyId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Hedef Para Birimi Seçin</option>
                      {currencies.filter(c => c.status === 'active').map(currency => (
                        <option 
                          key={currency.id} 
                          value={currency.id}
                          disabled={currency.id === rateFormData.baseCurrencyId}
                        >
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                    {rateFormErrors.targetCurrencyId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{rateFormErrors.targetCurrencyId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kur Oranı*
                    </label>
                    <input
                      type="number"
                      id="rate"
                      value={rateFormData.rate}
                      onChange={(e) => setRateFormData({ ...rateFormData, rate: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border ${
                        rateFormErrors.rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      min="0"
                      step="0.0001"
                    />
                    {rateFormErrors.rate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{rateFormErrors.rate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Geçerlilik Tarihi
                    </label>
                    <input
                      type="date"
                      id="effectiveDate"
                      value={rateFormData.effectiveDate}
                      onChange={(e) => setRateFormData({ ...rateFormData, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddExchangeRate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exchange Rate Modal */}
      {showEditRateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Döviz Kuru Düzenle
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Baz Para Birimi
                    </label>
                    <input
                      type="text"
                      value={currentRate ? `${currentRate.baseCurrency.code} - ${currentRate.baseCurrency.name}` : ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Baz para birimi değiştirilemez. Yeni bir kur oluşturmanız gerekir.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hedef Para Birimi
                    </label>
                    <input
                      type="text"
                      value={currentRate ? `${currentRate.targetCurrency.code} - ${currentRate.targetCurrency.name}` : ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Hedef para birimi değiştirilemez. Yeni bir kur oluşturmanız gerekir.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kur Oranı*
                    </label>
                    <input
                      type="number"
                      id="edit-rate"
                      value={rateFormData.rate}
                      onChange={(e) => setRateFormData({ ...rateFormData, rate: parseFloat(e.target.value) })}
                      className={`w-full px-3 py-2 border ${
                        rateFormErrors.rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      min="0"
                      step="0.0001"
                    />
                    {rateFormErrors.rate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{rateFormErrors.rate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="edit-effectiveDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Geçerlilik Tarihi
                    </label>
                    <input
                      type="date"
                      id="edit-effectiveDate"
                      value={rateFormData.effectiveDate}
                      onChange={(e) => setRateFormData({ ...rateFormData, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEditExchangeRate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditRateModal(false)}
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