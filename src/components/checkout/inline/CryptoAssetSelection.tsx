/**
 * Seleção de Ativo Crypto (USDC, XLM, etc)
 * Etapa intermediária após escolher "Crypto" como método de pagamento
 */

'use client';

import { UsdcIcon } from '@/components/icons/UsdcIcon';
import { XlmIcon } from '@/components/icons/XlmIcon';

type CryptoAsset = 'USDC' | 'XLM';

interface CryptoAssetSelectionProps {
    onSelect: (asset: CryptoAsset) => void;
    onBack: () => void;
}

export function CryptoAssetSelection({ onSelect, onBack }: CryptoAssetSelectionProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                </button>
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Escolha a Criptomoeda</h3>
                    <p className="text-xs text-gray-500">Selecione qual ativo deseja usar</p>
                </div>
            </div>

            {/* Opções de Moedas */}
            <div className="space-y-3">
                {/* USDC */}
                <button
                    onClick={() => onSelect('USDC')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                        <UsdcIcon size={32} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">USDC</p>
                        <p className="text-xs text-gray-500">Stellar Network • Stablecoin</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600">
                        chevron_right
                    </span>
                </button>

                {/* XLM - Desabilitado por enquanto */}
                <button
                    disabled
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                >
                    <div className="w-12 h-12 rounded-xl bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <XlmIcon size={28} />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">XLM</p>
                        <p className="text-xs text-gray-500">Stellar Lumens • Em breve</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">lock</span>
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5 flex-shrink-0">
                        info
                    </span>
                    <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">Sobre USDC</p>
                        <p className="text-xs text-blue-800">
                            USDC é uma stablecoin pareada 1:1 com o Dólar Americano. Transações rápidas e taxas baixas na rede Stellar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
