'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { ArrowLeft, Plus, Bed as BedIcon, Tag, Package } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import RoomFeatures from '@/components/rooms/RoomFeatures';
import { roomsApi } from '@/lib/api/rooms';
import { IRoom } from '@/types/models';

export default function RoomFeaturesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<IRoom | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        // Fetch room details using roomsApi service
        const response = await roomsApi.getById(params.id);
        
        if (response.success && response.data) {
          setRoom(response.data);
        } else {
          console.error('Oda detayları alınamadı:', response.error);
          throw new Error(response.error || 'Oda bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error: any) {
        console.error('Veri çekilirken hata oluştu:', error);
        setError(error.message || 'Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRoom();
    }
  }, [isAuthenticated, params.id]);

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

  if (error) {
    return (
      <div className="min-h-screen p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover: bg-gray-800 rounded-lg transition-colors"
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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Oda bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 animate-slideLeft">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Oda {room.room_number} - Özellikler
          </h1>
        </div>

        {/* Room Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Oda Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <BedIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Kapasite: {room.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Tip: {room.room_type === 'STANDARD' ? 'Standart' : room.room_type === 'SUITE' ? 'Suit' : 'Deluxe'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/dashboard/rooms/${params.id}/beds`)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BedIcon className="w-4 h-4" />
                  <span>Yataklar</span>
                </div>
              </button>
              <button
                onClick={() => router.push(`/dashboard/rooms/${params.id}/inventory`)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Envanter</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <RoomFeatures roomId={params.id} />
        </div>
      </div>
    </div>
  );
}