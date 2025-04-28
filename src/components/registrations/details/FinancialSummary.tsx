import React from 'react';
import { DollarSign } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface FinancialSummaryProps {
  registration: ISeasonRegistration;
  financialData: {
    products: Array<{
      name: string;
      categoryName: string;
      status: string;
      grossAmount: number;
      discountAmount: number;
      discountPercentage: number;
      netAmount: number;
      paidAmount: number;
      refundAmount: number;
      remainingAmount: number;
    }>;
    summary: {
      totalGross: number;
      totalDiscount: number;
      totalDiscountPercentage: number;
      totalNet: number;
      totalPaid: number;
      totalRefund: number;
      totalRemaining: number;
    };
  };
}

export default function FinancialSummary({ registration, financialData }: FinancialSummaryProps) {
  const { products, summary } = financialData;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Finansal Özet
      </h3>
      
      <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ürün
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Durum
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Brüt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İndirim
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Net
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ödenen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Kalan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{product.categoryName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(product.grossAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(product.discountAmount)}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">%{product.discountPercentage.toFixed(1)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(product.netAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(product.paidAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(product.refundAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.remainingAmount)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-700/50 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                TOPLAM
              </td>
              <td className="px-6 py-4 whitespace-nowrap"></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(summary.totalGross)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalDiscount)}
                <div className="text-xs text-gray-500 dark:text-gray-400">%{summary.totalDiscountPercentage.toFixed(1)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(summary.totalNet)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalPaid)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(summary.totalRefund)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(summary.totalRemaining)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}