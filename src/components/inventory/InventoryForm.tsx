import { useState } from 'react';
import { FileText, Tag, Calendar, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '@/lib/authExport';
import { IInventoryItem } from '@/types/models';
import { CreateInventoryRequest, UpdateInventoryRequest } from '@/lib/api/inventory';

interface InventoryFormProps {
  onSubmit: (data: CreateInventoryRequest | UpdateInventoryRequest) => Promise<void>;
  initialData?: IInventoryItem | null;
  isEditing?: boolean;
  assignableType?: string | null;
  assignableId?: number | string | null;
}

export default function InventoryForm({ 
  onSubmit, 
  initialData = null, 
  isEditing = false,
  assignableType = null,
  assignableId = null
}: InventoryFormProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    item_type: initialData?.item_type || 'furniture',
    status: initialData?.status || 'in_use',
    tracking_number: initialData?.tracking_number || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    purchase_date: initialData?.purchase_date || new Date().toISOString().split('T')[0],
    warranty_end: initialData?.warranty_end || '',
    assignable_type: assignableType ? `App\\Modules\\${assignableType}\\Models\\${assignableType}` : initialData?.assignable_type || null,
    assignable_id: assignableId || initialData?.assignable_id || null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error: any) {
      setError(error.message || 'Envanter kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Envanter Türü*
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.item_type}
              onChange={(e) => setFormData({...formData, item_type: e.target.value as 'furniture' | 'appliance' | 'linen' | 'electronic' | 'kitchenware' | 'decoration'})}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitting}
            >
              <option value="furniture">Mobilya</option>
              <option value="appliance">Beyaz Eşya</option>
              <option value="linen">Tekstil</option>
              <option value="electronic">Elektronik</option>
              <option value="kitchenware">Mutfak Eşyası</option>
              <option value="decoration">Dekorasyon</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durum*
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'in_use' | 'in_storage' | 'maintenance' | 'disposed'})}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitting}
            >
              <option value="in_use">Kullanımda</option>
              <option value="in_storage">Depoda</option>
              <option value="maintenance">Bakımda</option>
              <option value="disposed">Kullanım Dışı</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Takip Numarası*
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tracking_number}
              onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
              placeholder="ELC-2024-001"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Benzersiz bir takip numarası girin (örn: ELC-2024-001)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Marka
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="TechBrand"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Smart TV 4K"
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Satın Alma Tarihi*
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Garanti Bitiş Tarihi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.warranty_end}
              onChange={(e) => setFormData({...formData, warranty_end: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isEditing ? 'Güncelleniyor...' : 'Ekleniyor...'}</span>
            </>
          ) : (
            <span>{isEditing ? 'Güncelle' : 'Ekle'}</span>
          )}
        </button>
      </div>
    </form>
  );
}