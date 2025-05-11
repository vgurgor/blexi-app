'use client';

import { useState } from 'react';
import { Bed, Hash } from 'lucide-react';
import { IBed } from '@/types/models';

interface NewBedFormProps {
  onSubmit: (data: Partial<IBed>) => void;
}

export default function NewBedForm({ onSubmit }: NewBedFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    bed_number: '',
    bed_type: 'SINGLE' as 'SINGLE' | 'DOUBLE' | 'BUNK',
    status: 'available' as 'available' | 'occupied' | 'maintenance' | 'reserved'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Yatak adı zorunludur');
      }
      if (!formData.bed_number.trim()) {
        throw new Error('Yatak numarası zorunludur');
      }
      
      onSubmit(formData);
    } catch (error: any) {
      console.error('Form hatası:', error);
      setError(error.message || 'Yatak eklenirken bir hata oluştu');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatak Adı*
          </label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Yatak 1"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatak Numarası*
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.bed_number}
              onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
              placeholder="1A"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatak Tipi*
          </label>
          <select
            value={formData.bed_type}
            onChange={(e) => setFormData({ ...formData, bed_type: e.target.value as 'SINGLE' | 'DOUBLE' | 'BUNK' })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            required
          >
            <option value="SINGLE">Tek Kişilik</option>
            <option value="DOUBLE">Çift Kişilik</option>
            <option value="BUNK">Ranza</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durum*
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'maintenance' | 'reserved' })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            required
          >
            <option value="available">Boş</option>
            <option value="maintenance">Bakımda</option>
            <option value="reserved">Rezerve</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Yatak Ekle
        </button>
      </div>
    </form>
  );
}