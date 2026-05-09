/**
 * Componente de mensagem individual (AI ou usuário)
 */

'use client';

import { Message } from '@/types/checkout';
import { UseCheckoutReturn } from '@/types/checkout-hook';
import { ActionButtons } from './inline/ActionButtons';
import { CustomerDataForm } from './inline/CustomerDataForm';
import { PaymentOptions } from './inline/PaymentOptions';
import { WalletConnectionStep } from './inline/WalletConnectionStep';
import { CryptoAssetSelection } from './inline/CryptoAssetSelection';
import { PaymentReview } from './inline/PaymentReview';
import { StellarPaymentReview } from './inline/StellarPaymentReview';
import { QrCodePayment } from './inline/QrCodePayment';
import { CardPayment } from './inline/CardPayment';
import { TransactionPending } from './inline/TransactionPending';
import { SuccessScreen } from './inline/SuccessScreen';

interface MessageBubbleProps {
  message: Message;
  checkout: UseCheckoutReturn;
}

export function MessageBubble({ message, checkout }: MessageBubbleProps) {
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
    <div className="flex items-start space-x-3 max-w-lg min-w-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-lg">support_agent</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 border border-gray-200 rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-800 break-words whitespace-pre-wrap text-justify leading-relaxed">{message.content}</p>
        </div>

        {/* Renderiza componentes inline baseado no tipo - só após typing terminar */}
        {message.componentType && message.isTypingComplete && (
          <div className="mt-3 animate-slideIn">
            {message.componentType === 'buttons' && message.componentData && (
              <ActionButtons data={message.componentData} checkout={checkout} />
            )}

            {message.componentType === 'form' && message.componentData && (
              <CustomerDataForm
                data={message.componentData}
                checkout={checkout}
                initialData={checkout.customerData}
              />
            )}

            {message.componentType === 'payment-options' && (
              <PaymentOptions data={message.componentData || {}} checkout={checkout} />
            )}

            {message.componentType === 'wallet-connection' && (
              <WalletConnectionStep data={message.componentData || {}} checkout={checkout} />
            )}

            {message.componentType === 'crypto-asset-selection' && (
              <CryptoAssetSelection
                onSelect={(asset) => checkout.selectCryptoAsset?.(asset)}
                onBack={() => checkout.changePaymentMethod?.()}
              />
            )}

            {message.componentType === 'payment-review' && message.componentData && (
              <PaymentReview
                data={message.componentData}
                checkout={checkout}
                product={checkout.product!}
              />
            )}

            {message.componentType === 'stellar-payment-review' && message.componentData && (
              <StellarPaymentReview
                data={message.componentData}
                checkout={checkout}
                product={checkout.product!}
              />
            )}

            {message.componentType === 'qr-code' && message.componentData && (
              <QrCodePayment
                data={message.componentData}
                checkout={checkout}
                product={checkout.product!}
              />
            )}

            {message.componentType === 'card-payment' && message.componentData && (
              <CardPayment
                data={message.componentData}
                product={checkout.product!}
                clientSecret={message.componentData.clientSecret || ''}
                onSuccess={message.componentData.onPaymentSuccess}
              />
            )}

            {message.componentType === 'transaction-pending' && message.componentData && (
              <TransactionPending data={message.componentData} checkout={checkout} />
            )}

            {message.componentType === 'success' && message.componentData && (
              <SuccessScreen data={message.componentData} checkout={checkout} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
