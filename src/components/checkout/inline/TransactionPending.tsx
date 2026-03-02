/**
 * Transaction Pending Component
 * Shows transaction confirmation status with loading animation
 */

'use client';

import { useEffect, useState } from 'react';
import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';

interface TransactionPendingProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
}

export function TransactionPending({ data }: TransactionPendingProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (addr: string | unknown) => {
    if (!addr || typeof addr !== 'string') return '';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Loading Animation */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="material-symbols-outlined text-blue-600 text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            currency_bitcoin
          </span>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-800">Processando Pagamento</h3>
        <p className="text-sm text-gray-500 mt-1">Aguardando confirmação da blockchain...</p>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Hash da Transação</p>
          <p className="text-sm font-mono text-gray-800 break-all">
            {formatAddress(data.transactionHash || '')}
          </p>
        </div>

        {data.escrowId && (
          <div>
            <p className="text-xs text-gray-500 mb-1">ID do Escrow</p>
            <p className="text-sm font-mono text-gray-800">#{data.escrowId}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Tempo decorrido:</span>
          <span className="font-medium">{elapsed}s</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-3 mt-4 border border-blue-100">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">O que está acontecendo?</p>
            <p className="text-blue-800">
              Sua transação está sendo processada pela rede Stellar. Isso geralmente leva de 5 a 15
              segundos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
