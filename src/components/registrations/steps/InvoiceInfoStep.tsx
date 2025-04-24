'use client';

import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Building, User, Phone, Mail, MapPin, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { FormInput } from '@/components/ui';
import { countriesApi } from '@/lib/api/countries';
import { provincesApi } from '@/lib/api/provinces';
import { districtsApi } from '@/lib/api/districts';
import { useToast } from '@/hooks/useToast';

export default function InvoiceInfoStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoice_titles',
  });
  
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const toast = useToast();

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
    
    // Add a default invoice title if none exists
    if (fields.length === 0) {
      handleAddInvoiceTitle();
    }
  }, []);

  // Convert text to uppercase with Turkish character support
  const toUpperCase = (text: string): string => {
    if (!text) return '';
    return text.toLocaleUpperCase('tr-TR');
  };

  // Fetch countries
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await countriesApi.getAll();
      
      if (response.success && response.data) {
        setCountries(response.data);
        
        // Set default country (Turkey)
        const turkey = response.data.find(country => country.code === 'TUR');
        if (turkey) {
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
  const fetchProvinces = async (countryId: string) => {
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
  const fetchDistricts = async (provinceId: string) => {
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

  // Add a new invoice title
  const handleAddInvoiceTitle = () => {
    // Find default country (Turkey)
    const turkey = countries.find(country => country.code === 'TR');
    
    append({
      title_type: 'individual',
      first_name: '',
      last_name: '',
      identity_number: '',
      company_name: '',
      tax_office: '',
      tax_number: '',
      address: '',
      phone: '',
      email: '',
      is_default: fields.length === 0, // First one is default
      address_data: {
        country_id: turkey ? parseInt(turkey.id) : undefined,
        province_id: '',
        district_id: '',
        neighborhood: '',
        street: '',
        building_no: '',
        apartment_no: '',
        postal_code: '',
      },
    });
  };

  // Handle country change
  const handleCountryChange = (index: number, countryId: number) => {
    setValue(`invoice_titles.${index}.address_data.country_id`, countryId);
    setValue(`invoice_titles.${index}.address_data.province_id`, '');
    setValue(`invoice_titles.${index}.address_data.district_id`, '');
    fetchProvinces(countryId.toString());
  };

  // Handle province change
  const handleProvinceChange = (index: number, provinceId: number) => {
    setValue(`invoice_titles.${index}.address_data.province_id`, provinceId);
    setValue(`invoice_titles.${index}.address_data.district_id`, '');
    fetchDistricts(provinceId.toString());
  };

  // Update formatted address when address components change
  const updateFormattedAddress = (index: number) => {
    const addressData = watch(`invoice_titles.${index}.address_data`);
    
    if (!addressData) return;
    
    const { neighborhood, street, building_no, apartment_no } = addressData;
    
    // Get district, province and country names
    const district = districts.find(d => d.id === addressData.district_id?.toString())?.name || '';
    const province = provinces.find(p => p.id === addressData.province_id?.toString())?.name || '';
    const country = countries.find(c => c.id === addressData.country_id?.toString())?.name || '';
    
    // Build formatted address
    let formattedAddress = '';
    
    if (street) formattedAddress += street;
    if (building_no) formattedAddress += ` No:${building_no}`;
    if (apartment_no) formattedAddress += ` Daire:${apartment_no}`;
    if (neighborhood) formattedAddress += `, ${neighborhood}`;
    if (district) formattedAddress += `, ${district}`;
    if (province) formattedAddress += `, ${province}`;
    if (country) formattedAddress += `, ${country}`;
    
    // Update address field
    setValue(`invoice_titles.${index}.address`, formattedAddress);
  };

  // Handle input change with uppercase conversion
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    setValue(fieldName, toUpperCase(value));
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    
    // Format the phone number
    let formattedValue = '';
    if (digits.length > 0) {
      formattedValue = '(';
      if (digits.length > 0) {
        formattedValue += digits.substring(0, 3);
      }
      if (digits.length > 3) {
        formattedValue += ') ' + digits.substring(3, 6);
      }
      if (digits.length > 6) {
        formattedValue += ' ' + digits.substring(6, 8);
      }
      if (digits.length > 8) {
        formattedValue += ' ' + digits.substring(8, 10);
      }
    }
    
    return formattedValue;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Fatura Bilgileri
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fatura için gerekli bilgileri girin.
        </p>
      </div>

      {/* Invoice Titles */}
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Fatura Başlığı {index + 1}
              </h3>
              
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Title Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fatura Tipi*
              </label>
              <Controller
                name={`invoice_titles.${index}.title_type`}
                control={control}
                render={({ field }) => (
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'individual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                      <input
                        type="radio"
                        {...field}
                        value="individual"
                        checked={field.value === 'individual'}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'individual' ? 'border-blue-500' : 'border-gray-400'}`}>
                        {field.value === 'individual' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <span className={field.value === 'individual' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Bireysel</span>
                    </label>
                    
                    <label className={`flex items-center gap-2 p-3 rounded-lg border ${field.value === 'corporate' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} cursor-pointer`}>
                      <input
                        type="radio"
                        {...field}
                        value="corporate"
                        checked={field.value === 'corporate'}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${field.value === 'corporate' ? 'border-blue-500' : 'border-gray-400'}`}>
                        {field.value === 'corporate' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <span className={field.value === 'corporate' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}>Kurumsal</span>
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Individual or Corporate Fields */}
            {watch(`invoice_titles.${index}.title_type`) === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.first_name`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Ad"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.first_name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => handleInputChange(e, `invoice_titles.${index}.first_name`)}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.first_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.first_name?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Soyad*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.last_name`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Soyad"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.last_name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => handleInputChange(e, `invoice_titles.${index}.last_name`)}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.last_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.last_name?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    TC Kimlik No*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.identity_number`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="TC Kimlik No"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.identity_number ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.identity_number && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.identity_number?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon*
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.phone`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          placeholder="(5XX) XXX XX XX"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => {
                            // Format phone number
                            field.onChange(formatPhoneNumber(e.target.value));
                          }}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.phone?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.email`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          placeholder="E-posta"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.email?.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şirket Adı*
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.company_name`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Şirket Adı"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.company_name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => handleInputChange(e, `invoice_titles.${index}.company_name`)}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.company_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.company_name?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vergi Dairesi*
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.tax_office`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Vergi Dairesi"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.tax_office ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => handleInputChange(e, `invoice_titles.${index}.tax_office`)}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.tax_office && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.tax_office?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vergi Numarası*
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.tax_number`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Vergi Numarası"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.tax_number ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.tax_number && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.tax_number?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon*
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.phone`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          placeholder="(5XX) XXX XX XX"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                          onChange={(e) => {
                            // Format phone number
                            field.onChange(formatPhoneNumber(e.target.value));
                          }}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.phone?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Controller
                      name={`invoice_titles.${index}.email`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          placeholder="E-posta"
                          className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                            errors.invoice_titles?.[index]?.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                          } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        />
                      )}
                    />
                    {errors.invoice_titles?.[index]?.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.invoice_titles?.[index]?.email?.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Structured Address */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Adres Bilgileri
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ülke*
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.country_id`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        disabled={isLoadingCountries}
                        onChange={(e) => {
                          const countryId = parseInt(e.target.value);
                          field.onChange(countryId);
                          handleCountryChange(index, countryId);
                        }}
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
                    name={`invoice_titles.${index}.address_data.province_id`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        disabled={isLoadingProvinces || !watch(`invoice_titles.${index}.address_data.country_id`)}
                        onChange={(e) => {
                          const provinceId = parseInt(e.target.value);
                          field.onChange(provinceId);
                          handleProvinceChange(index, provinceId);
                        }}
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
                    name={`invoice_titles.${index}.address_data.district_id`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        disabled={isLoadingDistricts || !watch(`invoice_titles.${index}.address_data.province_id`)}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                          updateFormattedAddress(index);
                        }}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Neighborhood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mahalle
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.neighborhood`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Mahalle"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        onChange={(e) => {
                          handleInputChange(e, `invoice_titles.${index}.address_data.neighborhood`);
                          updateFormattedAddress(index);
                        }}
                      />
                    )}
                  />
                </div>
                
                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cadde/Sokak
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.street`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Cadde/Sokak"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        onChange={(e) => {
                          handleInputChange(e, `invoice_titles.${index}.address_data.street`);
                          updateFormattedAddress(index);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Building No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bina No
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.building_no`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Bina No"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateFormattedAddress(index);
                        }}
                      />
                    )}
                  />
                </div>
                
                {/* Apartment No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daire No
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.apartment_no`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Daire No"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateFormattedAddress(index);
                        }}
                      />
                    )}
                  />
                </div>
                
                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Posta Kodu
                  </label>
                  <Controller
                    name={`invoice_titles.${index}.address_data.postal_code`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Posta Kodu"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateFormattedAddress(index);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Formatted Address (Read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tam Adres*
              </label>
              <Controller
                name={`invoice_titles.${index}.address`}
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    rows={3}
                  />
                )}
              />
              {errors.invoice_titles?.[index]?.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.invoice_titles?.[index]?.address?.message as string}
                </p>
              )}
            </div>

            {/* Is Default Checkbox */}
            <div className="flex items-center">
              <Controller
                name={`invoice_titles.${index}.is_default`}
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                )}
              />
              <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Varsayılan fatura adresi olarak ayarla
              </label>
            </div>
          </div>
        ))}

        {/* Add Invoice Title Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAddInvoiceTitle}
            variant="secondary"
            leftIcon={<Plus className="w-4 h-4" />}
            type="button"
          >
            Fatura Başlığı Ekle
          </Button>
        </div>

        {/* Error message if no invoice titles */}
        {errors.invoice_titles && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.invoice_titles.message as string}
          </p>
        )}
      </div>
    </div>
  );
}