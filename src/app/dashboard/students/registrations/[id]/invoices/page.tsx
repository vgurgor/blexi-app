'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Edit
} from 'lucide-react';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/atoms/Button';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import RegistrationTabs from '@/components/registrations/details/RegistrationTabs';
import RegistrationHeader from '@/components/registrations/details/RegistrationHeader';
import RegistrationInvoicesContent from '@/components/registrations/details/RegistrationInvoicesContent';

export default function RegistrationInvoicesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      fetchRegistrationDetails();
    }
  }, [isAuthenticated, params.id]);

  const fetchRegistrationDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch registration details
      const registrationResponse = await seasonRegistrationsApi.getById(params.id);
      
      if (registrationResponse.success && registrationResponse.data) {
        setRegistration(registrationResponse.data);
      } else {
        toast.error('Kayıt detayları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching registration details:', error);
      toast.error('Kayıt detayları yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await seasonRegistrationsApi.updateStatus(params.id, 'cancelled');
      
      if (response.success) {
        toast.success('Kayıt başarıyla iptal edildi');
        setRegistration(prev => ({ ...prev, status: 'cancelled' }));
        setShowDeleteModal(false);
      } else {
        throw new Error(response.error || 'Kayıt iptal edilirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kayıt iptal hatası:', error);
      setDeleteError(error.message || 'Kayıt iptal edilirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      const response = await seasonRegistrationsApi.updateStatus(params.id, 'completed');
      
      if (response.success) {
        toast.success('Kayıt başarıyla tamamlandı');
        setRegistration(prev => ({ ...prev, status: 'completed' }));
      } else {
        toast.error(response.error || 'Kayıt tamamlanırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kayıt tamamlama hatası:', error);
      toast.error(error.message || 'Kayıt tamamlanırken bir hata oluştu');
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'invoices') return;
    
    // Navigate to the appropriate tab page
    if (tab === 'details') {
      router.push(`/dashboard/students/registrations/${params.id}`);
    } else {
      router.push(`/dashboard/students/registrations/${params.id}/${tab}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kayıt Bulunamadı
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Belirtilen ID ile kayıt bulunamadı. Lütfen geçerli bir kayıt ID'si ile tekrar deneyin.
            </p>
            <button
              onClick={() => router.push('/dashboard/students/registrations')}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Kayıtlara Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 animate-slideLeft">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kayıt Detayları
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {registration.status === 'active' && (
              <>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  İptal Et
                </Button>
                <Button
                  onClick={handleCompleteRegistration}
                  variant="success"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Tamamla
                </Button>
              </>
            )}
            <Button
              onClick={() => router.push(`/dashboard/students/registrations/${params.id}/edit`)}
              variant="secondary"
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Düzenle
            </Button>
          </div>
        </div>

        {/* Student Info Header */}
        <RegistrationHeader registration={registration} />

        {/* Tabs */}
        <RegistrationTabs activeTab="invoices" setActiveTab={handleTabChange} />

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <RegistrationInvoicesContent registrationId={registration.id} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleCancelRegistration}
        title="Kaydı İptal Et"
        message="Bu kaydı iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
}