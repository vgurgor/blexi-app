'use client';

import { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Mail, FileText, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/authExport';
import { firmsApi, FirmDto, UpdateFirmRequest } from '@/lib/api/firms';

interface EditCompanyFormProps {
  company: FirmDto;
  onSubmit: (data: any) => void;
}

export default function EditCompanyForm({ company, onSubmit }: EditCompanyFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<UpdateFirmRequest>({
    name: '',
    tax_number: '',
    address: '',
    phone: '',
    email: '',
    tax_office: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch company details if not provided completely
    const fetchCompanyDetails = async () => {
      setIsLoading(true);
      try {
        const response = await firmsApi.getById(company.id);
        
        if (response.success && response.data) {
          setFormData({
            name: response.data.name || '',
            tax_number: response.data.taxNumber || '',
            address: response.data.address || '',
            phone: response.data.phone || '',
            email: response.data.email || '',
            tax_office: response.data.taxOffice || '',
            status: response.data.status || 'active'
          });
        } else {
          console.error('Firma detayları alınamadı:', response.error);
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

    // Log initial data for debugging
    console.log('Başlangıç firma verisi:', company);
    console.log('Form verileri:', formData);

    // If tax_number is missing, fetch complete details
    if (!company.tax_number) {
      fetchCompanyDetails();
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Gönderilecek form verisi:', formData);
    
    // Form doğrulaması
    if (!formData.tax_number || formData.tax_number.trim() === '') {
      setError('Vergi numarası boş olamaz.');
      return;
    }
    
    try {
      // FormData'yı direkt API'ye gönder, API dönüşümü yapacak
      const response = await firmsApi.update(company.id, formData as unknown as FormData);
      
      if (!response.success) {
        throw new Error(response.error || 'Firma güncellenirken bir hata oluştu');
      }
      
      console.log('Güncellenmiş firma yanıtı:', response);
      
      // Eğer data tanımlı değilse veya id yoksa, orijinal company bilgisini kullan
      const updatedData = (response.data && response.data.id) ? response.data : {
        ...company,
        // Formdan gelen değerleri ekle
        name: formData.name,
        tax_number: formData.tax_number,
        tax_office: formData.tax_office || "",
        address: formData.address || "",
        phone: formData.phone || "",
        email: formData.email || "",
        status: formData.status
      };
      
      console.log('Güncellenmiş firma verisi:', updatedData);
      onSubmit(updatedData);
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
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