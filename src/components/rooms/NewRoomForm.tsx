'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Building, Bed, Hash, Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import RoomFeatures from './RoomFeatures';

interface Apartment {
  id: number;
  name: string;
}

interface BedFormData {
  id?: number; // For UI tracking only
  name: string;
  bed_number: string;
  bed_type: 'SINGLE' | 'DOUBLE' | 'BUNK';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export default function NewRoomForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    apart_id: '',
    room_number: '',
    floor: 1,
    capacity: 1,
    room_type: 'STANDARD',
    status: 'active'
  });
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [error, setError] = useState('');
  const [newRoomId, setNewRoomId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'beds'>('details');
  const [beds, setBeds] = useState<BedFormData[]>([]);
  const [currentBed, setCurrentBed] = useState<BedFormData>({
    name: '',
    bed_number: '',
    bed_type: 'SINGLE',
    status: 'available'
  });
  const [bedErrors, setBedErrors] = useState({
    name: '',
    bed_number: ''
  });
  const [isAddingBeds, setIsAddingBeds] = useState(false);

  useEffect(() => {
    const fetchApartments = async () => {
      if (!token) return;
      
      setIsLoadingApartments(true);
      try {
        const response = await fetch('https://api.blexi.co/api/v1/aparts?per_page=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          setApartments(data.data);
        } else {
          console.error('Apart verileri alınamadı:', data);
        }
      } catch (error) {
        console.error('Apart verileri çekilirken hata oluştu:', error);
      } finally {
        setIsLoadingApartments(false);
      }
    };

    fetchApartments();
  }, [token]);

  const validateRoomForm = () => {
    if (!formData.apart_id) {
      setError('Lütfen bir apart seçin');
      return false;
    }
    if (!formData.room_number) {
      setError('Oda numarası zorunludur');
      return false;
    }
    return true;
  };

  const validateBedForm = () => {
    const errors = {
      name: '',
      bed_number: ''
    };
    let isValid = true;

    if (!currentBed.name.trim()) {
      errors.name = 'Yatak adı zorunludur';
      isValid = false;
    }

    if (!currentBed.bed_number.trim()) {
      errors.bed_number = 'Yatak numarası zorunludur';
      isValid = false;
    } else if (beds.some(bed => bed.bed_number === currentBed.bed_number)) {
      errors.bed_number = 'Bu yatak numarası zaten kullanılıyor';
      isValid = false;
    }

    setBedErrors(errors);
    return isValid;
  };

  const handleAddBed = () => {
    if (!validateBedForm()) return;

    setBeds([...beds, { ...currentBed, id: Date.now() }]);
    setCurrentBed({
      name: '',
      bed_number: '',
      bed_type: 'SINGLE',
      status: 'available'
    });
    setBedErrors({ name: '', bed_number: '' });
  };

  const handleRemoveBed = (id: number) => {
    setBeds(beds.filter(bed => bed.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateRoomForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Create the room
      const roomResponse = await fetch('https://api.blexi.co/api/v1/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const roomData = await roomResponse.json();
      
      if (!roomResponse.ok) {
        throw new Error(roomData.message || 'Oda eklenirken bir hata oluştu');
      }
      
      const roomId = roomData.data.id;
      setNewRoomId(roomId);
      
      // 2. Create beds if any
      if (beds.length > 0) {
        setIsAddingBeds(true);
        
        // Create beds sequentially to avoid race conditions
        for (const bed of beds) {
          const { id, ...bedData } = bed; // Remove the temporary id
          
          const bedResponse = await fetch('https://api.blexi.co/api/v1/beds', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              ...bedData,
              room_id: roomId
            })
          });
          
          if (!bedResponse.ok) {
            const bedError = await bedResponse.json();
            console.error('Yatak ekleme hatası:', bedError);
            // Continue with other beds even if one fails
          }
        }
        
        setIsAddingBeds(false);
      }
      
      setIsSubmitted(true);
      onSubmit(roomData.data);
    } catch (error: any) {
      console.error('Oda ekleme hatası:', error);
      setError(error.message || 'Oda eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBedTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE': return 'Tek Kişilik';
      case 'DOUBLE': return 'Çift Kişilik';
      case 'BUNK': return 'Ranza';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Boş';
      case 'occupied': return 'Dolu';
      case 'maintenance': return 'Bakımda';
      case 'reserved': return 'Rezerve';
      default: return status;
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          disabled={isSubmitted}
        >
          Oda Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('beds')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'beds'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          disabled={isSubmitted}
        >
          Yataklar
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Apart*
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.apart_id}
                    onChange={(e) => setFormData({ ...formData, apart_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    required
                    disabled={isLoadingApartments || isSubmitting}
                  >
                    <option value="">Apart Seçin</option>
                    {apartments.map((apart) => (
                      <option key={apart.id} value={apart.id}>
                        {apart.name}
                      </option>
                    ))}
                  </select>
                </div>
                {isLoadingApartments && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Apartlar yükleniyor...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Oda Numarası*
                </label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="101"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kat*
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Zemin kat için 0 giriniz.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kapasite*
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Oda Tipi*
                </label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                  disabled={isSubmitting}
                >
                  <option value="STANDARD">Standart</option>
                  <option value="SUITE">Suit</option>
                  <option value="DELUXE">Deluxe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durum*
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  required
                  disabled={isSubmitting}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="maintenance">Bakımda</option>
                </select>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('beds')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  İleri: Yataklar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 text-sm">
                <p>Bu odaya eklemek istediğiniz yatakları aşağıda tanımlayabilirsiniz. Oda oluşturulduktan sonra da yatak ekleyebilirsiniz.</p>
              </div>

              {/* Current beds list */}
              {beds.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Eklenecek Yataklar</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yatak Adı</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yatak No</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tip</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {beds.map(bed => (
                          <tr key={bed.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{bed.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{bed.bed_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getBedTypeLabel(bed.bed_type)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                bed.status === 'available' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : bed.status === 'maintenance'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              }`}>
                                {getStatusLabel(bed.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleRemoveBed(bed.id!)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add new bed form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Yeni Yatak Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Yatak Adı*
                    </label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={currentBed.name}
                        onChange={(e) => setCurrentBed({ ...currentBed, name: e.target.value })}
                        placeholder="Yatak 1"
                        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                          bedErrors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {bedErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{bedErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Yatak Numarası*
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={currentBed.bed_number}
                        onChange={(e) => setCurrentBed({ ...currentBed, bed_number: e.target.value })}
                        placeholder="1A"
                        className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                          bedErrors.bed_number ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                        disabled={isSubmitting}
                      />
                    </div>
                    {bedErrors.bed_number && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{bedErrors.bed_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Yatak Tipi*
                    </label>
                    <select
                      value={currentBed.bed_type}
                      onChange={(e) => setCurrentBed({ ...currentBed, bed_type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="SINGLE">Tek Kişilik</option>
                      <option value="DOUBLE">Çift Kişilik</option>
                      <option value="BUNK">Ranza</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durum*
                    </label>
                    <select
                      value={currentBed.status}
                      onChange={(e) => setCurrentBed({ ...currentBed, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="available">Boş</option>
                      <option value="maintenance">Bakımda</option>
                      <option value="reserved">Rezerve</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAddBed}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4" />
                    Yatağı Listeye Ekle
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Geri: Oda Bilgileri
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isAddingBeds ? 'Yataklar Ekleniyor...' : 'Oda Oluşturuluyor...'}</span>
                    </>
                  ) : (
                    <span>Odayı Oluştur</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : newRoomId ? (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
            <h3 className="text-lg font-semibold mb-2">Oda başarıyla oluşturuldu!</h3>
            <p>Oda numarası: <strong>{formData.room_number}</strong></p>
            <p>Eklenen yatak sayısı: <strong>{beds.length}</strong></p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Oda Özellikleri
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <RoomFeatures roomId={newRoomId} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}