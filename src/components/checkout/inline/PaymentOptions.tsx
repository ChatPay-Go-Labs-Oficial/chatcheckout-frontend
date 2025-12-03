/**
 * Botões de seleção de método de pagamento
 */

'use client';

import { CheckoutActions, MessageComponentData, PaymentMethod } from '@/types/checkout';

interface PaymentOptionsProps {
  data: MessageComponentData;
  actions: CheckoutActions;
}

export function PaymentOptions({ actions }: PaymentOptionsProps) {
  const handleSelect = (method: PaymentMethod) => {
    actions.selectPaymentMethod(method);
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-sm mt-2">
      <button
        onClick={() => handleSelect('pix')}
        className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-white p-3 rounded-lg gradient-bg shadow-md hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined">qr_code_2</span>
        <span>Pix</span>
      </button>
    </div>
  );
}
