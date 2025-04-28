import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface FinancialSummarySectionProps {
  financialSummary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: number;
  };
  products?: Array<{
    id: string;
    name: string;
    category?: string;
    status?: string;
    grossAmount: number;
    discountAmount: number;
    netAmount: number;
    paidAmount: number;
    refundAmount: number;
    remainingAmount: number;
    discountPercentage?: number;
  }>;
}

export default function FinancialSummarySection({ 
  financialSummary, 
  products = []
}: FinancialSummarySectionProps) {
  // Eğer ürünler verilmezse, toplam finansal özeti kullanarak bir özet ürün oluştur
  const displayProducts = products.length > 0 ? products : [
    {
      id: 'summary',
      name: 'Tüm Ürünler',
      grossAmount: financialSummary.totalAmount * 1.8, // Yaklaşık brüt tutarı hesapla
      discountAmount: financialSummary.totalAmount * 0.8, // Yaklaşık indirim tutarı
      netAmount: financialSummary.totalAmount,
      paidAmount: financialSummary.paidAmount,
      refundAmount: 0,
      remainingAmount: financialSummary.remainingAmount,
      discountPercentage: 45 // Yaklaşık indirim yüzdesi
    }
  ];

  // Toplamları hesapla
  const totals = {
    grossAmount: displayProducts.reduce((sum, product) => sum + product.grossAmount, 0),
    discountAmount: displayProducts.reduce((sum, product) => sum + product.discountAmount, 0),
    netAmount: displayProducts.reduce((sum, product) => sum + product.netAmount, 0),
    paidAmount: displayProducts.reduce((sum, product) => sum + product.paidAmount, 0),
    refundAmount: displayProducts.reduce((sum, product) => sum + product.refundAmount, 0),
    remainingAmount: displayProducts.reduce((sum, product) => sum + product.remainingAmount, 0),
  };

  const discountPercentage = totals.grossAmount > 0 
    ? Math.round((totals.discountAmount / totals.grossAmount) * 100 * 10) / 10
    : 0;

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
            {displayProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                  {product.category && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.category}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {product.status || 'Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(product.grossAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(product.discountAmount)}
                  </span>
                  {product.discountPercentage && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">%{product.discountPercentage}</div>
                  )}
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
                {formatCurrency(totals.grossAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                {formatCurrency(totals.discountAmount)}
                <div className="text-xs text-gray-500 dark:text-gray-400">%{discountPercentage}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(totals.netAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                {formatCurrency(totals.paidAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatCurrency(totals.refundAmount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(totals.remainingAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}