'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Briefcase, Save, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormCheckbox, FormSelect } from '@/components/ui';
import { Button } from '@/components/ui/atoms/Button';
import { peopleApi } from '@/lib/api/people';
import { guestsApi } from '@/lib/api/guests';
import { guardiansApi } from '@/lib/api/guardians';
import { countriesApi } from '@/lib/api/countries';
import { provincesApi } from '@/lib/api/provinces';
import { districtsApi } from '@/lib/api/districts';
import { useToast } from '@/hooks/useToast';
import PageLoader from '@/components/PageLoader';

// Create a schema for the form
const studentSchema = z.object({
  name: z.string().min(3, 'Ad en az 3 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  gender: z.enum(['MALE', 'FEMALE'], { 
    required_error: 'Cinsiyet seçimi zorunludur',
    invalid_type_error: 'Cinsiyet MALE veya FEMALE olmalıdır'
  }),
  tc_no: z.string().min(11, 'TC Kimlik No 11 karakter olmalıdır').max(11),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  birth_date: z.string().min(1, 'Doğum tarihi zorunludur'),
  address: z.string().optional().or(z.literal('')),
  country_id: z.string().min(1, 'Ülke seçimi zorunludur'),
  province_id: z.string().min(1, 'İl seçimi zorunludur'),
  district_id: z.string().min(1, 'İlçe seçimi zorunludur'),
  neighborhood: z.string().optional().or(z.literal('')),
  street: z.string().optional().or(z.literal('')),
  building_no: z.string().optional().or(z.literal('')),
  apartment_no: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  guest_type: z.enum(['STUDENT', 'EMPLOYEE', 'OTHER']).default('STUDENT'),
  profession_department: z.string().optional().or(z.literal('')),
  is_self_guardian: z.boolean().default(false),
  guardian_relationship: z.string().optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Address selection state
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      guest_type: 'STUDENT',
      is_self_guardian: false,
      gender: 'MALE',
    }
  });

  const countryId = watch('country_id');
  const provinceId = watch('province_id');

  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid) {
          router.replace('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAuth, router]);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (countryId) {
      fetchProvinces(countryId);
      // Reset province and district when country changes
      setValue('province_id', '');
      setValue('district_id', '');
      setDistricts([]);
    }
  }, [countryId, setValue]);

  // Fetch districts when province changes
  useEffect(() => {
    if (provinceId) {
      fetchDistricts(provinceId);
      // Reset district when province changes
      setValue('district_id', '');
    }
  }, [provinceId, setValue]);

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
          setValue('country_id', turkey.id);
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

  // Update formatted address when address components change
  const updateFormattedAddress = () => {
    const countryId = watch('country_id');
    const provinceId = watch('province_id');
    const districtId = watch('district_id');
    const neighborhood = watch('neighborhood');
    const street = watch('street');
    const buildingNo = watch('building_no');
    const apartmentNo = watch('apartment_no');
    
    // Get district, province and country names
    const district = districts.find(d => d.id === districtId)?.name || '';
    const province = provinces.find(p => p.id === provinceId)?.name || '';
    const country = countries.find(c => c.id === countryId)?.name || '';
    
    // Build formatted address
    let formattedAddress = '';
    
    if (street) formattedAddress += street;
    if (buildingNo) formattedAddress += ` No:${buildingNo}`;
    if (apartmentNo) formattedAddress += ` Daire:${apartmentNo}`;
    if (neighborhood) formattedAddress += `, ${neighborhood}`;
    if (district) formattedAddress += `, ${district}`;
    if (province) formattedAddress += `, ${province}`;
    if (country) formattedAddress += `, ${country}`;
    
    // Update address field
    setValue('address', formattedAddress);
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);

    try {
      // Update formatted address before submission
      updateFormattedAddress();

      // First create the person
      const personData = {
        name: data.name,
        surname: data.surname,
        gender: data.gender,
        tc_no: data.tc_no,
        phone: data.phone,
        email: data.email,
        birth_date: data.birth_date,
        city: '',
        // Create proper address object structure
        address: {
          country_id: parseInt(data.country_id),
          province_id: parseInt(data.province_id),
          district_id: parseInt(data.district_id),
          neighborhood: data.neighborhood || undefined,
          street: data.street || undefined,
          building_no: data.building_no || undefined,
          apartment_no: data.apartment_no || undefined,
          postal_code: data.postal_code || undefined,
          address_type: 'home' as const,
          is_default: true,
          status: 'active' as const
        }
      };

      const personResponse = await peopleApi.create(personData);
      
      if (!personResponse.success || !personResponse.data) {
        throw new Error(personResponse.error || 'Kişi oluşturulurken bir hata oluştu');
      }
      
      // Then create the guest (student)
      const guestData = {
        person_id: parseInt(personResponse.data.id),
        guest_type: data.guest_type,
        profession_department: data.profession_department,
      };
      
      const guestResponse = await guestsApi.create(guestData);

      if (!guestResponse.success || !guestResponse.data) {
        throw new Error(guestResponse.error || 'Öğrenci kaydı oluşturulurken bir hata oluştu');
      }

      // If self guardian is checked, create a guardian record
      if (data.is_self_guardian) {
        const guardianData = {
          person_id: parseInt(personResponse.data.id),
          guest_id: parseInt(guestResponse.data.id),
          relationship: 'SELF',
          is_self: true,
          is_emergency_contact: true,
          valid_from: new Date().toISOString().split('T')[0],
        };
        
        const guardianResponse = await guardiansApi.create(guardianData);
        
        if (!guardianResponse.success) {
          toast.warning('Öğrenci kaydı oluşturuldu ancak veli kaydı oluşturulurken bir hata oluştu');
        }
      }
      
      toast.success('Öğrenci başarıyla oluşturuldu');
      
      // Redirect to student list
      router.push('/dashboard/students');
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast.error(error.message || 'Öğrenci oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {isSubmitting && <PageLoader />}
      <div className="min-h-screen p-8 animate-slideLeft">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Öğrenci Ekle
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Ad"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Soyad*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('surname')}
                      type="text"
                      placeholder="Soyad"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.surname ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.surname && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.surname.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cinsiyet*
                  </label>
                  <select
                    {...register('gender')}
                    className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                      errors.gender ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  >
                    <option value="MALE">Erkek</option>
                    <option value="FEMALE">Kadın</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    TC Kimlik No*
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('tc_no')}
                      type="text"
                      placeholder="11 haneli TC Kimlik No"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.tc_no ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.tc_no && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tc_no.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon*
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('phone')}
                      type="text"
                      placeholder="+90 555 123 4567"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="ornek@email.com"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Doğum Tarihi*
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('birth_date')}
                      type="date"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.birth_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                    />
                  </div>
                  {errors.birth_date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birth_date.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Öğrenci Tipi
                  </label>
                  <select
                    {...register('guest_type')}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  >
                    <option value="STUDENT">Öğrenci</option>
                    <option value="EMPLOYEE">Çalışan</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {watch('guest_type') === 'STUDENT' ? 'Bölüm/Fakülte' : 'Çalıştığı Kurum/Departman'}
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('profession_department')}
                      type="text"
                      placeholder={watch('guest_type') === 'STUDENT' ? 'Örn: Bilgisayar Mühendisliği' : 'Örn: ABC Şirketi / Muhasebe'}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Adres Bilgileri</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ülke*
                    </label>
                    <select
                      {...register('country_id')}
                      className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.country_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                      disabled={isLoadingCountries}
                      onChange={(e) => {
                        setValue('country_id', e.target.value);
                        updateFormattedAddress();
                      }}
                    >
                      <option value="">Ülke Seçin</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country_id.message}</p>
                    )}
                  </div>
                  
                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İl*
                    </label>
                    <select
                      {...register('province_id')}
                      className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.province_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                      disabled={isLoadingProvinces || !countryId}
                      onChange={(e) => {
                        setValue('province_id', e.target.value);
                        updateFormattedAddress();
                      }}
                    >
                      <option value="">İl Seçin</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.province_id.message}</p>
                    )}
                    {!countryId && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Önce bir ülke seçmelisiniz
                      </p>
                    )}
                  </div>
                  
                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İlçe*
                    </label>
                    <select
                      {...register('district_id')}
                      className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border ${
                        errors.district_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                      disabled={isLoadingDistricts || !provinceId}
                      onChange={(e) => {
                        setValue('district_id', e.target.value);
                        updateFormattedAddress();
                      }}
                    >
                      <option value="">İlçe Seçin</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.district_id.message}</p>
                    )}
                    {!provinceId && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Önce bir il seçmelisiniz
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Neighborhood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mahalle
                    </label>
                    <input
                      {...register('neighborhood')}
                      type="text"
                      placeholder="Mahalle"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onChange={(e) => {
                        setValue('neighborhood', e.target.value);
                        updateFormattedAddress();
                      }}
                    />
                  </div>
                  
                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cadde/Sokak
                    </label>
                    <input
                      {...register('street')}
                      type="text"
                      placeholder="Cadde/Sokak"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onChange={(e) => {
                        setValue('street', e.target.value);
                        updateFormattedAddress();
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Building No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bina No
                    </label>
                    <input
                      {...register('building_no')}
                      type="text"
                      placeholder="Bina No"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onChange={(e) => {
                        setValue('building_no', e.target.value);
                        updateFormattedAddress();
                      }}
                    />
                  </div>
                  
                  {/* Apartment No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daire No
                    </label>
                    <input
                      {...register('apartment_no')}
                      type="text"
                      placeholder="Daire No"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onChange={(e) => {
                        setValue('apartment_no', e.target.value);
                        updateFormattedAddress();
                      }}
                    />
                  </div>
                  
                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      {...register('postal_code')}
                      type="text"
                      placeholder="Posta Kodu"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      onChange={(e) => {
                        setValue('postal_code', e.target.value);
                        updateFormattedAddress();
                      }}
                    />
                  </div>
                </div>
                
                {/* Formatted Address (Read-only) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tam Adres
                  </label>
                  <textarea
                    {...register('address')}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    rows={3}
                    readOnly
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Veli Bilgileri</h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      {...register('is_self_guardian')}
                      type="checkbox"
                      id="is_self_guardian"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="is_self_guardian" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kendisi veli olarak atansın
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Misafir kendi velisi olarak atanır (18 yaş üstü için)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  isLoading={isSubmitting}
                >
                  Öğrenci Kaydet
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}