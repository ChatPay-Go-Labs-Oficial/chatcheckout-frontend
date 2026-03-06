/**
 * Review de Pagamento Stellar
 * UI com hierarquia visual clara: produto → valor → dados → ação
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
import { STELLAR_CONFIG } from '@/utils/stellar/constants';

interface StellarPaymentReviewProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
  product: ProductInfo;
}

export function StellarPaymentReview({ checkout, product }: StellarPaymentReviewProps) {
  const { address, signTransaction } = useStellarWallet();

  const selectedAsset = (checkout.cryptoAsset as 'XLM' | 'USDC') || 'XLM';
  const isProductInSelectedAsset = product.currency?.toUpperCase() === selectedAsset;

  const { convertedAmount, exchangeRate, isLoading } = usePriceConversion(
    isProductInSelectedAsset ? 0 : product.price,
    'BRL',
    selectedAsset,
  );

  const amountCrypto = isProductInSelectedAsset ? product.price : convertedAmount;

  const fees = useMemo(() => {
    const networkFee = STELLAR_FEES.BASE_FEE_XLM;
    const spreadAmount = amountCrypto * STELLAR_FEES.SPREAD_PERCENT;
    const total = amountCrypto + networkFee + spreadAmount;
    return { networkFee, spreadPercent: STELLAR_FEES.SPREAD_PERCENT, spreadAmount, total };
  }, [amountCrypto]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const formatAddress = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : '');

  const handleConfirm = () => checkout.confirmPayment(signTransaction);
  const customerData = checkout.customerData;

  return (
    <div className="space-y-2">
      {/* ── CARD PRINCIPAL ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">
              receipt_long
            </span>
            Resumo da Compra
          </h2>
        </div>

        {/* ── Produto ── */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          {product.imageUrl ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-lg">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              Produto
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {product.name}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── Valor Total — destaque principal ── */}
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Valor a pagar
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 py-1">
              <span className="material-symbols-outlined animate-spin text-violet-400 text-[20px]">
                sync
              </span>
              <span className="text-sm text-gray-400">Calculando...</span>
            </div>
          ) : (
            <div className="flex items-end justify-between">
              {/* Total em destaque */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  {selectedAsset === 'USDC' ? <UsdcIcon size={22} /> : <XlmIcon size={22} />}
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {fees.total.toFixed(selectedAsset === 'USDC' ? 2 : 5)}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">{selectedAsset}</span>
                </div>
                {!isProductInSelectedAsset && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Cotação: 1 {selectedAsset} = R$ {exchangeRate.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Badge da rede Stellar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-400">Rede:</span>
                <div className="flex items-center gap-1">
                  {/* Badge Stellar — rede sempre XLM/Stellar independente do asset */}
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                    <XlmIcon size={12} />
                    <span className="text-[11px] font-semibold text-gray-800">Stellar</span>
                  </div>
                  {/* Badge Testnet / Mainnet */}
                  {STELLAR_CONFIG.NETWORK === 'public' ? (
                    <div className="flex items-center px-2 py-1 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-[11px] font-semibold text-green-700">Mainnet</span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="text-[11px] font-semibold text-amber-700">Testnet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detalhamento de taxas — hierarquia secundária */}
          {!isLoading && (
            <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5 space-y-1.5">
              {!isProductInSelectedAsset && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-600 font-medium">
                    ~{amountCrypto.toFixed(5)} {selectedAsset}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Taxa da rede</span>
                <span className="text-gray-600">~{fees.networkFee.toFixed(5)} XLM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">
                  Spread ({(fees.spreadPercent * 100).toFixed(0)}%)
                </span>
                <span className="text-gray-600">
                  ~{fees.spreadAmount.toFixed(5)} {selectedAsset}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-1.5 flex justify-between text-xs font-semibold">
                <span className="text-gray-600">Total estimado</span>
                <span className="text-violet-600">
                  ~{fees.total.toFixed(5)} {selectedAsset}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Wallet ── */}
        {address && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-gray-500 text-[16px]">wallet</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Wallet conectada
                </p>
                <p className="text-xs font-mono font-semibold text-gray-700 truncate">
                  {formatAddress(address)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Dados do Cliente ── */}
        {customerData && (
          <>
            <div className="border-t border-gray-100" />
            <div className="px-4 py-3">
              <div className="flex justify-between items-center mb-2.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">person</span>
                  Seus Dados
                </p>
                <button
                  onClick={checkout.editCustomerData}
                  className="text-[10px] font-semibold text-violet-500 hover:text-violet-700 transition-colors flex items-center gap-0.5 px-2 py-1 rounded-md hover:bg-violet-50"
                >
                  <span className="material-symbols-outlined text-[12px]">edit</span>
                  Editar
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { icon: 'badge', label: 'Nome', value: customerData.name },
                  { icon: 'mail', label: 'E-mail', value: customerData.email },
                  { icon: 'fingerprint', label: 'CPF', value: customerData.cpf },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-400 text-[14px]">
                        {icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-xs font-medium text-gray-700 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Aviso de taxas ── */}
      <div className="bg-yellow-50 rounded-lg px-3 py-2.5 border border-yellow-200 flex items-start gap-2">
        <span className="material-symbols-outlined text-yellow-600 text-[16px] mt-0.5 flex-shrink-0">
          warning
        </span>
        <p className="text-xs text-yellow-800">
          <span className="font-semibold">Taxas estimadas.</span> Os valores podem variar
          ligeiramente no momento da confirmação na blockchain.
        </p>
      </div>

      {/* ── CTAs ── */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={isLoading || !address}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white px-4 py-3.5 rounded-xl gradient-bg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
          Confirmar e Pagar
        </button>

        <button
          onClick={() => checkout.changePaymentMethod()}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          Alterar forma de Pagamento
        </button>
      </div>
    </div>
  );
}
