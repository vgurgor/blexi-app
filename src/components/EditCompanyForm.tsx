'use client';

import { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, FileText, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Company {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string;
  tax_office: string | null;
  status: 'active' | 'inactive';
}

interface EditCompanyFormProps {
  company: Company;
  onSubmit: (data: any) => void;
}

export default function EditCompanyForm({ company, onSubmit }: EditCompanyFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    tax_number: '',
    address: '',
    phone: '',
    email: '',
    tax_office: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch company details if not provided completely
    const fetchCompanyDetails = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.blexi.co/api/v1/firms/${company.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          setFormData({
            name: data.data.name || '',
            tax_number: data.data.tax_number || '',
            address: data.data.address || '',
            phone: data.data.phone || '',
            email: data.data.email || '',
            tax_office: data.data.tax_office || '',
            status: data.data.status || 'active'
          });
        } else {
          console.error('Firma detayları alınamadı:', data);
          setError('Firma bilgileri yüklenirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('Firma detayları çekilirken hata oluştu:', error);
        setError('Firma bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize form with provided company data
    setFormData({
      name: company.name || '',
      tax_number: company.tax_number || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      tax_office: company.tax_office || '',
      status: company.status || 'active'
    });

    // If tax_number is missing, fetch complete details
    if (!company.tax_number) {
      fetchCompanyDetails();
    }
  }, [company, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/firms/${company.id}`, {
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
        throw new Error(data.message || 'Firma güncellenirken bir hata oluştu');
      }
      
      onSubmit(data.data);
    } catch (error: any) {
      console.error('Firma güncelleme hatası:', error);
      setError(error.message || 'Firma güncellenirken bir hata oluştu');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Firma Adı*
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örnek Firma A.Ş."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vergi Numarası*
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tax_number}
              onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              placeholder="1234567890"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vergi Dairesi
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tax_office}
              onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
              placeholder="Kadıköy Vergi Dairesi"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adres
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Örnek Mah. Test Sok. No:1 Kadıköy/İstanbul"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Telefon
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+90 555 123 4567"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-posta
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@ornekfirma.com"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
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
  );
}