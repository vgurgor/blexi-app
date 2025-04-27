import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { invoiceTitlesApi } from '@/lib/api/invoiceTitles';
import { invoicesApi } from '@/lib/api/invoices';
import { useToast } from '@/hooks/useToast';
import InvoicesTable from './InvoicesTable';
import InvoiceTitlesList from './InvoiceTitlesList';

interface RegistrationInvoicesContentProps {
  registrationId: string;
}

export default function RegistrationInvoicesContent({ registrationId }: RegistrationInvoicesContentProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceTitles, setInvoiceTitles] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceTitles();
  }, [registrationId]);

  const fetchInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const response = await invoicesApi.getByRegistrationId(registrationId);
      
      if (response.success) {
        setInvoices(response.data);
      } else {
        toast.error('Fatura bilgileri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Fatura bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const fetchInvoiceTitles = async () => {
    setIsLoadingTitles(true);
    try {
      const response = await invoiceTitlesApi.getByRegistrationId(registrationId);
      
      if (response.success) {
        setInvoiceTitles(response.data);
      } else {
        toast.error('Fatura başlıkları yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching invoice titles:', error);
      toast.error('Fatura başlıkları yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const isLoading = isLoadingInvoices || isLoadingTitles;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Faturalar
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {invoices.length > 0 ? (
            <InvoicesTable invoices={invoices} />
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 mb-8">
              Bu kayıt için henüz fatura bulunmamaktadır.
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Fatura Başlıkları</h4>
            
            <InvoiceTitlesList invoiceTitles={invoiceTitles} />
          </div>
        </>
      )}
    </div>
  );
}