/**
 * Step de Conexão de Wallet Stellar
 * Componente inline para permitir usuário conectar sua wallet Stellar
 */

'use client';

import { useState } from 'react';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';

interface WalletConnectionStepProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
}

export function WalletConnectionStep({ checkout }: WalletConnectionStepProps) {
  const { address, isConnected, isConnecting, error, connect } = useStellarWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConnect = async () => {
    console.log('[WalletConnectionStep] handleConnect chamado', {
      isConnected,
      address,
      hasHandleWalletConnected: !!checkout.handleWalletConnected,
    });

    try {
      // Se já estiver conectado, apenas prosseguir
      if (isConnected && address) {
        setIsProcessing(true);
        console.log('[WalletConnectionStep] Chamando handleWalletConnected com:', address);

        if (!checkout.handleWalletConnected) {
          console.error('[WalletConnectionStep] handleWalletConnected não existe no checkout!');
          setIsProcessing(false);
          return;
        }

        await checkout.handleWalletConnected(address);
        console.log('[WalletConnectionStep] handleWalletConnected completado');
        return;
      }

      // Conectar wallet
      console.log('[WalletConnectionStep] Conectando wallet...');
      setIsProcessing(true);
      const connectedAddress = await connect();
      console.log('[WalletConnectionStep] Wallet conectada:', connectedAddress);

      if (connectedAddress) {
        // Chamar o hook do checkout para notificar que a wallet foi conectada
        await checkout.handleWalletConnected?.(connectedAddress);
      }
    } catch (err) {
      console.error('[WalletConnectionStep] Erro ao conectar wallet:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-3">
      {/* Header com ícone */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-2xl">
            account_balance_wallet
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Conectar Carteira Stellar</h3>
          <p className="text-sm text-gray-500">Pague com USDC na rede Stellar</p>
        </div>
      </div>

      {/* Descrição */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-4">
          Para pagar com <strong>USDC</strong>, você precisa conectar sua carteira Stellar.
        </p>

        {/* Carteiras suportadas */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-900 mb-2">Carteiras suportadas:</p>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>
                <strong>Freighter</strong> - Extensão para Chrome/Firefox
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>
                <strong>Lobstr</strong> - App mobile e web wallet
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </p>
        </div>
      )}

      {/* Botão de Conexão */}
      <button
        onClick={handleConnect}
        disabled={isConnecting || isProcessing}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-3.5 rounded-xl gradient-bg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span
          className={`material-symbols-outlined text-xl ${
            isConnecting || isProcessing ? 'animate-spin' : ''
          }`}
        >
          {isConnecting || isProcessing
            ? 'sync'
            : isConnected
              ? 'check_circle'
              : 'account_balance_wallet'}
        </span>
        <span>
          {isProcessing
            ? 'Preparando...'
            : isConnecting
              ? 'Conectando...'
              : isConnected
                ? 'Continuar com Wallet Conectada'
                : 'Conectar Wallet Stellar'}
        </span>
      </button>

      {/* Mensagem se já estiver conectado */}
      {isConnected && address && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            Wallet já conectada:{' '}
            <span className="font-mono font-medium">
              {address.slice(0, 6)}...{address.slice(-6)}
            </span>
          </p>
        </div>
      )}

      {/* Security badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-green-500 text-sm">verified</span>
          <span>Seguro</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-green-500 text-sm">lock</span>
          <span>Descentralizado</span>
        </div>
      </div>
    </div>
  );
}
