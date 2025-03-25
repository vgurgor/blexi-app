import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ReactQueryProvider } from '@/context/ReactQueryProvider';
import PageTransition from '@/components/PageTransition';
import ErrorBoundary from '@/components/ErrorBoundary';
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
                <PageTransition>
                  {children}
                </PageTransition>
              </ToastProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}