import React from 'react';

interface EmergencyContactCardProps {
  emergencyContact: string | any;
}

export default function EmergencyContactCard({ emergencyContact }: EmergencyContactCardProps) {
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h4 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">Acil Durum İletişim</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          try {
            const contactData = typeof emergencyContact === 'string' 
              ? JSON.parse(emergencyContact)
              : emergencyContact;
            
            return (
              <>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">İsim:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-300">{contactData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Telefon:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-300">{contactData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Yakınlık:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-300">{contactData.relationship}</p>
                </div>
              </>
            );
          } catch (e) {
            return (
              <div className="col-span-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {emergencyContact}
                </p>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}