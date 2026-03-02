/**
 * Review de Pagamento Stellar
 * Mostra resumo com conversão BRL → USDC, taxas detalhadas e wallet conectada
 */

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { MessageComponentData, ProductInfo } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';
import { useStellarWallet } from '@/hooks/useStellarWallet';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { STELLAR_FEES } from '@/utils/stellar/constants';
import { UsdcIcon } from '@/components/icons/UsdcIcon';
import { XlmIcon } from '@/components/icons/XlmIcon';

interface StellarPaymentReviewProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
  product: ProductInfo;
}

export function StellarPaymentReview({ product, checkout }: StellarPaymentReviewProps) {
  const { address, signTransaction } = useStellarWallet();

  // Get selected crypto asset from checkout state (default to XLM)
  const selectedAsset = (checkout.cryptoAsset as 'XLM' | 'USDC') || 'XLM';

  // Verificar se produto já está no asset selecionado
  const isProductInSelectedAsset = product.currency?.toUpperCase() === selectedAsset;

  // Só fazer conversão se produto estiver em BRL
  const { convertedAmount, exchangeRate, isLoading } = usePriceConversion(
    isProductInSelectedAsset ? 0 : product.price,
    'BRL',
    selectedAsset,
  );

  // Valor final no asset selecionado
  const amountCrypto = isProductInSelectedAsset ? product.price : convertedAmount;

  // Cálculo de taxas
  const fees = useMemo(() => {
    const networkFee = STELLAR_FEES.BASE_FEE_XLM;
    const spreadAmount = amountCrypto * STELLAR_FEES.SPREAD_PERCENT;
    const total = amountCrypto + networkFee + spreadAmount;

    return {
      networkFee,
      spreadPercent: STELLAR_FEES.SPREAD_PERCENT,
      spreadAmount,
      total,
    };
  }, [amountCrypto]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const handleChangeWallet = () => {
    // TODO: Implementar troca de wallet
    console.log('Trocar wallet');
  };

  const handleConfirm = () => {
    // Pass signTransaction function to confirmPayment for crypto payments
    checkout.confirmPayment(signTransaction);
  };

  return (
    <div className="space-y-3">
      {/* Card Principal - Resumo da Compra */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">
              receipt_long
            </span>
            Resumo da Compra
          </h2>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4">
          {/* Produto */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            {product.imageUrl ? (
              <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                Produto
              </p>
              <p className="text-sm font-medium text-gray-700 truncate">{product.name}</p>
            </div>
          </div>

          {/* Conversão de Preço */}
          <div className="space-y-2 text-sm">
            {/* Se produto já está no asset selecionado, mostrar direto */}
            {isProductInSelectedAsset ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço:</span>
                  <span className="font-semibold text-gray-900">
                    {product.price.toFixed(2)} {selectedAsset}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-2 mt-2"></div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Taxa da rede:</span>
                  <span className="text-gray-600">~{fees.networkFee.toFixed(5)} XLM</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    Spread ({(fees.spreadPercent * 100).toFixed(0)}%):
                  </span>
                  <span className="text-gray-600">
                    ~{fees.spreadAmount.toFixed(2)} {selectedAsset}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-2 mt-2"></div>

                <div className="flex justify-between items-center text-base font-semibold">
                  <span className="text-gray-900">TOTAL:</span>
                  <span className="text-blue-600">
                    {fees.total.toFixed(2)} {selectedAsset}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Produto em BRL, fazer conversão */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço em BRL:</span>
                  <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <span className="material-symbols-outlined animate-spin text-gray-400">
                      sync
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Taxa de conversão:</span>
                      <span>
                        1 {selectedAsset} = R$ {exchangeRate.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-2 mt-2"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor em {selectedAsset}:</span>
                      <span className="font-medium text-gray-900">
                        ~{amountCrypto.toFixed(2)} {selectedAsset}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Taxa da rede:</span>
                      <span className="text-gray-600">~{fees.networkFee.toFixed(5)} XLM</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Spread ({(fees.spreadPercent * 100).toFixed(0)}%):
                      </span>
                      <span className="text-gray-600">
                        ~{fees.spreadAmount.toFixed(2)} {selectedAsset}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-2 mt-2"></div>

                    <div className="flex justify-between items-center text-base font-semibold">
                      <span className="text-gray-900">TOTAL:</span>
                      <span className="text-blue-600">
                        {fees.total.toFixed(2)} {selectedAsset}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Wallet Conectada */}
          {address && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">wallet</span>
                    Wallet Conectada
                  </p>
                  <p className="text-sm font-mono font-medium text-gray-800 truncate">
                    {formatAddress(address)}
                  </p>
                </div>
                <button
                  onClick={handleChangeWallet}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2 flex-shrink-0"
                >
                  Trocar
                </button>
              </div>
            </div>
          )}

          {/* Aviso de Taxas */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5 flex-shrink-0">
                warning
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-yellow-900 mb-1">Taxas Estimadas</p>
                <p className="text-xs text-yellow-800">
                  As taxas podem variar ligeiramente no momento da confirmação na blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Confirmar */}
          <button
            onClick={handleConfirm}
            disabled={isLoading || !address}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-3.5 rounded-xl gradient-bg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Confirmar e Pagar</span>
          </button>
        </div>
      </div>

      {/* Seção de Dados do Cliente e Método (igual ao PaymentReview original) */}
      {checkout.customerData && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-600 text-[18px]">person</span>
              Seus Dados
            </h3>
          </div>

          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nome:</span>
              <span className="text-gray-900 font-medium">{checkout.customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900 font-medium">{checkout.customerData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">WhatsApp:</span>
              <span className="text-gray-900 font-medium">{checkout.customerData.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">CPF:</span>
              <span className="text-gray-900 font-medium">{checkout.customerData.cpf}</span>
            </div>

            <button
              onClick={() => checkout.editCustomerData()}
              className="w-full mt-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Editar dados
            </button>
          </div>
        </div>
      )}

      {/* Card de Método de Pagamento */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {selectedAsset === 'XLM' ? <XlmIcon size={18} /> : <UsdcIcon size={18} />}
            Método de Pagamento
          </h3>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                {selectedAsset === 'XLM' ? <XlmIcon size={24} /> : <UsdcIcon size={24} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedAsset} (Stellar)</p>
                <p className="text-xs text-gray-500">
                  {selectedAsset === 'XLM'
                    ? 'Ativo nativo • Taxas mínimas'
                    : 'Stablecoin • Pareado ao USD'}
                </p>
              </div>
            </div>

            <button
              onClick={() => checkout.changePaymentMethod()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Alterar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
