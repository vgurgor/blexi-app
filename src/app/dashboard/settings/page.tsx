'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authExport';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Lock, 
  Save,
  Check,
  Puzzle,
  Users
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user, tenant } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    systemUpdates: true,
    marketingEmails: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipRestriction: false
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme || 'dark',
    sidebarCollapsed: false,
    highContrast: false,
    animationsReduced: false
  });

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
    if (user && tenant) {
      setGeneralSettings(prev => ({
        ...prev,
        companyName: tenant.name || ''
      }));
    }
  }, [user, tenant]);

  useEffect(() => {
    setAppearanceSettings(prev => ({
      ...prev,
      theme: theme || 'dark'
    }));
  }, [theme]);

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

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setAppearanceSettings(prev => ({
      ...prev,
      theme: newTheme
    }));
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'features', label: 'Özellikler', icon: Puzzle, path: '/dashboard/settings/features' },
    { id: 'users', label: 'Kullanıcılar', icon: Users, path: '/dashboard/settings/users' }
  ];

  return (
    <div className="p-8 pt-24 animate-slideLeft">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ayarlar
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs */}
          <div className="w-full md:w-64 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => tab.path ? router.push(tab.path) : setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeTab === tab.id && !tab.path
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Genel Ayarlar
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      value={generalSettings.companyName}
                      onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dil
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zaman Dilimi
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                      <option value="Europe/London">Londra (GMT+0)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tarih Formatı
                    </label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="DD.MM.YYYY">31.12.2025</option>
                      <option value="MM/DD/YYYY">12/31/2025</option>
                      <option value="YYYY-MM-DD">2025-12-31</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Bildirim Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">E-posta Bildirimleri</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Önemli güncellemeler için e-posta al</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.emailNotifications}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          emailNotifications: !notificationSettings.emailNotifications
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">SMS Bildirimleri</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Acil durumlar için SMS al</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.smsNotifications}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          smsNotifications: !notificationSettings.smsNotifications
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray -700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Ödeme Hatırlatıcıları</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Yaklaşan ödemeler için hatırlatıcı al</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.paymentReminders}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          paymentReminders: !notificationSettings.paymentReminders
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Sistem Güncellemeleri</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Yeni özellikler ve güncellemeler hakkında bilgi al</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationSettings.systemUpdates}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings, 
                          systemUpdates: !notificationSettings.systemUpdates
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Güvenlik Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">İki Faktörlü Doğrulama</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hesabınızı korumak için ek güvenlik katmanı</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securitySettings.twoFactorAuth}
                        onChange={() => setSecuritySettings({
                          ...securitySettings, 
                          twoFactorAuth: !securitySettings.twoFactorAuth
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Oturum Zaman Aşımı (dakika)
                    </label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="15">15 dakika</option>
                      <option value="30">30 dakika</option>
                      <option value="60">1 saat</option>
                      <option value="120">2 saat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Şifre Sona Erme Süresi (gün)
                    </label>
                    <select
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value="30">30 gün</option>
                      <option value="60">60 gün</option>
                      <option value="90">90 gün</option>
                      <option value="180">180 gün</option>
                      <option value="never">Asla</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">IP Kısıtlaması</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Belirli IP adreslerinden erişime izin ver</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securitySettings.ipRestriction}
                        onChange={() => setSecuritySettings({
                          ...securitySettings, 
                          ipRestriction: !securitySettings.ipRestriction
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Görünüm Ayarları
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          appearanceSettings.theme === 'light'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <Sun className={`w-8 h-8 mb-2 ${
                          appearanceSettings.theme === 'light'
                            ? 'text-blue-500'
                            : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          appearanceSettings.theme === 'light'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>Açık</span>
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          appearanceSettings.theme === 'dark'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <Moon className={`w-8 h-8 mb-2 ${
                          appearanceSettings.theme === 'dark'
                            ? 'text-blue-500'
                            : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          appearanceSettings.theme === 'dark'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>Koyu</span>
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                          appearanceSettings.theme === 'system'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <Smartphone className={`w-8 h-8 mb-2 ${
                          appearanceSettings.theme === 'system'
                            ? 'text-blue-500'
                            : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          appearanceSettings.theme === 'system'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>Sistem</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Kenar Çubuğu Daraltılmış</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Kenar çubuğunu daraltarak daha fazla alan kazanın</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={appearanceSettings.sidebarCollapsed}
                        onChange={() => setAppearanceSettings({
                          ...appearanceSettings, 
                          sidebarCollapsed: !appearanceSettings.sidebarCollapsed
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Yüksek Kontrast</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daha iyi okunabilirlik için kontrastı artırın</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={appearanceSettings.highContrast}
                        onChange={() => setAppearanceSettings({
                          ...appearanceSettings, 
                          highContrast: !appearanceSettings.highContrast
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Azaltılmış Animasyonlar</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daha iyi performans için animasyonları azaltın</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={appearanceSettings.animationsReduced}
                        onChange={() => setAppearanceSettings({
                          ...appearanceSettings, 
                          animationsReduced: !appearanceSettings.animationsReduced
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Kaydedildi!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}