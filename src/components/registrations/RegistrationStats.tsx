import React, { useState, useEffect } from 'react';
import { RegistrationStats as IRegistrationStats } from '@/types/api';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/hooks/useToast';
import { 
  Users, 
  DollarSign, 
  CalendarCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart4, 
  Building2
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/atoms/LoadingSpinner';

export default function RegistrationStats() {
  const [stats, setStats] = useState<IRegistrationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await seasonRegistrationsApi.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          toast.error('İstatistikler yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Error fetching registration stats:', error);
        toast.error('İstatistikler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">İstatistik verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kayıtlar"
          value={stats.totalRegistrations}
          icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          description="Toplam kayıt sayısı"
          color="blue"
        />
        <StatCard
          title="Aktif Kayıtlar"
          value={stats.activeRegistrations}
          icon={<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
          description="Devam eden kayıtlar"
          color="green"
        />
        <StatCard
          title="Tamamlanan"
          value={stats.completedRegistrations}
          icon={<CalendarCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          description="Tamamlanan kayıtlar"
          color="indigo"
        />
        <StatCard
          title="İptal Edilen"
          value={stats.cancelledRegistrations}
          icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          description="İptal edilen kayıtlar"
          color="red"
        />
      </div>

      {/* Finansal İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          description="Toplam beklenen gelir"
          color="emerald"
        />
        <StatCard
          title="Tahsilat"
          value={formatCurrency(stats.collectedRevenue)}
          icon={<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />}
          description="Tahsil edilen miktar"
          color="green"
        />
        <StatCard
          title="Bekleyen Ödeme"
          value={formatCurrency(stats.pendingRevenue)}
          icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          description="Beklenen ödemeler"
          color="amber"
        />
      </div>

      {/* Doluluk Oranı */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doluluk Oranı</h3>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div 
            className="bg-blue-600 h-4 rounded-full" 
            style={{ width: `${stats.occupancyRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Doluluk</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            %{stats.occupancyRate.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Apartman Bazında Dağılım */}
      {stats.registrationsByApartment && Object.keys(stats.registrationsByApartment).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apartman Bazında Dağılım</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.registrationsByApartment).map(([apartment, count]) => (
              <div key={apartment} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-gray-800 dark:text-gray-200">{apartment}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aylık Kayıt Dağılımı */}
      {stats.registrationsByMonth && Object.keys(stats.registrationsByMonth).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart4 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aylık Kayıt Dağılımı</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.registrationsByMonth)
              .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
              .map(([month, count]) => {
                const date = new Date(month);
                const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                const year = date.getFullYear();
                return (
                  <div key={month} className="flex flex-col p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{monthName} {year}</span>
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'green' | 'red' | 'amber' | 'indigo' | 'emerald' | 'purple';
}

const StatCard = ({ title, value, icon, description, color }: StatCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};