'use client';

import { useEffect } from 'react';
import { StellarWalletsKit } from '@jsr/creit-tech__stellar-wallets-kit/sdk';
import type { SwkAppTheme } from '@jsr/creit-tech__stellar-wallets-kit/types';
import { FreighterModule } from '@jsr/creit-tech__stellar-wallets-kit/modules/freighter';
import { LobstrModule } from '@jsr/creit-tech__stellar-wallets-kit/modules/lobstr';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

/**
 * ChatCheckout Dark Theme for Stellar Wallets Kit
 * Customizado com as cores da marca
 */
const chatCheckoutTheme: SwkAppTheme = {
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
    'font-family': "var(--font-geist-sans), system-ui, -apple-system, sans-serif",

    // Border radius
    'border-radius': '0.75rem',
};

/**
 * Stellar Wallet Provider
 * Inicializa o Stellar Wallets Kit no app
 */
export function StellarWalletProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Apenas executar no cliente
        if (typeof window === 'undefined') {
            return;
        }

        try {
            // Inicializar Stellar Wallets Kit
            StellarWalletsKit.init({
                theme: chatCheckoutTheme,
                modules: [
                    new FreighterModule(),
                    new LobstrModule(),
                ],
                network: STELLAR_CONFIG.NETWORK,
            });

            console.log('[StellarWalletProvider] Stellar Wallets Kit inicializado:', {
                network: STELLAR_CONFIG.NETWORK,
                modules: ['Freighter', 'Lobstr'],
            });
        } catch (error) {
            console.error('[StellarWalletProvider] Erro ao inicializar Stellar Wallets Kit:', error);
        }
    }, []);

    return <>{children}</>;
}
