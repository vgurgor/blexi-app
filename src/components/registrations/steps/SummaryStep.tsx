'use client';

import { useState } from 'react';
import { User, Building2, Calendar, Package, CreditCard, FileText, Check, AlertTriangle, Shield, Bed, DoorOpen } from 'lucide-react';
import { RegistrationFormData } from '../RegistrationWizard';
import { formatCurrency, formatDate } from '@/utils/format';

interface SummaryStepProps {
  data: RegistrationFormData;
}

export default function SummaryStep({ data }: SummaryStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    guest: true,
    guardian: true,
    accommodation: true,
    products: true,
    invoice: true,
  });

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    let total = 0;
    data.products?.forEach(product => {
      total += product.quantity * product.unit_price;
    });
    return total;
  };

  // Get bed type display text
  const getBedTypeDisplay = (bedType: string) => {
    switch (bedType) {
      case 'SINGLE': return 'Tek Kişilik';
      case 'DOUBLE': return 'Çift Kişilik';
      case 'BUNK': return 'Ranza';
      default: return bedType;
    }
  };

  // Get guest type display text
  const getGuestTypeDisplay = (guestType: string) => {
    switch (guestType) {
      case 'STUDENT': return 'Öğrenci';
      case 'EMPLOYEE': return 'Çalışan';
      case 'OTHER': return 'Diğer';
      default: return guestType;
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Kayıt Özeti
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Lütfen kayıt bilgilerini kontrol edin ve onaylayın.
        </p>
      </div>

      {/* Guest Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
          onClick={() => toggleSection('guest')}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Misafir Bilgileri</h3>
          </div>
          <div className={`transform transition-transform ${expandedSections.guest ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.guest && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ad:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Soyad:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.surname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.tc_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefon:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">E-posta:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.birth_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cinsiyet:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {data.guest?.gender === 'MALE' ? 'Erkek' : 'Kadın'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Misafir Tipi:</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getGuestTypeDisplay(data.guest?.guest_type || '')}
                </p>
              </div>
              {data.guest?.guest_type === 'STUDENT' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Eğitim Seviyesi:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.guest?.education_level || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Okul:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.guest?.school_name || '-'}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Acil Durum Kişisi:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.emergency_contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Acil Durum Telefonu:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.guest?.emergency_contact_phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guardian Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
          onClick={() => toggleSection('guardian')}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Veli Bilgileri</h3>
          </div>
          <div className={`transform transition-transform ${expandedSections.guardian ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.guardian && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {data.is_self_guardian ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Misafir kendi velisi olarak atanacak
                </p>
              </div>
            ) : data.guardian ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ad:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Soyad:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.tc_no}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefon:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">E-posta:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.birth_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cinsiyet:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {data.guardian.gender === 'MALE' ? 'Erkek' : 'Kadın'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Yakınlık Derecesi:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.guardian.relationship}</p>
                </div>
                {data.guardian.occupation && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Meslek:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.guardian.occupation}</p>
                  </div>
                )}
                {data.guardian.workplace && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">İş Yeri:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{data.guardian.workplace}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-700 dark:text-amber-300">
                  Veli bilgisi eklenmedi.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accommodation Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
          onClick={() => toggleSection('accommodation')}
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Konaklama Bilgileri</h3>
          </div>
          <div className={`transform transition-transform ${expandedSections.accommodation ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.accommodation && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Yatak ID:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.bed_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sezon Kodu:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.season_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Giriş Tarihi:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.check_in_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Çıkış Tarihi:</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.check_out_date}</p>
              </div>
              {data.deposit_amount && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Depozito Tutarı:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(data.deposit_amount)}</p>
                </div>
              )}
              {data.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notlar:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
          onClick={() => toggleSection('products')}
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Ürünler</h3>
          </div>
          <div className={`transform transition-transform ${expandedSections.products ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.products && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ürün ID</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Miktar</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Birim Fiyat</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.products?.map((product, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.product_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatCurrency(product.unit_price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(product.quantity * product.unit_price)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700/30">
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">Toplam:</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">{formatCurrency(calculateTotal())}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
          onClick={() => toggleSection('invoice')}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Fatura Bilgileri</h3>
          </div>
          <div className={`transform transition-transform ${expandedSections.invoice ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {expandedSections.invoice && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {data.invoice_titles?.map((title, idx) => (
              <div key={idx} className="mb-6 last:mb-0 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Fatura Başlığı {idx + 1} {title.is_default && '(Varsayılan)'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fatura Tipi:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {title.title_type === 'individual' ? 'Bireysel' : 'Kurumsal'}
                    </p>
                  </div>
                  
                  {title.title_type === 'individual' ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {title.first_name} {title.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.identity_number}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Şirket Adı:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vergi Dairesi:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.tax_office}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vergi Numarası:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{title.tax_number}</p>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telefon:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{title.phone}</p>
                  </div>
                  
                  {title.email && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">E-posta:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{title.email}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Confirmation */}
      <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
        <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Kayıt Onayı</h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            Tüm bilgileri kontrol ettikten sonra "Kaydı Tamamla" butonuna tıklayarak işlemi tamamlayabilirsiniz.
            Kayıt tamamlandıktan sonra değişiklik yapmak için ilgili kayıt sayfasını kullanmanız gerekecektir.
          </p>
        </div>
      </div>
    </div>
  );
}