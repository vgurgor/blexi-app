'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/utils/validations/user';
import { Form, FormInput, FormCheckbox } from '@/components/ui';
import { Button } from '@/components/ui/atoms/Button';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Get the callbackUrl from search params (for redirecting after login)
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Initialize the form with validation schema
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, router, callbackUrl]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    
    try {
      // The rememberMe parameter will affect token expiration
      const success = await login(data.username, data.password);
      if (success) {
        // Cookie'yi kontrol et
        setTimeout(() => {
          const cookies = document.cookie.split(';');
          const hasAuthToken = cookies.some(c => c.trim().startsWith('auth_token='));
          console.log('Login sonrası auth_token kontrolü:', hasAuthToken);
          
          // Zustand store'dan token'ı kontrol et
          const token = useAuthStore.getState().token;
          console.log('Zustand token kontrolü:', token ? 'Token var' : 'Token yok');
          
          // Dashboard'a yönlendir
          router.push(callbackUrl);
        }, 100);
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Giriş sırasında bir hata oluştu');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 dark:bg-clip-text">
              BLEXI
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Yönetim Paneline Hoş Geldiniz
            </p>
          </div>

          <Form form={form} onSubmit={onSubmit} className="space-y-6">
            {serverError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {serverError}
              </div>
            )}
            
            <FormInput
              name="username"
              label="Kullanıcı Adı"
              type="text"
              autoComplete="username"
              placeholder="kullanici.adi"
              className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 dark:focus:ring-cyan-400/50 transition-all"
            />
            
            <FormInput
              name="password"
              label="Şifre"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 dark:focus:ring-cyan-400/50 transition-all"
            />
            
            <div className="flex items-center justify-between">
              <FormCheckbox
                name="rememberMe"
                label="Beni hatırla"
              />
              
              <div className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer">
                Şifremi unuttum
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={!isLoading && <LogIn className="w-5 h-5" />}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Giriş Yap
            </Button>
            
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Yeni kullanıcı kaydı için sistem yöneticinize başvurun.
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}