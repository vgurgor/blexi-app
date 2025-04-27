import React from 'react';

interface InvoiceTitlesListProps {
  invoiceTitles: any[];
}

export default function InvoiceTitlesList({ invoiceTitles }: InvoiceTitlesListProps) {
  if (invoiceTitles.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Bu kayıt için henüz fatura başlığı bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {invoiceTitles.map((title) => (
        <div key={title.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-medium text-gray-900 dark:text-white">
              {title.titleType === 'individual' 
                ? `${title.firstName} ${title.lastName}`
                : title.companyName}
            </h5>
            {title.isDefault && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                Varsayılan
              </span>
            )}
          </div>
          
          {title.titleType === 'corporate' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium">Vergi Dairesi:</span> {title.taxOffice}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium">Vergi No:</span> {title.taxNumber}
              </p>
            </>
          )}
          
          {title.titleType === 'individual' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span className="font-medium">TC Kimlik No:</span> {title.identityNumber}
            </p>
          )}
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium">Telefon:</span> {title.phone}
          </p>
          
          {title.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span className="font-medium">E-posta:</span> {title.email}
            </p>
          )}
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span className="font-medium">Adres:</span> {title.address}
          </p>
        </div>
      ))}
    </div>
  );
}