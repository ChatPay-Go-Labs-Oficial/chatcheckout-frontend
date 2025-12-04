'use client';

import React, { useState, useEffect } from 'react';
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@/utils/env';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import { paymentService } from '@/services/paymentService';

interface StripeConnectWrapperProps {
  children: React.ReactNode;
}

export const StripeConnectWrapper = ({ children }: StripeConnectWrapperProps) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const instance = loadConnectAndInitialize({
          publishableKey: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          fetchClientSecret: async () => {
            const { clientSecret } = await paymentService.createAccountSession();
            return clientSecret;
          },
          appearance: {
            overlays: 'dialog',
            variables: {
              colorPrimary: '#0d7ff2',
            },
          },
        });

        setStripeConnectInstance(instance);
      } catch (err) {
        console.error('Failed to initialize Stripe Connect:', err);
        setError('Falha ao carregar o sistema de pagamentos.');
      }
    };

    initStripe();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!stripeConnectInstance) return <div>Carregando sistema de pagamentos...</div>;

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  );
};
