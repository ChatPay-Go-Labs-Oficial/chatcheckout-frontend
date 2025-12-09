'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@/utils/env';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import { paymentService } from '@/services/paymentService';

interface StripeConnectWrapperProps {
  children: React.ReactNode;
}

export const StripeConnectWrapper = ({ children }: StripeConnectWrapperProps) => {
  const { data: stripeConnectInstance, isLoading, error } = useQuery({
    queryKey: ['stripe-connect-instance'],
    queryFn: async () => {
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
        return instance;
      } catch (err) {
        throw new Error('Falha ao carregar o sistema de pagamentos.');
      }
    },
    staleTime: Infinity, // Instância deve ser carregada uma única vez
    refetchOnWindowFocus: false,
  });

  if (error) return <div className="text-red-500">{(error as Error).message}</div>;
  if (isLoading || !stripeConnectInstance) return <div>Carregando sistema de pagamentos...</div>;

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  );
};
