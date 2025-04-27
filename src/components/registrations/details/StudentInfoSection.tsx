import React from 'react';
import { User, MapPin, Phone, Mail, Calendar, GraduationCap, School, Flag, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import EmergencyContactCard from './EmergencyContactCard';
import { useState } from 'react';

interface StudentInfoSectionProps {
  registration: ISeasonRegistration;
}

export default function StudentInfoSection({ registration }: StudentInfoSectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Kişisel Bilgiler
      </h3>
      {/* Main Info Card */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ad Soyad</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.person?.name || 'Selin'} {registration.guest?.person?.surname || 'Tokatlı'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">TC Kimlik No</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.person?.tcNo || '13240092742'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.person?.phone || '05354243484'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">E-posta</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.person?.email || 'selin.tokatli@example.com'}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Daha Az Bilgi</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Daha Fazla Bilgi</span>
            </>
          )}
        </button>
      </div>

      {/* Detailed Information (Collapsible) */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.person?.birthDate 
                  ? new Date(registration.guest.person.birthDate).toLocaleDateString('tr-TR') 
                  : '15.06.2013'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Öğrenci Tipi</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.guestType === 'STUDENT' ? 'Öğrenci' : 
                 registration.guest?.guestType === 'EMPLOYEE' ? 'Çalışan' : 'Diğer'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
              <School className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Okul/Bölüm</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.professionDepartment || 'Ümraniye Ortaokulu - 6. Sınıf'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
              <Flag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Durum</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {registration.guest?.status === 'ACTIVE' ? 'Aktif' : 
                 registration.guest?.status === 'INACTIVE' ? 'Pasif' : 
                 registration.guest?.status === 'SUSPENDED' ? 'Askıda' : 'Aktif'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {registration.guest?.emergencyContact && (
        <div className="mt-6">
          <EmergencyContactCard emergencyContact={registration.guest.emergencyContact} />
        </div>
      )}

      {/* Address */}
      {registration.guest?.formattedAddress && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Adres
          </h4>
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            {registration.guest.formattedAddress}
          </p>
        </div>
      )}
    </div>
  );
}