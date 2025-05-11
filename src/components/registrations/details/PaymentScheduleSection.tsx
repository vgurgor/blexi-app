import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Clock, Info, CreditCard, DollarSign, Plus, Check, X } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { paymentsApi } from '@/lib/api/payments';
import { paymentPlansApi } from '@/lib/api/paymentPlans';
import { paymentTypesApi } from '@/lib/api/paymentTypes';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/atoms/Button';

interface PaymentPlan {
  id: string;
  plannedDate: string;
  plannedAmount: number;
  status: 'planned' | 'paid' | 'partial_paid' | 'overdue';
  plannedPaymentType?: {
    id: string;
    name: string;
    bankName?: string;
  };
  isDeposit?: boolean;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  approvalCode?: string;
  status: 'completed' | 'cancelled' | 'refunded';
  paymentType?: {
    id: string;
    name: string;
    bankName?: string;
  };
  notes?: string;
}

interface PaymentScheduleSectionProps {
  registrationId: string;
  paymentPlans: PaymentPlan[];
}

interface PaymentType {
  id: string;
  name: string;
  bankName?: string;
}

export default function PaymentScheduleSection({ registrationId, paymentPlans }: PaymentScheduleSectionProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{
    planId: string | null;
    paymentTypeId: string;
    amount: number;
    paymentDate: string;
    approvalCode: string;
    notes: string;
  }>({
    planId: null,
    paymentTypeId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    approvalCode: '',
    notes: '',
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const toast = useToast();
  
  const totalAmount = paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0);
  
  // Fetch payment types for dropdown
  useEffect(() => {
    const fetchPaymentTypes = async () => {
      setIsLoadingPaymentTypes(true);
      try {
        const response = await paymentTypesApi.getAll(undefined, 'active');
        
        if (response.success && response.data) {
          const paymentTypeData = response.data;
          setPaymentTypes(paymentTypeData);

          // Set first payment type as default if available
          if (paymentTypeData.length > 0) {
            setPaymentForm(prev => ({
              ...prev,
              paymentTypeId: paymentTypeData[0]?.id || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching payment types:', error);
      } finally {
        setIsLoadingPaymentTypes(false);
      }
    };
    
    fetchPaymentTypes();
  }, []);

  const togglePlanExpand = async (planId: string) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
      // Reset payment form when closing
      if (paymentForm.planId === planId) {
        setPaymentForm({
          planId: null,
          paymentTypeId: paymentTypes.length > 0 ? paymentTypes[0].id : '',
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          approvalCode: '',
          notes: '',
        });
      }
      return;
    }
    
    setExpandedPlan(planId);
    
    // Only fetch if we don't already have the data
    if (!paymentDetails[planId] && !isLoading[planId]) {
      setIsLoading(prev => ({ ...prev, [planId]: true }));
      
      try {
        const response = await paymentsApi.getByPlanId(planId);
        if (response.success && response.data) {
          const payments = response.data || [];
          setPaymentDetails(prev => ({
            ...prev,
            [planId]: payments
          }));
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, [planId]: false }));
      }
    }
  };

  const handlePaymentClick = (planId: string, plannedAmount: number) => {
    // Check if payment already exists
    const existingPayments = paymentDetails[planId] || [];
    if (existingPayments.length > 0) {
      toast.info('Bu plan için zaten ödeme kaydı bulunmaktadır');
      return;
    }

    // Prepare payment form with plan details
    setPaymentForm({
      planId: planId,
      paymentTypeId: paymentTypes.length > 0 ? paymentTypes[0].id : '',
      amount: plannedAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      approvalCode: '',
      notes: '',
    });
    
    // Expand the plan details
    setExpandedPlan(planId);
  };

  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for amount to convert to number
    if (name === 'amount') {
      setPaymentForm({
        ...paymentForm,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setPaymentForm({
        ...paymentForm,
        [name]: value,
      });
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.planId) return;
    
    setIsSubmittingPayment(true);
    
    try {
      const response = await paymentsApi.create({
        payment_plan_id: parseInt(paymentForm.planId),
        payment_type_id: parseInt(paymentForm.paymentTypeId),
        amount: paymentForm.amount,
        payment_date: paymentForm.paymentDate,
        approval_code: paymentForm.approvalCode || undefined,
        notes: paymentForm.notes || undefined,
      });
      
      if (response.success && response.data) {
        // Add new payment to the payment details
        setPaymentDetails(prev => ({
          ...prev,
          [paymentForm.planId!]: [...(prev[paymentForm.planId!] || []), response.data]
        }));
        
        toast.success('Ödeme başarıyla kaydedildi');
        
        // Reset form
        setPaymentForm({
          planId: null,
          paymentTypeId: paymentTypes.length > 0 ? paymentTypes[0].id : '',
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          approvalCode: '',
          notes: '',
        });
      } else {
        toast.error(response.error || 'Ödeme kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Ödeme kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const cancelPaymentForm = () => {
    setPaymentForm({
      planId: null,
      paymentTypeId: paymentTypes.length > 0 ? paymentTypes[0].id : '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      approvalCode: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Ödendi
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Gecikmiş
          </span>
        );
      case 'partial_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Kısmi Ödeme
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            Planlandı
          </span>
        );
    }
  };

  const getPaymentInfo = (planId: string) => {
    const payments = paymentDetails[planId] || [];
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return { payments, totalPaid };
  };

  // Format date in DD.MM.YYYY format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Calculate total amounts
  const totalPaid = Object.values(paymentDetails)
    .flat()
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Ödeme Planı
      </h3>
      
      <div className="space-y-1">
        {paymentPlans.length > 0 ? (
          paymentPlans.map((plan) => {
            const { payments, totalPaid } = getPaymentInfo(plan.id);
            const isPaid = plan.status === 'paid';
            const planDate = formatDate(plan.plannedDate);
            const isAddingPayment = paymentForm.planId === plan.id;
            
            return (
              <div key={plan.id} className="mb-2">
                {/* Payment plan header - always visible */}
                <div 
                  className={`grid grid-cols-12 items-center p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                    expandedPlan === plan.id ? 'bg-gray-50 dark:bg-gray-800 border-b-0 rounded-b-none' : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'
                  } ${isPaid ? 'bg-green-50 dark:bg-green-900/10' : ''} border border-gray-200 dark:border-gray-700`}
                  onClick={() => togglePlanExpand(plan.id)}
                >
                  <div className="col-span-6 md:col-span-8 flex items-center gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isPaid}
                        readOnly
                        disabled
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      {plan.isDeposit && (
                        <span className="inline-flex items-center px-2 py-0.5 mr-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          Depozito
                        </span>
                      )}
                      {planDate}
                      {expandedPlan === plan.id ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-4 flex items-center justify-end gap-4">
                    <div className="text-sm font-medium text-right">
                      <span className={`${isPaid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatCurrency(totalPaid)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 mx-1">/</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(plan.plannedAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded payment details */}
                {expandedPlan === plan.id && (
                  <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800 p-4 shadow-inner">
                    {isLoading[plan.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : isAddingPayment ? (
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                        <h4 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-4">Yeni Ödeme Ekle</h4>
                        
                        <form onSubmit={handleSubmitPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Payment Type Selector */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Ödeme Türü*
                            </label>
                            <select
                              name="paymentTypeId"
                              value={paymentForm.paymentTypeId}
                              onChange={handlePaymentFormChange}
                              disabled={isSubmittingPayment}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Ödeme Türü Seçin</option>
                              {paymentTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.name} {type.bankName ? `(${type.bankName})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Amount */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tutar*
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                name="amount"
                                value={paymentForm.amount}
                                onChange={handlePaymentFormChange}
                                disabled={isSubmittingPayment}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                              />
                            </div>
                          </div>
                          
                          {/* Payment Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Ödeme Tarihi*
                            </label>
                            <input
                              type="date"
                              name="paymentDate"
                              value={paymentForm.paymentDate}
                              onChange={handlePaymentFormChange}
                              disabled={isSubmittingPayment}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md py-2 px-3"
                              required
                            />
                          </div>
                          
                          {/* Approval Code */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Onay/Referans Kodu
                            </label>
                            <input
                              type="text"
                              name="approvalCode"
                              value={paymentForm.approvalCode}
                              onChange={handlePaymentFormChange}
                              disabled={isSubmittingPayment}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md py-2 px-3"
                              placeholder="Ödeme onay kodu"
                            />
                          </div>
                          
                          {/* Notes */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Notlar
                            </label>
                            <textarea
                              name="notes"
                              value={paymentForm.notes}
                              onChange={handlePaymentFormChange}
                              disabled={isSubmittingPayment}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md py-2 px-3"
                              rows={2}
                              placeholder="Ödeme ile ilgili notlar"
                            />
                          </div>
                          
                          {/* Form Buttons */}
                          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => cancelPaymentForm()}
                              disabled={isSubmittingPayment}
                              leftIcon={<X className="w-4 h-4" />}
                            >
                              İptal
                            </Button>
                            <Button
                              type="submit"
                              variant="primary"
                              isLoading={isSubmittingPayment}
                              leftIcon={!isSubmittingPayment && <Check className="w-4 h-4" />}
                            >
                              Ödeme Ekle
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Bilgileri</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Plan Tipi:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {plan.plannedPaymentType?.name || "Belirtilmemiş"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Plan Tarihi:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{planDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(plan.plannedAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Durum:</span>
                              <div>{getStatusBadge(plan.status)}</div>
                            </div>
                          </div>
                          
                          {!isPaid && payments.length === 0 && (
                            <div className="mt-4">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentClick(plan.id, plan.plannedAmount);
                                }}
                                variant="primary"
                                leftIcon={<Plus className="w-4 h-4" />}
                                size="sm"
                                className="w-full"
                              >
                                Ödeme Ekle
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {payments && payments.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ödeme Bilgileri</h4>
                            <div className="space-y-3">
                              {payments.map(payment => (
                                <div key={payment.id} className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Ödeme Tipi:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {payment.paymentType?.name || "Belirtilmemiş"}
                                    </span>
                                  </div>
                                  {payment.approvalCode && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Slip Onay Kodu:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {payment.approvalCode}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Ödeme Tarihi:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(payment.paymentDate)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Ödeme Tutar:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                  </div>
                                  {payment.notes && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Notlar:</span>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {payment.notes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ödeme Bilgileri</h4>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-600 dark:text-gray-400">
                                  Bu plana ait ödeme bilgisi bulunmamaktadır.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ödeme Planı Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400">Bu kayıt için henüz ödeme planı oluşturulmamış.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
