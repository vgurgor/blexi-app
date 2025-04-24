'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Package, Plus, Trash2, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { productsApi } from '@/lib/api/products';
import { pricesApi } from '@/lib/api/prices';
import { useToast } from '@/hooks/useToast';

export default function ProductSelectionStep() {
  const { control, watch, setValue, formState: { errors }, trigger } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });
  
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const toast = useToast();

  const apartId = watch('apart_id');
  const seasonCode = watch('season_code');
  const selectedProducts = watch('products') || [];

  // Fetch products and prices when apart and season are selected
  useEffect(() => {
    if (apartId && seasonCode) {
      fetchProducts();
      fetchPrices();
    }
  }, [apartId, seasonCode]);

  // Calculate total amount when products change
  useEffect(() => {
    let total = 0;
    if (selectedProducts && Array.isArray(selectedProducts)) {
      selectedProducts.forEach((product: any) => {
        const quantity = Number(product?.quantity || 1);
        const unitPrice = Number(product?.unit_price || 0);
        total += quantity * unitPrice;
      });
    }
    setTotalAmount(total);
  }, [selectedProducts]);

  // Auto-select product if only one is available
  useEffect(() => {
    if (prices.length === 1 && fields.length === 0) {
      const price = prices[0];
      const product = products.find(p => p.id.toString() === price.productId);
      
      if (product) {
        handleAddProduct(parseInt(price.productId), price.price);
      }
    }
  }, [prices, products, fields.length]);

  // Trigger validation when products change
  useEffect(() => {
    if (fields.length > 0) {
      trigger('products');
    }
  }, [fields, trigger]);

  // Fetch available products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await productsApi.getAll('active');
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        toast.error('Ürünler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch prices for the selected apart and season
  const fetchPrices = async () => {
    setIsLoadingPrices(true);
    try {
      const response = await pricesApi.getAll(apartId, seasonCode);
      
      if (response.success && response.data) {
        setPrices(response.data);
      } else {
        toast.error('Fiyatlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Fiyatlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Add a new product to the list with fixed quantity of 1
  const handleAddProduct = (productId: number, unitPrice: number) => {
    // Check if product is already added
    const existingProductIndex = selectedProducts.findIndex(
      (p: any) => p.product_id === productId
    );
    
    if (existingProductIndex >= 0) {
      // Product already exists, don't add it again
      toast.info('Bu ürün zaten eklenmiş');
      return;
    }
    
    // Add new product with fixed quantity of 1
    append({
      product_id: productId,
      quantity: 1,
      unit_price: unitPrice,
    });
    
    // Trigger validation after adding a product
    setTimeout(() => {
      trigger('products');
    }, 0);
  };

  // Get product name by ID
  const getProductName = (productId: string | number) => {
    const product = products.find(p => p.id.toString() === productId.toString());
    return product ? product.name : 'Bilinmeyen Ürün';
  };

  // Calculate the total price for a product line
  const calculateLineTotal = (index: number) => {
    if (!selectedProducts || !selectedProducts[index]) return '0.00';
    
    const quantity = Number(selectedProducts[index]?.quantity || 1);
    const unitPrice = Number(selectedProducts[index]?.unit_price || 0);
    
    return (quantity * unitPrice).toFixed(2);
  };

  // Check if product can be removed (only if there are more than 2 products)
  const canRemoveProduct = () => {
    return fields.length > 2;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ürün Seçimi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafir için ürün ve hizmetleri seçin.
        </p>
      </div>

      {/* Available Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Kullanılabilir Ürünler
        </h3>
        
        {isLoadingPrices ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prices.map((price) => {
              const product = products.find(p => p.id.toString() === price.productId);
              const isSelected = selectedProducts.some((p: any) => p.product_id === parseInt(price.productId));
              
              return product ? (
                <div 
                  key={price.id} 
                  className={`p-4 rounded-lg border ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  } transition-colors cursor-pointer`}
                  onClick={() => !isSelected && handleAddProduct(parseInt(price.productId), price.price)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                    {isSelected && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        Seçildi
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {product.description || 'Açıklama bulunmuyor'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {price.price.toLocaleString('tr-TR')} {price.currency}
                    </span>
                    {!isSelected && (
                      <button 
                        type="button"
                        className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(parseInt(price.productId), price.price);
                        }}
                      >
                        Ekle
                      </button>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-amber-700 dark:text-amber-300">
              Seçilen apart ve sezon için ürün fiyatı bulunamadı. Lütfen farklı bir apart veya sezon seçin.
            </p>
          </div>
        )}
      </div>

      {/* Selected Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Seçilen Ürünler
        </h3>
        
        {fields.length > 0 ? (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const productId = watch(`products.${index}.product_id`);
              return (
                <div 
                  key={field.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Name */}
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getProductName(productId)}
                        </div>
                      </div>
                      <Controller
                        name={`products.${index}.product_id`}
                        control={control}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                    </div>

                    {/* Quantity - Read-only */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Miktar:</span> 1
                      </div>
                      <Controller
                        name={`products.${index}.quantity`}
                        control={control}
                        defaultValue={1}
                        render={({ field }) => (
                          <input type="hidden" {...field} value={1} />
                        )}
                      />
                    </div>

                    {/* Unit Price - Read-only */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Birim Fiyat:</span> {watch(`products.${index}.unit_price`)} ₺
                      </div>
                      <Controller
                        name={`products.${index}.unit_price`}
                        control={control}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                    </div>

                    {/* Total Price & Remove Button */}
                    <div className="md:col-span-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateLineTotal(index)} ₺
                      </span>
                      {canRemoveProduct() && (
                        <button
                          type="button"
                          onClick={() => {
                            remove(index);
                            // Trigger validation after removing a product
                            setTimeout(() => {
                              trigger('products');
                            }, 0);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Henüz ürün seçilmedi. Yukarıdaki listeden ürün seçin.
            </p>
          </div>
        )}

        {/* Error message if no products */}
        {errors.products && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.products.message as string}
          </p>
        )}
      </div>

      {/* Total Amount */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Toplam Tutar:</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {totalAmount.toFixed(2)} ₺
          </span>
        </div>
      </div>
    </div>
  );
}