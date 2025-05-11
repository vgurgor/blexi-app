'use client';

import { useState, useEffect } from 'react';
import { WithPermission } from '@/components/auth';
import { Permission } from '@/lib/roles';
import { Button } from '@/components/ui/atoms/Button';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/molecules/Modal';
import { PlusCircle, Trash2, Edit, UserPlus } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { IUser } from '@/types/models';

export default function UsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  // State for users data
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
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
  
  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await usersApi.getAll();
      
      if (response.success && response.data) {
        setUsers(response.data as IUser[]);
      } else {
        setError(response.error || 'Kullanıcı verileri yüklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kullanıcı verileri çekilirken hata:', error);
      setError(error.message || 'Kullanıcı verileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: {
    username: string;
    email: string;
    name: string;
    password: string;
    password_confirmation: string;
    role: 'super-admin' | 'admin' | 'manager' | 'user';
  }) => {
    setLoading(true);
    
    try {
      const response = await usersApi.create(userData);
      
      if (response.success) {
        toast.success('Kullanıcı başarıyla eklendi');
        setIsAddUserModalOpen(false);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.error || 'Kullanıcı eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Kullanıcı ekleme hatası:', error);
      toast.error(error.message || 'Kullanıcı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
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
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
                  {users.length > 0 ? (
                    users.map((user) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Henüz kullanıcı kaydı bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                placeholder="ornek@blexi.co"
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
              onClick={() => {
                // Get form data and call handleAddUser
                const usernameInput = document.getElementById('username') as HTMLInputElement;
                const nameInput = document.getElementById('name') as HTMLInputElement;
                const emailInput = document.getElementById('email') as HTMLInputElement;
                const passwordInput = document.getElementById('password') as HTMLInputElement;
                const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
                const roleSelect = document.getElementById('role') as HTMLSelectElement;
                
                const userData = {
                  username: usernameInput?.value || '',
                  name: nameInput?.value || '',
                  email: emailInput?.value || '',
                  password: passwordInput?.value || '',
                  password_confirmation: confirmPasswordInput?.value || '',
                  role: (roleSelect?.value || 'user') as 'super-admin' | 'admin' | 'manager' | 'user'
                };
                
                handleAddUser(userData);
              }}
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