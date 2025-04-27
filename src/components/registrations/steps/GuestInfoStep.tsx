'use client';

import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { User, Phone, Mail, Calendar, MapPin, Briefcase, Building, Info, Users } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui';
import { countriesApi } from '@/lib/api/countries';
import { provincesApi } from '@/lib/api/provinces';
import { districtsApi } from '@/lib/api/districts';
import { useToast } from '@/hooks/useToast';

export default function GuestInfoStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const toast = useToast();

  const guestType = watch('guest.guest_type');
  const countryId = watch('guest.country_id');
  const provinceId = watch('guest.province_id');

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (countryId) {
      fetchProvinces(countryId);
      // Clear province and district selection when country changes
      setValue('guest.province_id', '');
      setValue('guest.district_id', '');
      setProvinces([]);
      setDistricts([]);
    }
  }, [countryId, setValue]);

  // Fetch districts when province changes
  useEffect(() => {
    if (provinceId) {
      fetchDistricts(provinceId);
      // Clear district selection when province changes
      setValue('guest.district_id', '');
      setDistricts([]);
    }
  }, [provinceId, setValue]);

  // Fetch countries
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await countriesApi.getAll();
      
      if (response.success && response.data) {
        setCountries(response.data);
        
        // Set default country (Turkey) if not already set
        if (!watch('guest.country_id')) {
          const turkey = response.data.find(country => country.code === 'TR');
          if (turkey) {
            setValue('guest.country_id', turkey.id);
          }
        }
      } else {
        toast.error('Ülkeler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Ülkeler yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Fetch provinces for a country
  const fetchProvinces = async (countryId: string | number) => {
    setIsLoadingProvinces(true);
    try {
      const response = await countriesApi.getProvinces(countryId);
      
      if (response.success && response.data) {
        setProvinces(response.data);
      } else {
        toast.error('İller yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      toast.error('İller yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  // Fetch districts for a province
  const fetchDistricts = async (provinceId: string | number) => {
    setIsLoadingDistricts(true);
    try {
      const response = await provincesApi.getDistricts(provinceId);
      
      if (response.success && response.data) {
        setDistricts(response.data);
      } else {
        toast.error('İlçeler yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('İlçeler yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Misafir Bilgileri
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafirin kişisel bilgilerini ve iletişim bilgilerini girin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Name */}
        <FormInput
          name="guest.name"
          label="Ad*"
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
          placeholder="Ad"
        />
        
        {/* Guest Surname */}
        <FormInput
          name="guest.surname"
          label="Soyad*"
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
          placeholder="Soyad"
        />
        
        {/* Guest Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cinsiyet*
          </label>
          <Controller
            name="guest.gender"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'MALE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                  <input
                    type="radio"
                    {...field}
                    value="MALE"
                    checked={field.value === 'MALE'}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'MALE' ? 'border-blue-500' : 'border-gray-400'}`}>
                    {field.value === 'MALE' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                  </div>
                  <span className={field.value === 'MALE' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Erkek</span>
                </label>
                
                <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'FEMALE' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                  <input
                    type="radio"
                    {...field}
                    value="FEMALE"
                    checked={field.value === 'FEMALE'}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'FEMALE' ? 'border-blue-500' : 'border-gray-400'}`}>
                    {field.value === 'FEMALE' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                  </div>
                  <span className={field.value === 'FEMALE' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Kadın</span>
                </label>
              </div>
            )}
          />
          {errors.guest?.gender && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.guest.gender.message as string}
            </p>
          )}
        </div>
        
        {/* Guest ID Number */}
        <FormInput
          name="guest.tc_no"
          label="TC Kimlik No*"
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
          placeholder="11 haneli TC Kimlik No"
          maxLength={11}
        />
        
        {/* Guest Phone */}
        <FormInput
          name="guest.phone"
          label="Telefon*"
          leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
          placeholder="(5XX) XXX XX XX"
          mask="(000) 000 00 00"
        />
        
        {/* Guest Email */}
        <FormInput
          name="guest.email"
          label="E-posta"
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          placeholder="ornek@email.com"
          type="email"
        />
        
        {/* Guest Birth Date */}
        <FormInput
          name="guest.birth_date"
          label="Doğum Tarihi*"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          type="date"
        />
        
        {/* Guest Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Misafir Tipi*
          </label>
          <Controller
            name="guest.guest_type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                  errors.guest?.guest_type ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
              >
                <option value="STUDENT">Öğrenci</option>
                <option value="EMPLOYEE">Çalışan</option>
                <option value="OTHER">Diğer</option>
              </select>
            )}
          />
          {errors.guest?.guest_type && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.guest.guest_type.message as string}
            </p>
          )}
        </div>
        
        {/* Education Level - Only show for students */}
        {guestType === 'STUDENT' && (
          <FormInput
            name="guest.education_level"
            label="Eğitim Seviyesi"
            leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
            placeholder="Lisans, Yüksek Lisans, vb."
          />
        )}
        
        {/* School Name - Only show for students */}
        {guestType === 'STUDENT' && (
          <FormInput
            name="guest.school_name"
            label="Okul Adı"
            leftIcon={<Building className="w-5 h-5 text-gray-400" />}
            placeholder="Okul adı"
          />
        )}
        
        {/* Workplace - Only show for employees */}
        {guestType === 'EMPLOYEE' && (
          <FormInput
            name="guest.workplace"
            label="Çalıştığı Yer"
            leftIcon={<Building className="w-5 h-5 text-gray-400" />}
            placeholder="Çalıştığı yer"
          />
        )}
        
        {/* Emergency Contact Name */}
        <FormInput
          name="guest.emergency_contact_name"
          label="Acil Durum Kişisi Adı*"
          leftIcon={<User className="w-5 h-5 text-gray-400" />}
          placeholder="Acil durum kişisi adı"
        />
        
        {/* Emergency Contact Phone */}
        <FormInput
          name="guest.emergency_contact_phone"
          label="Acil Durum Kişisi Telefonu*"
          leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
          placeholder="(5XX) XXX XX XX"
          mask="(000) 000 00 00"
        />
        
        {/* Emergency Contact Relationship */}
        <FormInput
          name="guest.emergency_contact_relationship"
          label="Acil Durum Kişisi Yakınlık"
          leftIcon={<Users className="w-5 h-5 text-gray-400" />}
          placeholder="Anne, Baba, Kardeş, vb."
        />
      </div>

      {/* Guest Address */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Adres Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ülke*
            </label>
            <Controller
              name="guest.country_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  disabled={isLoadingCountries}
                >
                  <option value="">Ülke Seçin</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          
          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İl*
            </label>
            <Controller
              name="guest.province_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  disabled={isLoadingProvinces || !countryId}
                >
                  <option value="">İl Seçin</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          
          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İlçe*
            </label>
            <Controller
              name="guest.district_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  disabled={isLoadingDistricts || !provinceId}
                >
                  <option value="">İlçe Seçin</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Neighborhood */}
          <FormInput
            name="guest.neighborhood"
            label="Mahalle"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Mahalle"
          />
          
          {/* Street */}
          <FormInput
            name="guest.street"
            label="Cadde/Sokak"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Cadde/Sokak"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Building No */}
          <FormInput
            name="guest.building_no"
            label="Bina No"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Bina No"
          />
          
          {/* Apartment No */}
          <FormInput
            name="guest.apartment_no"
            label="Daire No"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Daire No"
          />
          
          {/* Postal Code */}
          <FormInput
            name="guest.postal_code"
            label="Posta Kodu"
            leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
            placeholder="Posta Kodu"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notlar
        </label>
        <Controller
          name="guest.notes"
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
  );
}