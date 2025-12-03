/**
 * Componente de mensagem individual (AI ou usuário)
 */

'use client';

import { Message, CheckoutActions, CheckoutState } from '@/types/checkout';
import {
  ActionButtons,
  CustomerDataForm,
  PaymentOptions,
  PaymentReview,
  QrCodePayment,
  SuccessScreen,
} from './inline';

interface MessageBubbleProps {
  message: Message;
  actions: CheckoutActions;
  state: CheckoutState;
}

export function MessageBubble({ message, actions, state }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex items-start space-x-3 max-w-xs ml-auto">
          <div className="flex-1">
            <div className="gradient-bg text-white rounded-lg rounded-tr-none p-3 shadow-sm">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600 text-lg">person</span>
          </div>
        </div>
      </div>
    );
  }

  // Mensagem da IA
  return (
    <div className="flex items-start space-x-3 max-w-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-lg">support_agent</span>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
          <p className="text-sm text-gray-800">{message.content}</p>
        </div>

        {/* Renderiza componentes inline baseado no tipo - só após typing terminar */}
        {message.componentType && message.isTypingComplete && (
          <div className="mt-3 animate-slideIn">
            {message.componentType === 'buttons' && message.componentData && (
              <ActionButtons data={message.componentData} actions={actions} />
            )}

            {message.componentType === 'form' && message.componentData && (
              <CustomerDataForm
                data={message.componentData}
                actions={actions}
                initialData={state.customerData}
              />
            )}

            {message.componentType === 'payment-options' && (
              <PaymentOptions data={message.componentData || {}} actions={actions} />
            )}

            {message.componentType === 'payment-review' && message.componentData && (
              <PaymentReview
                data={message.componentData}
                actions={actions}
                product={state.product!}
              />
            )}

            {message.componentType === 'qr-code' && message.componentData && (
              <QrCodePayment
                data={message.componentData}
                actions={actions}
                product={state.product!}
              />
            )}

            {message.componentType === 'success' && message.componentData && (
              <SuccessScreen data={message.componentData} actions={actions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
