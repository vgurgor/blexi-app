import React from 'react';
import { User, MapPin, Phone, Mail, Calendar, GraduationCap, School, Flag, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import EmergencyContactCard from './EmergencyContactCard';
import { useState } from 'react';

interface StudentInfoSectionProps {
  registration: ISeasonRegistration;
}

export default function StudentInfoSection({ registration }: StudentInfoSectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div></div>
  );
}