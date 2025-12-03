/**
 * Tela de pagamento com QR Code Pix
 */

'use client';

import { useState } from 'react';
import { CheckoutActions, MessageComponentData, ProductInfo } from '@/types/checkout';
import Image from 'next/image';

interface QrCodePaymentProps {
  data: MessageComponentData;
  actions: CheckoutActions;
  product: ProductInfo;
}

export function QrCodePayment({ data, product }: QrCodePaymentProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isExpired, setIsExpired] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleCopy = () => {
    if (data.pixCode) {
      navigator.clipboard.writeText(data.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Timer regressivo
  useState(() => {
    // Extrair tempo inicial em minutos (ex: "10 minutos" -> 10)
    const initialMinutes = parseInt(data.expiresIn?.match(/\d+/)?.[0] || '10');
    let totalSeconds = initialMinutes * 60;

    const interval = setInterval(() => {
      totalSeconds--;

      if (totalSeconds <= 0) {
        clearInterval(interval);
        setTimeLeft('00:00');
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">
              qr_code_scanner
            </span>
            Pagamento via Pix
          </h2>
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-[16px] ${
                isExpired ? 'text-red-500' : 'text-orange-500'
              }`}
            >
              {isExpired ? 'error' : 'schedule'}
            </span>
            <span
              className={`text-xs font-semibold font-mono ${
                isExpired ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {isExpired ? 'Expirado' : timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Valor a pagar */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total a pagar</p>
          <p className="text-3xl font-bold text-gray-700">{formatPrice(product.price)}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div
            className={`bg-white p-3 rounded-xl border-2 shadow-sm relative ${
              isExpired ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            {data.qrCodeUrl ? (
              <div className="relative">
                <Image
                  src={data.qrCodeUrl}
                  alt="QR Code Pix"
                  width={160}
                  height={160}
                  className={`w-40 h-40 rounded-lg ${isExpired ? 'opacity-30 grayscale' : ''}`}
                />
                {isExpired && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                      QR Code Expirado
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-300 text-6xl">qr_code_2</span>
              </div>
            )}
          </div>
        </div>

        {/* Código Pix Copia e Cola */}
        {data.pixCode && (
          <div className="space-y-2 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-mono break-all text-center leading-relaxed">
                {data.pixCode.substring(0, 40)}...
              </p>
            </div>

            <button
              onClick={handleCopy}
              disabled={isExpired}
              className={`w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl shadow-md transition-all duration-200 ${
                isExpired
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'gradient-bg text-white hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {copied ? 'check_circle' : 'content_copy'}
              </span>
              <span>{copied ? 'Código Copiado!' : 'Copiar código Pix'}</span>
            </button>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">info</span>
            <p className="text-xs font-semibold text-blue-900">Instruções:</p>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-700 ml-6">
            <li>Abra o app do seu banco e pague com Pix.</li>
            <li>Escaneie o QR Code ou cole o código acima.</li>
            <li>Confirme os dados e finalize o pagamento.</li>
          </ol>
        </div>

        {/* Confirmação automática */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>
          <span>A confirmação do pagamento é automática.</span>
        </div>
      </div>
    </div>
  );
}
