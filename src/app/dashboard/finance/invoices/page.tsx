'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

export default function InvoicesPage() {
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

  // Mock invoice data
  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2025-001',
      studentName: 'Ahmet Yılmaz',
      amount: '₺3,500',
      date: '15 Mayıs 2025',
      status: 'Ödendi',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2025-002',
      studentName: 'Ayşe Kaya',
      amount: '₺2,000',
      date: '12 Mayıs 2025',
      status: 'Ödendi',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2025-003',
      studentName: 'Mehmet Demir',
      amount: '₺1,500',
      date: '10 Mayıs 2025',
      status: 'Beklemede',
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2025-004',
      studentName: 'Zeynep Şahin',
      amount: '₺3,200',
      date: '8 Mayıs 2025',
      status: 'Ödendi',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    {
      id: 5,
      invoiceNumber: 'INV-2025-005',
      studentName: 'Ali Yıldız',
      amount: '₺2,800',
      date: '5 Mayıs 2025',
      status: 'İptal Edildi',
      statusColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Fatura Yönetimi
        </h1>
        <button 
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Fatura</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Fatura ara..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="paid">Ödendi</option>
            <option value="pending">Beklemede</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
          
          <input
            type="month"
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filtreler</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fatura No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Öğrenci
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tutar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.studentName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="flex-shrink-0 mr-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.amount}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.statusColor}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="İndir"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Düzenle"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="İptal Et"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            className="px-3 py-1 rounded-md bg-blue-500 text-white"
          >
            1
          </button>
          
          <button
            className="px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            2
          </button>
          
          <button
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  );
}