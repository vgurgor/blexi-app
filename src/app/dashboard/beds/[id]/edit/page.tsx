'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { ArrowLeft } from 'lucide-react';
import EditBedForm from '@/components/rooms/EditBedForm';
import PageLoader from '@/components/PageLoader';
import { bedsApi } from '@/lib/api/beds';
import { IBed } from '@/types/models';

export default function EditBedPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bed, setBed] = useState<IBed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBed = async () => {
      setIsLoading(true);
      try {
        const response = await bedsApi.getById(params.id);
        
        if (response.success && response.data) {
          setBed(response.data);
        } else {
          console.error('Yatak detayları alınamadı:', response.error);
          setError(response.error || 'Yatak bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Yatak detayları çekilirken hata oluştu:', error);
        setError('Yatak bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBed();
    }
  }, [isAuthenticated, params.id]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (data: IBed) => {
    setIsSubmitting(true);
    try {
      const response = await bedsApi.update(params.id, data);
      
      if (response.success && response.data) {
        console.log('Yatak güncellendi:', response.data);
        await new Promise(resolve => setTimeout(resolve, 300)); // Kısa bir bekleme
        router.back();
      } else {
        console.error('Yatak güncellenirken hata oluştu:', response.error);
        setError(response.error || 'Yatak güncellenirken bir hata oluştu.');
        setIsSubmitting(false);
      }
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

  if (!bed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Yatak bulunamadı.</p>
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
              Yatak Düzenle
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <EditBedForm bed={bed} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
}