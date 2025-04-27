import React from 'react';
import { User, MapPin } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import EmergencyContactCard from './EmergencyContactCard';

interface StudentInfoSectionProps {
  registration: ISeasonRegistration;
}

export default function StudentInfoSection({ registration }: StudentInfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Öğrenci Bilgileri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ad Soyad</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.person?.name} {registration.guest?.person?.surname}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">TC Kimlik No</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.person?.tcNo}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.person?.phone}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.person?.email || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Doğum Tarihi</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.person?.birthDate ? new Date(registration.guest.person.birthDate).toLocaleDateString('tr-TR') : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Misafir Tipi</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.guestType === 'STUDENT' ? 'Öğrenci' : 
             registration.guest?.guestType === 'EMPLOYEE' ? 'Çalışan' : 'Diğer'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meslek/Bölüm</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.professionDepartment || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durum</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {registration.guest?.status === 'ACTIVE' ? 'Aktif' : 
             registration.guest?.status === 'INACTIVE' ? 'Pasif' : 
             registration.guest?.status === 'SUSPENDED' ? 'Askıda' : registration.guest?.status}
          </p>
        </div>
      </div>

      {/* Emergency Contact */}
      {registration.guest?.emergencyContact && (
        <EmergencyContactCard emergencyContact={registration.guest.emergencyContact} />
      )}

      {/* Address */}
      {registration.guest?.formattedAddress && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Adres
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {registration.guest.formattedAddress}
          </p>
        </div>
      )}
    </div>
  );
}