'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';

type ModalMode = 'create' | 'update';

interface CheckoutLinkModalProps {
  product: Product;
  checkoutUrl: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: ModalMode;
  hashChanged?: boolean;
}

/**
 * Modal exibido após criação/edição do produto
 * Mostra o link único de checkout para compartilhar
 */
export function CheckoutLinkModal({
  product,
  checkoutUrl,
  isOpen,
  onClose,
  mode = 'create',
  hashChanged = false,
}: CheckoutLinkModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira: ${product.name}`,
          url: checkoutUrl,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    }
  };

  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Configurações dinâmicas baseadas no modo
  const config = {
    create: {
      title: 'Produto Criado com Sucesso!',
      subtitle: `Seu produto ${product.name} está pronto para vender`,
      iconColor: 'from-green-400 to-green-600',
    },
    update: {
      title: hashChanged ? 'Link Atualizado!' : 'Produto Atualizado com Sucesso!',
      subtitle: hashChanged
        ? `O link de checkout foi alterado. Use o novo link abaixo.`
        : `Seu produto ${product.name} foi atualizado`,
      iconColor: hashChanged ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-blue-600',
    },
  };

  const currentConfig = config[mode];

  return (
    <div className="fixed inset-0 bg-gray-500/15 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr ${currentConfig.iconColor} flex items-center justify-center shadow-lg`}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-white">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentConfig.title}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#6f43d0]">{currentConfig.subtitle}</span>
          </p>
        </div>

        {/* Alert para hash alterado */}
        {mode === 'update' && hashChanged && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 mb-1">Atenção!</h4>
                <p className="text-sm text-yellow-700">
                  Você alterou a <strong>URL da página de vendas</strong> ou o{' '}
                  <strong>prompt de IA</strong>. Um novo link de checkout foi gerado. Certifique-se
                  de usar o link atualizado abaixo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Info Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100">
          <div className="flex items-center gap-4">
            {product.imageUrl ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-2xl">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Checkout Link Section */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Link Único de Checkout
          </label>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm text-gray-700 overflow-x-auto whitespace-nowrap">
              {checkoutUrl}
            </div>

            <button
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white hover:scale-105 hover:shadow-lg'
              }`}
            >
              {copied ? (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Compartilhe este link com seus clientes para que possam comprar o produto
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {supportsShare && (
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Compartilhar
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] rounded-xl hover:scale-[1.02] hover:shadow-lg transition"
          >
            Continuar
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Próximos Passos:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Compartilhe o link de checkout nas suas redes sociais, email ou WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Configure a integração com IA para atendimento automatizado (opcional)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Acompanhe as vendas no dashboard de produtos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
