'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { ArrowLeft, Plus, Building2, Tag, Package, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { apartsApi, ApartDto } from '@/lib/api/apartments';

interface InventoryItem {
  id: number;
  tenant_id: number;
  apart_id: number | null;
  bed_id: number | null;
  assignable_type: string | null;
  assignable_id: number | null;
  item_type: string;
  status: string;
  tracking_number: string;
  brand: string | null;
  model: string | null;
  purchase_date: string;
  warranty_end: string | null;
  created_at: string;
  updated_at: string;
}

export default function ApartmentInventoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [apartment, setApartment] = useState<ApartDto | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const fetchApartmentAndInventory = async () => {
      setIsLoading(true);
      try {
        // Fetch apartment details using the API service
        const apartId = parseInt(params.id, 10);
        const apartmentResponse = await apartsApi.getById(apartId);

        if (!apartmentResponse.success || !apartmentResponse.data) {
          throw new Error(apartmentResponse.error || 'Apart bilgileri yüklenirken bir hata oluştu.');
        }

        setApartment(apartmentResponse.data as ApartDto);

        // Use the dedicated endpoint for apartment inventory
        const inventoryResponse = await apartsApi.getInventory(apartId);

        if (!inventoryResponse.success) {
          throw new Error(inventoryResponse.error || 'Envanter bilgileri yüklenirken bir hata oluştu.');
        }

        setInventory(inventoryResponse.data);
      } catch (error: any) {
        console.error('Veri çekilirken hata oluştu:', error);
        setError(error.message || 'Bilgiler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchApartmentAndInventory();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchAvailableInventory = async () => {
    if (!token) return;
    
    try {
      // Get inventory items that are in storage (available to be assigned)
      const response = await fetch(`https://api.blexi.co/api/v1/inventory?assigned=false&per_page=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setAvailableInventory(data.data);
      } else {
        console.error('Kullanılabilir envanter verileri alınamadı:', data);
        setError('Kullanılabilir envanter yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kullanılabilir envanter verileri çekilirken hata oluştu:', error);
      setError('Kullanılabilir envanter yüklenirken bir hata oluştu.');
    }
  };

  const handleAssignInventory = async () => {
    if (!token || !selectedItem) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Using the dedicated assignment endpoint
      const response = await fetch(`https://api.blexi.co/api/v1/inventory/${selectedItem}/assign-to-apart/${params.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Get the updated item
        const updatedItem = availableInventory.find(item => item.id === selectedItem);
        if (updatedItem) {
          // Add to apartment inventory
          setInventory(prev => [...prev, {
            ...updatedItem,
            status: 'in_use',
            assignable_type: 'App\\Modules\\Apart\\Models\\Apart',
            assignable_id: parseInt(params.id)
          }]);
        }
        
        setSuccess('Envanter başarıyla aparta atandı.');
        setShowAddForm(false);
        setSelectedItem(null);
      } else {
        throw new Error(data.message || 'Envanter atanırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Envanter atama hatası:', error);
      setError(error.message || 'Envanter atanırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignInventory = async () => {
    if (!token || !itemToDelete) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Using the dedicated unassign endpoint
      const response = await fetch(`https://api.blexi.co/api/v1/inventory/${itemToDelete}/unassign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove from apartment inventory
        setInventory(prev => prev.filter(item => item.id !== itemToDelete));
        setSuccess('Envanter başarıyla aparttan kaldırıldı.');
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        throw new Error(data.message || 'Envanter kaldırılırken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Envanter kaldırma hatası:', error);
      setError(error.message || 'Envanter kaldırılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setSelectedItem(null);
    setError('');
    fetchAvailableInventory();
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'furniture': return 'Mobilya';
      case 'appliance': return 'Beyaz Eşya';
      case 'linen': return 'Tekstil';
      case 'electronic': return 'Elektronik';
      case 'kitchenware': return 'Mutfak Eşyası';
      case 'decoration': return 'Dekorasyon';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_use': return 'Kullanımda';
      case 'in_storage': return 'Depoda';
      case 'maintenance': return 'Bakımda';
      case 'disposed': return 'Kullanım Dışı';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in_use': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'in_storage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_use': return CheckCircle;
      case 'in_storage': return Package;
      case 'maintenance': return AlertCircle;
      case 'disposed': return Trash2;
      default: return Clock;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hata
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Apart bulunamadı.</p>
      </div>
    );
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
              {apartment.name} - Envanter
            </h1>
          </div>

          {/* Apartment Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Apart Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">Adres: {apartment.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Tip: {apartment.gender_type === 'MALE' ? 'Erkek' : apartment.gender_type === 'FEMALE' ? 'Kız' : 'Karma'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/dashboard/apartments/${params.id}/edit`)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Detaylar</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Add Inventory Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Apart Envanteri
            </h2>
            <button
              onClick={() => showAddForm ? setShowAddForm(false) : handleOpenAddForm()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {showAddForm ? (
                <>
                  <span>İptal</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Envanter Ekle</span>
                </>
              )}
            </button>
          </div>

          {success && (
            <div className="p-3 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Add Inventory Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aparta Envanter Ekle
              </h3>
              
              {error && (
                <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Eklenecek Envanter
                  </label>
                  <select
                    value={selectedItem || ''}
                    onChange={(e) => setSelectedItem(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  >
                    <option value="">Envanter Seçin</option>
                    {availableInventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.tracking_number} - {item.brand} {item.model} ({getItemTypeLabel(item.item_type)})
                      </option>
                    ))}
                  </select>
                </div>

                {availableInventory.length === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                    Eklenebilecek kullanılabilir envanter bulunamadı. Önce yeni envanter oluşturmanız gerekebilir.
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAssignInventory}
                    disabled={!selectedItem}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Aparta Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inventory List */}
          {inventory.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Takip No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tür</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marka/Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {inventory.map(item => {
                    const StatusIcon = getStatusIcon(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.tracking_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{getItemTypeLabel(item.item_type)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.brand ? (
                              <>
                                <span className="font-medium">{item.brand}</span>
                                {item.model && <span> / {item.model}</span>}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusClass(item.status)}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setItemToDelete(item.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Bu aparta henüz envanter bulunmamaktadır. Yeni envanter eklemek için "Envanter Ekle" butonunu kullanabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleUnassignInventory}
        title="Envanteri Kaldır"
        message="Bu envanteri aparttan kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz."
        isLoading={isSubmitting}
        error={error}
      />
    </>
  );
}