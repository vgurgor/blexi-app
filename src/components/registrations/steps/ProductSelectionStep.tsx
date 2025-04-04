'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Package, Plus, Trash2, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { FormInput } from '@/components/ui';
import { productsApi } from '@/lib/api/products';
import { pricesApi } from '@/lib/api/prices';
import { useToast } from '@/hooks/useToast';

export default function ProductSelectionStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
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
        const quantity = Number(product?.quantity || 0);
        const unitPrice = Number(product?.unit_price || 0);
        total += quantity * unitPrice;
      });
    }
    setTotalAmount(total);
  }, [selectedProducts]);

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

  // Add a new product to the list
  const handleAddProduct = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    append({
      product_id: '',
      quantity: 1,
      unit_price: 0,
    });
  };

  // Update product price when product is selected
  const handleProductChange = (index: number, productId: number) => {
    // Find the price for this product
    const price = prices.find(p => p.productId === productId.toString());
    
    if (price) {
      setValue(`products.${index}.unit_price`, price.price);
    } else {
      // If no price is found, set a default price of 0
      setValue(`products.${index}.unit_price`, 0);
      toast.warning('Bu ürün için fiyat bulunamadı. Lütfen manuel olarak girin.');
    }
  };

  // Get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Bilinmeyen Ürün';
  };

  // Calculate the total price for a product line
  const calculateLineTotal = (index: number) => {
    if (!selectedProducts || !selectedProducts[index]) return '0.00';
    
    const quantity = Number(selectedProducts[index]?.quantity || 0);
    const unitPrice = Number(selectedProducts[index]?.unit_price || 0);
    
    return (quantity * unitPrice).toFixed(2);
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

      {/* Product List */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Product Selection */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ürün*
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Controller
                    name={`products.${index}.product_id`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                          errors.products?.[index]?.product_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isLoadingProducts}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                          handleProductChange(index, parseInt(e.target.value));
                        }}
                      >
                        <option value="">Ürün Seçin</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                {errors.products?.[index]?.product_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.products?.[index]?.product_id?.message as string}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Miktar*
                </label>
                <Controller
                  name={`products.${index}.quantity`}
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      min="1"
                      className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.products?.[index]?.quantity ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  )}
                />
                {errors.products?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.products?.[index]?.quantity?.message as string}
                  </p>
                )}
              </div>

              {/* Unit Price */}
              <div className="md:col-span-3">
                <FormInput
                  name={`products.${index}.unit_price`}
                  label="Birim Fiyat*"
                  type="number"
                  leftIcon={<DollarSign className="w-5 h-5 text-gray-400" />}
                  mask={Number}
                  maskOptions={{
                    scale: 2,
                    thousandsSeparator: '.',
                    padFractionalZeros: false,
                    normalizeZeros: true,
                    radix: ',',
                    mapToRadix: ['.']
                  }}
                  value={String(watch(`products.${index}.unit_price`) || '')}
                  error={errors.products?.[index]?.unit_price?.message as string}
                />
              </div>

              {/* Total Price (Calculated) */}
              <div className="md:col-span-1">
                <div className="flex items-center h-10 justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {calculateLineTotal(index)} ₺
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Product Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAddProduct}
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            type="button" // Explicitly set type to button
          >
            Ürün Ekle
          </Button>
        </div>

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