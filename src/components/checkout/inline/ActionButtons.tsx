/**
 * Botões de ação inline (Finalizar compra / Tirar dúvidas)
 */

'use client';

import { CheckoutActions, MessageComponentData } from '@/types/checkout';

interface ActionButtonsProps {
  data: MessageComponentData;
  actions: CheckoutActions;
}

export function ActionButtons({ data, actions }: ActionButtonsProps) {
  const buttons = data.buttons || [];

  const handleAction = (action: string) => {
    if (action === 'start-checkout') {
      actions.startCheckout();
    } else if (action === 'start-qa') {
      actions.startQA();
    } else if (action === 'continue-checkout') {
      actions.continueCheckout();
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2 mt-2">
      {buttons.map((button, index) => {
        const isPrimary = button.variant === 'primary';
        const isQA = button.action === 'start-qa';
        const displayLabel =
          isPrimary && button.action === 'start-checkout'
            ? 'Ir para finalização de compra'
            : button.label;

        return (
          <button
            key={index}
            onClick={() => handleAction(button.action)}
            className={`inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 text-sm ${
              isPrimary
                ? 'gradient-bg text-white hover:shadow-md hover:scale-[1.01]'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {isPrimary && (
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            )}
            {isQA && <span className="material-symbols-outlined text-[18px]">help</span>}
            <span>{displayLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
