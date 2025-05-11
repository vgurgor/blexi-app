'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, ArrowRight, Save, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import PageLoader from '@/components/PageLoader';
import { Button } from '@/components/ui/atoms/Button';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import RegistrationWizard from '@/components/registrations/RegistrationWizard';

export default function NewStudentRegistrationPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const toast = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setRegistrationData(data);
    
    try {
      // Prepare the data for the streamlined API
      const streamlinedData = {
        guest: {
          tc_id: data.guest.tc_no,
          first_name: data.guest.name,
          last_name: data.guest.surname,
          birth_date: data.guest.birth_date,
          gender: data.guest.gender.toLowerCase(),
          nationality: data.guest.nationality || 'TR',
          guest_type: data.guest.guest_type.toLowerCase(),
          education_level: data.guest.education_level,
          school_name: data.guest.school_name,
          phone: data.guest.phone,
          email: data.guest.email || '',
          special_notes: data.guest.notes,
          emergency_contact: {
            name: data.guest.emergency_contact_name,
            phone: data.guest.emergency_contact_phone,
            relationship: data.guest.emergency_contact_relationship || 'Diğer',
          },
          address: data.guest.address || {
            country_id: 1, // Default to Turkey
            province_id: data.guest.province_id || 34, // Default to Istanbul
            district_id: data.guest.district_id || 1,
            neighborhood: data.guest.neighborhood,
            street: data.guest.street,
            building_no: data.guest.building_no,
            apartment_no: data.guest.apartment_no,
            postal_code: data.guest.postal_code,
          },
        },
        is_self_guardian: data.is_self_guardian,
        guardian: !data.is_self_guardian ? {
          tc_id: data.guardian.tc_no,
          first_name: data.guardian.name,
          last_name: data.guardian.surname,
          birth_date: data.guardian.birth_date,
          gender: data.guardian.gender.toLowerCase(),
          relationship_type: data.guardian.relationship,
          phone: data.guardian.phone,
          email: data.guardian.email || '',
          occupation: data.guardian.occupation,
          workplace: data.guardian.workplace,
          address: data.guardian.address || {
            country_id:1, // Default to Turkey
            province_id: data.guardian.province_id || 34, // Default to Istanbul
            district_id: data.guardian.district_id || 1,
            neighborhood: data.guardian.neighborhood,
            street: data.guardian.street,
            building_no: data.guardian.building_no,
            apartment_no: data.guardian.apartment_no,
            postal_code: data.guardian.postal_code,
          },
        } : undefined,
        bed_id: parseInt(data.bed_id),
        season_code: data.season_code,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        deposit_amount: data.deposit_amount || 0,
        notes: data.notes || '',
        payment_plans: [],
        products: data.products.map((product: any) => ({
          product_id: parseInt(product.product_id),
          quantity: parseInt(product.quantity),
        })),
        invoice_titles: data.invoice_titles.map((title: any) => ({
          title_type: title.title_type,
          first_name: title.first_name,
          last_name: title.last_name,
          identity_number: title.identity_number,
          company_name: title.company_name,
          tax_office: title.tax_office,
          tax_number: title.tax_number,
          phone: title.phone,
          email: title.email || '',
          is_default: title.is_default || false,
          address: {
            country_id: title.address_data?.country_id || 1,
            province_id: title.address_data?.province_id || 34,
            district_id: title.address_data?.district_id || 1,
            neighborhood: title.address_data?.neighborhood,
            street: title.address_data?.street,
            building_no: title.address_data?.building_no,
            apartment_no: title.address_data?.apartment_no,
            postal_code: title.address_data?.postal_code,
          },
        })),
      };
      
      // Submit the streamlined registration data to the API
      const response = await seasonRegistrationsApi.createStreamlined(streamlinedData);
      
      if (response.success && response.data) {
        setIsCompleted(true);
        toast.success('Öğrenci kaydı başarıyla oluşturuldu!');
      } else {
        toast.error(response.error || 'Öğrenci kaydı oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Öğrenci kaydı oluşturma hatası:', error);
      toast.error(error.message || 'Öğrenci kaydı oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToList = () => {
    router.push('/dashboard/students/registrations');
  };

  const handleCreateNew = () => {
    setRegistrationData(null);
    setIsCompleted(false);
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Öğrenci Kaydı
            </h1>
          </div>

          {isCompleted ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Öğrenci Kaydı Başarıyla Oluşturuldu!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Öğrenci kaydı başarıyla oluşturuldu. Kayıt listesine giderek detayları görüntüleyebilir veya yeni bir kayıt oluşturabilirsiniz.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleGoToList}
                  variant="primary"
                >
                  Öğrenci Kayıtları Listesine Git
                </Button>
                <Button 
                  onClick={handleCreateNew}
                  variant="secondary"
                >
                  Yeni Öğrenci Kaydı Oluştur
                </Button>
              </div>
            </div>
          ) : (
            <RegistrationWizard onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </>
  );
}