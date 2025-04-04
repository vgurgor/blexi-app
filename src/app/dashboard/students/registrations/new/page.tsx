'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, ArrowRight, Save, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import PageLoader from '@/components/PageLoader';
import { Button } from '@/components/ui/atoms/Button';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import RegistrationWizard from '@/components/registrations/RegistrationWizard';

export default function NewStudentRegistrationPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const toast = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setRegistrationData(data);
    
    try {
      // Submit the complete registration data to the API
      const response = await seasonRegistrationsApi.createComplete(data);
      
      if (response.success && response.data) {
        setIsCompleted(true);
        toast.success('Öğrenci kaydı başarıyla oluşturuldu!');
      } else {
        toast.error(response.error || 'Öğrenci kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Öğrenci kaydı oluşturma hatası:', error);
      toast.error(error.message || 'Öğrenci kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToList = () => {
    router.push('/dashboard/students/registrations');
  };

  const handleCreateNew = () => {
    setRegistrationData(null);
    setIsCompleted(false);
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
    <>
      {isSubmitting && <PageLoader />}
      <div className="min-h-screen p-8 animate-slideLeft">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Öğrenci Kaydı
            </h1>
          </div>

          {isCompleted ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Öğrenci Kaydı Başarıyla Oluşturuldu!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Öğrenci kaydı başarıyla oluşturuldu. Kayıt listesine giderek detayları görüntüleyebilir veya yeni bir kayıt oluşturabilirsiniz.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleGoToList}
                  variant="primary"
                >
                  Öğrenci Kayıtları Listesine Git
                </Button>
                <Button 
                  onClick={handleCreateNew}
                  variant="secondary"
                >
                  Yeni Öğrenci Kaydı Oluştur
                </Button>
              </div>
            </div>
          ) : (
            <RegistrationWizard onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </>
  );
}