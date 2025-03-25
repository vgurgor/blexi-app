'use client';

import { useState } from 'react';
import { Bed, User, Edit, MoreHorizontal, Trash2, Tag, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoreActionsDropdown from '../MoreActionsDropdown';
import { useAuth } from '@/lib/authExport';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface BedCardProps {
  bed: {
    id: number;
    name: string;
    bed_number: string;
    bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    room_id: number;
    guest_id: number | null;
    created_at: string;
    updated_at: string;
  };
  onStatusChange: (id: number, status: 'available' | 'occupied' | 'maintenance' | 'reserved') => void;
  onDelete: (id: number) => void;
}

export default function BedCard({ bed, onStatusChange, onDelete }: BedCardProps) {
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

  const handleDeleteBed = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/beds/${bed.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        onDelete(bed.id);
        setShowDeleteModal(false);
      } else {
        throw new Error(data.message || 'Yatak silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Yatak silme hatası:', error);
      setDeleteError(error.message || 'Yatak silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getBedActions = () => [
    {
      icon: Edit,
      label: 'Düzenle',
      description: 'Yatak bilgilerini düzenle',
      onClick: () => router.push(`/dashboard/beds/${bed.id}/edit`)
    },
    {
      icon: Tag,
      label: 'Özellikler',
      description: 'Yatak özelliklerini yönet',
      onClick: () => router.push(`/dashboard/beds/${bed.id}/features`)
    },
    {
      icon: Package,
      label: 'Envanter',
      description: 'Yatak envanterini yönet',
      onClick: () => router.push(`/dashboard/beds/${bed.id}/inventory`)
    },
    bed.status === 'maintenance' ? {
      icon: Bed,
      label: 'Kullanılabilir Yap',
      description: 'Yatağı kullanılabilir duruma getir',
      variant: 'success' as const,
      onClick: () => onStatusChange(bed.id, 'available')
    } : bed.status === 'occupied' ? {
      icon: Bed,
      label: 'Boşalt',
      description: 'Yatağı boşalt',
      variant: 'warning' as const,
      onClick: () => onStatusChange(bed.id, 'available')
    } : bed.status === 'reserved' ? {
      icon: Bed,
      label: 'Rezervasyonu İptal Et',
      description: 'Yatak rezervasyonunu iptal et',
      variant: 'warning' as const,
      onClick: () => onStatusChange(bed.id, 'available')
    } : {
      icon: Bed,
      label: 'Bakıma Al',
      description: 'Yatağı bakım durumuna getir',
      variant: 'warning' as const,
      onClick: () => onStatusChange(bed.id, 'maintenance')
    },
    {
      icon: Trash2,
      label: 'Sil',
      description: 'Yatağı sistemden kaldır',
      variant: 'danger' as const,
      onClick: () => setShowDeleteModal(true)
    }
  ];

  const getBedTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE': return 'Tek Kişilik';
      case 'DOUBLE': return 'Çift Kişilik';
      case 'BUNK': return 'Ranza';
      default: return type;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {bed.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Yatak No: {bed.bed_number}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/dashboard/beds/${bed.id}/edit`)}
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
                    actions={getBedActions()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            bed.status === 'available'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : bed.status === 'maintenance'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : bed.status === 'reserved'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {bed.status === 'available' ? 'Boş' : 
             bed.status === 'maintenance' ? 'Bakımda' : 
             bed.status === 'reserved' ? 'Rezerve' : 'Dolu'}
          </div>
          
          {/* Bed Type Badge */}
          <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}>
            {getBedTypeLabel(bed.bed_type)}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yatak Tipi</p>
              <p className="font-medium text-gray-900 dark:text-white">{getBedTypeLabel(bed.bed_type)}</p>
            </div>
          </div>

          {bed.guest_id && (
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Öğrenci</p>
                <p className="font-medium text-gray-900 dark:text-white">ID: {bed.guest_id}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => router.push(`/dashboard/beds/${bed.id}/features`)}
              className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
            >
              <Tag className="w-4 h-4" />
              <span>Özellikler</span>
            </button>
            <button
              onClick={() => router.push(`/dashboard/beds/${bed.id}/inventory`)}
              className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <Package className="w-4 h-4" />
              <span>Envanter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteBed}
        title="Yatak Silme"
        message={`"${bed.name}" yatağını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}