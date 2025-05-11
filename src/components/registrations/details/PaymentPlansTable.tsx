import React from 'react';
import { formatCurrency } from '@/utils/format';
import { Info } from 'lucide-react';
import PaymentStatusBadge from '@/components/ui/atoms/PaymentStatusBadge';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner';

interface PaymentPlan {
  id: string;
  plannedDate: string;
  plannedAmount: number;
  status: string;
  isDeposit?: boolean;
  plannedPaymentType?: {
    id: string;
    name: string;
    bankName?: string;
  };
}

interface PaymentPlansTableProps {
  paymentPlans: PaymentPlan[];
  isLoading?: boolean;
  totalPaidAmount?: number;
}

export default function PaymentPlansTable({ 
  paymentPlans, 
  isLoading = false,
  totalPaidAmount = 0
}: PaymentPlansTableProps) {
  const totalAmount = paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0);
  
  // Tarih formatı DD.MM.YYYY olarak formatla
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (paymentPlans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
            <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ödeme Planı Bulunamadı</h3>
          <p className="text-gray-600 dark:text-gray-400">Bu kayıt için henüz ödeme planı oluşturulmamış.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ödeme Tarihi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ödeme Tipi
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Durum
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tutar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paymentPlans.map((plan) => {
            // Determine row background color based on status
            let bgColorClass = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
            
            if (plan.status === 'paid') {
              bgColorClass = "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20";
            } else if (plan.status === 'overdue') {
              bgColorClass = "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20";
            } else if (plan.status === 'partial_paid') {
              bgColorClass = "bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20";
            }
            
            return (
              <tr key={plan.id} className={bgColorClass}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(plan.plannedDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white flex items-center">
                    {plan.isDeposit && (
                      <span className="mr-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        Depozito
                      </span>
                    )}
                    {plan.plannedPaymentType?.name || 'Belirtilmemiş'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <PaymentStatusBadge status={plan.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(plan.plannedAmount)}
                  </div>
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Toplam:</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {formatCurrency(totalPaidAmount)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}