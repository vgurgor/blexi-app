'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar, 
  Package, 
  CreditCard, 
  FileText, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Bed, 
  DoorOpen, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { seasonRegistrationProductsApi } from '@/lib/api/seasonRegistrationProducts';
import { paymentPlansApi } from '@/lib/api/paymentPlans';
import { invoiceTitlesApi } from '@/lib/api/invoiceTitles';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/hooks/useToast';

export default function StudentRegistrationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [invoiceTitles, setInvoiceTitles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'payments' | 'invoices' | 'documents'>('overview');
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
    if (isAuthenticated && params.id) {
      fetchRegistrationData();
    }
  }, [isAuthenticated, params.id]);

  const fetchRegistrationData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch registration details
      const registrationResponse = await seasonRegistrationsApi.getById(params.id);
      
      if (registrationResponse.success && registrationResponse.data) {
        setRegistration(registrationResponse.data);
        
        // Fetch products
        const productsResponse = await seasonRegistrationProductsApi.getByRegistrationId(params.id);
        if (productsResponse.success) {
          setProducts(productsResponse.data);
        }
        
        // Fetch payment plans
        const paymentPlansResponse = await paymentPlansApi.getAll({ seasonRegistrationProductId: params.id });
        if (paymentPlansResponse.success) {
          setPaymentPlans(paymentPlansResponse.data);
        }
        
        // Fetch invoice titles
        const invoiceTitlesResponse = await invoiceTitlesApi.getByRegistrationId(params.id);
        if (invoiceTitlesResponse.success) {
          setInvoiceTitles(invoiceTitlesResponse.data);
        }
      } else {
        setError('Öğrenci kaydı bilgileri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching student registration data:', error);
      setError('Öğrenci kaydı bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!registration || registration.status !== 'active') return;
    
    setIsUpdating(true);
    
    try {
      const response = await seasonRegistrationsApi.updateStatus(params.id, 'completed');
      
      if (response.success) {
        toast.success('Öğrenci kaydı başarıyla tamamlandı');
        setRegistration(response.data);
      } else {
        toast.error(response.error || 'Öğrenci kaydı tamamlanırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error completing student registration:', error);
      toast.error(error.message || 'Öğrenci kaydı tamamlanırken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration || registration.status !== 'active') return;
    
    setIsUpdating(true);
    
    try {
      const response = await seasonRegistrationsApi.updateStatus(params.id, 'cancelled');
      
      if (response.success) {
        toast.success('Öğrenci kaydı başarıyla iptal edildi');
        setRegistration(response.data);
      } else {
        toast.error(response.error || 'Öğrenci kaydı iptal edilirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Error cancelling student registration:', error);
      toast.error(error.message || 'Öğrenci kaydı iptal edilirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintRegistration = () => {
    window.print();
  };

  const handleExportRegistration = (format: string) => {
    toast.info(`Kayıt ${format.toUpperCase()} formatında dışa aktarılıyor...`);
    // Implement export functionality
  };

  const handleViewStudent = () => {
    if (registration?.guest?.id) {
      router.push(`/dashboard/students/${registration.guest.id}`);
    } else {
      toast.error('Öğrenci bilgisi bulunamadı');
    }
  };

  // Calculate total amount from products
  const calculateTotal = () => {
    let total = 0;
    products.forEach(product => {
      total += product.quantity * product.unitPrice;
    });
    return total;
  };

  // Calculate total paid amount
  const calculateTotalPaid = () => {
    let total = 0;
    paymentPlans.forEach(plan => {
      if (plan.status === 'paid') {
        total += plan.plannedAmount;
      }
    });
    return total;
  };

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    return calculateTotal() - calculateTotalPaid();
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Aktif
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            İptal Edildi
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Tamamlandı
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            Ödendi
          </span>
        );
      case 'partial_paid':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            Kısmi Ödendi
          </span>
        );
      case 'planned':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            Planlandı
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            Gecikti
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hata
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Öğrenci kaydı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="p-8 animate-slideLeft">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Öğrenci Kaydı #{registration.id}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Oluşturulma: {formatDate(registration.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleViewStudent}
              variant="secondary"
              leftIcon={<User className="w-4 h-4" />}
            >
              Öğrenci Detayları
            </Button>
            
            <Button
              onClick={handlePrintRegistration}
              variant="secondary"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Yazdır
            </Button>
            
            <div className="relative group">
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Dışa Aktar
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <div className="py-1">
                  <button 
                    onClick={() => handleExportRegistration('excel')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Excel'e Aktar
                  </button>
                  <button 
                    onClick={() => handleExportRegistration('pdf')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF'e Aktar
                  </button>
                </div>
              </div>
            </div>
            
            {registration.status === 'active' && (
              <>
                <Button
                  onClick={handleCompleteRegistration}
                  variant="success"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  isLoading={isUpdating}
                >
                  Tamamla
                </Button>
                
                <Button
                  onClick={handleCancelRegistration}
                  variant="danger"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  isLoading={isUpdating}
                >
                  İptal Et
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                registration.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                  : registration.status === 'cancelled'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                {registration.status === 'active' 
                  ? <CheckCircle className="w-6 h-6" />
                  : registration.status === 'cancelled'
                    ? <XCircle className="w-6 h-6" />
                    : <CheckCircle className="w-6 h-6" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {registration.guest?.person?.name} {registration.guest?.person?.surname}
                  </h2>
                  {getStatusBadge(registration.status)}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Kayıt ID: {registration.id} | Öğrenci ID: {registration.guestId}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-sm text-gray-500 dark:text-gray-400">Toplam Tutar</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateTotal().toLocaleString('tr-TR')} ₺
              </div>
              <div className={`text-sm ${calculateRemainingAmount() > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                {calculateRemainingAmount() > 0 
                  ? `${calculateRemainingAmount().toLocaleString('tr-TR')} ₺ Kalan Ödeme`
                  : 'Tamamen Ödendi'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Ürünler ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Ödemeler ({paymentPlans.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Fatura Bilgileri ({invoiceTitles.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Belgeler
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Öğrenci Bilgileri
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.person?.name} {registration.guest?.person?.surname || ''}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Öğrenci Tipi:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.guestType === 'STUDENT' ? 'Öğrenci' :
                         registration.guest?.guestType === 'EMPLOYEE' ? 'Çalışan' : 'Diğer'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.person?.tcNo || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cinsiyet:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.person?.gender === 'MALE' ? 'Erkek' : 
                         registration.guest?.person?.gender === 'FEMALE' ? 'Kadın' : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.person?.phone || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">E-posta:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest?.person?.email || '-'}
                      </p>
                    </div>
                  </div>
                  
                  {registration.guest?.professionDepartment && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {registration.guest.guestType === 'STUDENT' ? 'Bölüm/Fakülte:' : 'Çalıştığı Kurum/Departman:'}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.guest.professionDepartment}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adres:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {registration.guest?.person?.address || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Accommodation Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Konaklama Bilgileri
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Apart:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.apart?.name || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sezon:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.season?.name || registration.seasonCode || '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Oda:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.bed?.room?.room_number || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Yatak:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.bed?.bed_number || '-'} 
                        {registration.bed?.bed_type && ` (${
                          registration.bed.bed_type === 'SINGLE' ? 'Tek Kişilik' : 
                          registration.bed.bed_type === 'DOUBLE' ? 'Çift Kişilik' : 'Ranza'
                        })`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Giriş Tarihi:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(registration.checkInDate)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Çıkış Tarihi:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(registration.checkOutDate)}
                      </p>
                    </div>
                  </div>
                  
                  {registration.depositAmount > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Depozito Tutarı:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.depositAmount.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  )}
                  
                  {registration.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notlar:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {registration.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Finansal Özet
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {calculateTotal().toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {products.length} ürün
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Ödenen Tutar</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {calculateTotalPaid().toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                    {paymentPlans.filter(p => p.status === 'paid').length} ödeme
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Kalan Tutar</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {calculateRemainingAmount().toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                    {paymentPlans.filter(p => p.status !== 'paid').length} bekleyen ödeme
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Ödeme Durumu
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {calculateRemainingAmount() <= 0 
                        ? 'Tüm ödemeler tamamlandı' 
                        : `${calculateRemainingAmount().toLocaleString('tr-TR')} ₺ tutarında ödeme bekliyor`}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setActiveTab('payments')}
                      variant="secondary"
                      leftIcon={<CreditCard className="w-4 h-4" />}
                    >
                      Ödeme Detayları
                    </Button>
                    
                    <Button
                      onClick={() => setActiveTab('products')}
                      variant="secondary"
                      leftIcon={<Package className="w-4 h-4" />}
                    >
                      Ürün Detayları
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {registration.guest?.guardians && registration.guest.guardians.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Veli Bilgileri
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {registration.guest.guardians.map((guardian: any, index: number) => (
                    <div 
                      key={guardian.id} 
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {guardian.person?.name} {guardian.person?.surname}
                              {guardian.isSelf && ' (Kendisi)'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {guardian.relationship === 'PARENT' ? 'Ebeveyn' :
                               guardian.relationship === 'SIBLING' ? 'Kardeş' :
                               guardian.relationship === 'RELATIVE' ? 'Akraba' :
                               guardian.relationship === 'SPOUSE' ? 'Eş' :
                               guardian.relationship === 'SELF' ? 'Kendisi' : guardian.relationship}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          {guardian.isEmergencyContact && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              Acil Durum Kişisi
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guardian.person?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {guardian.person.phone}
                            </span>
                          </div>
                        )}
                        
                        {guardian.person?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {guardian.person.email}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {guardian.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Not:</span> {guardian.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <Package className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ürünler
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ürün</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Miktar</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Birim Fiyat</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.product?.name || `Ürün #${product.productId}`}
                              </div>
                              {product.product?.category?.name && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.product.category.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.unitPrice.toLocaleString('tr-TR')} ₺</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {(product.quantity * product.unitPrice).toLocaleString('tr-TR')} ₺
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Ürün bulunamadı.
                      </td>
                    </tr>
                  )}
                  
                  {products.length > 0 && (
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                        Genel Toplam:
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {calculateTotal().toLocaleString('tr-TR')} ₺
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <CreditCard className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ödeme Planları
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ödeme Tipi</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Planlanan Tarih</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Depozito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentPlans.length > 0 ? (
                    paymentPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {plan.plannedPaymentType?.name || `Ödeme Tipi #${plan.plannedPaymentTypeId}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(plan.plannedDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{plan.plannedAmount.toLocaleString('tr-TR')} ₺</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(plan.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {plan.isDeposit ? (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Ödeme planı bulunamadı.
                      </td>
                    </tr>
                  )}
                  
                  {paymentPlans.length > 0 && (
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={2} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                        Toplam:
                      </td>
                      <td colSpan={3} className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Payment Summary */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Toplam Planlanan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ödenen</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {paymentPlans.filter(p => p.status === 'paid').reduce((sum, plan) => sum + plan.plannedAmount, 0).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kalan</p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    {paymentPlans.filter(p => p.status !== 'paid').reduce((sum, plan) => sum + plan.plannedAmount, 0).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fatura Bilgileri
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {invoiceTitles.length > 0 ? (
                invoiceTitles.map((title) => (
                  <div key={title.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {title.titleType === 'individual' 
                          ? `${title.firstName} ${title.lastName}`
                          : title.companyName}
                        {title.isDefault && ' (Varsayılan)'}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        {title.titleType === 'individual' ? 'Bireysel' : 'Kurumsal'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {title.titleType === 'corporate' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vergi Dairesi:</p>
                            <p className="font-medium text-gray-900 dark:text-white">{title.taxOffice}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vergi Numarası:</p>
                            <p className="font-medium text-gray-900 dark:text-white">{title.taxNumber}</p>
                          </div>
                        </>
                      )}
                      
                      {title.titleType === 'individual' && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No:</p>
                          <p className="font-medium text-gray-900 dark:text-white">{title.identityNumber}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Telefon:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.phone}</p>
                      </div>
                      
                      {title.email && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">E-posta:</p>
                          <p className="font-medium text-gray-900 dark:text-white">{title.email}</p>
                        </div>
                      )}
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Adres:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.address}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Fatura bilgisi bulunamadı.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Belgeler
              </h2>
            </div>
            
            <div className="p-6">
              {registration.guest?.documents && registration.guest.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registration.guest.documents.map((document: any) => (
                    <div key={document.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{document.documentName}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {document.type === 'UPLOADED' ? 'Yüklenen Belge' : 'Sistem Belgesi'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          document.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          document.status === 'verified' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          document.status === 'expired' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {document.status === 'active' ? 'Aktif' :
                           document.status === 'verified' ? 'Doğrulanmış' :
                           document.status === 'expired' ? 'Süresi Dolmuş' : 'Geçersiz'}
                        </span>
                        
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                          İndir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Henüz belge bulunmamaktadır.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    Belge Yükle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {registration.notes && activeTab === 'overview' && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Notlar
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{registration.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}