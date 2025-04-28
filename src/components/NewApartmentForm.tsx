'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Wifi, Building, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/authExport';
import { apartsApi, CreateApartRequest } from '@/lib/api/apartments';
import { firmsApi, FirmDto } from '@/lib/api/firms';
import { IApartment } from '@/types/models';

interface Firm {
  id: number;
  name: string;
}

export default function NewApartmentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firm_id: '',
    name: '',
    address: '',
    gender_type: 'MIXED' as 'MALE' | 'FEMALE' | 'MIXED',
    opening_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });
  const [firms, setFirms] = useState<FirmDto[]>([]);
  const [isLoadingFirms, setIsLoadingFirms] = useState(false);
  const [error, setError] = useState('');
  const [newApartmentId, setNewApartmentId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchFirms = async () => {
      setIsLoadingFirms(true);
      try {
        const response = await firmsApi.getAll({ per_page: 100 });
        
        if (response.success && response.data) {
          setFirms(response.data);
        } else {
          console.error('Firma verileri alınamadı:', response.error);
        }
      } catch (error) {
        console.error('Firma verileri çekilirken hata oluştu:', error);
      } finally {
        setIsLoadingFirms(false);
      }
    };

    fetchFirms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Prepare API request data
      const apartmentData: CreateApartRequest = {
        name: formData.name,
        address: formData.address,
        firm_id: parseInt(formData.firm_id, 10),
        gender_type: formData.gender_type,
        opening_date: formData.opening_date,
        status: formData.status
      };
      
      const response = await apartsApi.create(apartmentData);
      
      if (!response.success) {
        throw new Error(response.error || 'Apart eklenirken bir hata oluştu');
      }
      
      setNewApartmentId(parseInt(response.data.id, 10));
      setIsSubmitted(true);
      onSubmit(response.data);
    } catch (error: any) {
      console.error('Apart ekleme hatası:', error);
      setError(error.message || 'Apart eklenirken bir hata oluştu');
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
            Firma*
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.firm_id}
              onChange={(e) => setFormData({ ...formData, firm_id: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isLoadingFirms || isSubmitted}
            >
              <option value="">Firma Seçin</option>
              {firms.map((firm) => (
                <option key={firm.id} value={firm.id}>
                  {firm.name}
                </option>
              ))}
            </select>
          </div>
          {isLoadingFirms && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Firmalar yükleniyor...</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apart Adı*
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="A Blok"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitted}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adres*
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Üniversite Cad. No:1"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitted}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cinsiyet Tipi*
          </label>
          <select
            value={formData.gender_type}
            onChange={(e) => setFormData({ ...formData, gender_type: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            required
            disabled={isSubmitted}
          >
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kız</option>
            <option value="MIXED">Karma</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Açılış Tarihi*
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.opening_date}
              onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitted}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durum*
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            required
            disabled={isSubmitted}
          >
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {!isSubmitted ? (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Apart Ekle
          </button>
        ) : newApartmentId && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
            Apart başarıyla eklendi. Şimdi özellikler ekleyebilirsiniz.
          </div>
        )}
      </div>
      
      {isSubmitted && newApartmentId && (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Apart Özellikleri
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <ApartmentFeatures apartmentId={newApartmentId} />
          </div>
        </div>
      )}
    </form>
  );
}

// Import ApartmentFeatures component
import ApartmentFeatures from './ApartmentFeatures';