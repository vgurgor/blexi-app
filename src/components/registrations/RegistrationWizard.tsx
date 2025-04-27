'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Save, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/hooks/useToast';
import GuestInfoStep from './steps/GuestInfoStep';
import GuardianInfoStep from './steps/GuardianInfoStep';
import AccommodationStep from './steps/AccommodationStep';
import PricingStep from './steps/PricingStep';
import InvoiceInfoStep from './steps/InvoiceInfoStep';
import SummaryStep from './steps/SummaryStep';
import WizardProgress from './WizardProgress';

// Define the steps of the wizard
const STEPS = [
  { id: 'guest-info', title: 'Misafir Bilgileri' },
  { id: 'guardian-info', title: 'Veli Bilgileri' },
  { id: 'accommodation', title: 'Konaklama' },
  { id: 'pricing', title: 'Ücret' },
  { id: 'invoice-info', title: 'Fatura Bilgileri' },
  { id: 'summary', title: 'Özet ve Onay' },
];

// Create a schema for the entire form
const registrationSchema = z.object({
  // Guest Info
  guest: z.object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    surname: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    gender: z.enum(['MALE', 'FEMALE']),
    tc_no: z.string().min(11, 'TC Kimlik No 11 karakter olmalıdır').max(11),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
    birth_date: z.string().min(1, 'Doğum tarihi zorunludur'),
    nationality: z.string().default('TR'),
    guest_type: z.enum(['STUDENT', 'EMPLOYEE', 'OTHER']),
    education_level: z.string().optional().or(z.literal('')),
    school_name: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    emergency_contact_name: z.string().min(2, 'Acil durum kişisi adı zorunludur'),
    emergency_contact_phone: z.string().min(10, 'Acil durum kişisi telefonu zorunludur'),
    emergency_contact_relationship: z.string().optional().or(z.literal('')),
    // Address fields
    country_id: z.number().or(z.string().transform(val => Number(val))), // Turkey
    province_id: z.number().or(z.string().transform(val => Number(val))).optional(),
    district_id: z.number().or(z.string().transform(val => Number(val))).optional(),
    neighborhood: z.string().optional().or(z.literal('')),
    street: z.string().optional().or(z.literal('')),
    building_no: z.string().optional().or(z.literal('')),
    apartment_no: z.string().optional().or(z.literal('')),
    postal_code: z.string().optional().or(z.literal('')),
  }),
  
  // Guardian Info
  is_self_guardian: z.boolean().default(false),
  guardian: z.object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').optional(),
    surname: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    relationship: z.string().min(1, 'İlişki türü zorunludur').optional(),
    tc_no: z.string().min(11, 'TC Kimlik No 11 karakter olmalıdır').max(11).optional(),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır').optional(),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
    birth_date: z.string().optional(),
    occupation: z.string().optional().or(z.literal('')),
    workplace: z.string().optional().or(z.literal('')),
    // Address fields
    country_id: z.number().or(z.string().transform(val => Number(val))).optional(), // Turkey
    province_id: z.number().or(z.string().transform(val => Number(val))).optional(),
    district_id: z.number().or(z.string().transform(val => Number(val))).optional(),
    neighborhood: z.string().optional().or(z.literal('')),
    street: z.string().optional().or(z.literal('')),
    building_no: z.string().optional().or(z.literal('')),
    apartment_no: z.string().optional().or(z.literal('')),
    postal_code: z.string().optional().or(z.literal('')),
  }).optional(),
  
  // Accommodation
  bed_id: z.string().min(1, 'Lütfen bir yatak seçin'),
  season_code: z.string().min(1, 'Lütfen bir sezon seçin'),
  check_in_date: z.string().min(1, 'Giriş tarihi zorunludur'),
  check_out_date: z.string().min(1, 'Çıkış tarihi zorunludur'),
  deposit_amount: z.number().optional().or(z.string().transform(val => Number(val))),
  notes: z.string().optional(),
  
  // Pricing
  products: z.array(
    z.object({
      product_id: z.number().or(z.string().transform(val => Number(val))),
      quantity: z.number().min(1, 'Miktar en az 1 olmalıdır').or(z.string().transform(val => Number(val))),
      unit_price: z.number().min(0, 'Birim fiyat 0 veya daha büyük olmalıdır').or(z.string().transform(val => Number(val))),
    })
  ).min(1, 'En az bir ürün seçmelisiniz'),
  
  // Invoice Info
  invoice_titles: z.array(z.object({
    title_type: z.enum(['individual', 'corporate']),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    identity_number: z.string().optional(),
    company_name: z.string().optional(),
    tax_office: z.string().optional(),
    tax_number: z.string().optional(),
    phone: z.string().min(1, 'Telefon zorunludur'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
    is_default: z.boolean().optional(),
    address_data: z.object({
      country_id: z.number().or(z.string().transform(val => Number(val))),
      province_id: z.number().or(z.string().transform(val => Number(val))),
      district_id: z.number().or(z.string().transform(val => Number(val))),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      building_no: z.string().optional(),
      apartment_no: z.string().optional(),
      postal_code: z.string().optional(),
    }).optional(),
  })).min(1, 'En az bir fatura başlığı oluşturmalısınız'),
}).refine(data => {
  // If is_self_guardian is false, guardian info is required
  if (!data.is_self_guardian) {
    return data.guardian && 
           data.guardian.name && 
           data.guardian.surname && 
           data.guardian.gender && 
           data.guardian.tc_no && 
           data.guardian.phone && 
           data.guardian.birth_date && 
           data.guardian.relationship;
  }
  return true;
}, {
  message: "Veli bilgileri zorunludur",
  path: ["guardian"]
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationWizardProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
}

export default function RegistrationWizard({ onSubmit }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    guest: {
      name: '',
      surname: '',
      gender: 'MALE',
      tc_no: '',
      phone: '',
      email: '',
      birth_date: '',
      nationality: 'TR',
      guest_type: 'STUDENT',
      education_level: '',
      school_name: '',
      notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      country_id: '', // Turkey
    },
    is_self_guardian: false,
    guardian: {
      name: '',
      surname: '',
      gender: 'MALE',
      relationship: '',
      tc_no: '',
      phone: '',
      email: '',
      birth_date: '',
      occupation: '',
      workplace: '',
      country_id: '', // Turkey
    },
    products: [],
    invoice_titles: [],
  });
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Create form methods with zod resolver
  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: formData as any,
    mode: 'onChange',
  });

  // Update form data when step changes
  useEffect(() => {
    const subscription = methods.watch((value) => {
      setFormData(current => ({ ...current, ...value }));
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  // Handle next step
  const handleNext = async () => {
    const isValid = await methods.trigger(getFieldsForStep(currentStep));
    
    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = methods.getValues();
      await onSubmit(values as RegistrationFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get fields to validate for the current step
  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0: // Guest Info
        return [
          'guest.name', 
          'guest.surname', 
          'guest.gender', 
          'guest.tc_no', 
          'guest.phone', 
          'guest.birth_date', 
          'guest.guest_type',
          'guest.emergency_contact_name',
          'guest.emergency_contact_phone'
        ];
      case 1: // Guardian Info
        return formData.is_self_guardian 
          ? ['is_self_guardian'] 
          : [
              'is_self_guardian',
              'guardian.name', 
              'guardian.surname', 
              'guardian.gender', 
              'guardian.relationship', 
              'guardian.tc_no', 
              'guardian.phone', 
              'guardian.birth_date'
            ];
      case 2: // Accommodation
        return ['bed_id', 'season_code', 'check_in_date', 'check_out_date'];
      case 3: // Pricing
        return ['products'];
      case 4: // Invoice Info
        return ['invoice_titles'];
      default:
        return [];
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <GuestInfoStep />;
      case 1:
        return <GuardianInfoStep />;
      case 2:
        return <AccommodationStep />;
      case 3:
        return <PricingStep />;
      case 4:
        return <InvoiceInfoStep />;
      case 5:
        return <SummaryStep data={formData as RegistrationFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Progress Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <WizardProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Form */}
      <FormProvider {...methods}>
        <form className="p-6">
          {renderStep()}
        </form>
      </FormProvider>

      {/* Navigation Buttons */}
      <div className="flex justify-between p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
          variant="secondary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Geri
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          variant="primary"
          rightIcon={currentStep < STEPS.length - 1 ? <ArrowRight className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          isLoading={isSubmitting}
        >
          {currentStep < STEPS.length - 1 ? 'Devam' : 'Kaydı Tamamla'}
        </Button>
      </div>
    </div>
  );
}