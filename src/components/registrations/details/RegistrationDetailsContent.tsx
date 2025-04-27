import React from 'react';
import { User, Building2, MapPin, Calendar, DollarSign, FileText, Tag, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import { formatCurrency } from '@/utils/format';
import StudentInfoSection from './StudentInfoSection';
import AccommodationInfoSection from './AccommodationInfoSection';
import { Button } from '@/components/ui/atoms/Button';

interface RegistrationDetailsContentProps {
  registration: ISeasonRegistration;
}

export default function RegistrationDetailsContent({ registration }: RegistrationDetailsContentProps) {
  return (
    <div className="space-y-8">
      {/* Student Information */}
      <StudentInfoSection registration={registration} />

      {/* Accommodation Information */}
      <AccommodationInfoSection registration={registration} />
      
      {/* Financial Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Finansal Özet
        </h3>
        
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ürün
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Brüt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İndirim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Net
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ödenen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kalan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Eğitim/İlköğretim</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">6.SINIF</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Aktif
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(619200)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(276047)}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">%44.6</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(343153)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(98381)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(244772)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Kırtasiye/İlköğretim</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">6.SINIF</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Aktif
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(61500)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(24750)}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">%40.2</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(36750)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(36750)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Öğle Yemeği/İlköğretim</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">6.SINIF</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Aktif
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(240000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(128000)}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">%53.3</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(112000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(112000)}
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700/50 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  TOPLAM
                </td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(920700)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                  {formatCurrency(428797)}
                  <div className="text-xs text-gray-500 dark:text-gray-400">%46.6</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(491903)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(98381)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(393522)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Ödeme Planı
        </h3>
        
        <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tutar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ödenen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kalan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="bg-green-50 dark:bg-green-900/10">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">07 Ocak 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(98381)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(98381)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(0)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Şubat 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Mart 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">07 Nisan 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Mayıs 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Haziran 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">07 Temmuz 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Ağustos 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49191)}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">05 Eylül 2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49185)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(49185)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ödeme Özeti</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(491903)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ödenen:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(98381)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kalan:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(393522)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ödeme Durumu:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">%20 Tamamlandı</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ödeme Bilgileri</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Son Ödeme:</span>
              <span className="font-medium text-gray-900 dark:text-white">07 Ocak 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Son Ödeme Tutarı:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(98381)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sonraki Ödeme:</span>
              <span className="font-medium text-gray-900 dark:text-white">05 Şubat 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sonraki Ödeme Tutarı:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(49191)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h4>
          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full justify-center"
              leftIcon={<DollarSign className="w-4 h-4" />}
            >
              Ödeme Al
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-center"
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Fatura Oluştur
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-center"
              leftIcon={<Tag className="w-4 h-4" />}
            >
              İndirim Uygula
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notes and Additional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notlar ve Ek Bilgiler</h4>
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kayıt Notları</h5>
            <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
              {registration.notes || 'Bu kayıt için not bulunmamaktadır.'}
            </p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ödeme Geçmişi</h5>
            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">07 Ocak 2025 - {formatCurrency(98381)} - Kredi Kartı</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kayıt Durumu</h5>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Aktif
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Kayıt Tarihi: {new Date(registration.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}