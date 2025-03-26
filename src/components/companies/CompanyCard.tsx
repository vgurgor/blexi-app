'use client';

import { useState } from 'react';
import { Building, MapPin, Phone, Mail, Edit, MoreHorizontal, Building2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MoreActionsDropdown from '../MoreActionsDropdown';
import { useAuth } from '@/lib/authExport';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { ICompany } from '@/types/models';

interface CompanyCardProps {
  company: ICompany;
  onStatusChange: (id: number, status: 'active' | 'inactive') => void;
  onDelete: (id: number) => void;
}

export default function CompanyCard({ company, onStatusChange, onDelete }: CompanyCardProps) {
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

  const handleDeleteCompany = async () => {
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // Use the API service instead of direct fetch
      const response = await onDelete(company.id);
      setShowDeleteModal(false);
    } catch (error: any) {
      console.error('Firma silme hatası:', error);
      setDeleteError(error.message || 'Firma silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCompanyActions = () => [
    {
      icon: Edit,
      label: 'Düzenle',
      description: 'Firma bilgilerini düzenle',
      onClick: () => router.push(`/dashboard/companies/${company.id}/edit`)
    },
    company.status === 'inactive' ? {
      icon: Building,
      label: 'Aktife Al',
      description: 'Firmayı aktif duruma getir',
      variant: 'success' as const,
      onClick: () => onStatusChange(company.id, 'active')
    } : {
      icon: Building,
      label: 'Pasife Al',
      description: 'Firmayı pasif duruma getir',
      variant: 'warning' as const,
      onClick: () => onStatusChange(company.id, 'inactive')
    },
    {
      icon: Trash2,
      label: 'Sil',
      description: 'Firmayı sistemden kaldır',
      variant: 'danger' as const,
      onClick: () => setShowDeleteModal(true)
    }
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Building className="w-4 h-4" />
                <span className="text-sm">{company.aparts?.length || 0} Apart</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/dashboard/companies/${company.id}/edit`)}
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
                    actions={getCompanyActions()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            company.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {company.status === 'active' ? 'Aktif' : 'Pasif'}
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-4">
          {company.address && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{company.address}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{company.phone}</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{company.email}</span>
            </div>
          )}

          {/* Stats */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 gap-4">
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {company.aparts_count}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toplam Apart
              </p>
            </div>
            {company.aparts && company.aparts.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apartlar:</p>
                <div className="space-y-1">
                  {company.aparts.map(apart => (
                    <div key={apart.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{apart.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCompany}
        title="Firma Silme"
        message={`"${company.name}" firmasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={isDeleting}
        error={deleteError}
      />
    </>
  );
}