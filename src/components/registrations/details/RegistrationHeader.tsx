import React from 'react';
import { User, Phone, Mail, Calendar, Building2, Bed, Tag, GraduationCap, Flag, School, ChevronUp, ChevronDown } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import { formatCurrency } from '@/utils/format';
import StatusBadge from './StatusBadge';
import EmergencyContactCard from './EmergencyContactCard';
import { useState } from 'react';

// Yardımcı fonksiyon
const formatProfessionDepartment = (prof: any): string => {
  if (!prof) return '';
  
  // Nesne ise
  if (typeof prof === 'object' && prof !== null) {
    try {
      // school_name ve education_level'i kullan
      const schoolName = prof.school_name || '';
      const educationLevel = prof.education_level || '';
      if (schoolName && educationLevel) {
        return `${schoolName} / ${educationLevel}`;
      } else if (schoolName) {
        return schoolName;
      } else if (educationLevel) {
        return educationLevel;
      }
      
      // Diğer durumlarda JSON'a dönüştür
      return JSON.stringify(prof);
    } catch {
      return String(prof);
    }
  }
  
  // String ise ve JSON olabilir
  if (typeof prof === 'string') {
    try {
      const parsed = JSON.parse(prof);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatProfessionDepartment(parsed);
      }
      return prof;
    } catch {
      return prof;
    }
  }
  
  // Son çare - her zaman string'e dönüştür
  return String(prof);
};

interface RegistrationHeaderProps {
  registration: ISeasonRegistration;
}

export default function RegistrationHeader({ registration }: RegistrationHeaderProps) {
  // Prepare financial summary data
  const registrationAny = registration as any;
  const financialSummary = registrationAny.financialSummary || {
    totalAmount: parseFloat(registrationAny.totalAmount) || 0,
    paidAmount: parseFloat(registrationAny.paidAmount) || 0,
    remainingAmount: (parseFloat(registrationAny.totalAmount) || 0) - (parseFloat(registrationAny.paidAmount) || 0),
    paymentProgress: Math.round(((parseFloat(registrationAny.paidAmount) || 0) / Math.max(parseFloat(registrationAny.totalAmount) || 1, 1)) * 100)
  };

  // Define payment type for TypeScript
  interface PaymentScheduleItem {
    id?: string;
    date: string;
    amount: string | number;
    paidAmount?: string | number;
    status?: string;
  }

  // Prepare payment schedule data for next payment
  const paymentSchedule = (registrationAny.paymentSchedule as PaymentScheduleItem[] || []).map((payment) => ({
    id: payment.id || String(Math.random()),
    date: payment.date,
    amount: parseFloat(payment.amount as string) || 0,
    paidAmount: parseFloat(payment.paidAmount as string) || 0,
    remainingAmount: (parseFloat(payment.amount as string) || 0) - (parseFloat(payment.paidAmount as string) || 0),
    isPaid: payment.status === 'paid' || (parseFloat(payment.paidAmount as string) || 0) >= (parseFloat(payment.amount as string) || 0)
  })) || [];

  // Find next payment
  const nextPayment = paymentSchedule
    .filter(payment => !payment.isPaid)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const [showDetails, setShowDetails] = useState(false);

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
                {registration.guest?.guestType === 'STUDENT' ? 'Öğrenci' : registration.guest?.guestType === 'EMPLOYEE' ? 'Çalışan' : 'Misafir'}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {registration.guest?.person?.phone && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">{registration.guest.person.phone}</span>
                  </div>
                )}
                {registration.guest?.person?.email && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">{registration.guest.person.email}</span>
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
                  {registration.bed?.room?.apart?.name || '-'}
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
                  {registration.bed?.room?.name || '-'} / {registration.bed?.bedNumber || '-'}
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
                  {registration.season?.name || registration.seasonCode || '-'}
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
                  {registration.guest?.person?.tcNo || '-'}
                </div>
              </div>
            </div>

            {/* Detailed Information (Collapsible) */}
            {showDetails && (
              <>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {registration.guest?.person?.birthDate
                      ? new Date(registration.guest.person.birthDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
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
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                  <School className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Okul/Bölüm</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatProfessionDepartment(registration.guest?.professionDepartment) || '-'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
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
              </>
            )}
             
          </div>
           {/* Emergency Contact */}
           {registration.guest?.emergencyContact && (
                  <div className="mt-6">
                    <EmergencyContactCard emergencyContact={registration.guest.emergencyContact} />
                  </div>
                )}
          <button 
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 flex mx-auto text-sm items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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
        
        {/* Financial Summary */}
        <div className="lg:w-80 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finansal Özet</h3>
            <StatusBadge status={registration.status} />
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(financialSummary.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ödenen:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(financialSummary.paidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kalan:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(financialSummary.remainingAmount)}</span>
            </div>
            
            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${financialSummary.paymentProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ödeme İlerleme</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">%{financialSummary.paymentProgress}</span>
              </div>
            </div>
          </div>
          
          {nextPayment && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sonraki Ödeme:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(nextPayment.date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tutar:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(nextPayment.amount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}