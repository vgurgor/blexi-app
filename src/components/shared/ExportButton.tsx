import React, { useState } from 'react';
import { Download, FileSpreadsheet, File as FilePdf, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';

interface ExportButtonProps {
  onExport: (format: 'excel' | 'pdf' | 'csv') => void;
  isDisabled?: boolean;
}

export default function ExportButton({ onExport, isDisabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        leftIcon={<Download className="w-5 h-5" />}
        rightIcon={<ChevronDown className="w-4 h-4" />}
        disabled={isDisabled}
      >
        Dışa Aktar
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-1">
              <button 
                onClick={() => handleExport('excel')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel'e Aktar
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FilePdf className="w-4 h-4 mr-2" />
                PDF'e Aktar
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV'ye Aktar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}