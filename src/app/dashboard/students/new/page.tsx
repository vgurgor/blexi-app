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
  city: z.string().optional().or(z.literal('')),
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

  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      guest_type: 'STUDENT',
      is_self_guardian: false,
      gender: 'MALE',
    }
  });

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

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    
    try {
      // First create the person
      const personData = {
        name: data.name,
        surname: data.surname,
        gender: data.gender,
        tc_no: data.tc_no,
        phone: data.phone,
        email: data.email,
        birth_date: data.birth_date,
        address: data.address,
        city: data.city,
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
      
      if (!guestResponse.success) {
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adres
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('address')}
                      type="text"
                      placeholder="Adres"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şehir
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="Şehir"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                  </div>
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