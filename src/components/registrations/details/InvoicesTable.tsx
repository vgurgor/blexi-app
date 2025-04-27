import React from 'react';
import { formatCurrency } from '@/utils/format';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface InvoicesTableProps {
  invoices: any[];
}

export default function InvoicesTable({ invoices }: InvoicesTableProps) {
  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Düzenlendi
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            Taslak
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <XCircle className="w-3.5 h-3.5" />
            İptal Edildi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5" />
            {status}
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
              Fatura No
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tarih
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
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  {invoice.invoiceNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getInvoiceStatusBadge(invoice.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(invoice.totalAmount)} {invoice.currency}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}