import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { seasonRegistrationProductsApi } from '@/lib/api/seasonRegistrationProducts';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/hooks/useToast';
import ProductsTable from './ProductsTable';

interface RegistrationProductsContentProps {
  registrationId: string;
}

export default function RegistrationProductsContent({ registrationId }: RegistrationProductsContentProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, [registrationId]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await seasonRegistrationProductsApi.getByRegistrationId(registrationId);
      
      if (response.success) {
        setProducts(response.data);
      } else {
        toast.error('Ürün bilgileri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ürün bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Ürünler
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <ProductsTable products={products} />
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Bu kayıt için henüz ürün bulunmamaktadır.
        </div>
      )}
    </div>
  );
}