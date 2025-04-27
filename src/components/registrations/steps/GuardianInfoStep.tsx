'use client';

import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { User, Phone, Mail, Calendar, MapPin, Briefcase, Building, Info, Shield } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui';
import { countriesApi } from '@/lib/api/countries';
import { provincesApi } from '@/lib/api/provinces';
import { districtsApi } from '@/lib/api/districts';
import { useToast } from '@/hooks/useToast';

export default function GuardianInfoStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const toast = useToast();

  const isSelfGuardian = watch('is_self_guardian');
  const guestData = watch('guest');
  const guardianCountryId = watch('guardian.country_id');
  const guardianProvinceId = watch('guardian.province_id');

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (guardianCountryId) {
      fetchProvinces(guardianCountryId);
    }
  }, [guardianCountryId]);

  // Fetch districts when province changes
  useEffect(() => {
    if (guardianProvinceId) {
      fetchDistricts(guardianProvinceId);
    }
  }, [guardianProvinceId]);

  // Auto-fill guardian info with guest info when self-guardian is selected
  useEffect(() => {
    if (isSelfGuardian && guestData) {
      // No need to set guardian info as we'll handle this in the API
    }
  }, [isSelfGuardian, guestData]);

  // Fetch countries
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await countriesApi.getAll();
      
      if (response.success && response.data) {
        setCountries(response.data);
        
        // Set default country (Turkey)
        const turkey = response.data.find(country => country.code === 'TR');
        if (turkey) {
          setValue('guardian.country_id', parseInt(turkey.id));
          fetchProvinces(turkey.id);
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
        
        // Set default province if none selected
        if (!watch('guardian.province_id') && response.data.length > 0) {
          // Try to find Istanbul (34) or use the first province
          const istanbul = response.data.find(province => province.id === 34);
          setValue('guardian.province_id', parseInt(istanbul ? istanbul.id : response.data[0].id));
          fetchDistricts(istanbul ? istanbul.id : response.data[0].id);
        }
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
        
        // Set default district if none selected
        if (!watch('guardian.district_id') && response.data.length > 0) {
          setValue('guardian.district_id', parseInt(response.data[0].id));
        }
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
          Veli Bilgileri
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Öğrencinin veli bilgilerini girin veya öğrencinin kendisini veli olarak atayın.
        </p>
      </div>

      {/* Self Guardian Checkbox */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center">
          <Controller
            name="is_self_guardian"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="is_self_guardian"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            )}
          />
          <label htmlFor="is_self_guardian" className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            Öğrenci kendi velisidir
          </label>
        </div>
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          Bu seçenek işaretlendiğinde, öğrenci bilgileri veli olarak da kullanılacaktır.
        </p>
      </div>

      {/* Guardian Form - Only show if not self guardian */}
      {!isSelfGuardian && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guardian Name */}
            <FormInput
              name="guardian.name"
              label="Veli Adı*"
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              placeholder="Veli adı"
            />
            
            {/* Guardian Surname */}
            <FormInput
              name="guardian.surname"
              label="Veli Soyadı*"
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              placeholder="Veli soyadı"
            />
            
            {/* Guardian Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cinsiyet*
              </label>
              <Controller
                name="guardian.gender"
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
              {errors.guardian?.gender && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.guardian.gender.message as string}
                </p>
              )}
            </div>
            
            {/* Guardian Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yakınlık Derecesi*
              </label>
              <Controller
                name="guardian.relationship"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                      errors.guardian?.relationship ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  >
                    <option value="">Seçiniz</option>
                    <option value="MOTHER">Anne</option>
                    <option value="FATHER">Baba</option>
                    <option value="SIBLING">Kardeş</option>
                    <option value="GRANDPARENT">Büyükanne/Büyükbaba</option>
                    <option value="UNCLE_AUNT">Amca/Dayı/Hala/Teyze</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                )}
              />
              {errors.guardian?.relationship && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.guardian.relationship.message as string}
                </p>
              )}
            </div>
            
            {/* Guardian ID Number */}
            <FormInput
              name="guardian.tc_no"
              label="TC Kimlik No*"
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              placeholder="11 haneli TC Kimlik No"
              maxLength={11}
            />
            
            {/* Guardian Phone */}
            <FormInput
              name="guardian.phone"
              label="Telefon*"
              leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
              placeholder="(5XX) XXX XX XX"
              mask="(000) 000 00 00"
            />
            
            {/* Guardian Email */}
            <FormInput
              name="guardian.email"
              label="E-posta"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              placeholder="ornek@email.com"
              type="email"
            />
            
            {/* Guardian Birth Date */}
            <FormInput
              name="guardian.birth_date"
              label="Doğum Tarihi*"
              leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
              type="date"
            />
            
            {/* Guardian Occupation */}
            <FormInput
              name="guardian.occupation"
              label="Meslek"
              leftIcon={<Briefcase className="w-5 h-5 text-gray-400" />}
              placeholder="Meslek"
            />
            
            {/* Guardian Workplace */}
            <FormInput
              name="guardian.workplace"
              label="İş Yeri"
              leftIcon={<Building className="w-5 h-5 text-gray-400" />}
              placeholder="İş yeri"
            />
          </div>

          {/* Guardian Address */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Veli Adres Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ülke*
                </label>
                <Controller
                  name="guardian.country_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isLoadingCountries}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  name="guardian.province_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isLoadingProvinces || !guardianCountryId}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  name="guardian.district_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isLoadingDistricts || !guardianProvinceId}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                name="guardian.neighborhood"
                label="Mahalle"
                leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                placeholder="Mahalle"
              />
              
              {/* Street */}
              <FormInput
                name="guardian.street"
                label="Cadde/Sokak"
                leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                placeholder="Cadde/Sokak"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Building No */}
              <FormInput
                name="guardian.building_no"
                label="Bina No"
                leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                placeholder="Bina No"
              />
              
              {/* Apartment No */}
              <FormInput
                name="guardian.apartment_no"
                label="Daire No"
                leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                placeholder="Daire No"
              />
              
              {/* Postal Code */}
              <FormInput
                name="guardian.postal_code"
                label="Posta Kodu"
                leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                placeholder="Posta Kodu"
              />
            </div>
          </div>
        </div>
      )}

      {/* Self Guardian Info */}
      {isSelfGuardian && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-500 dark:text-green-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Öğrenci Kendi Velisi
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Öğrenci kendi velisi olarak atanacaktır. Öğrenci bilgileri veli bilgileri olarak kullanılacaktır.
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Öğrenci 18 yaşından büyükse kendi velisi olabilir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}