/**
 * Página principal do checkout conversacional
 * URL: /checkout?hash=ABC123
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCheckout } from '@/hooks/useCheckout';
import { MessageList } from '@/components/checkout/MessageList';
import { MessageInput } from '@/components/checkout/MessageInput';
import { ProductHeader } from '@/components/checkout/ProductHeader';
import { Loading } from '@/components/ui/Loading';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');

  if (!hash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Link Inválido</h1>
          <p className="text-gray-600">O link de checkout não é válido.</p>
        </div>
      </div>
    );
  }

  return <CheckoutContainer hash={hash} />;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={<Loading />}
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutContainer({ hash }: { hash: string }) {
  const checkout = useCheckout(hash);

  if (checkout.loading) {
    return <Loading />;
  }

  if (checkout.error || !checkout.product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro</h1>
          <p className="text-gray-600">{checkout.error || 'Produto não encontrado'}</p>
        </div>
      </div>
    );
  }

  const showInput =
    checkout.showMessageInput &&
    checkout.checkoutStep !== 'confirmation' &&
    checkout.mode !== 'initial';

  return (
    <div
      className="flex flex-col h-screen max-w-[var(--checkout-max-width)] mx-auto bg-white shadow-2xl"
      style={{ '--checkout-max-width': '700px' } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h1 className="text-lg font-semibold">
            <span className="gradient-text">ChatCheckout</span>
          </h1>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Product Header */}
        <ProductHeader product={checkout.product} />
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto bg-background-light pb-2">
        <MessageList messages={checkout.messages} checkout={checkout} />
      </main>

      {/* Footer */}
      {showInput && (
        <MessageInput
          onSend={checkout.sendMessage}
          isTyping={checkout.aiTyping}
          disabled={checkout.checkoutStep === 'confirmation'}
        />
      )}
    </div>
  );
}
