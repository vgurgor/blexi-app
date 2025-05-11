import React from 'react';
import { DollarSign, FileText, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/atoms/Button';
import DataCard, { DataItem } from '@/components/ui/molecules/DataCard';

interface PaymentSummaryProps {
  summary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentProgress: number;
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
    nextPaymentDate?: string;
    nextPaymentAmount?: number;
  };
}

export default function PaymentSummary({ summary }: PaymentSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DataCard title="Ödeme Özeti">
        <DataItem
          label="Toplam Tutar"
          value={formatCurrency(summary.totalAmount)}
        />
        <DataItem
          label="Ödenen"
          value={formatCurrency(summary.paidAmount)}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <DataItem
          label="Kalan"
          value={formatCurrency(summary.remainingAmount)}
        />
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <DataItem
            label="Ödeme Durumu"
            value={`%${summary.paymentProgress} Tamamlandı`}
            valueClassName="text-amber-600 dark:text-amber-400"
          />
        </div>
      </DataCard>

      <DataCard title="Ödeme Bilgileri">
        {summary.lastPaymentDate ? (
          <>
            <DataItem label="Son Ödeme" value={summary.lastPaymentDate} />
            <DataItem
              label="Son Ödeme Tutarı"
              value={formatCurrency(summary.lastPaymentAmount || 0)}
            />
          </>
        ) : null}

        {summary.nextPaymentDate ? (
          <>
            <DataItem label="Sonraki Ödeme" value={summary.nextPaymentDate} />
            <DataItem
              label="Sonraki Ödeme Tutarı"
              value={formatCurrency(summary.nextPaymentAmount || 0)}
            />
          </>
        ) : null}

        {!summary.lastPaymentDate && !summary.nextPaymentDate && (
          <div className="text-gray-600 dark:text-gray-400">Henüz ödeme planı oluşturulmamış.</div>
        )}
      </DataCard>

      <DataCard title="Hızlı İşlemler">
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full justify-center"
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            Ödeme Al
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-center"
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Fatura Oluştur
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-center"
            leftIcon={<Tag className="w-4 h-4" />}
          >
            İndirim Uygula
          </Button>
        </div>
      </DataCard>
    </div>
  );
}