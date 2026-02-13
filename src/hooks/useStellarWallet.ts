'use client';

import { useState, useEffect, useCallback } from 'react';
import { StellarWalletsKit } from '@jsr/creit-tech__stellar-wallets-kit/sdk';
import { KitEventType, Networks } from '@jsr/creit-tech__stellar-wallets-kit/types';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

/**
 * useStellarWallet Hook Return Type
 */
interface UseStellarWalletReturn {
  /** Endereço da wallet conectada */
  address: string | undefined;
  /** Status de conexão */
  isConnected: boolean;
  /** Estado de carregamento durante conexão */
  isConnecting: boolean;
  /** Erro durante conexão ou operações */
  error: string | null;
  /** Conectar wallet (abre modal de seleção) */
  connect: () => Promise<string | undefined>;
  /** Desconectar wallet */
  disconnect: () => void;
  /** Assinar transação XDR */
  signTransaction: (txXdr: string) => Promise<string>;
}

/**
 * useStellarWallet
 * Hook para gerenciar conexão com wallets Stellar (Freighter, Lobstr)
 *
 * @example
 * ```ts
 * const { address, isConnected, connect } = useStellarWallet();
 *
 * // Conectar wallet
 * const walletAddress = await connect();
 *
 * // Assinar transação
 * const signedTx = await signTransaction(xdr);
 * ```
 */
export function useStellarWallet(): UseStellarWalletReturn {
  const [address, setAddress] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar e escutar eventos do kit
  useEffect(() => {
    // Apenas executar no cliente
    if (typeof window === 'undefined') {
      return;
    }

    // Tentar obter endereço existente (se já conectou anteriormente)
    StellarWalletsKit.getAddress()
      .then(({ address }) => {
        if (address) {
          setAddress(address);
          setIsConnected(true);
          console.log('[useStellarWallet] Wallet already connected:', address);
        }
      })
      .catch(() => {
        // Não foi possível obter endereço (normal se não conectou ainda)
        setIsConnected(false);
      });

    // Escutar mudanças de estado (troca de conta, desconexão, etc.)
    const unsubscribeStateUpdated = StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
      console.log('[useStellarWallet] STATE_UPDATED:', event.payload);
      setAddress(event.payload.address);
      setIsConnected(!!event.payload.address);
    });

    // Escutar evento de desconexão
    const unsubscribeDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      console.log('[useStellarWallet] DISCONNECT');
      setAddress(undefined);
      setIsConnected(false);
    });

    // Cleanup: desinscrever eventos ao desmontar
    return () => {
      unsubscribeStateUpdated();
      unsubscribeDisconnect();
    };
  }, []);

  /**
   * Conectar wallet
   * Abre modal do Stellar Wallets Kit para selecionar wallet
   */
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('[useStellarWallet] Opening wallet selection modal...');

      // Abrir modal de autenticação
      const { address } = await StellarWalletsKit.authModal();

      console.log('[useStellarWallet] Wallet connected:', address);

      setAddress(address);
      setIsConnected(true);

      return address;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar wallet';
      console.error('[useStellarWallet] Connection error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Desconectar wallet
   * Reseta estado local (Stellar Wallets Kit não tem método público de disconnect)
   */
  const disconnect = useCallback(() => {
    console.log('[useStellarWallet] Disconnecting wallet...');
    setAddress(undefined);
    setIsConnected(false);
    setError(null);
  }, []);

  /**
   * Assinar transação
   * @param txXdr XDR da transação a ser assinada
   * @returns XDR da transação assinada
   */
  const signTransaction = useCallback(
    async (txXdr: string) => {
      if (!address) {
        throw new Error('Nenhuma wallet conectada');
      }

      try {
        console.log('[useStellarWallet] Signing transaction...');

        // Determinar network passphrase
        const networkPassphrase =
          STELLAR_CONFIG.NETWORK === 'public' ? Networks.PUBLIC : Networks.TESTNET;

        // Assinar transação
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
          networkPassphrase,
          address,
        });

        console.log('[useStellarWallet] Transaction signed successfully');

        return signedTxXdr;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao assinar transação';
        console.error('[useStellarWallet] Signing error:', err);
        setError(errorMessage);
        throw err;
      }
    },
    [address]
  );

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
