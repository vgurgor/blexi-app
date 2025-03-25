'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Wifi, Building, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import ApartmentFeatures from './ApartmentFeatures';

interface Firm {
  id: number;
  name: string;
}

interface Apartment {
  id: number;
  firm_id: number;
  name: string;
  address: string;
  gender_type: string;
  opening_date: string;
  status: string;
}

interface EditApartmentFormProps {
  apartment: Apartment;
  onSubmit: (data: any) => void;
}

export default function EditApartmentForm({ apartment, onSubmit }: EditApartmentFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firm_id: '',
    name: '',
    address: '',
    gender_type: 'MIXED',
    opening_date: '',
    status: 'active'
  });
  const [firms, setFirms] = useState<Firm[]>([]);
  const [isLoadingFirms, setIsLoadingFirms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'features'>('details');

  useEffect(() => {
    const fetchFirms = async () => {
      if (!token) return;
      
      setIsLoadingFirms(true);
      try {
        const response = await fetch('https://api.blexi.co/api/v1/firms?per_page=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          setFirms(data.data);
        } else {
          console.error('Firma verileri alınamadı:', data);
        }
      } catch (error) {
        console.error('Firma verileri çekilirken hata oluştu:', error);
      } finally {
        setIsLoadingFirms(false);
      }
    };

    fetchFirms();
  }, [token]);

  useEffect(() => {
    // Fetch apartment details if not provided completely
    const fetchApartmentDetails = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.blexi.co/api/v1/aparts/${apartment.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          setFormData({
            firm_id: data.data.firm_id.toString(),
            name: data.data.name,
            address: data.data.address,
            gender_type: data.data.gender_type,
            opening_date: data.data.opening_date,
            status: data.data.status
          });
        } else {
          console.error('Apart detayları alınamadı:', data);
          setError('Apart bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Apart detayları çekilirken hata oluştu:', error);
        setError('Apart bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize form with provided apartment data
    setFormData({
      firm_id: apartment.firm_id.toString(),
      name: apartment.name,
      address: apartment.address,
      gender_type: apartment.gender_type,
      opening_date: apartment.opening_date,
      status: apartment.status
    });

    // If some data is missing, fetch complete details
    if (!apartment.gender_type) {
      fetchApartmentDetails();
    }
  }, [apartment, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/aparts/${apartment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Apart güncellenirken bir hata oluştu');
      }
      
      onSubmit(data.data);
    } catch (error: any) {
      console.error('Apart güncelleme hatası:', error);
      setError(error.message || 'Apart güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Apart Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'features'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Özellikler
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {activeTab === 'details' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoadingFirms}
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
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      ) : (
        <ApartmentFeatures apartmentId={apartment.id} />
      )}
    </div>
  );
}