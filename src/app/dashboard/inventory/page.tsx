'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { inventoryApi, type InventoryFilters } from '@/lib/api/inventory';
import { IInventoryItem } from '@/types/models';
import { Plus, Package, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryForm from '@/components/inventory/InventoryForm';
import PageLoader from '@/components/PageLoader';

// Using IInventoryItem from models.ts

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

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [inventory, setInventory] = useState<IInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    itemType: 'all',
    status: 'all',
    warrantyExpired: 'all',
    assigned: 'all',
    apartId: 'all',
    roomId: 'all',
    bedId: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IInventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

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
      fetchInventory();
    }
  }, [isAuthenticated, token, currentPage, filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      // Prepare filters for API
      const apiFilters: InventoryFilters = {
        page: currentPage,
        per_page: 10
      };
      
      if (filters.itemType !== 'all') {
        apiFilters.item_type = filters.itemType as any;
      }
      
      if (filters.status !== 'all') {
        apiFilters.status = filters.status as any;
      }
      
      if (filters.warrantyExpired !== 'all') {
        apiFilters.warranty_expired = filters.warrantyExpired === 'expired';
      }
      
      if (filters.assigned !== 'all') {
        apiFilters.assigned = filters.assigned === 'assigned';
      }
      
      if (filters.apartId !== 'all') {
        apiFilters.apart_id = filters.apartId;
      }
      
      if (filters.roomId !== 'all') {
        apiFilters.room_id = filters.roomId;
      }
      
      if (filters.bedId !== 'all') {
        apiFilters.bed_id = filters.bedId;
      }
      
      // Use the API service instead of direct fetch
      const response = await inventoryApi.getAll(apiFilters);
      
      if (response.success) {
        setInventory(response.data);
        
        // Set pagination meta
        if (response.meta) {
          setPaginationMeta(response.meta as PaginationMeta);
        }
      } else {
        console.error('Veri çekme hatası:', response.error);
      }
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInventory = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Use the API service instead of direct fetch
      const response = await inventoryApi.create(formData);
      
      if (!response.success) {
        throw new Error(response.error || 'Envanter eklenirken bir hata oluştu');
      }
      
      setSuccess('Envanter başarıyla eklendi.');
      setInventory(prev => [response.data, ...prev]);
      setShowAddForm(false);
      fetchInventory(); // Refresh the list
    } catch (error: any) {
      console.error('Envanter ekleme hatası:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInventory = async (formData: any) => {
    if (!editingItem) throw new Error('Düzenlenecek öğe bulunamadı');
    
    setIsSubmitting(true);
    
    try {
      // Use the API service instead of direct fetch
      const response = await inventoryApi.update(editingItem.id, formData);
      
      if (!response.success) {
        throw new Error(response.error || 'Envanter güncellenirken bir hata oluştu');
      }
      
      setSuccess('Envanter başarıyla güncellendi.');
      setInventory(prev => prev.map(item => item.id === editingItem.id ? response.data : item));
      setShowAddForm(false);
      setEditingItem(null);
      fetchInventory(); // Refresh the list
    } catch (error: any) {
      console.error('Envanter güncelleme hatası:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInventory = async (id: number) => {
    try {
      // Use the API service instead of direct fetch
      const response = await inventoryApi.delete(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Envanter silinirken bir hata oluştu');
      }
      
      // Remove from inventory
      setInventory(prev => prev.filter(item => item.id !== id.toString()));
      setSuccess('Envanter başarıyla silindi.');
    } catch (error: any) {
      console.error('Envanter silme hatası:', error);
      throw error;
    }
  };

  const handleEditItem = (item: IInventoryItem) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationMeta && page > paginationMeta.last_page)) return;
    setCurrentPage(page);
  };

  // Filter by search term
  const filteredInventory = inventory.filter(item => {
    if (!searchTerm) return true;
    
    return (
      item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
    <>
      {isSubmitting && <PageLoader />}
      <div className="p-8">
        {/* Header with New Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Envanter Yönetimi
          </h1>
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) setEditingItem(null);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            {showAddForm ? (
              <span>İptal</span>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span className="font-medium">Yeni Envanter</span>
              </>
            )}
          </button>
        </div>

        {success && (
          <div className="p-3 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Add/Edit Inventory Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingItem ? 'Envanter Düzenle' : 'Yeni Envanter Ekle'}
            </h3>
            
            <InventoryForm 
              onSubmit={editingItem ? handleUpdateInventory : handleCreateInventory}
              initialData={editingItem}
              isEditing={!!editingItem}
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Envanter ara..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Item Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Envanter Türü
                </h3>
                <select
                  value={filters.itemType}
                  onChange={(e) => setFilters({...filters, itemType: e.target.value})}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="furniture">Mobilya</option>
                  <option value="appliance">Beyaz Eşya</option>
                  <option value="linen">Tekstil</option>
                  <option value="electronic">Elektronik</option>
                  <option value="kitchenware">Mutfak Eşyası</option>
                  <option value="decoration">Dekorasyon</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Durum
                </h3>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="in_use">Kullanımda</option>
                  <option value="in_storage">Depoda</option>
                  <option value="maintenance">Bakımda</option>
                  <option value="disposed">Kullanım Dışı</option>
                </select>
              </div>

              {/* Warranty Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Garanti Durumu
                </h3>
                <select
                  value={filters.warrantyExpired}
                  onChange={(e) => setFilters({...filters, warrantyExpired: e.target.value})}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="expired">Garantisi Bitmiş</option>
                  <option value="valid">Garantisi Devam Eden</option>
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Atama Durumu
                </h3>
                <select
                  value={filters.assigned}
                  onChange={(e) => setFilters({...filters, assigned: e.target.value})}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="assigned">Atanmış</option>
                  <option value="unassigned">Atanmamış</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    itemType: 'all',
                    status: 'all',
                    warrantyExpired: 'all',
                    assigned: 'all',
                    apartId: 'all',
                    roomId: 'all',
                    bedId: 'all'
                  })}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <InventoryTable 
          items={filteredInventory}
          onDelete={handleDeleteInventory}
          onEdit={handleEditItem}
          isLoading={isLoading}
        />

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
      </div>
    </>
  );
}