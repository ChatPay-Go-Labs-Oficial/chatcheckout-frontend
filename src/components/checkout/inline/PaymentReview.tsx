/**
 * Card de revisão da compra antes do pagamento
 */

'use client';

import Image from 'next/image';
import { MessageComponentData, ProductInfo } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';
import { UsdcIcon } from '@/components/icons/UsdcIcon';
import { XlmIcon } from '@/components/icons/XlmIcon';

interface PaymentReviewProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
  product: ProductInfo;
}

export function PaymentReview({ data, checkout, product }: PaymentReviewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getPaymentMethodLabel = () => {
    if (data.paymentMethod === 'pix') return 'Pix';
    if (data.paymentMethod === 'card') return 'Cartão';
    // Se for crypto e tiver moeda selecionada, mostra "Crypto | USDC"
    if (data.paymentMethod === 'crypto' && data.cryptoAsset) {
      return `Crypto | ${data.cryptoAsset}`;
    }
    return 'Crypto';
  };

  const getPaymentMethodIcon = () => {
    if (data.paymentMethod === 'pix') return 'qr_code_scanner';
    if (data.paymentMethod === 'card') return 'credit_card';
    return 'currency_bitcoin';
  };

  return (
    <div className="space-y-3">
      {/* Card Principal - Resumo da Compra */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header compacto */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">
              receipt_long
            </span>
            Resumo da Compra
          </h2>
        </div>

        {/* Conteúdo do resumo - mais compacto */}
        <div className="p-4 space-y-3">
          {/* Produto com imagem */}
          <div className="flex items-center gap-3">
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

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Valor e Forma de Pagamento */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500 font-medium">Valor Total</p>
              {product.currency === 'USDC' || data.paymentMethod === 'crypto' ? (
                <p className="text-xl font-semibold text-gray-700">
                  {Number(product.price).toFixed(2)} {product.currency || 'USDC'}
                </p>
              ) : (
                <p className="text-xl font-semibold text-gray-700">
                  {formatPrice(Number(product.price))}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
              {/* Ícone dinâmico baseado no método e moeda */}
              {data.paymentMethod === 'crypto' ? (
                <>
                  {data.cryptoAsset === 'USDC' ? (
                    <UsdcIcon size={28} />
                  ) : data.cryptoAsset === 'XLM' ? (
                    <XlmIcon size={28} />
                  ) : (
                    // Fallback genérico crypto
                    <span className="material-symbols-outlined text-gray-500 text-[18px]">
                      currency_bitcoin
                    </span>
                  )}
                </>
              ) : (
                <span className="material-symbols-outlined text-gray-500 text-[18px]">
                  {getPaymentMethodIcon()}
                </span>
              )}
              <span className="text-sm font-medium text-gray-700">{getPaymentMethodLabel()}</span>
            </div>
          </div>
        </div>

        {/* Dados do Cliente - compacto */}
        {data.customerData && (
          <>
            <div className="border-t border-gray-100"></div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gray-600 text-[18px]">
                    person
                  </span>
                  Seus Dados
                </h3>
                <button
                  onClick={checkout.editCustomerData}
                  className="text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      badge
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 font-medium">Nome</p>
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {data.customerData.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      mail
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 font-medium">E-mail</p>
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {data.customerData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gray-500 text-[16px]">
                      fingerprint
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 font-medium">CPF</p>
                    <p className="text-xs font-medium text-gray-700">{data.customerData.cpf}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botões de Ação - compactos */}
      <div className="space-y-2">
        <button
          onClick={() => checkout.confirmPayment()}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-3 rounded-xl gradient-bg shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
          <span>Efetuar Pagamento</span>
        </button>

        <button
          onClick={checkout.changePaymentMethod}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          <span>Alterar forma de Pagamento</span>
        </button>
      </div>
    </div>
  );
}
