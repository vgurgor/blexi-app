'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText 
} from 'lucide-react';

export default function FinanceDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid) {
          router.replace('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAuth, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Toplam Gelir',
      value: '₺248,500',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
    },
    {
      title: 'Toplam Gider',
      value: '₺85,200',
      change: '+3.2%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6 text-red-500" />,
      color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    },
    {
      title: 'Net Kar',
      value: '₺163,300',
      change: '+18.3%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
    },
    {
      title: 'Bekleyen Ödemeler',
      value: '₺42,800',
      change: '-5.1%',
      trend: 'down',
      icon: <CreditCard className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
    }
  ];

  const quickLinks = [
    {
      title: 'Sezonlar',
      description: 'Sezon yönetimi ve fiyatlandırma',
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      path: '/dashboard/finance/seasons'
    },
    {
      title: 'Ödemeler',
      description: 'Ödeme işlemleri ve takibi',
      icon: <CreditCard className="w-6 h-6 text-green-500" />,
      path: '/dashboard/finance/payments'
    },
    {
      title: 'Faturalar',
      description: 'Fatura oluşturma ve yönetimi',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      path: '/dashboard/finance/invoices'
    },
    {
      title: 'Raporlar',
      description: 'Finansal raporlar ve analizler',
      icon: <BarChart2 className="w-6 h-6 text-amber-500" />,
      path: '/dashboard/finance/reports'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Finans Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Finansal verileri görüntüleyin, analiz edin ve yönetin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center ${
                stat.trend === 'up' 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {stat.trend === 'up' 
                  ? <TrendingUp className="w-4 h-4 mr-1" /> 
                  : <TrendingDown className="w-4 h-4 mr-1" />
                }
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Hızlı Erişim
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickLinks.map((link, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(link.path)}
          >
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                {link.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {link.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {link.description}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Son İşlemler
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İşlem
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tarih
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tutar
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { id: 1, name: 'Kira Ödemesi - Ahmet Yılmaz', date: '15 Mayıs 2025', amount: '₺3,500', status: 'Tamamlandı', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
              { id: 2, name: 'Depozito - Ayşe Kaya', date: '12 Mayıs 2025', amount: '₺2,000', status: 'Tamamlandı', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
              { id: 3, name: 'Elektrik Faturası', date: '10 Mayıs 2025', amount: '₺850', status: 'Beklemede', statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
              { id: 4, name: 'Su Faturası', date: '8 Mayıs 2025', amount: '₺320', status: 'Tamamlandı', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
              { id: 5, name: 'İnternet Faturası', date: '5 Mayıs 2025', amount: '₺450', status: 'Tamamlandı', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
            ].map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.statusColor}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}