'use client';

/**
 * Wallet Status Indicator
 *
 * Component that displays the current connection status of the Stellar wallet.
 * Shows connection details when connected and a connect button when disconnected.
 */

import { useStellarWallet } from '@/contexts/StellarWalletContext';

interface WalletStatusIndicatorProps {
  onConnectClick: () => void;
}

export function WalletStatusIndicator({ onConnectClick }: WalletStatusIndicatorProps) {
  const { isConnected, publicKey, balance, disconnectWallet, network } = useStellarWallet();

  // Truncate address for display (e.g., "CDLZ...QLFO")
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white">check_circle</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Carteira Conectada</p>
          <p className="text-xs text-gray-600 truncate" title={publicKey || undefined}>
            {truncateAddress(publicKey)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-medium text-green-700">Saldo: {balance} XLM</p>
            <span className="text-xs text-gray-400">•</span>
            <p className="text-xs text-gray-600 capitalize">{network}</p>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          title="Desconectar carteira"
        >
          <span className="material-symbols-outlined text-red-600">logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnectClick}
      className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
    >
      <span className="material-symbols-outlined">account_balance_wallet</span>
      Conectar Carteira Stellar
    </button>
  );
}
