import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ReactQueryProvider } from '@/context/ReactQueryProvider';
import PageTransition from '@/components/PageTransition';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthGuard from '@/components/auth/AuthGuard';
import AuthStateHydrator from '@/components/auth/AuthStateHydrator';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Blexi - Apart Yönetim Sistemi',
  description: 'Profesyonel apart ve yurt yönetim sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ReactQueryProvider>
            <ThemeProvider>
              <ToastProvider>
                <AuthStateHydrator />
                <PageTransition>
                  <AuthGuard>
                    {children}
                  </AuthGuard>
                </PageTransition>
              </ToastProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}