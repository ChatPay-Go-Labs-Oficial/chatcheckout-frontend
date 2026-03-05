/**
 * Transaction Pending Component
 * Mostra status de confirmação com animação de loading → check verde
 */

'use client';

import { useEffect, useState } from 'react';
import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';
import { XlmIcon } from '@/components/icons/XlmIcon';

interface TransactionPendingProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
}

export function TransactionPending({ data }: TransactionPendingProps) {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'confirmed'>('loading');

  // Contador de tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simula a transição para "confirmado" quando data indica conclusão
  // Na prática, o checkout remove o componente após confirmar,
  // então damos um mínimo de 2s e depois mostramos o check antes de sumir
  useEffect(() => {
    if ((data as { completed?: boolean }).completed) {
      setPhase('confirmed');
    }
  }, [(data as { completed?: boolean }).completed]);

  const formatAddress = (addr: string | unknown) => {
    if (!addr || typeof addr !== 'string') return '–';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Animação principal */}
      <div className="flex flex-col items-center justify-center py-8 px-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          {phase === 'loading' ? (
            <>
              {/* Anel girando */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
              {/* Logo Stellar no centro */}
              <div className="relative z-10">
                <XlmIcon size={32} />
              </div>
            </>
          ) : (
            <>
              {/* Círculo verde preenchido com check */}
              <div
                className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center"
                style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
              >
                <span
                  className="material-symbols-outlined text-green-600 text-4xl"
                  style={{ animation: 'fadeIn 0.25s 0.2s ease both' }}
                >
                  check
                </span>
              </div>
            </>
          )}
        </div>

        {/* Texto de status */}
        <div className="text-center mt-5">
          {phase === 'loading' ? (
            <>
              <h3 className="text-base font-semibold text-gray-800">Processando Pagamento</h3>
              <p className="text-sm text-gray-400 mt-1">Aguardando confirmação da blockchain...</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-green-700">Transação Confirmada!</h3>
              <p className="text-sm text-gray-400 mt-1">Seu pagamento foi processado com sucesso.</p>
            </>
          )}
        </div>
      </div>

      {/* Detalhes da transação */}
      <div className="px-4 pb-4 space-y-2">
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 space-y-2">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Hash da Transação</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {formatAddress(data.transactionHash || '')}
            </p>
          </div>

          {data.escrowId && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">ID do Escrow</p>
              <p className="text-xs font-mono text-gray-700">#{data.escrowId}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Tempo decorrido</span>
            <span className="text-xs font-semibold text-gray-600">{elapsed}s</span>
          </div>
        </div>

        {/* Info box */}
        {phase === 'loading' && (
          <div className="bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[16px] mt-0.5 flex-shrink-0">info</span>
            <p className="text-xs text-blue-800">
              Sua transação está sendo processada pela <span className="font-semibold">Rede Stellar</span>. Isso geralmente leva de 5 a 15 segundos.
            </p>
          </div>
        )}
      </div>

      {/* CSS das animações */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
