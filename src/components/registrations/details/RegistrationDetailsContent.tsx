import React, { useState, useEffect } from 'react';
import { ISeasonRegistration } from '@/types/models';
import StudentInfoSection from './StudentInfoSection';
import AccommodationInfoSection from './AccommodationInfoSection';
import FinancialSummary from './FinancialSummary';
import PaymentSummary from './PaymentSummary';
import NotesSection from './NotesSection';
import PaymentPlansTable from './PaymentPlansTable';
import { Calendar, Info } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { paymentPlansApi } from '@/lib/api/paymentPlans';
import SectionHeading from '@/components/ui/molecules/SectionHeading';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner';

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
        <SectionHeading
          title="Ödeme Planı"
          icon={<Calendar className="w-5 h-5" />}
        />

        <PaymentPlansTable
          paymentPlans={paymentPlans}
          isLoading={isLoadingPaymentPlans}
          totalPaidAmount={totalPaidAmount}
        />
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