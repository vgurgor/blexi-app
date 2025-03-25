'use client';

import { useState } from 'react';
import { DoorOpen, Building2, Users2, Edit, MoreHorizontal, Trash2, Tag, Package, Bed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoreActionsDropdown from '../MoreActionsDropdown';
import { useAuth } from '@/lib/auth';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface RoomCardProps {
  room: {
    id: number;
    room_number: string;
    floor: number;
    capacity: number;
    room_type: 'STANDARD' | 'SUITE' | 'DELUXE';
    status: 'active' | 'inactive' | 'maintenance';
    apart_id: number;
    beds_count: number;
    created_at: string;
    updated_at: string;
  };
  getApartmentName: (id: number) => string;
  onStatusChange: (id: number, status: 'active' | 'inactive' | 'maintenance') => void;
  onDelete: (id: number) => void;
}

export default function RoomCard({ room, getApartmentName, onStatusChange, onDelete }: RoomCardProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleMoreActionsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreActions(true);
  };

  const handleDeleteRoom = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        onDelete(room.id);
        setShowDeleteModal(false);
      } else {
        throw new Error(data.message || 'Oda silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Oda silme hatası:', error);
      setDeleteError(error.message || 'Oda silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoomActions = () => [
    {
      icon: Edit,
      label: 'Düzenle',
      description: 'Oda bilgilerini düzenle',
      onClick: () => router.push(`/dashboard/rooms/${room.id}/edit`)
    },
    {
      icon: Bed,
      label: 'Yataklar',
      description: 'Oda yataklarını yönet',
      onClick: () => router.push(`/dashboard/rooms/${room.id}/beds`)
    },
    {
      icon: Tag,
      label: 'Özellikler',
      description: 'Oda özelliklerini yönet',
      onClick: () => router.push(`/dashboard/rooms/${room.id}/features`)
    },
    {
      icon: Package,
      label: 'Envanter',
      description: 'Oda envanterini yönet',
      onClick: () => router.push(`/dashboard/rooms/${room.id}/inventory`)
    },
    room.status === 'inactive' ? {
      icon: DoorOpen,
      label: 'Aktife Al',
      description: 'Odayı aktif duruma getir',
      variant: 'success' as const,
      onClick: () => onStatusChange(room.id, 'active')
    } : room.status === 'maintenance' ? {
      icon: DoorOpen,
      label: 'Aktife Al',
      description: 'Odayı aktif duruma getir',
      variant: 'success' as const,
      onClick: () => onStatusChange(room.id, 'active')
    } : {
      icon: DoorOpen,
      label: 'Pasife Al',
      description: 'Odayı pasif duruma getir',
      variant: 'warning' as const,
      onClick: () => onStatusChange(room.id, 'inactive')
    },
    {
      icon: Trash2,
      label: 'Sil',
      description: 'Odayı sistemden kaldır',
      variant: 'danger' as const,
      onClick: () => setShowDeleteModal(true)
    }
  ];

  // Calculate occupancy rate
  const occupancyRate = room.capacity > 0 ? Math.round((room.beds_count / room.capacity) * 100) : 0;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Oda {room.room_number}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getApartmentName(room.apart_id)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kat: {room.floor}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div className="relative">
                <button 
                  onClick={handleMoreActionsClick}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                {showMoreActions && (
                  <MoreActionsDropdown
                    isOpen={showMoreActions}
                    onClose={() => setShowMoreActions(false)}
                    actions={getRoomActions()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            room.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : room.status === 'maintenance'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {room.status === 'active' ? 'Aktif' : room.status === 'maintenance' ? 'Bakımda' : 'Pasif'}
          </div>
          
          {/* Room Type Badge */}
          <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            room.room_type === 'STANDARD'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : room.room_type === 'SUITE'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
          }`}>
            {room.room_type === 'STANDARD' 
              ? 'Standart' 
              : room.room_type === 'SUITE' 
                ? 'Suit' 
                : 'Deluxe'}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <DoorOpen className="w-5 h-5" />
              <span className="text-sm">Kapasite</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {room.capacity}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kişilik Oda
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Bed className="w-5 h-5" />
              <span className="text-sm">Yataklar</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {room.beds_count}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {occupancyRate}% Doluluk
            </p>
          </div>

          <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <button
                onClick={() => router.push(`/dashboard/rooms/${room.id}/beds`)}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <Bed className="w-4 h-4" />
                <span>Yataklar</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/rooms/${room.id}/features`)}
                className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                <Tag className="w-4 h-4" />
                <span>Özellikler</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRoom}
        title="Oda Silme"
        message={`"${room.room_number}" numaralı odayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}