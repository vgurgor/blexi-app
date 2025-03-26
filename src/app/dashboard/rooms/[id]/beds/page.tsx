'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { ArrowLeft, Plus, Bed as BedIcon, User, Tag, Package } from 'lucide-react';
import BedCard from '@/components/rooms/BedCard';
import PageLoader from '@/components/PageLoader';
import NewBedForm from '@/components/rooms/NewBedForm';
import { roomsApi } from '@/lib/api/rooms';
import { bedsApi } from '@/lib/api/beds';
import { IRoom, IBed } from '@/types/models';

export default function RoomBedsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<IRoom | null>(null);
  const [beds, setBeds] = useState<IBed[]>([]);
  const [error, setError] = useState('');
  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomAndBeds = async () => {
      setIsLoading(true);
      try {
        // Fetch room details using roomsApi
        const roomResponse = await roomsApi.getById(params.id);
        
        if (roomResponse.success && roomResponse.data) {
          setRoom(roomResponse.data);
          
          // Fetch beds for this room using bedsApi
          const bedsResponse = await bedsApi.getAll({ 
            room_id: parseInt(params.id),
            per_page: 100 
          });
          
          if (bedsResponse.success) {
            setBeds(bedsResponse.data);
          } else {
            console.error('Yatak bilgileri alınamadı:', bedsResponse.error);
            setError('Yatak bilgileri yüklenirken bir hata oluştu.');
          }
        } else {
          console.error('Oda detayları alınamadı:', roomResponse.error);
          setError('Oda bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error: any) {
        console.error('Veri çekilirken hata oluştu:', error);
        setError(error.message || 'Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRoomAndBeds();
    }
  }, [isAuthenticated, params.id]);

  const handleBedStatusChange = async (id: string, status: 'available' | 'occupied' | 'maintenance' | 'reserved') => {
    try {
      const response = await bedsApi.update(id, { status });

      if (response.success) {
        // Update local state
        setBeds(prev => prev.map(b => 
          b.id === id ? { ...b, status } : b
        ));
      } else {
        console.error('Durum değiştirme hatası:', response.error);
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleBedDelete = async (id: string) => {
    try {
      const response = await bedsApi.delete(id);

      if (response.success) {
        // Update local state
        setBeds(prev => prev.filter(b => b.id !== id));
      } else {
        console.error('Silme hatası:', response.error);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleAddBed = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Add room_id to the bed data
      const bedData = {
        ...data,
        roomId: params.id
      };
      
      const response = await bedsApi.create(bedData);
      
      if (response.success) {
        // Add new bed to the list
        setBeds(prev => [...prev, response.data]);
        setShowAddBedForm(false);
      } else {
        throw new Error(response.error || 'Yatak eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Yatak ekleme hatası:', error);
      setError(error.message || 'Yatak eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Oda bulunamadı.</p>
      </div>
    );
  }

  return (
    <>
      {isSubmitting && <PageLoader />}
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
              Oda {room.room_number} - Yataklar
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
                    <User className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Yatak Sayısı: {beds.length}</span>
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
                  onClick={() => router.push(`/dashboard/rooms/${params.id}/features`)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Özellikler</span>
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

          {/* Add Bed Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Yataklar
            </h2>
            <button
              onClick={() => setShowAddBedForm(!showAddBedForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {showAddBedForm ? (
                <>
                  <span>İptal</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Yatak Ekle</span>
                </>
              )}
            </button>
          </div>

          {/* Add Bed Form */}
          {showAddBedForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <NewBedForm onSubmit={handleAddBed} />
            </div>
          )}

          {/* Beds Grid */}
          {beds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beds.map(bed => (
                <BedCard
                  key={bed.id}
                  bed={bed}
                  onStatusChange={handleBedStatusChange}
                  onDelete={handleBedDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Bu odada henüz yatak bulunmamaktadır. Yeni yatak eklemek için "Yatak Ekle" butonunu kullanabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}