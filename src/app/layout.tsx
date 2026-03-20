import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthGuard } from '@/components/AuthGuard';
import QueryProvider from '@/components/providers/QueryProvider';
import { StellarWalletProvider } from '@/contexts/StellarWalletContext';
import { StellarWalletsKitProvider } from '@/app/providers/StellarWalletProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ChatCheckout',
  description: 'ChatCheckout application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ToastProvider>
            <StellarWalletsKitProvider>
              <StellarWalletProvider>
                <AuthGuard />
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </StellarWalletProvider>
            </StellarWalletsKitProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
