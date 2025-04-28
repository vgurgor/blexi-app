import React from 'react';
import { ISeasonRegistration } from '@/types/models';
import StudentInfoSection from './StudentInfoSection';
import AccommodationInfoSection from './AccommodationInfoSection';
import FinancialSummary from './FinancialSummary';
import PaymentSchedule from './PaymentSchedule';
import PaymentSummary from './PaymentSummary';
import NotesSection from './NotesSection';

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
  paymentPlansData, 
  paymentSummary 
}: RegistrationDetailsContentProps) {
  // Ödeme planlarını uygun formata dönüştür
  const formattedPaymentPlans = paymentPlansData.map(plan => ({
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

  return (
    <div className="space-y-8">
      
      {/* Payment Schedule */}
      <PaymentSchedule payments={formattedPaymentPlans} />
      
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