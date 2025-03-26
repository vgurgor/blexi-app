import { useState } from 'react';
import { Trash2, Edit, AlertCircle, CheckCircle, Clock, Package, ExternalLink } from 'lucide-react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useRouter } from 'next/navigation';
import { IInventoryItem } from '@/types/models';

interface InventoryTableProps {
  items: IInventoryItem[];
  onDelete: (id: number) => Promise<void>;
  onEdit?: (item: IInventoryItem) => void;
  isLoading?: boolean;
}

export default function InventoryTable({ 
  items, 
  onDelete, 
  onEdit,
  isLoading = false 
}: InventoryTableProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteClick = (id: string) => {
    setItemToDelete(Number(id));
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      await onDelete(itemToDelete);
      setShowDeleteModal(false);
    } catch (error: any) {
      setDeleteError(error.message || 'Envanter silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'furniture': return 'Mobilya';
      case 'appliance': return 'Beyaz Eşya';
      case 'linen': return 'Tekstil';
      case 'electronic': return 'Elektronik';
      case 'kitchenware': return 'Mutfak Eşyası';
      case 'decoration': return 'Dekorasyon';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_use': return CheckCircle;
      case 'in_storage': return Package;
      case 'maintenance': return AlertCircle;
      case 'disposed': return Trash2;
      default: return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_use': return 'Kullanımda';
      case 'in_storage': return 'Depoda';
      case 'maintenance': return 'Bakımda';
      case 'disposed': return 'Kullanım Dışı';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in_use': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_storage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const isWarrantyExpired = (warrantyEnd: string) => {
    if (!warrantyEnd) return false;
    return new Date(warrantyEnd) < new Date();
  };

  const getAssignmentInfo = (item: IInventoryItem) => {
    if (!item.assignable_type || !item.assignable_id) return 'Atanmamış';

    const assignable_type = item.assignable_type.split('\\').pop() || '';
    const isRoomAssignment = assignable_type === 'Room';
    const isBedAssignment = assignable_type === 'Bed';
    const isApartAssignment = assignable_type === 'Apart';
    
    if (isRoomAssignment) return `Oda #${item.assignable_id}`;
    if (isBedAssignment) return `Yatak #${item.assignable_id}`;
    if (isApartAssignment) return `Apart #${item.assignable_id}`;
    
    return `${assignable_type} #${item.assignable_id}`;
  };

  const navigateToAssignedItem = (item: IInventoryItem) => {
    if (!item.assignable_type || !item.assignable_id) return;
    
    const assignable_type = item.assignable_type.split('\\').pop() || '';
    
    if (assignable_type === 'Room') {
      router.push(`/dashboard/rooms/${item.assignable_id}/inventory`);
    } else if (assignable_type === 'Bed') {
      router.push(`/dashboard/beds/${item.assignable_id}/inventory`);
    } else if (assignable_type === 'Apart') {
      router.push(`/dashboard/apartments/${item.assignable_id}/inventory`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Henüz envanter kaydı bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Takip No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tür</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marka/Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Satın Alma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Garanti</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map(item => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.tracking_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{getItemTypeLabel(item.item_type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.brand ? (
                          <>
                            <span className="font-medium">{item.brand}</span>
                            {item.model && <span> / {item.model}</span>}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusClass(item.status)}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.assignable_type && item.assignable_id ? (
                        <button 
                          onClick={() => navigateToAssignedItem(item)}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <span>{getAssignmentInfo(item)}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Atanmamış</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.purchase_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.warranty_end ? (
                        <span className={isWarrantyExpired(item.warranty_end) ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                          {formatDate(item.warranty_end)}
                          {isWarrantyExpired(item.warranty_end) && ' (Süresi dolmuş)'}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Envanteri Sil"
        message="Bu envanter kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}