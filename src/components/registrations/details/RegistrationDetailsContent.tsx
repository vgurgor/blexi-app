import React from 'react';
import { User, Building2, MapPin } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import { formatCurrency } from '@/utils/format';
import StudentInfoSection from './StudentInfoSection';
import AccommodationInfoSection from './AccommodationInfoSection';

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
    </div>
  );
}