'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { ArrowLeft } from 'lucide-react';
import EditApartmentForm from '@/components/EditApartmentForm';
import PageLoader from '@/components/PageLoader';
import { apartsApi, ApartDto } from '@/lib/api/apartments';

export default function EditApartmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apartment, setApartment] = useState<ApartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApartment = async () => {
      setIsLoading(true);
      try {
        const apartId = parseInt(params.id, 10);
        const response = await apartsApi.getById(apartId);

        if (response.success && response.data) {
          setApartment(response.data);
        } else {
          console.error('Apart detayları alınamadı:', response.error);
          setError('Apart bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Apart detayları çekilirken hata oluştu:', error);
        setError('Apart bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchApartment();
    }
  }, [isAuthenticated, params.id]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // API entegrasyonu EditApartmentForm içinde yapıldı
      console.log('Apart güncellendi:', data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Kısa bir bekleme
      router.back();
    } catch (error) {
      console.error('Hata:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
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

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Apart bulunamadı.</p>
      </div>
    );
  }

  return (
    <>
      {isSubmitting && <PageLoader />}
      <div className="min-h-screen p-8 animate-slideLeft">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Apart Düzenle
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <EditApartmentForm apartment={apartment} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
}