import React from 'react';
import { User, Phone, Mail, Calendar, Building2, Bed, Tag } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import StatusBadge from './StatusBadge';

interface RegistrationHeaderProps {
  registration: ISeasonRegistration;
}

export default function RegistrationHeader({ registration }: RegistrationHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Student Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {registration.guest?.person?.name} {registration.guest?.person?.surname}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {registration.guest?.professionDepartment || 'Ümraniye Ortaokulu'} - 6. Sınıf
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm">{registration.guest?.person?.phone || '05354243484'}</span>
                </div>
                {registration.guest?.person?.email && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">{registration.guest?.person?.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm">Kayıt: {new Date(registration.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Apart</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {registration.bed?.room?.name || 'A Blok'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Bed className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Oda/Yatak</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {registration.bed?.bedNumber || 'Oda 101'} / {registration.bed?.bedType === 'SINGLE' ? 'Tek Kişilik' : registration.bed?.bedType === 'DOUBLE' ? 'Çift Kişilik' : 'Ranza'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Dönem</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {registration.season?.name || '2025-2026 Akademik Yıl'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Kimlik No</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {registration.guest?.person?.tcNo || '13240092742'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="lg:w-80 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finansal Özet</h3>
            <StatusBadge status={registration.status} />
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
              <span className="font-medium text-gray-900 dark:text-white">₺491.903,00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ödenen:</span>
              <span className="font-medium text-green-600 dark:text-green-400">₺98.381,00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kalan:</span>
              <span className="font-medium text-gray-900 dark:text-white">₺393.522,00</span>
            </div>
            
            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ödeme İlerleme</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">%20</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sonraki Ödeme:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">05 Şubat 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tutar:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">₺49.191,00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}