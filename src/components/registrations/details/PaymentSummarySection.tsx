import React from 'react';
import { DollarSign, FileText, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/atoms/Button';

interface PaymentSummarySectionProps {
  financialSummary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: number;
  };
  lastPayment?: {
    date: string;
    amount: number;
  };
  nextPayment?: {
    date: string;
    amount: number;
  };
}

export default function PaymentSummarySection({ 
  financialSummary,
  lastPayment, 
  nextPayment 
}: PaymentSummarySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ödeme Özeti</h4>
        <div className="space-y-3">
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
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Ödeme Durumu:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">%{financialSummary.paymentProgress} Tamamlandı</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ödeme Bilgileri</h4>
        <div className="space-y-3">
          {lastPayment && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Son Ödeme:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(lastPayment.date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Son Ödeme Tutarı:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(lastPayment.amount)}</span>
              </div>
            </>
          )}
          
          {nextPayment && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sonraki Ödeme:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(nextPayment.date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sonraki Ödeme Tutarı:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(nextPayment.amount)}</span>
              </div>
            </>
          )}

          {!lastPayment && !nextPayment && (
            <div className="text-gray-600 dark:text-gray-400">
              Ödeme bilgisi bulunamadı.
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h4>
        <div className="space-y-3">
          <Button 
            variant="primary" 
            className="w-full justify-center"
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            Ödeme Al
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-center"
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Fatura Oluştur
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-center"
            leftIcon={<Tag className="w-4 h-4" />}
          >
            İndirim Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}