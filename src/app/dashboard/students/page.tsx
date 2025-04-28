'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Plus, 
  Calendar, 
  FileText, 
  CreditCard, 
  Building2, 
  Bed, 
  ArrowUpRight,
  Search,
  GraduationCap,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { guestsApi } from '@/lib/api/guests';
import { seasonRegistrationsApi } from '@/lib/api/seasonRegistrations';
import { overduePaymentsApi } from '@/lib/api/overduepayments';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/atoms/Card';

export default function StudentsOverviewPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingPayments: 0,
    upcomingRegistrations: 0,
    recentRegistrations: []
  });
  const toast = useToast();

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
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Paralel veri çekme işlemlerini gerçekleştirelim
      const [
        registrationsResponse,
        registrationStatsResponse,
        overduePaymentsResponse,
        upcomingRegistrationsResponse
      ] = await Promise.all([
        // Fetch recent registrations (son 5 kayıt)
        seasonRegistrationsApi.getAll(
          undefined, undefined, undefined, 'active', undefined, undefined, 1, 5
        ),
        
        // Fetch registration stats - öğrenci sayıları için
        seasonRegistrationsApi.getStats(),
        
        // Fetch overdue payments count
        overduePaymentsApi.getTotalOverduePayments(),
        
        // Fetch upcoming registrations count
        overduePaymentsApi.getUpcomingRegistrationsCount()
      ]);
      
      // Öğrenci sayısı istatistiklerini alma
      const totalStudents = registrationStatsResponse.success 
        ? registrationStatsResponse.data.totalGuestCount || 0 
        : 0;
        
      const activeStudents = registrationStatsResponse.success 
        ? registrationStatsResponse.data.activeGuestCount || 0 
        : 0;
      
      setStats({
        totalStudents,
        activeStudents,
        pendingPayments: overduePaymentsResponse.success ? overduePaymentsResponse.data.count : 0,
        upcomingRegistrations: upcomingRegistrationsResponse.success ? upcomingRegistrationsResponse.data.count : 0,
        recentRegistrations: registrationsResponse.data || []
      });
    } catch (error) {
      console.error('Dashboard verileri çekilirken hata oluştu:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Öğrenci Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Öğrenci kayıtlarını yönetin ve takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/students/registrations/new')}
            variant="primary"
            leftIcon={<UserPlus className="w-5 h-5" />}
          >
            Öğrenci Kaydı Oluştur
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Öğrenci ara..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push(`/dashboard/students/registrations?search=${e.currentTarget.value}`);
              }
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Toplam Öğrenci
            </CardTitle>
            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.totalStudents
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Kayıtlı öğrenci sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Aktif Öğrenciler
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.activeStudents
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Aktif durumdaki öğrenciler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Bekleyen Ödemeler
            </CardTitle>
            <CreditCard className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.pendingPayments
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bekleyen ödeme sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Yaklaşan Kayıtlar
            </CardTitle>
            <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                stats.upcomingRegistrations
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Önümüzdeki 30 gün içinde
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Son Kayıtlar
          </h2>
          <Button 
            onClick={() => router.push('/dashboard/students/registrations')}
            variant="secondary"
            size="sm"
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Tümünü Gör
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stats.recentRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Apart
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tarih Aralığı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentRegistrations.map((registration: any) => (
                    <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {registration.guest?.person ? `${registration.guest.person.name} ${registration.guest.person.surname}` : 'İsimsiz Öğrenci'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {registration.guest?.professionDepartment || 'Bölüm belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="flex-shrink-0 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-sm text-gray-900 dark:text-white">
                          {registration.bed?.room?.apart?.name || 'Belirtilmemiş'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Bed className="inline-block mr-1 h-3 w-3" />
                          Yatak {registration.bed?.bedNumber || registration.bed?.bed_number || 'Belirtilmemiş'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(registration.checkInDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(registration.checkOutDate).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : registration.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {registration.status === 'active' ? 'Aktif' : 
                           registration.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/students/registrations/${registration.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Henüz kayıt bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => router.push('/dashboard/students/registrations/new')}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yeni Kayıt</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Yeni öğrenci kaydı oluşturun</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => router.push('/dashboard/students/registrations?status=active')}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aktif Kayıtlar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktif öğrenci kayıtlarını görüntüleyin</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => router.push('/dashboard/students/registrations?filter=overdue')}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geciken Ödemeler</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Geciken ödemeleri kontrol edin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}