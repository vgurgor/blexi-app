'use client';

import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Building2, Calendar, Info, AlertTriangle, DollarSign } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui';
import { apartsApi } from '@/lib/api/apartments';
import { seasonsApi } from '@/lib/api/seasons';
import { useToast } from '@/hooks/useToast';

export default function ApartmentSelectionStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [apartments, setApartments] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const toast = useToast();

  const apartId = watch('apart_id');
  const seasonCode = watch('season_code');
  const checkInDate = watch('check_in_date');
  const checkOutDate = watch('check_out_date');

  // Fetch apartments and seasons on component mount
  useEffect(() => {
    fetchApartments();
    fetchSeasons();
  }, []);

  // Fetch apartment details when apartId changes
  useEffect(() => {
    if (apartId) {
      fetchApartmentDetails(apartId);
    }
  }, [apartId]);

  // Fetch apartments
  const fetchApartments = async () => {
    setIsLoadingApartments(true);
    try {
      const personGender = watch('person')?.gender;
      const response = await apartsApi.getAll({ status: 'active', gender_type: personGender });
      
      if (response.success && response.data) {
        setApartments(response.data);
      } else {
        toast.error('Apartlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast.error('Apartlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingApartments(false);
    }
  };

  // Fetch seasons
  const fetchSeasons = async () => {
    setIsLoadingSeasons(true);
    try {
      const response = await seasonsApi.getAll('active');
      
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        toast.error('Sezonlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      toast.error('Sezonlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  // Fetch apartment details
  const fetchApartmentDetails = async (id: string) => {
    try {
      const response = await apartsApi.getById(id);
      
      if (response.success && response.data) {
        setSelectedApartment(response.data);
      }
    } catch (error) {
      console.error('Error fetching apartment details:', error);
    }
  };

  // Handle check-in/check-out date changes
  const handleDateChange = (field: string, value: string) => {
    setValue(field, value);
    
    // Validate date range
    if (checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      if (endDate <= startDate) {
        toast.error('Çıkış tarihi giriş tarihinden sonra olmalıdır');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Apart ve Sezon Seçimi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafirin kalacağı apartı ve sezon bilgilerini seçin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apartment Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apart*
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="apart_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.apart_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingApartments}
                >
                  <option value="">Apart Seçin</option>
                  {apartments.map((apart) => (
                    <option key={apart.id} value={apart.id}>
                      {apart.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.apart_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.apart_id.message as string}
            </p>
          )}
        </div>

        {/* Season Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sezon*
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="season_code"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.season_code ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingSeasons}
                >
                  <option value="">Sezon Seçin</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.code}>
                      {season.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.season_code && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.season_code.message as string}
            </p>
          )}
        </div>

        {/* Check-in Date */}
        <FormInput
          name="check_in_date"
          label="Giriş Tarihi*"
          type="date"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          onChange={(e) => handleDateChange('check_in_date', e.target.value)}
        />

        {/* Check-out Date */}
        <FormInput
          name="check_out_date"
          label="Çıkış Tarihi*"
          type="date"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          onChange={(e) => handleDateChange('check_out_date', e.target.value)}
        />

        {/* Deposit Amount */}
        <FormInput
          name="deposit_amount"
          label="Depozito Tutarı"
          type="number"
          placeholder="0,00"
          leftIcon={<DollarSign className="w-5 h-5 text-gray-400" />}
          mask={Number}
          maskOptions={{
            scale: 2,
            thousandsSeparator: '.',
            padFractionalZeros: false,
            normalizeZeros: true,
            radix: ',',
            mapToRadix: ['.']
          }}
          value={String(watch('deposit_amount') || '')}
        />

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notlar
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="Eklemek istediğiniz notlar..."
                rows={3}
              />
            )}
          />
        </div>
      </div>

      {/* Selected Apartment Info */}
      {selectedApartment && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Seçilen Apart Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-medium">Adres:</span> {selectedApartment.address}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-medium">Cinsiyet Tipi:</span> {
                  selectedApartment.gender_type === 'MALE' ? 'Erkek' : 
                  selectedApartment.gender_type === 'FEMALE' ? 'Kız' : 'Karma'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-medium">Durum:</span> {
                  selectedApartment.status === 'active' ? 'Aktif' : 'Pasif'
                }
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-medium">Açılış Tarihi:</span> {
                  new Date(selectedApartment.opening_date).toLocaleDateString('tr-TR')
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning for date selection */}
      {checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate) && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Çıkış tarihi giriş tarihinden sonra olmalıdır.
          </p>
        </div>
      )}
    </div>
  );
}