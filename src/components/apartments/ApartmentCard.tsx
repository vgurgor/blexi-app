'use client';

import { useState } from 'react';
import { Building2, Users2, Wifi, Edit, MoreHorizontal, Trash2, Tag, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoreActionsDropdown from '../MoreActionsDropdown';
import { useAuth } from '@/lib/authExport';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import ApartmentFeaturesList from './ApartmentFeaturesList';
import { apartsApi } from '@/lib/api/apartments';

import { ApartDto } from '@/lib/api/apartments';

interface ApartmentCardProps {
  apartment: ApartDto & {
    total_rooms?: number;
    occupied_rooms?: number;
    internet_speed?: string;
  };
  getCompanyName: (id: number) => string;
  onStatusChange: (id: number, status: 'active' | 'inactive') => void;
  onDelete: (id: number) => void;
}

export default function ApartmentCard({ apartment, getCompanyName, onStatusChange, onDelete }: ApartmentCardProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [features, setFeatures] = useState<any[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);

  const handleMoreActionsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMoreActions(true);
  };

  const handleDeleteApartment = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const response = await apartsApi.delete(apartment.id.toString());
      
      if (response.success) {
        onDelete(apartment.id);
        setShowDeleteModal(false);
      } else {
        throw new Error(response.error || 'Apart silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Apart silme hatası:', error);
      setDeleteError(error.message || 'Apart silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchApartmentFeatures = async () => {
    if (!token || features.length > 0) return;
    
    setIsLoadingFeatures(true);
    try {
      const response = await apartsApi.getFeatures(apartment.id.toString());
      
      if (response.success && response.data) {
        setFeatures(response.data);
      } else {
        console.error('Özellik verileri alınamadı:', response.error);
      }
    } catch (error) {
      console.error('Özellik verileri çekilirken hata oluştu:', error);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const toggleFeatures = () => {
    if (!showFeatures && features.length === 0) {
      fetchApartmentFeatures();
    }
    setShowFeatures(!showFeatures);
  };

  const getApartmentActions = () => [
    {
      icon: Edit,
      label: 'Düzenle',
      description: 'Apart bilgilerini düzenle',
      onClick: () => router.push(`/dashboard/apartments/${apartment.id}/edit`)
    },
    apartment.status === 'inactive' ? {
      icon: Building2,
      label: 'Aktife Al',
      description: 'Apartı aktif duruma getir',
      variant: 'success' as const,
      onClick: () => onStatusChange(apartment.id, 'active')
    } : {
      icon: Building2,
      label: 'Pasife Al',
      description: 'Apartı pasif duruma getir',
      variant: 'warning' as const,
      onClick: () => onStatusChange(apartment.id, 'inactive')
    },
    {
      icon: Trash2,
      label: 'Sil',
      description: 'Apartı sistemden kaldır',
      variant: 'danger' as const,
      onClick: () => setShowDeleteModal(true)
    }
  ];

  // Determine occupancy rate
  const totalRooms = apartment.total_rooms || apartment.rooms_count || 0;
  const occupiedRooms = apartment.occupied_rooms || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {apartment.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {apartment.address}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getCompanyName(apartment.firm_id)}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/dashboard/apartments/${apartment.id}/edit`)}
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
                    actions={getApartmentActions()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            apartment.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {apartment.status === 'active' ? 'Aktif' : 'Pasif'}
          </div>
          
          {/* Gender Type Badge */}
          <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            apartment.gender_type === 'MALE'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : apartment.gender_type === 'FEMALE'
                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}>
            {apartment.gender_type === 'MALE' 
              ? 'Erkek' 
              : apartment.gender_type === 'FEMALE' 
                ? 'Kız' 
                : 'Karma'}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Building2 className="w-5 h-5" />
              <span className="text-sm">Odalar</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {occupiedRooms}/{totalRooms}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {occupancyRate}% Doluluk
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Users2 className="w-5 h-5" />
              <span className="text-sm">Öğrenciler</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {occupiedRooms}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aktif Öğrenci
            </p>
          </div>

          {apartment.internet_speed && (
            <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Wifi className="w-5 h-5" />
                <span className="text-sm">İnternet</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {apartment.internet_speed}
              </p>
            </div>
          )}

           <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Açılış Tarihi: {new Date(apartment.opening_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          
          <div className="col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 mx-auto">
                <button 
                  onClick={() => router.push(`/dashboard/apartments/${apartment.id}/inventory`)}
                  className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                >
                  <Package className="w-4 h-4" />
                  <span>Envanter</span>
                </button>
                <button 
                  onClick={toggleFeatures}
                  className="flex items-center px-2 gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Tag className="w-4 h-4" />
                  <span>{showFeatures ? 'Özellikleri Gizle' : 'Özellikleri Göster'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {showFeatures && (
            <div className="col-span-2 pt-2 mx-auto">
              <ApartmentFeaturesList 
                features={features} 
                isLoading={isLoadingFeatures} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteApartment}
        title="Apart Silme"
        message={`"${apartment.name}" apartını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}