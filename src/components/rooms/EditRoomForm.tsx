'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Building, Bed, Hash, Tag } from 'lucide-react';
import { useAuth } from '@/lib/authExport';
import RoomFeatures from './RoomFeatures';
import { roomsApi } from '@/lib/api/rooms';
import { IRoom } from '@/types/models';
import { api } from '@/lib/api/base';

interface Apartment {
  id: number;
  name: string;
}

interface EditRoomFormProps {
  room: IRoom;
  onSubmit: (data: IRoom) => void;
}

export default function EditRoomForm({ room, onSubmit }: EditRoomFormProps) {
  const [formData, setFormData] = useState({
    apart_id: '',
    room_number: '',
    floor: 1,
    capacity: 1,
    room_type: 'STANDARD' as 'STANDARD' | 'SUITE' | 'DELUXE',
    status: 'active' as 'active' | 'inactive' | 'maintenance'
  });
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'features'>('details');

  useEffect(() => {
    const fetchApartments = async () => {
      setIsLoadingApartments(true);
      try {
        const response = await api.get('/api/v1/aparts?per_page=100');
        
        if (response.success && Array.isArray(response.data)) {
          setApartments(response.data);
        } else {
          console.error('Apart verileri alınamadı:', response.error);
        }
      } catch (error) {
        console.error('Apart verileri çekilirken hata oluştu:', error);
      } finally {
        setIsLoadingApartments(false);
      }
    };

    fetchApartments();
  }, []);

  useEffect(() => {
    // Initialize form with provided room data
    setFormData({
      apart_id: room.apart_id,
      room_number: room.room_number,
      floor: room.floor,
      capacity: room.capacity,
      room_type: room.room_type,
      status: room.status
    });
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Convert form data for API
      const updateData = {
        apart_id: formData.apart_id,
        room_number: formData.room_number,
        floor: formData.floor,
        capacity: formData.capacity,
        room_type: formData.room_type,
        status: formData.status
      };
      
      const response = await roomsApi.update(room.id, updateData);
      
      if (!response.success) {
        throw new Error(response.error || 'Oda güncellenirken bir hata oluştu');
      }
      
      onSubmit(response.data);
    } catch (error: any) {
      console.error('Oda güncelleme hatası:', error);
      setError(error.message || 'Oda güncellenirken bir hata oluştu');
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Oda Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'features'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Özellikler
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {activeTab === 'details' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apart*
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.apart_id}
                  onChange={(e) => setFormData({ ...formData, apart_id: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                  disabled={isLoadingApartments}
                >
                  <option value="">Apart Seçin</option>
                  {apartments.map((apart) => (
                    <option key={apart.id} value={apart.id.toString()}>
                      {apart.name}
                    </option>
                  ))}
                </select>
              </div>
              {isLoadingApartments && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Apartlar yükleniyor...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Oda Numarası*
              </label>
              <div className="relative">
                <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="101"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kat*
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Zemin kat için 0 giriniz.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kapasite*
              </label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Oda Tipi*
              </label>
              <select
                value={formData.room_type}
                onChange={(e) => setFormData({ ...formData, room_type: e.target.value as 'STANDARD' | 'SUITE' | 'DELUXE' })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                required
              >
                <option value="STANDARD">Standart</option>
                <option value="SUITE">Suit</option>
                <option value="DELUXE">Deluxe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durum*
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                required
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="maintenance">Bakımda</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      ) : (
        <RoomFeatures roomId={room.id} />
      )}
    </div>
  );
}