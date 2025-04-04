'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Save, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/hooks/useToast';
import GuestInfoStep from './steps/GuestInfoStep';
import ApartmentSelectionStep from './steps/ApartmentSelectionStep';
import ProductSelectionStep from './steps/ProductSelectionStep';
import PaymentPlanStep from './steps/PaymentPlanStep';
import InvoiceInfoStep from './steps/InvoiceInfoStep';
import SummaryStep from './steps/SummaryStep';
import WizardProgress from './WizardProgress';

// Define the steps of the wizard
const STEPS = [
  { id: 'guest-info', title: 'Misafir Bilgileri' },
  { id: 'apartment-selection', title: 'Apart ve Sezon Seçimi' },
  { id: 'product-selection', title: 'Ürün Seçimi' },
  { id: 'payment-plan', title: 'Ödeme Planı' },
  { id: 'invoice-info', title: 'Fatura Bilgileri' },
  { id: 'summary', title: 'Özet ve Onay' },
];

// Create a schema for the entire form
const registrationSchema = z.object({
  // Guest Info
  guest_id: z.string().optional(),
  person: z.object({
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
    address: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  guest_type: z.enum(['STUDENT', 'EMPLOYEE', 'OTHER']),
  profession_department: z.string().optional(),
  is_self_guardian: z.boolean().optional(),
  guardian_relationship: z.string().optional(),
  
  // Apartment Selection
  apart_id: z.string().min(1, 'Lütfen bir apart seçin'),
  season_code: z.string().min(1, 'Lütfen bir sezon seçin'),
  check_in_date: z.string().min(1, 'Giriş tarihi zorunludur'),
  check_out_date: z.string().min(1, 'Çıkış tarihi zorunludur'),
  deposit_amount: z.number().optional(),
  notes: z.string().optional(),
  
  // Product Selection
  products: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
    unit_price: z.number().min(0, 'Birim fiyat 0 veya daha büyük olmalıdır'),
  })).min(1, 'En az bir ürün seçmelisiniz'),
  
  // Payment Plan
  payment_plans: z.array(z.object({
    planned_amount: z.number().min(1, 'Planlanan tutar en az 1 olmalıdır'),
    planned_date: z.string().min(1, 'Planlanan tarih zorunludur'),
    planned_payment_type_id: z.number(),
    is_deposit: z.boolean().optional(),
  })).min(1, 'En az bir ödeme planı oluşturmalısınız'),
  
  // Invoice Info
  invoice_titles: z.array(z.object({
    title_type: z.enum(['individual', 'corporate']),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    identity_number: z.string().optional(),
    company_name: z.string().optional(),
    tax_office: z.string().optional(),
    tax_number: z.string().optional(),
    address: z.string().min(1, 'Adres zorunludur'),
    phone: z.string().min(1, 'Telefon zorunludur'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
    is_default: z.boolean().optional(),
    address_data: z.object({
      country_id: z.number(),
      province_id: z.number(),
      district_id: z.number(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      building_no: z.string().optional(),
      apartment_no: z.string().optional(),
      postal_code: z.string().optional(),
    }).optional(),
  })).min(1, 'En az bir fatura başlığı oluşturmalısınız'),
  
  // Discounts (optional)
  discounts: z.array(z.object({
    discount_rule_id: z.number(),
    product_id: z.number(),
  })).optional(),
  
  // Guardians (optional)
  guardians: z.array(z.object({
    person_id: z.number(),
    relationship: z.string(),
    is_self: z.boolean().optional(),
    is_emergency_contact: z.boolean().optional(),
    valid_from: z.string(),
    notes: z.string().optional(),
  })).optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationWizardProps {
  onSubmit: (data: RegistrationFormData) => Promise<void>;
}

export default function RegistrationWizard({ onSubmit }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    guest_type: 'STUDENT',
    is_self_guardian: false,
    products: [],
    payment_plans: [],
    invoice_titles: [],
    discounts: [],
    guardians: [],
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
      
      // If self guardian is checked, add to guardians array
      if (values.is_self_guardian && values.person && values.guest_id) {
        const personId = parseInt(values.person.id || '0');
        if (!values.guardians) {
          values.guardians = [];
        }
        
        // Only add if not already in the array
        if (!values.guardians.some(g => g.is_self)) {
          values.guardians.push({
            person_id: personId,
            relationship: 'SELF',
            is_self: true,
            is_emergency_contact: true,
            valid_from: new Date().toISOString().split('T')[0],
          });
        }
      }
      
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
        return ['guest_id', 'person.name', 'person.surname', 'person.gender', 'person.tc_no', 'person.phone', 'person.birth_date', 'guest_type'];
      case 1: // Apartment Selection
        return ['apart_id', 'season_code', 'check_in_date', 'check_out_date'];
      case 2: // Product Selection
        return ['products'];
      case 3: // Payment Plan
        return ['payment_plans'];
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
        return <ApartmentSelectionStep />;
      case 2:
        return <ProductSelectionStep />;
      case 3:
        return <PaymentPlanStep />;
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