'use client';

/**
 * Wallet Settings Page
 *
 * Page for managing Stellar wallet settings.
 * Users can connect/create wallets, switch networks, and view account details.
 */

import { useState } from 'react';
import { useStellarWallet } from '@/contexts/StellarWalletContext';
import { WalletStatusIndicator } from '@/components/stellar/WalletStatusIndicator';
import { WalletConnectionModal } from '@/components/stellar/WalletConnectionModal';
import { NetworkSwitcher } from '@/components/stellar/NetworkSwitcher';

export default function WalletSettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, balance, accountId } = useStellarWallet();

  // Truncate address for display
  const truncateAddress = (address: string | null) => {
    if (!address) return 'N/A';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Configurações da Carteira</h1>
        <p className="text-gray-600 mt-2">
          Gerencie sua carteira Stellar para pagamentos com criptomoedas
        </p>
      </div>

      <div className="space-y-6">
        {/* Network Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Rede Stellar</h2>
          <NetworkSwitcher />
          <p className="text-xs text-gray-500 mt-3">
            {isConnected
              ? 'Ao trocar de rede, você precisará reconectar sua carteira.'
              : 'Selecione a rede antes de conectar sua carteira.'}
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Carteira</h2>
          <WalletStatusIndicator onConnectClick={() => setIsModalOpen(true)} />
        </div>

        {/* Account Details */}
        {isConnected && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Account ID</p>
                <p
                  className="text-sm text-gray-800 font-mono break-all"
                  title={accountId || undefined}
                >
                  {truncateAddress(accountId)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className="text-lg font-semibold text-gray-800">{balance} XLM</p>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Sobre Passkeys</h3>
          <p className="text-sm text-blue-800 mb-3">
            Esta carteira utiliza a tecnologia WebAuthn para proteger seus ativos com
            biometria. Suas chaves privadas nunca saem do seu dispositivo e você pode
            autorizar transações usando impressão digital, Face ID, ou PIN do dispositivo.
          </p>
          <h3 className="font-semibold text-blue-900 mb-2 mt-4">Sobre Stellar</h3>
          <p className="text-sm text-blue-800">
            Stellar é uma rede blockchain projetada para facilitar pagamentos rápidos e
            de baixo custo. Com sua Smart Account, você pode enviar e receber XLM e outros
            ativos digitais com segurança.
          </p>
        </div>

        {/* Testnet Warning */}
        {isConnected && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">
                warning
              </span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Modo Testnet Ativado
                </h3>
                <p className="text-sm text-yellow-800">
                  Você está conectado à rede de teste. Os tokens XLM na Testnet não têm valor
                  real e são usados apenas para fins de teste. Use a Mainnet para transações
                  com valor real.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <WalletConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
