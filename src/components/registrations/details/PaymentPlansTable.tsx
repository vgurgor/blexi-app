import React from 'react';
import { formatCurrency } from '@/utils/format';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface PaymentPlansTableProps {
  paymentPlans: any[];
}

export default function PaymentPlansTable({ paymentPlans }: PaymentPlansTableProps) {
  const totalAmount = paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Ödendi
          </span>
        );
      case 'partial_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Kısmi Ödeme
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Gecikmiş
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            Planlandı
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ödeme Tarihi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ödeme Tipi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Durum
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tutar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paymentPlans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(plan.plannedDate).toLocaleDateString('tr-TR')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {plan.plannedPaymentType?.name || 'Belirtilmemiş'}
                  {plan.isDeposit && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      Depozito
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getPaymentStatusBadge(plan.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(plan.plannedAmount)}
                </div>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Toplam:</div>
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