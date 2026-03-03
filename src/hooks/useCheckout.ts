/**
 * Hook orquestrador do checkout conversacional
 *
 * Composição de hooks especializados:
 * - useCheckoutState: Estado centralizado
 * - useCheckoutMessages: Criação e manipulação de mensagens
 * - useCheckoutTyping: Efeitos de digitação
 * - useCheckoutStreaming: Integração com API de streaming
 * - useCheckoutActions: Ações de negócio
 *
 * Mantém API pública idêntica para compatibilidade com componentes existentes
 */

'use client';

import { useEffect, useRef } from 'react';
import { useCheckoutState } from './checkout/useCheckoutState';
import { useCheckoutMessages } from './checkout/useCheckoutMessages';
import { useCheckoutTyping } from './checkout/useCheckoutTyping';
import { useCheckoutStreaming } from './checkout/useCheckoutStreaming';
import { useCheckoutActions } from './checkout/useCheckoutActions';
import { useQuery } from '@tanstack/react-query';
import { decodeProduct } from '@/services/checkoutService';
import { checkoutTrackingService } from '@/services/checkoutTrackingService';
import type { CustomerData, PaymentMethod } from '@/types/checkout';

// Query interna para buscar produto
function useCheckoutQuery(hash: string) {
  return useQuery({
    queryKey: ['checkout-product', hash],
    queryFn: () => decodeProduct(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 30, // 30 minutos (produto não muda muito rápido)
    retry: 1,
  });
}

function mapPaymentMethod(method: PaymentMethod): 'PIX' | 'CARD' | 'CRYPTO' {
  if (method === 'pix') return 'PIX';
  if (method === 'card') return 'CARD';
  return 'CRYPTO';
}

export function useCheckout(hash: string) {
  // ========================================
  // Composição de Hooks Especializados
  // ========================================

  const { state, actions: stateActions } = useCheckoutState();
  const messageActions = useCheckoutMessages(stateActions);
  const typingActions = useCheckoutTyping(stateActions);
  const streamingActions = useCheckoutStreaming(stateActions);
  const businessActions = useCheckoutActions(
    state,
    stateActions,
    messageActions,
    streamingActions,
    typingActions,
  );

  // ========================================
  // Efeitos de Inicialização
  // ========================================

  // ========================================
  // Data Fetching com TanStack Query
  // ========================================

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useCheckoutQuery(hash);

  // ========================================
  // Sincronização e Inicialização
  // ========================================

  // Track if welcome message has been sent to avoid duplicates
  const welcomeMessageSent = useRef(false);

  /**
   * Sincroniza dados da query com o estado local
   */
  useEffect(() => {
    if (product) {
      // Se o produto mudou ou ainda não temos no estado
      if (!state.product || state.product.id !== product.id) {
        stateActions.setProduct(product);
        // Reset welcome message flag when product changes
        welcomeMessageSent.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, state.product]);

  /**
   * Dispara mensagem de boas-vindas quando produto está carregado e sincronizado
   */
  useEffect(() => {
    if (state.product && state.messages.length === 0 && !welcomeMessageSent.current) {
      // Set flag immediately to prevent race conditions from multiple renders
      welcomeMessageSent.current = true;
      void businessActions.addWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.product, state.messages.length]);

  // Sincroniza erros e loading
  useEffect(() => {
    if (isLoadingProduct) {
      stateActions.setLoading(true);
    } else {
      stateActions.setLoading(false);
    }

    if (productError) {
      stateActions.setError(
        productError instanceof Error ? productError.message : 'Erro ao carregar produto',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingProduct, productError]);

  // Inicia sessão de tracking do checkout
  useEffect(() => {
    if (!hash) return;
    void checkoutTrackingService.ensureSession(hash);
  }, [hash]);

  // Heartbeat periódico
  useEffect(() => {
    if (!hash) return;

    const interval = setInterval(() => {
      void checkoutTrackingService.sendCheckoutHeartbeat(hash);
    }, 30000);

    return () => clearInterval(interval);
  }, [hash]);

  // Evento de abandono quando sair da página no meio do checkout
  useEffect(() => {
    if (!hash) return;

    return () => {
      const shouldTrackAbandonment =
        state.mode === 'checkout' &&
        state.checkoutStep !== 'confirmation' &&
        state.checkoutStep !== null;

      if (shouldTrackAbandonment) {
        void checkoutTrackingService.abandonCheckout(hash, {
          checkoutStep: state.checkoutStep,
          paymentMethod: state.paymentMethod,
        });
      }
    };
  }, [hash, state.mode, state.checkoutStep, state.paymentMethod]);

  // ========================================
  // API Pública (Mantém compatibilidade)
  // ========================================

  const startQA = async () => {
    await businessActions.startQA();
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'CHECKOUT_QA_STARTED',
        step: 'QA',
      });
    }
  };

  const startCheckout = async () => {
    await businessActions.startCheckout();
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'CHECKOUT_STARTED',
        step: 'CHECKOUT_STARTED',
      });
    }
  };

  const submitCustomerData = async (data: CustomerData) => {
    await businessActions.submitCustomerData(data);
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'CUSTOMER_DATA_SUBMITTED',
        step: 'CUSTOMER_DATA',
        metadata: { hasPhone: !!data.phone, hasWhatsapp: !!data.whatsapp },
      });
    }
  };

  const selectPaymentMethod = async (method: PaymentMethod) => {
    await businessActions.selectPaymentMethod(method);
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'PAYMENT_METHOD_SELECTED',
        step: 'PAYMENT_METHOD',
        paymentMethod: mapPaymentMethod(method),
      });
    }
  };

  const selectCryptoAsset = async (asset: 'USDC' | 'XLM') => {
    await businessActions.selectCryptoAsset(asset);
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'CRYPTO_ASSET_SELECTED',
        step: 'PAYMENT_REVIEW',
        paymentMethod: 'CRYPTO',
        metadata: { asset },
      });
    }
  };

  const handleWalletConnected = async (address: string) => {
    await businessActions.handleWalletConnected(address);
    if (state.product?.productHash) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'WALLET_CONNECTED',
        step: 'WALLET_CONNECTION',
        paymentMethod: 'CRYPTO',
        metadata: { walletAddress: address },
      });
    }
  };

  const confirmPayment = async (signTransactionFn?: (txXdr: string) => Promise<string>) => {
    if (state.product?.productHash && state.paymentMethod) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'PAYMENT_CONFIRM_CLICKED',
        step: 'PAYMENT',
        paymentMethod: mapPaymentMethod(state.paymentMethod),
      });
    }

    await businessActions.confirmPayment(signTransactionFn);
  };

  const confirmPaymentSuccess = async () => {
    await businessActions.confirmPaymentSuccess();

    if (state.product?.productHash && state.paymentMethod) {
      void checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'PAYMENT_SUCCEEDED',
        step: 'CONFIRMATION',
        paymentMethod: mapPaymentMethod(state.paymentMethod),
      });
    }
  };

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    product: state.product,
    mode: state.mode,
    checkoutStep: state.checkoutStep,
    customerData: state.customerData,
    paymentMethod: state.paymentMethod,
    cryptoAsset: state.cryptoAsset,
    walletAddress: state.walletAddress,
    messages: state.messages,
    aiTyping: state.isAiTyping,
    showMessageInput: state.showMessageInput,

    // Ações
    startQA,
    startCheckout,
    sendMessage: businessActions.sendMessage,
    continueCheckout: businessActions.continueCheckout,
    submitCustomerData,
    selectPaymentMethod,
    selectCryptoAsset,
    handleWalletConnected,
    confirmPayment,
    confirmPaymentSuccess,
    editCustomerData: businessActions.editCustomerData,
    changePaymentMethod: businessActions.changePaymentMethod,
    askQuestion: businessActions.askQuestion,
  };
}
