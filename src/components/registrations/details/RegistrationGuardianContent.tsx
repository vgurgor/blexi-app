import React from 'react';
import { Shield } from 'lucide-react';
import { ISeasonRegistration } from '@/types/models';
import GuardianCard from './GuardianCard';

interface RegistrationGuardianContentProps {
  registration: ISeasonRegistration;
}

export default function RegistrationGuardianContent({ registration }: RegistrationGuardianContentProps) {
  // Note: ISeasonRegistration's guest property doesn't include guardians
  // in the interface, but may be present in the runtime data
  const guestAny = registration.guest as any;
  const guardians = guestAny?.guardians || [];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Veli Bilgileri
      </h3>

      {guardians.length > 0 ? (
        <div className="space-y-6">
          {guardians.map((guardian: any) => (
            <GuardianCard key={guardian.id} guardian={guardian} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Bu kayıt için henüz veli bilgisi bulunmamaktadır.
        </div>
      )}
    </div>
  );
}