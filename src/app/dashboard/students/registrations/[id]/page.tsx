'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, Building2, Calendar, Package, CreditCard, FileText, Printer, CheckCircle, XCircle } from 'lucide-react';
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
      const response = await seasonRegistrationsApi.complete(params.id);
      
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

  // Calculate total amount from products
  const calculateTotal = () => {
    let total = 0;
    products.forEach(product => {
      total += product.quantity * product.unitPrice;
    });
    return total;
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Öğrenci Kaydı Detayları
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handlePrintRegistration}
              variant="secondary"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Yazdır
            </Button>
            
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

        {/* Registration Status */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Kayıt Durumu: {
                    registration.status === 'active' ? 'Aktif' :
                    registration.status === 'cancelled' ? 'İptal Edildi' :
                    registration.status === 'completed' ? 'Tamamlandı' : registration.status
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Kayıt ID: {registration.id}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 dark:text-gray-400">Oluşturulma Tarihi:</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(registration.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Student Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Öğrenci Bilgileri
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {registration.guest?.person?.name || 'Bilinmiyor'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Öğrenci Tipi:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {registration.guest?.guestType === 'STUDENT' ? 'Öğrenci' :
                   registration.guest?.guestType === 'EMPLOYEE' ? 'Çalışan' : 'Diğer'}
                </p>
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
            </div>
          </div>

          {/* Apartment and Season Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Apart ve Sezon Bilgileri
              </h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apart:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {registration.apart?.name || 'Bilinmiyor'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sezon:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {registration.season?.name || registration.seasonCode}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tarih Aralığı:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(registration.checkInDate).toLocaleDateString('tr-TR')} - {new Date(registration.checkOutDate).toLocaleDateString('tr-TR')}
                </p>
              </div>
              
              {registration.depositAmount > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Depozito Tutarı:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {registration.depositAmount} ₺
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.product?.name || `Ürün #${product.productId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.unitPrice} ₺</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(product.quantity * product.unitPrice).toFixed(2)} ₺
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
                        {calculateTotal().toFixed(2)} ₺
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Plans */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {plan.plannedPaymentType?.name || `Ödeme Tipi #${plan.plannedPaymentTypeId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(plan.plannedDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{plan.plannedAmount} ₺</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          plan.status === 'planned' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : plan.status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : plan.status === 'partial_paid'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {plan.status === 'planned' ? 'Planlandı' :
                           plan.status === 'paid' ? 'Ödendi' :
                           plan.status === 'partial_paid' ? 'Kısmi Ödendi' : 'Gecikti'}
                        </span>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Titles */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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

        {/* Notes */}
        {registration.notes && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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