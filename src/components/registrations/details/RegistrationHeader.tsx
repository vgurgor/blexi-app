import React from 'react';
import { User } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import StatusBadge from './StatusBadge';

interface RegistrationHeaderProps {
  registration: ISeasonRegistration;
}

export default function RegistrationHeader({ registration }: RegistrationHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {registration.guest?.person?.name} {registration.guest?.person?.surname}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {registration.guest?.professionDepartment || 'Meslek/Bölüm belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <div>
            <StatusBadge status={registration.status} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kayıt Tarihi: {new Date(registration.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
}