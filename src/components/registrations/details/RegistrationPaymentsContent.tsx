import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentPlansApi } from '@/lib/api/paymentPlans';
import { useToast } from '@/hooks/useToast';
import PaymentScheduleSection from './PaymentScheduleSection';

interface RegistrationPaymentsContentProps {
  registrationId: string;
}

export default function RegistrationPaymentsContent({ registrationId }: RegistrationPaymentsContentProps) {
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPaymentPlans();
  }, [registrationId]);

  const fetchPaymentPlans = async () => {
    setIsLoading(true);
    try {
      // Use getAll with seasonRegistrationId filter instead of getByRegistrationId
      const response = await paymentPlansApi.getAll({
        seasonRegistrationId: registrationId,
        perPage: 50
      });
      
      if (response.success) {
        setPaymentPlans(response.data || []);
      } else {
        toast.error('Ödeme planı bilgileri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast.error('Ödeme planı bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Ödeme Bilgileri
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <PaymentScheduleSection registrationId={registrationId} paymentPlans={paymentPlans} />
      )}
    </div>
  );
}