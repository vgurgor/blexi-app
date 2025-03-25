'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Plus, DoorOpen, Bed, ChevronLeft, ChevronRight, Building2, Search, Filter } from 'lucide-react';
import RoomCard from '@/components/rooms/RoomCard';

interface Room {
  id: number;
  room_number: string;
  floor: number;
  capacity: number;
  room_type: 'STANDARD' | 'SUITE' | 'DELUXE';
  status: 'active' | 'inactive' | 'maintenance';
  apart_id: number;
  beds_count: number;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface Filters {
  status: string[];
  roomType: string;
  apartId: string;
  floor: string;
  occupancyRange: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    roomType: 'all',
    apartId: 'all',
    floor: 'all',
    occupancyRange: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid) {
          router.replace('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Auth kontrolü hatası:', error);
        router.replace('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    init();
  }, [checkAuth, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRooms();
      fetchApartments();
    }
  }, [isAuthenticated, token, currentPage, filters]);

  const fetchRooms = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      let url = 'https://api.blexi.co/api/v1/rooms';
      let queryParams = new URLSearchParams();
      
      queryParams.append('page', currentPage.toString());
      queryParams.append('per_page', '9');
      
      if (filters.roomType !== 'all') {
        queryParams.append('room_type', filters.roomType);
      }
      
      if (filters.apartId !== 'all') {
        queryParams.append('apart_id', filters.apartId);
      }
      
      if (filters.floor !== 'all') {
        queryParams.append('floor', filters.floor);
      }
      
      // Fix: Send status as a single parameter if only one is selected
      if (filters.status.length === 1) {
        queryParams.append('status', filters.status[0]);
      }
      
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        // If we have multiple status filters, filter client-side
        if (filters.status.length > 1) {
          setRooms(data.data.filter((room: Room) => 
            filters.status.includes(room.status)
          ));
        } else {
          setRooms(data.data);
        }
        
        // Set pagination meta
        if (data.meta) {
          setPaginationMeta(data.meta);
        }
      } else {
        console.error('Veri çekme hatası:', data);
      }
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApartments = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('https://api.blexi.co/api/v1/aparts?per_page=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setApartments(data.data);
      } else {
        console.error('Apart verileri alınamadı:', data);
      }
    } catch (error) {
      console.error('Apart verileri çekilirken hata oluştu:', error);
    }
  };

  const handleRoomStatusChange = async (id: number, status: 'active' | 'inactive' | 'maintenance') => {
    if (!token) return;
    
    try {
      const response = await fetch(`https://api.blexi.co/api/v1/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Update local state
        setRooms(prev => prev.map(r => 
          r.id === id ? { ...r, status } : r
        ));
        // Refresh data from server
        fetchRooms();
      } else {
        console.error('Durum değiştirme hatası:', await response.json());
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
    }
  };

  const handleRoomDelete = async (id: number) => {
    if (!token) return;
    
    try {
      await fetch(`https://api.blexi.co/api/v1/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      // Update local state
      setRooms(prev => prev.filter(r => r.id !== id));
      // Refresh data from server
      fetchRooms();
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.last_page)) return;
    setCurrentPage(page);
  };

  const getApartmentName = (apartId: number) => {
    const apartment = apartments.find(a => a.id === apartId);
    return apartment ? apartment.name : 'Bilinmiyor';
  };

  // Filter only by search term locally, all other filters are handled by the API
  const filteredRooms = rooms.filter(room => {
    if (!searchTerm) return true;
    
    return room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getApartmentName(room.apart_id).toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-8 pt-24">
      {/* Header with New Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Odalar
        </h1>
        <button 
          onClick={() => router.push('/dashboard/rooms/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Yeni Oda</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Oda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtreler
        </button>
      </div>

      {showFilters && (
        <div className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Durum</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newStatus = filters.status.includes('active')
                      ? filters.status.filter(s => s !== 'active')
                      : [...filters.status, 'active'];
                    setFilters({...filters, status: newStatus});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.status.includes('active')
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => {
                    const newStatus = filters.status.includes('inactive')
                      ? filters.status.filter(s => s !== 'inactive')
                      : [...filters.status, 'inactive'];
                    setFilters({...filters, status: newStatus});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.status.includes('inactive')
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Pasif
                </button>
                <button
                  onClick={() => {
                    const newStatus = filters.status.includes('maintenance')
                      ? filters.status.filter(s => s !== 'maintenance')
                      : [...filters.status, 'maintenance'];
                    setFilters({...filters, status: newStatus});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.status.includes('maintenance')
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  Bakımda
                </button>
              </div>
            </div>

            {/* Room Type Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Oda Tipi
              </h3>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Tipler</option>
                <option value="STANDARD">Standart</option>
                <option value="SUITE">Suit</option>
                <option value="DELUXE">Deluxe</option>
              </select>
            </div>

            {/* Apart Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Apart
              </h3>
              <select
                value={filters.apartId}
                onChange={(e) => setFilters({...filters, apartId: e.target.value})}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Apartlar</option>
                {apartments.map(apart => (
                  <option key={apart.id} value={apart.id}>
                    {apart.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Kat
              </h3>
              <select
                value={filters.floor}
                onChange={(e) => setFilters({...filters, floor: e.target.value})}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Katlar</option>
                <option value="0">Zemin Kat</option>
                <option value="1">1. Kat</option>
                <option value="2">2. Kat</option>
                <option value="3">3. Kat</option>
                <option value="4">4. Kat</option>
                <option value="5">5. Kat ve üzeri</option>
              </select>
            </div>

            {/* Occupancy Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Doluluk Oranı
              </h3>
              <select
                value={filters.occupancyRange}
                onChange={(e) => setFilters({...filters, occupancyRange: e.target.value})}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="full">Tamamen Dolu</option>
                <option value="partial">Kısmen Dolu</option>
                <option value="empty">Tamamen Boş</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: [],
                  roomType: 'all',
                  apartId: 'all',
                  floor: 'all',
                  occupancyRange: 'all'
                })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  getApartmentName={getApartmentName}
                  onStatusChange={handleRoomStatusChange}
                  onDelete={handleRoomDelete}
                />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-gray-500 dark:text-gray-400">
                Henüz oda kaydı bulunmamaktadır.
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginationMeta && paginationMeta.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {paginationMeta.links
                  .filter(link => !link.label.includes('Previous') && !link.label.includes('Next'))
                  .map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(parseInt(link.label))}
                      className={`min-w-[36px] h-9 px-3 rounded-md font-medium ${
                        link.active
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationMeta.last_page}
                  className={`p-2 rounded-md ${
                    currentPage === paginationMeta.last_page
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}