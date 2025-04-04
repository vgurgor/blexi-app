'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Calendar, CreditCard, Plus, Trash2, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { FormInput } from '@/components/ui';
import { paymentTypesApi } from '@/lib/api/paymentTypes';
import { useToast } from '@/hooks/useToast';

export default function PaymentPlanStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'payment_plans',
  });
  
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [plannedTotal, setPlannedTotal] = useState<number>(0); // Initialize as number
  const toast = useToast();

  const products = watch('products') || [];
  const depositAmount = watch('deposit_amount') || 0;
  const paymentPlans = watch('payment_plans') || [];

  // Calculate total amount from products
  useEffect(() => {
    let total = 0;
    products.forEach((product: any) => {
      total += product.quantity * product.unit_price;
    });
    setTotalAmount(total);
  }, [products]);

  // Calculate planned total from payment plans
  useEffect(() => {
    let total = 0;
    paymentPlans.forEach((plan: any) => {
      total += Number(plan.planned_amount) || 0; // Ensure it's a number
    });
    setPlannedTotal(total);
  }, [paymentPlans]);

  // Fetch payment types on component mount
  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  // Add deposit payment plan if deposit amount is set
  useEffect(() => {
    if (depositAmount > 0 && fields.length === 0) {
      // Add deposit payment plan
      append({
        planned_amount: depositAmount,
        planned_date: new Date().toISOString().split('T')[0],
        planned_payment_type_id: '',
        is_deposit: true,
      });
    }
  }, [depositAmount, fields.length, append]);

  // Fetch payment types
  const fetchPaymentTypes = async () => {
    setIsLoadingPaymentTypes(true);
    try {
      const response = await paymentTypesApi.getAll(undefined, 'active');
      
      if (response.success && response.data) {
        setPaymentTypes(response.data);
      } else {
        toast.error('Ödeme tipleri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching payment types:', error);
      toast.error('Ödeme tipleri yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingPaymentTypes(false);
    }
  };

  // Add a new payment plan
  const handleAddPaymentPlan = () => {
    append({
      planned_amount: 0,
      planned_date: '',
      planned_payment_type_id: '',
      is_deposit: false,
    });
  };

  // Calculate remaining amount
  const getRemainingAmount = () => {
    return totalAmount - plannedTotal;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Ödeme Planı
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafir için ödeme planı oluşturun.
        </p>
      </div>

      {/* Total Amount Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">Toplam Tutar:</span>
          </div>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {totalAmount.toFixed(2)} ₺
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
          <span className="text-blue-700 dark:text-blue-300">Planlanan Ödemeler:</span>
          <span className="font-medium text-blue-700 dark:text-blue-300">
            {plannedTotal.toFixed(2)} ₺
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
          <span className="text-blue-700 dark:text-blue-300">Kalan Tutar:</span>
          <span className={`font-bold ${
            getRemainingAmount() === 0 
              ? 'text-green-600 dark:text-green-400' 
              : getRemainingAmount() < 0 
                ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400'
          }`}>
            {getRemainingAmount().toFixed(2)} ₺
          </span>
        </div>
      </div>

      {/* Payment Plan List */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Payment Type */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ödeme Tipi*
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Controller
                    name={`payment_plans.${index}.planned_payment_type_id`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                          errors.payment_plans?.[index]?.planned_payment_type_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isLoadingPaymentTypes}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      >
                        <option value="">Ödeme Tipi Seçin</option>
                        {paymentTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                {errors.payment_plans?.[index]?.planned_payment_type_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.payment_plans?.[index]?.planned_payment_type_id?.message as string}
                  </p>
                )}
              </div>

              {/* Payment Date */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ödeme Tarihi*
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Controller
                    name={`payment_plans.${index}.planned_date`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                          errors.payment_plans?.[index]?.planned_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                      />
                    )}
                  />
                </div>
                {errors.payment_plans?.[index]?.planned_date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.payment_plans?.[index]?.planned_date?.message as string}
                  </p>
                )}
              </div>

              {/* Payment Amount */}
              <div className="md:col-span-3">
                <FormInput
                  name={`payment_plans.${index}.planned_amount`}
                  label="Ödeme Tutarı*"
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
                  value={String(watch(`payment_plans.${index}.planned_amount`) || '')}
                  error={errors.payment_plans?.[index]?.planned_amount?.message as string}
                />
              </div>

              {/* Is Deposit Checkbox and Remove Button */}
              <div className="md:col-span-2">
                <div className="flex items-center h-10 justify-between">
                  <div className="flex items-center">
                    <Controller
                      name={`payment_plans.${index}.is_deposit`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          disabled={watch(`payment_plans.${index}.is_deposit`) === true && depositAmount > 0}
                        />
                      )}
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Depozito
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={watch(`payment_plans.${index}.is_deposit`) === true && depositAmount > 0}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Payment Plan Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAddPaymentPlan}
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            type="button"
          >
            Ödeme Planı Ekle
          </Button>
        </div>

        {/* Error message if no payment plans */}
        {errors.payment_plans && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.payment_plans.message as string}
          </p>
        )}
      </div>

      {/* Warning for payment total */}
      {getRemainingAmount() !== 0 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {getRemainingAmount() > 0 
              ? `Toplam tutarın tamamı için ödeme planı oluşturulmadı. Kalan tutar: ${getRemainingAmount().toFixed(2)} ₺` 
              : `Ödeme planları toplamı, toplam tutardan fazla. Fark: ${Math.abs(getRemainingAmount()).toFixed(2)} ₺`}
          </p>
        </div>
      )}
    </div>
  );
}