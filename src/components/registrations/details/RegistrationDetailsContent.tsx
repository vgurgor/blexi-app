import React, { useState, useEffect } from 'react';
import { ISeasonRegistration } from '@/types/models';
import StudentInfoSection from './StudentInfoSection';
import AccommodationInfoSection from './AccommodationInfoSection';
import FinancialSummary from './FinancialSummary';
import PaymentSummary from './PaymentSummary';
import NotesSection from './NotesSection';
import { Calendar, CheckCircle, AlertTriangle, Clock, Info } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { paymentPlansApi } from '@/lib/api/paymentPlans';

interface RegistrationDetailsContentProps {
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
  paymentPlansData: Array<{
    id: string;
    plannedDate: string;
    plannedAmount: number;
    status: string;
    plannedPaymentType?: {
      id: string;
      name: string;
      bankName?: string;
    };
    isDeposit?: boolean;
  }>;
  paymentSummary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: number;
    lastPayment?: {
      date: string;
      amount: number;
    } | null;
    nextPayment?: {
      date: string;
      amount: number;
    } | null;
  };
}

export default function RegistrationDetailsContent({ 
  registration, 
  financialData, 
  paymentPlansData: initialPaymentPlansData, 
  paymentSummary 
}: RegistrationDetailsContentProps) {
  const [paymentPlans, setPaymentPlans] = useState(initialPaymentPlansData || []);
  const [isLoadingPaymentPlans, setIsLoadingPaymentPlans] = useState(initialPaymentPlansData?.length === 0);
  
  // Fetch payment plans if not provided or empty
  useEffect(() => {
    if (initialPaymentPlansData?.length === 0) {
      const fetchPaymentPlans = async () => {
        try {
          const response = await paymentPlansApi.getAll({
            seasonRegistrationId: registration.id,
            perPage: 50
          });
          
          if (response.success && response.data) {
            setPaymentPlans(response.data);
          }
        } catch (error) {
          console.error('Error fetching payment plans:', error);
        } finally {
          setIsLoadingPaymentPlans(false);
        }
      };
      
      fetchPaymentPlans();
    } else {
      setPaymentPlans(initialPaymentPlansData);
    }
  }, [registration.id, initialPaymentPlansData]);
  
  // Ödeme planlarını uygun formata dönüştür
  const formattedPaymentPlans = paymentPlans.map(plan => ({
    id: plan.id,
    date: new Date(plan.plannedDate).toLocaleDateString('tr-TR'),
    amount: plan.plannedAmount,
    paidAmount: plan.status === 'paid' ? plan.plannedAmount : 0,
    remainingAmount: plan.status === 'paid' ? 0 : plan.plannedAmount,
    isPaid: plan.status === 'paid'
  }));

  // Ödeme özet verilerini hazırla
  const formattedPaymentSummary = {
    totalAmount: paymentSummary.totalAmount,
    paidAmount: paymentSummary.paidAmount,
    remainingAmount: paymentSummary.remainingAmount,
    paymentProgress: paymentSummary.paymentProgress,
    lastPaymentDate: paymentSummary.lastPayment?.date ? 
      new Date(paymentSummary.lastPayment.date).toLocaleDateString('tr-TR') : undefined,
    lastPaymentAmount: paymentSummary.lastPayment?.amount,
    nextPaymentDate: paymentSummary.nextPayment?.date ? 
      new Date(paymentSummary.nextPayment.date).toLocaleDateString('tr-TR') : undefined,
    nextPaymentAmount: paymentSummary.nextPayment?.amount
  };

  // Ödeme geçmişi
  const paymentHistory = paymentSummary.lastPayment ? [
    {
      date: new Date(paymentSummary.lastPayment.date).toLocaleDateString('tr-TR'),
      amount: paymentSummary.lastPayment.amount,
      method: 'Ödeme'
    }
  ] : [];

  // Ödeme durumu badge'ini getir
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

  // Tarih formatı DD.MM.YYYY olarak formatla
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Toplam planlanmış ve ödenmiş tutarları hesapla
  const totalPlannedAmount = paymentPlans.reduce((sum, plan) => sum + plan.plannedAmount, 0);
  const totalPaidAmount = paymentSummary.paidAmount || 0;

  return (
    <div className="space-y-8">
      {/* Payment Plans Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Ödeme Planı
        </h3>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingPaymentPlans ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarih</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ödenen</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentPlans.length > 0 ? (
                    paymentPlans.map((plan) => {
                      const isPaid = plan.status === 'paid';
                      
                      // Determine row background color based on status
                      let bgColorClass = "bg-white dark:bg-gray-800";
                      
                      if (plan.status === 'paid') {
                        bgColorClass = "bg-green-50 dark:bg-green-900/10";
                      } else if (plan.status === 'overdue') {
                        bgColorClass = "bg-red-50 dark:bg-red-900/10";
                      } else if (plan.status === 'partial_paid') {
                        bgColorClass = "bg-yellow-50 dark:bg-yellow-900/10";
                      }
                      
                      // Calculate paid amount based on status
                      const paidAmount = plan.status === 'paid' 
                        ? plan.plannedAmount 
                        : plan.status === 'partial_paid' 
                          ? plan.plannedAmount * 0.5 // Approximate for display purposes
                          : 0;
                      
                      return (
                        <tr 
                          key={plan.id}
                          className={`${bgColorClass} hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isPaid}
                              readOnly
                              disabled
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {plan.isDeposit && (
                                <span className="inline-flex items-center px-2 py-0.5 mr-2 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                  Depozito
                                </span>
                              )}
                              <span className="font-medium">{formatDate(plan.plannedDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStatusBadge(plan.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(paidAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(plan.plannedAmount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                            <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ödeme Planı Bulunamadı</h3>
                          <p className="text-gray-600 dark:text-gray-400">Bu kayıt için henüz ödeme planı oluşturulmamış.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                      Toplam:
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(totalPaidAmount)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(totalPlannedAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Summary */}
      <PaymentSummary summary={formattedPaymentSummary} />
      
      {/* Notes and Additional Information */}
      <NotesSection
        notes={registration.notes}
        paymentHistory={paymentHistory}
        registrationStatus={registration.status}
        registrationDate={new Date(registration.createdAt).toLocaleDateString('tr-TR')}
      />
    </div>
  );
}