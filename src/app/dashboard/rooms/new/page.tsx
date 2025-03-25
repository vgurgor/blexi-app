'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import NewRoomForm from '@/components/rooms/NewRoomForm';
import PageLoader from '@/components/PageLoader';

export default function NewRoomPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // API entegrasyonu NewRoomForm içinde yapıldı
      console.log('Yeni oda eklendi:', data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Kısa bir bekleme
      router.back();
    } catch (error) {
      console.error('Hata:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && <PageLoader />}
      <div className="min-h-screen p-8 pt-24 animate-slideLeft">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Oda Ekle
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <NewRoomForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
}