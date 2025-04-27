import React from 'react';
import { User } from 'lucide-react';

interface GuardianCardProps {
  guardian: any;
}

export default function GuardianCard({ guardian }: GuardianCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {guardian.isSelf ? 'Kendisi' : guardian.person?.name + ' ' + guardian.person?.surname}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {guardian.relationship === 'self' ? 'Kendisi' : guardian.relationship}
            </p>
          </div>
        </div>
        <div>
          {guardian.isEmergencyContact && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Acil Durum Kişisi
            </span>
          )}
        </div>
      </div>

      {!guardian.isSelf && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {guardian.person?.phone || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {guardian.person?.email || '-'}
            </p>
          </div>
        </div>
      )}

      {guardian.notes && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Notlar:</span> {guardian.notes}
          </p>
        </div>
      )}
    </div>
  );
}