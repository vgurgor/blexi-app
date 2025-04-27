import React from 'react';

interface RegistrationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'details', label: 'Genel Bilgiler' },
  { id: 'products', label: 'Ürünler ve Hizmetler' },
  { id: 'payments', label: 'Ödemeler' },
  { id: 'invoices', label: 'Faturalar ve Belgeler' },
  { id: 'guardian', label: 'Veli/Vasi Bilgileri' },
  { id: 'notes', label: 'Notlar ve Tarihçe' },
];

export default function RegistrationTabs({ activeTab, setActiveTab }: RegistrationTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto bg-white dark:bg-gray-800 rounded-t-xl">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/20'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}