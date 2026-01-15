'use client';

/**
 * Wallet Connection Modal
 *
 * Modal component for creating or connecting to a Stellar wallet.
 * Provides options to create a new wallet with passkey or connect to an existing one.
 */

import { useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { connectWallet, createWallet, isLoading } = useStellarWallet();
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      await connectWallet();
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      await createWallet();
      onClose();
    } catch (error) {
      console.error('Creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#6f43d0] to-[#6fdcff] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-3xl">
              account_balance_wallet
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Carteira Stellar</h2>
          <p className="text-gray-600 mt-2">
            Conecte ou crie sua carteira para pagamentos com criptomoedas
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreate}
            disabled={isLoading || isCreating}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Criando carteira...' : 'Criar Nova Carteira'}
          </button>

          <button
            onClick={handleConnect}
            disabled={isLoading || isCreating}
            className="w-full py-3 px-4 bg-white border-2 border-[#6f43d0] text-[#6f43d0] font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Conectando...' : 'Conectar Carteira Existente'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-800 text-center">
            <strong>Nota:</strong> Você usará biometria (impressão digital, Face ID) para
            autorizar transações. Suas chaves nunca saem do seu dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}
