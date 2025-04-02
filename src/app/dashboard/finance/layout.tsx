'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Wallet, 
  Calendar, 
  CreditCard, 
  FileText, 
  DollarSign, 
  BarChart2, 
  Settings,
  ChevronRight,
  Package,
  Percent,
  Tag,
  Coins,
  ArrowLeftRight
} from 'lucide-react';

interface FinanceLayoutProps {
  children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      name: 'Genel Bakış', 
      path: '/dashboard/finance', 
      icon: <BarChart2 className="w-5 h-5" /> 
    },
    { 
      name: 'Sezonlar', 
      path: '/dashboard/finance/seasons', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      name: 'Ürünler', 
      path: '/dashboard/finance/products', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      name: 'Vergi Türleri', 
      path: '/dashboard/finance/tax-types', 
      icon: <Percent className="w-5 h-5" /> 
    },
    { 
      name: 'Fiyatlar', 
      path: '/dashboard/finance/prices', 
      icon: <Tag className="w-5 h-5" /> 
    },
    { 
      name: 'Para Birimleri', 
      path: '/dashboard/finance/currencies', 
      icon: <Coins className="w-5 h-5" /> 
    },
    { 
      name: 'Ödeme Tipleri', 
      path: '/dashboard/finance/payment-types', 
      icon: <CreditCard className="w-5 h-5" /> 
    },
    { 
      name: 'İndirimler', 
      path: '/dashboard/finance/discounts', 
      icon: <Percent className="w-5 h-5" /> 
    },
    { 
      name: 'Ödemeler', 
      path: '/dashboard/finance/payments', 
      icon: <CreditCard className="w-5 h-5" /> 
    },
    { 
      name: 'Faturalar', 
      path: '/dashboard/finance/invoices', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      name: 'Gelir/Gider', 
      path: '/dashboard/finance/transactions', 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    { 
      name: 'Ayarlar', 
      path: '/dashboard/finance/settings', 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
            <Wallet className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            {!collapsed && <span className="ml-2 font-semibold text-gray-900 dark:text-white">Finans Yönetimi</span>}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center' : 'justify-start'
              } p-3 mb-1 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div className={pathname === item.path ? 'text-blue-500 dark:text-blue-400' : ''}>
                {item.icon}
              </div>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}