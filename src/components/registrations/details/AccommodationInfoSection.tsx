import React from 'react';
import { Building2 } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import { formatCurrency } from '@/utils/format';
import StatusBadge from './StatusBadge';

interface AccommodationInfoSectionProps {
  registration: ISeasonRegistration;
}

export default function AccommodationInfoSection({ registration }: AccommodationInfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Konaklama Bilgileri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sezon</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.season?.name || registration.seasonCode}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Yatak</p>
          <p className="font-medium text-gray-900 dark:text-white">
            Yatak {registration.bed?.bedNumber || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Giriş Tarihi</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(registration.checkInDate).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Çıkış Tarihi</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(registration.checkOutDate).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Depozito</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.depositAmount ? formatCurrency(parseFloat(registration.depositAmount.toString())) : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</p>
          <div>
            <StatusBadge status={registration.status} />
          </div>
        </div>
      </div>

      {/* Notes */}
      {registration.notes && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Notlar</h4>
          <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            {registration.notes}
          </p>
        </div>
      )}
    </div>
  );
}