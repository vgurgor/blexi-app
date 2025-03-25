'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ArrowLeft, Plus, Bed as BedIcon, User, Tag, Package } from 'lucide-react';
import BedCard from '@/components/rooms/BedCard';
import PageLoader from '@/components/PageLoader';
import NewBedForm from '@/components/rooms/NewBedForm';

interface Bed {
  id: number;
  name: string;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  room_id: number;
  guest_id: number | null;
  created_at: string;
  updated_at: string;
}

export default function RoomBedsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [error, setError] = useState('');
  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomAndBeds = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        // Fetch room details
        const roomResponse = await fetch(`https://api.blexi.co/api/v1/rooms/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const roomData = await roomResponse.json();
        
        if (!roomResponse.ok) {
          throw new Error(roomData.message || 'Oda bilgileri yüklenirken bir hata oluştu.');
        }
        
        setRoom(roomData.data);
        
        // Fetch beds for this room
        const bedsResponse = await fetch(`https://api.blexi.co/api/v1/beds?room_id=${params.id}&per_page=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const bedsData = await bedsResponse.json();
        
        if (!bedsResponse.ok) {
          throw new Error(bedsData.message || 'Yatak bilgileri yüklenirken bir hata oluştu.');
        }
        
        setBeds(bedsData.data);
      } catch (error: any) {
        console.error('Veri çekilirken hata oluştu:', error);
        setError(error.message || 'Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && token) {
      fetchRoomAndBeds();
    }
  }, [isAuthenticated, token, params.id]);

  const handleBedStatusChange = async (id: number, status: 'available' | 'occupied' | 'maintenance' | 'reserved') => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/beds/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setBeds(prev => prev.map(b => 
          b.id === id ? { ...b, status } : b
        ));
      } else {
        console.error('Durum değiştirme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleBedDelete = async (id: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/beds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setBeds(prev => prev.filter(b => b.id !== id));
      } else {
        console.error('Silme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleAddBed = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://api.blexi.co/api/v1/beds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          room_id: parseInt(params.id)
        })
      });

      const responseData = await response.json();
      
      if (response.ok) {
        // Add new bed to the list
        setBeds(prev => [...prev, responseData.data]);
        setShowAddBedForm(false);
      } else {
        throw new Error(responseData.message || 'Yatak eklenirken bir hata oluştu');
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