/**
 * Step de Conexão de Wallet Stellar
 * Componente inline para permitir usuário conectar sua wallet Stellar
 */

'use client';

import { useStellarWallet } from '@/hooks/useStellarWallet';
import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';

interface WalletConnectionStepProps {
    data: MessageComponentData;
    checkout: UseCheckoutReturn;
}

export function WalletConnectionStep({ checkout }: WalletConnectionStepProps) {
    const { isConnecting, error, connect } = useStellarWallet();

    const handleConnect = async () => {
        try {
            const address = await connect();
            if (address) {
                // Navegar para próximo step através do checkout
                // checkout.onWalletConnected(address); // TODO: Implementar no useCheckout
                console.log('Wallet conectada:', address);
            }
        } catch (err) {
            console.error('Erro ao conectar wallet:', err);
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
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-3.5 rounded-xl gradient-bg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <span
                    className={`material-symbols-outlined text-xl ${isConnecting ? 'animate-spin' : ''}`}
                >
                    {isConnecting ? 'sync' : 'account_balance_wallet'}
                </span>
                <span>{isConnecting ? 'Conectando...' : 'Conectar Wallet Stellar'}</span>
            </button>

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
