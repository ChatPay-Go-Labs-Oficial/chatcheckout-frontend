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
        {/* USDC - Primary option (fully supported) */}
        <button
          onClick={() => onSelect('USDC')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-500 bg-green-50 hover:border-green-600 hover:bg-green-100 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-green-200 flex items-center justify-center flex-shrink-0">
            <UsdcIcon size={32} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">USDC</p>
              <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-medium">
                Disponível
              </span>
            </div>
            <p className="text-xs text-gray-600">Stellar Network • Stablecoin (USD)</p>
          </div>
          <span className="material-symbols-outlined text-green-600 group-hover:text-green-700">
            chevron_right
          </span>
        </button>

        {/* XLM - Now available */}
        <button
          onClick={() => onSelect('XLM')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:border-blue-600 hover:bg-blue-100 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
            <XlmIcon size={28} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">XLM</p>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                Disponível
              </span>
            </div>
            <p className="text-xs text-gray-600">Stellar Network • Nativo</p>
          </div>
          <span className="material-symbols-outlined text-blue-600 group-hover:text-blue-700">
            chevron_right
          </span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5 flex-shrink-0">
            info
          </span>
          <div>
            <p className="text-xs font-semibold text-blue-900 mb-1">Pagamento com Criptomoedas</p>
            <p className="text-xs text-blue-800">
              <strong>USDC:</strong> Stablecoin atrelada ao Dólar (valor estável).
            </p>
            <p className="text-xs text-blue-800">
              <strong>XLM:</strong> Moeda nativa da Stellar Network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
