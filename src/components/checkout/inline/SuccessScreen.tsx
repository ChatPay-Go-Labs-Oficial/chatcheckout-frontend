/**
 * Tela de sucesso após pagamento confirmado
 */

'use client';

import { MessageComponentData } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';

interface SuccessScreenProps {
  data: MessageComponentData;
  checkout: UseCheckoutReturn;
}

export function SuccessScreen({ data }: SuccessScreenProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm w-full">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-green-500" style={{ fontSize: '32px' }}>
            check
          </span>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-1">Pagamento confirmado com sucesso!</h2>

        <p className="text-sm text-gray-600 mb-4">
          Acesse agora o seu produto digital ou verifique seu e-mail para mais detalhes.
        </p>

        <a
          href={data.downloadUrl || '#'}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg gradient-bg text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
        >
          <span className="material-symbols-outlined mr-2">download</span>
          Download do E-book
        </a>
      </div>
    </div>
  );
}
