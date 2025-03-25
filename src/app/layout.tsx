import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import PageTransition from '@/components/PageTransition';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Apart Yönetim Sistemi',
  description: 'Apart yönetim ve kontrol sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}