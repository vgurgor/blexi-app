"use client";

import Link from 'next/link';
import { Button } from '../components/ui/atoms/Button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={handleGoBack} variant="ghost" className="w-full">
            Önceki Sayfaya Dön
          </Button>
          <Link href="/dashboard" passHref>
            <Button variant="primary" className="w-full">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}