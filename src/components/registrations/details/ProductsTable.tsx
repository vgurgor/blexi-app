import React from 'react';
import { formatCurrency } from '@/utils/format';

interface ProductsTableProps {
  products: any[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const totalAmount = products.reduce((sum, product) => sum + product.totalPrice, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ürün
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Miktar
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Birim Fiyat
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Toplam
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{product.product?.name || 'Bilinmeyen Ürün'}</div>
                {product.product?.category && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {product.product.category.name}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{product.quantity}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(product.unitPrice)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.totalPrice)}
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