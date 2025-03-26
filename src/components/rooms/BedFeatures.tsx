import { useState, useEffect } from 'react';
import { Plus, X, Wifi, Tv, Bed, Home, Coffee, Utensils, ShowerHead as Shower, Wind, Settings } from 'lucide-react';
import { bedsApi } from '@/lib/api/beds';
import { IFeature } from '@/types/models';

interface Feature {
  id: number;
  name: string;
  code: string;
  type: 'ROOM' | 'BED' | 'APART' | 'MIXED';
  status: 'active' | 'inactive';
}

interface BedFeaturesProps {
  bedId: string;
}

export default function BedFeatures({ bedId }: BedFeaturesProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (bedId) {
      fetchBedFeatures();
    }
  }, [bedId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchBedFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await bedsApi.getFeatures(bedId);
      
      if (response.success && response.data) {
        setFeatures(response.data);
      } else {
        console.error('Özellik verileri alınamadı:', response.error);
        setError(response.error || 'Özellikler yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Özellik verileri çekilirken hata oluştu:', error);
      setError('Özellikler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      // This API endpoint should be moved to a features API service in the future
      const response = await fetch('https://api.blexi.co/api/v1/features?per_page=100&status=active');

      const data = await response.json();
      
      if (response.ok) {
        // Filter out features that are already assigned to the bed
        // AND only include features with type 'BED'
        const featureIds = features.map(f => f.id);
        const filtered = data.data.filter((f: Feature) => 
          !featureIds.includes(f.id) && f.type === 'BED'
        );
        setAvailableFeatures(filtered);
      } else {
        console.error('Kullanılabilir özellik verileri alınamadı:', data);
        setError('Kullanılabilir özellikler yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kullanılabilir özellik verileri çekilirken hata oluştu:', error);
      setError('Kullanılabilir özellikler yüklenirken bir hata oluştu.');
    }
  };

  const handleAddFeature = async () => {
    if (!selectedFeature) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await bedsApi.addFeature(bedId, selectedFeature);
      
      if (response.success) {
        setSuccess('Özellik başarıyla eklendi.');
        fetchBedFeatures();
        setShowAddModal(false);
        setSelectedFeature(null);
      } else {
        throw new Error(response.error || 'Özellik eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Özellik ekleme hatası:', error);
      setError(error.message || 'Özellik eklenirken bir hata oluştu');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFeature = async (featureId: number) => {
    setIsRemoving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await bedsApi.removeFeature(bedId, featureId);
      
      if (response.success) {
        setSuccess('Özellik başarıyla kaldırıldı.');
        setFeatures(prev => prev.filter(f => f.id !== featureId));
      } else {
        throw new Error(response.error || 'Özellik kaldırılırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Özellik kaldırma hatası:', error);
      setError(error.message || 'Özellik kaldırılırken bir hata oluştu');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSelectedFeature(null);
    setError('');
    fetchAvailableFeatures();
  };

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ROOM': return 'Oda';
      case 'BED': return 'Yatak';
      case 'APART': return 'Apart';
      case 'MIXED': return 'Karma';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Yatak Özellikleri
        </h3>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Özellik Ekle
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : features.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(feature => {
            const FeatureIcon = getFeatureIcon(feature.type, feature.code);
            return (
              <div 
                key={feature.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <FeatureIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{feature.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTypeLabel(feature.type)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFeature(feature.id)}
                  disabled={isRemoving}
                  className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Bu yatağa henüz özellik eklenmemiş.
        </div>
      )}

      {/* Add Feature Modal */}
      {showAddModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => !isAdding && setShowAddModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Özellik Ekle
                </h3>
                <button
                  onClick={() => !isAdding && setShowAddModal(false)}
                  disabled={isAdding}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Eklenecek Özellik
                    </label>
                    <select
                      value={selectedFeature || ''}
                      onChange={(e) => setSelectedFeature(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isAdding}
                    >
                      <option value="">Özellik Seçin</option>
                      {availableFeatures.map(feature => (
                        <option key={feature.id} value={feature.id}>
                          {feature.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {availableFeatures.length === 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                      Eklenebilecek yatak özelliği bulunamadı. Tüm yatak özellikleri zaten eklenmiş olabilir.
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 text-sm">
                    Not: Sadece "Yatak" tipindeki özellikler listelenmiştir.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddFeature}
                  disabled={isAdding || !selectedFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ekleniyor...</span>
                    </>
                  ) : (
                    <span>Ekle</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}