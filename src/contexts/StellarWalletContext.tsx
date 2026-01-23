'use client';

/**
 * Stellar Wallet Context
 *
 * React Context provider for managing Stellar wallet state and operations.
 * Integrates with TanStack Query for server state management and provides
 * hooks for components to interact with the Stellar wallet.
 *
 * This context is completely independent from the JWT authentication system
 * and only manages Web3/Stellar operations.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useGlobalToast } from '@/contexts/ToastContext';
import {
  StellarWalletState,
  StellarNetwork,
  StellarTransaction,
  StellarTransactionResult,
} from '@/types/stellar';
import { stellarService } from '@/services/stellarService';

interface StellarWalletContextValue extends StellarWalletState {
  connectWallet: () => Promise<void>;
  createWallet: (username?: string) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: StellarNetwork) => Promise<void>;
  sendTransaction: (transaction: StellarTransaction) => Promise<StellarTransactionResult>;
  getBalance: () => Promise<void>;
  refreshConnection: () => Promise<void>;
}

const StellarWalletContext = createContext<StellarWalletContextValue | undefined>(undefined);

interface StellarWalletProviderProps {
  children: React.ReactNode;
}

export function StellarWalletProvider({ children }: StellarWalletProviderProps) {
  const toast = useGlobalToast();
  const [state, setState] = useState<StellarWalletState>({
    isConnected: false,
    accountId: null,
    publicKey: null,
    balance: '0',
    network: 'testnet',
    isLoading: true,
    error: null,
  });

  // Initialize wallet on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const connected = await stellarService.initializeWallet();

        if (connected) {
          setState({
            isConnected: true,
            accountId: stellarService.getAccountId(),
            publicKey: stellarService.getAccountId(),
            balance: '0',
            network: stellarService.getNetwork(),
            isLoading: false,
            error: null,
          });

          // Fetch initial balance
          try {
            const balance = await stellarService.getBalance();
            setState((prev) => ({ ...prev, balance }));
          } catch (error) {
            console.error('Error fetching initial balance:', error);
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: (error as Error).message,
        }));
      }
    };

    initialize();
  }, []);

  // Connect wallet mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      return stellarService.connectWallet(true);
    },
    onSuccess: (data) => {
      setState({
        ...state,
        isConnected: true,
        accountId: data.accountId,
        publicKey: data.publicKey,
        network: stellarService.getNetwork(),
        error: null,
      });
      toast.success('Carteira Stellar conectada com sucesso!');
    },
    onError: (error: Error) => {
      setState({ ...state, error: error.message });
      if (error.message.includes('No wallet connected')) {
        toast.info('Nenhuma carteira encontrada. Crie uma nova carteira primeiro.');
      } else {
        toast.error(`Erro ao conectar: ${error.message}`);
      }
    },
  });

  // Create wallet mutation
  const createMutation = useMutation({
    mutationFn: async (username?: string) => {
      return stellarService.createWallet(username);
    },
    onSuccess: (data) => {
      setState({
        ...state,
        isConnected: true,
        accountId: data.accountId,
        publicKey: data.publicKey,
        network: stellarService.getNetwork(),
        error: null,
      });
      toast.success('Carteira Stellar criada com sucesso!');
    },
    onError: (error: Error) => {
      setState({ ...state, error: error.message });
      toast.error(`Erro ao criar carteira: ${error.message}`);
    },
  });

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    stellarService.disconnectWallet();
    setState({
      isConnected: false,
      accountId: null,
      publicKey: null,
      balance: '0',
      network: 'testnet',
      isLoading: false,
      error: null,
    });
    toast.info('Carteira desconectada');
  }, [toast]);

  // Switch network mutation
  const switchNetworkMutation = useMutation({
    mutationFn: async (network: StellarNetwork) => {
      return stellarService.switchNetwork(network);
    },
    onSuccess: (_, network) => {
      setState({
        isConnected: false,
        accountId: null,
        publicKey: null,
        balance: '0',
        network,
        isLoading: false,
        error: null,
      });
      toast.success(`Rede alterada para ${network}. Conecte sua carteira novamente.`);
    },
    onError: (error: Error) => {
      setState({ ...state, error: error.message });
      toast.error(`Erro ao trocar rede: ${error.message}`);
    },
  });

  // Send transaction mutation
  const sendTransactionMutation = useMutation({
    mutationFn: async (transaction: StellarTransaction) => {
      return stellarService.sendTransaction(transaction);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Transação enviada com sucesso!');
      } else {
        toast.error(`Erro na transação: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar transação: ${error.message}`);
    },
  });

  // Refresh balance query
  const balanceQuery = useQuery({
    queryKey: ['stellar-balance', state.accountId],
    queryFn: async () => {
      const balance = await stellarService.getBalance();
      setState((prev) => ({ ...prev, balance }));
      return balance;
    },
    enabled: state.isConnected,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const connectWallet = useCallback(async () => {
    await connectMutation.mutateAsync();
  }, [connectMutation]);

  const createWallet = useCallback(
    async (username?: string) => {
      await createMutation.mutateAsync(username);
    },
    [createMutation],
  );

  const switchNetwork = useCallback(
    async (network: StellarNetwork) => {
      await switchNetworkMutation.mutateAsync(network);
    },
    [switchNetworkMutation],
  );

  const sendTransaction = useCallback(
    async (transaction: StellarTransaction) => {
      try {
        const result = await sendTransactionMutation.mutateAsync(transaction);
        return result;
      } catch (error) {
        return {
          hash: '',
          success: false,
          error: (error as Error).message,
        };
      }
    },
    [sendTransactionMutation],
  );

  const getBalance = useCallback(async () => {
    if (state.isConnected) {
      await balanceQuery.refetch();
    }
  }, [state.isConnected, balanceQuery]);

  const refreshConnection = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const connected = await stellarService.initializeWallet();

      if (connected) {
        setState({
          isConnected: true,
          accountId: stellarService.getAccountId(),
          publicKey: stellarService.getAccountId(),
          balance: '0',
          network: stellarService.getNetwork(),
          isLoading: false,
          error: null,
        });

        // Fetch balance
        const balance = await stellarService.getBalance();
        setState((prev) => ({ ...prev, balance }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false, isConnected: false }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  const value: StellarWalletContextValue = {
    ...state,
    connectWallet,
    createWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    getBalance,
    refreshConnection,
  };

  return <StellarWalletContext.Provider value={value}>{children}</StellarWalletContext.Provider>;
}

/**
 * Hook to access the Stellar wallet context
 * @throws Error if used outside of StellarWalletProvider
 * @returns StellarWalletContextValue
 */
export function useStellarWallet() {
  const context = useContext(StellarWalletContext);
  if (!context) {
    throw new Error('useStellarWallet must be used within StellarWalletProvider');
  }
  return context;
}
