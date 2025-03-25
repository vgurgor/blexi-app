'use client';

import { useState } from 'react';
import { WithPermission } from '@/components/auth';
import { Permission } from '@/lib/roles';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/molecules/Modal';
import { PlusCircle, Trash2, Edit, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  // Mock users data
  const users = [
    { id: 1, username: 'super-admin', name: 'Super Admin', role: 'super-admin', createdAt: '2023-02-15' },
    { id: 2, username: 'admin', name: 'Sistem Yöneticisi', role: 'admin', createdAt: '2023-01-01' },
    { id: 3, username: 'manager1', name: 'Ali Yılmaz', role: 'manager', createdAt: '2023-02-15' },
    { id: 4, username: 'user1', name: 'Ayşe Demir', role: 'user', createdAt: '2023-03-20' },
    { id: 5, username: 'user2', name: 'Mehmet Öz', role: 'user', createdAt: '2023-04-10' },
  ];
  
  const getRoleName = (role: string) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Yönetici';
      case 'manager': return 'Apartman Yöneticisi';
      case 'user': return 'Kullanıcı';
      default: return role;
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  const handleAddUser = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsAddUserModalOpen(false);
      toast.success('Kullanıcı başarıyla eklendi');
    }, 1000);
  };
  
  return (
    <WithPermission
      permission={Permission.USER_READ}
      fallback={
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Erişim Engellendi
          </h3>
          <p className="mt-2 text-red-500 dark:text-red-300">
            Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.
          </p>
        </div>
      }
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kullanıcı Yönetimi
          </h1>
          
          <WithPermission permission={Permission.USER_CREATE}>
            <Button
              onClick={() => setIsAddUserModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Yeni Kullanıcı
            </Button>
          </WithPermission>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kullanıcı Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <WithPermission permission={Permission.USER_UPDATE}>
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </WithPermission>
                        
                        <WithPermission permission={Permission.USER_DELETE}>
                          <button 
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </WithPermission>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Add User Modal */}
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Yeni Kullanıcı Ekle"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="ornek.kullanici"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="Ad Soyad"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol
              </label>
              <select
                id="role"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              >
                <option value="user">Kullanıcı</option>
                <option value="manager">Apartman Yöneticisi</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddUserModalOpen(false)}
            >
              İptal
            </Button>
            <Button 
              onClick={handleAddUser}
              isLoading={loading}
              leftIcon={!loading && <PlusCircle className="w-4 h-4" />}
            >
              Kullanıcı Ekle
            </Button>
          </div>
        </Modal>
      </div>
    </WithPermission>
  );
}