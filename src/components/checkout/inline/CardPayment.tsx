/**
 * Componente para pagamento com cartão usando Stripe Payment Element
 */
import React, { useState } from 'react';
import { MessageComponentData, ProductInfo } from '@/types/checkout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CardPaymentProps {
  data: MessageComponentData;
  product: ProductInfo | null;
  clientSecret: string;
  onSuccess?: () => void;
}

function CheckoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Erro ao processar pagamento');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess?.();
    } else {
      setErrorMessage('Pagamento não foi confirmado. Tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processando...' : 'Pagar agora'}
      </button>
    </form>
  );
}

export function CardPayment({ data, product, clientSecret, onSuccess }: CardPaymentProps) {
  if (!clientSecret) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-red-600">Erro: Client Secret não encontrado</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl">
          <span className="material-symbols-outlined text-blue-600 text-2xl">
            credit_card
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Pagamento com Cartão</h3>
          <p className="text-sm text-gray-500">Insira os dados do seu cartão</p>
        </div>
      </div>

      {/* Produto */}
      {product && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">{product.name}</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: product.currency || 'BRL',
            }).format(product.price)}
          </p>
        </div>
      )}

      {/* Stripe Payment Element */}
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm onSuccess={onSuccess} />
      </Elements>

      {/* Security badges */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Pagamento seguro via Stripe</span>
        </div>
      </div>
    </div>
  );
}
