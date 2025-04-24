'use client';

import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Building2, Calendar, Info, AlertTriangle, DollarSign, Bed, DoorOpen } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/ui';
import { apartsApi } from '@/lib/api/apartments';
import { roomsApi } from '@/lib/api/rooms';
import { bedsApi } from '@/lib/api/beds';
import { seasonsApi } from '@/lib/api/seasons';
import { useToast } from '@/hooks/useToast';

export default function ApartmentSelectionStep() {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const [apartments, setApartments] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoadingApartments, setIsLoadingApartments] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const toast = useToast();

  const apartId = watch('apart_id');
  const roomId = watch('room_id');
  const bedId = watch('bed_id');
  const seasonCode = watch('season_code');
  const checkInDate = watch('check_in_date');
  const checkOutDate = watch('check_out_date');

  // Fetch apartments and seasons on component mount
  useEffect(() => {
    fetchApartments();
    fetchSeasons();
  }, []);

  // Fetch rooms when apartId changes
  useEffect(() => {
    if (apartId) {
      fetchRooms(apartId);
      fetchApartmentDetails(apartId);
      // Clear room and bed selection when apartment changes
      setValue('room_id', '');
      setValue('bed_id', '');
      setSelectedRoom(null);
      setSelectedBed(null);
      setRooms([]);
      setBeds([]);
    }
  }, [apartId]);

  // Fetch beds when roomId changes
  useEffect(() => {
    if (roomId) {
      fetchBeds(roomId);
      fetchRoomDetails(roomId);
      // Clear bed selection when room changes
      setValue('bed_id', '');
      setSelectedBed(null);
      setBeds([]);
    }
  }, [roomId]);

  // Fetch bed details when bedId changes
  useEffect(() => {
    if (bedId) {
      fetchBedDetails(bedId);
    }
  }, [bedId]);

  // Fetch apartments
  const fetchApartments = async () => {
    setIsLoadingApartments(true);
    try {
      const personGender = watch('person')?.gender;
      const response = await apartsApi.getAll({ status: 'active' });
      
      if (response.success && response.data) {
        setApartments(response.data);
      } else {
        toast.error('Apartlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast.error('Apartlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingApartments(false);
    }
  };

  // Fetch rooms for a specific apartment
  const fetchRooms = async (apartId: string) => {
    setIsLoadingRooms(true);
    try {
      const response = await roomsApi.getAll({ apart_id: parseInt(apartId), status: 'active' });
      
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        toast.error('Odalar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Odalar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Fetch beds for a specific room
  const fetchBeds = async (roomId: string) => {
    setIsLoadingBeds(true);
    try {
      const response = await bedsApi.getAll({ room_id: parseInt(roomId), status: 'available' });
      
      if (response.success && response.data) {
        setBeds(response.data);
      } else {
        toast.error('Yataklar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching beds:', error);
      toast.error('Yataklar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingBeds(false);
    }
  };

  // Fetch seasons
  const fetchSeasons = async () => {
    setIsLoadingSeasons(true);
    try {
      const response = await seasonsApi.getAll('active');
      
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        toast.error('Sezonlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      toast.error('Sezonlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoadingSeasons(false);
    }
  };

  // Fetch apartment details
  const fetchApartmentDetails = async (id: string) => {
    try {
      const response = await apartsApi.getById(id);
      
      if (response.success && response.data) {
        setSelectedApartment(response.data);
      }
    } catch (error) {
      console.error('Error fetching apartment details:', error);
    }
  };

  // Fetch room details
  const fetchRoomDetails = async (id: string) => {
    try {
      const response = await roomsApi.getById(id);
      
      if (response.success && response.data) {
        setSelectedRoom(response.data);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  // Fetch bed details
  const fetchBedDetails = async (id: string) => {
    try {
      const response = await bedsApi.getById(id);
      
      if (response.success && response.data) {
        setSelectedBed(response.data);
      }
    } catch (error) {
      console.error('Error fetching bed details:', error);
    }
  };

  // Handle check-in/check-out date changes
  const handleDateChange = (field: string, value: string) => {
    setValue(field, value);
    
    // Validate date range
    if (checkInDate && checkOutDate) {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      
      if (endDate <= startDate) {
        toast.error('Çıkış tarihi giriş tarihinden sonra olmalıdır');
      }
    }
  };

  // Get bed type display text
  const getBedTypeDisplay = (bedType: string) => {
    switch (bedType) {
      case 'SINGLE': return 'Tek Kişilik';
      case 'DOUBLE': return 'Çift Kişilik';
      case 'BUNK': return 'Ranza';
      default: return bedType;
    }
  };

  // Get room type display text
  const getRoomTypeDisplay = (roomType: string) => {
    switch (roomType) {
      case 'STANDARD': return 'Standart';
      case 'SUITE': return 'Suit';
      case 'DELUXE': return 'Deluxe';
      default: return roomType;
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Konaklama Seçimi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Misafirin kalacağı apart, oda, yatak ve sezon bilgilerini seçin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Apartment Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apart*
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="apart_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.apart_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingApartments}
                >
                  <option value="">Apart Seçin</option>
                  {apartments.map((apart) => (
                    <option key={apart.id} value={apart.id}>
                      {apart.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.apart_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.apart_id.message as string}
            </p>
          )}
        </div>

        {/* Room Selection - Only show when apartment is selected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Oda*
          </label>
          <div className="relative">
            <DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="room_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.room_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingRooms || !apartId}
                >
                  <option value="">Oda Seçin</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Oda {room.room_number}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {!apartId && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Önce bir apart seçmelisiniz
            </p>
          )}
          {errors.room_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.room_id.message as string}
            </p>
          )}
        </div>

        {/* Bed Selection - Only show when room is selected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yatak*
          </label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="bed_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.bed_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingBeds || !roomId}
                >
                  <option value="">Yatak Seçin</option>
                  {beds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      Yatak {bed.bed_number} ({getBedTypeDisplay(bed.bed_type)})
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {!roomId && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Önce bir oda seçmelisiniz
            </p>
          )}
          {errors.bed_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.bed_id.message as string}
            </p>
          )}
          {roomId && beds.length === 0 && !isLoadingBeds && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Bu odada uygun yatak bulunmamaktadır
            </p>
          )}
        </div>

        {/* Season Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sezon*
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Controller
              name="season_code"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border ${
                    errors.season_code ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all`}
                  disabled={isLoadingSeasons}
                >
                  <option value="">Sezon Seçin</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.code}>
                      {season.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.season_code && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.season_code.message as string}
            </p>
          )}
        </div>

        {/* Check-in Date */}
        <FormInput
          name="check_in_date"
          label="Giriş Tarihi*"
          type="date"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          onChange={(e) => handleDateChange('check_in_date', e.target.value)}
        />

        {/* Check-out Date */}
        <FormInput
          name="check_out_date"
          label="Çıkış Tarihi*"
          type="date"
          leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
          onChange={(e) => handleDateChange('check_out_date', e.target.value)}
        />

        {/* Deposit Amount */}
        <FormInput
          name="deposit_amount"
          label="Depozito Tutarı"
          type="number"
          placeholder="0,00"
          leftIcon={<DollarSign className="w-5 h-5 text-gray-400" />}
          mask="numeric"
          maskOptions={{
            scale: 2,
            thousandsSeparator: '.',
            padFractionalZeros: false,
            normalizeZeros: true,
            radix: ',',
            mapToRadix: ['.']
          }}
          value={String(watch('deposit_amount') || '')}
        />

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notlar
          </label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="Eklemek istediğiniz notlar..."
                rows={3}
              />
            )}
          />
        </div>
      </div>

      {/* Selected Accommodation Info */}
      {(selectedApartment || selectedRoom || selectedBed) && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Seçilen Konaklama Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedApartment && (
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Apart:</span> {selectedApartment.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Adres:</span> {selectedApartment.address}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Cinsiyet Tipi:</span> {
                    selectedApartment.gender_type === 'MALE' ? 'Erkek' : 
                    selectedApartment.gender_type === 'FEMALE' ? 'Kız' : 'Karma'
                  }
                </p>
              </div>
            )}
            
            {selectedRoom && (
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Oda:</span> {selectedRoom.room_number}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Kat:</span> {selectedRoom.floor}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Oda Tipi:</span> {getRoomTypeDisplay(selectedRoom.room_type)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Kapasite:</span> {selectedRoom.capacity} kişilik
                </p>
              </div>
            )}
            
            {selectedBed && (
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Yatak:</span> {selectedBed.bed_number}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Yatak Tipi:</span> {getBedTypeDisplay(selectedBed.bed_type)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Durum:</span> {
                    selectedBed.status === 'available' ? 'Müsait' : 
                    selectedBed.status === 'occupied' ? 'Dolu' : 
                    selectedBed.status === 'maintenance' ? 'Bakımda' : 'Rezerve'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning for date selection */}
      {checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate) && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Çıkış tarihi giriş tarihinden sonra olmalıdır.
          </p>
        </div>
      )}

      {/* Warning for bed availability */}
      {bedId && selectedBed && selectedBed.status !== 'available' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Seçilen yatak şu anda müsait değil. Lütfen başka bir yatak seçin.
          </p>
        </div>
      )}
    </div>
  );
}