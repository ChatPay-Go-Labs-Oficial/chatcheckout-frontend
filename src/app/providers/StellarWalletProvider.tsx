'use client';

import { useEffect } from 'react';
import { NoSSR } from '@/components/providers/NoSSR';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

/**
 * ChatCheckout Dark Theme for Stellar Wallets Kit
 * Customizado com as cores da marca
 */
const chatCheckoutTheme = {
  // Colors
  primary: '#1992e6', // Azul ChatCheckout
  'primary-foreground': '#ffffff',
  background: '#181b4a', // Fundo escuro
  'background-secondary': '#0f1419',
  card: '#1a1f3a',
  'card-foreground': '#ffffff',
  popover: '#1a1f3a',
  'popover-foreground': '#ffffff',
  secondary: '#3b82f6',
  'secondary-foreground': '#ffffff',
  muted: '#374151',
  'muted-foreground': '#9ca3af',
  accent: '#3b82f6',
  'accent-foreground': '#ffffff',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#374151',
  input: '#374151',
  ring: '#1992e6',

  // Typography
  'font-family': 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',

  // Border radius
  'border-radius': '0.75rem',
};

/**
 * Client-side component that initializes Stellar Wallets Kit
 * This component is only rendered after hydration to prevent SSR issues
 */
function StellarWalletsKitInitializer() {
  useEffect(() => {
    const initializeKit = async () => {
      // Dynamic import to prevent SSR from loading the library
      const { StellarWalletsKit } = await import('@jsr/creit-tech__stellar-wallets-kit/sdk');
      const { FreighterModule } =
        await import('@jsr/creit-tech__stellar-wallets-kit/modules/freighter');
      const { LobstrModule } = await import('@jsr/creit-tech__stellar-wallets-kit/modules/lobstr');

      try {
        // Inicializar Stellar Wallets Kit
        StellarWalletsKit.init({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          theme: chatCheckoutTheme as any,
          modules: [new FreighterModule(), new LobstrModule()],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          network: STELLAR_CONFIG.NETWORK as any,
        });

        console.log('[StellarWalletProvider] Stellar Wallets Kit inicializado:', {
          network: STELLAR_CONFIG.NETWORK,
          modules: ['Freighter', 'Lobstr'],
        });
      } catch (error) {
        console.error('[StellarWalletProvider] Erro ao inicializar Stellar Wallets Kit:', error);
      }
    };

    initializeKit();
  }, []);

  return null;
}

/**
 * Stellar Wallets Kit Provider
 * Inicializa o Stellar Wallets Kit no app apenas no client-side
 * Usa NoSSR para garantir que nada rode durante SSR
 */
export function StellarWalletsKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoSSR>
        <StellarWalletsKitInitializer />
      </NoSSR>
      {children}
    </>
  );
}
