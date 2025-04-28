import React from 'react';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface NotesSectionProps {
  notes?: string;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  registrationStatus: string;
  registrationDate: string;
}

export default function NotesSection({
  notes,
  paymentHistory = [],
  registrationStatus,
  registrationDate
}: NotesSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notlar ve Ek Bilgiler</h4>
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kayıt Notları</h5>
          <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            {notes || 'Bu kayıt için not bulunmamaktadır.'}
          </p>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ödeme Geçmişi</h5>
          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.date} - {formatCurrency(payment.amount)} - {payment.method}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-600 dark:text-gray-400">Henüz ödeme yapılmamış.</span>
            )}
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kayıt Durumu</h5>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              registrationStatus === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : registrationStatus === 'cancelled'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            }`}>
              {registrationStatus === 'active' ? 'Aktif' : 
               registrationStatus === 'cancelled' ? 'İptal Edildi' : 
               registrationStatus === 'completed' ? 'Tamamlandı' : 'Beklemede'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Kayıt Tarihi: {registrationDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}