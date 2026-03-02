'use client';

import { useEffect } from 'react';
import { NoSSR } from '@/components/providers/NoSSR';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

/**
 * ChatCheckout Light Theme for Stellar Wallets Kit
 * Customizado com as cores claras da marca para harmonizar com a UI
 */
const chatCheckoutTheme = {
  // Colors
  primary: '#7c3aed', // Roxo/Azul vibrante do botão
  'primary-foreground': '#ffffff',
  background: '#ffffff', // Fundo branco
  'background-secondary': '#f9fafb',
  card: '#ffffff',
  'card-foreground': '#111827',
  popover: '#ffffff',
  'popover-foreground': '#111827',
  secondary: '#f1f5f9',
  'secondary-foreground': '#111827',
  muted: '#f8fafc',
  'muted-foreground': '#64748b',
  accent: '#f1f5f9',
  'accent-foreground': '#1e293b',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#e2e8f0',
  input: '#f8fafc',
  ring: '#7c3aed',

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
