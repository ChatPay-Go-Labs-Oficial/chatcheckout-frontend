'use client';

/**
 * Network Switcher
 *
 * Component for switching between Stellar Testnet and Mainnet.
 * Shows the current network and allows switching with visual feedback.
 */

import { useStellarWallet } from '@/contexts/StellarWalletContext';

export function NetworkSwitcher() {
  const { network, switchNetwork, isLoading } = useStellarWallet();

  const handleNetworkChange = async (newNetwork: 'testnet' | 'mainnet') => {
    if (newNetwork !== network && !isLoading) {
      await switchNetwork(newNetwork);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Rede:</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleNetworkChange('testnet')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            network === 'testnet'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Testnet
        </button>
        <button
          onClick={() => handleNetworkChange('mainnet')}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            network === 'mainnet'
              ? 'bg-purple-100 text-purple-700 border border-purple-300'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Mainnet
        </button>
      </div>
    </div>
  );
}
