import { Wifi, Tv, Bed, Home, Coffee, Utensils, ShowerHead as Shower, Wind, Settings } from 'lucide-react';

import { ApartFeature } from '@/lib/api/apartments';

interface ApartmentFeaturesListProps {
  features: ApartFeature[];
  isLoading: boolean;
}

export default function ApartmentFeaturesList({ features, isLoading }: ApartmentFeaturesListProps) {
  const getFeatureIcon = (type: string, code: string) => {
    // Based on common feature codes, return an appropriate icon
    if (code.includes('WIFI') || code.includes('INTERNET')) return Wifi;
    if (code.includes('TV')) return Tv;
    if (code.includes('BED')) return Bed;
    if (code.includes('KITCHEN') || code.includes('MUTFAK')) return Utensils;
    if (code.includes('COFFEE') || code.includes('KAHVE')) return Coffee;
    if (code.includes('SHOWER') || code.includes('DUS')) return Shower;
    if (code.includes('AC') || code.includes('KLIMA')) return Wind;
    
    // Default icons based on type
    switch (type) {
      case 'ROOM': return Bed;
      case 'BED': return Bed;
      case 'APART': return Home;
      default: return Settings;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Bu aparta henüz özellik eklenmemiş.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {features.map(feature => {
        const FeatureIcon = getFeatureIcon(feature.type, feature.code);
        return (
          <div 
            key={feature.id}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            <FeatureIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>{feature.name}</span>
          </div>
        );
      })}
    </div>
  );
}