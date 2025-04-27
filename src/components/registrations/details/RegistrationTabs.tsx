import React from 'react';

interface RegistrationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'details', label: 'Genel Bilgiler' },
  { id: 'products', label: 'Ürünler' },
  { id: 'payments', label: 'Ödeme Planı' },
  { id: 'invoices', label: 'Faturalar' },
  { id: 'guardian', label: 'Veli Bilgileri' },
];

export default function RegistrationTabs({ activeTab, setActiveTab }: RegistrationTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}