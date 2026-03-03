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

function useCheckoutQuery(hash: string) {
  return useQuery({
    queryKey: ['checkout-product', hash],
    queryFn: () => decodeProduct(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

function mapPaymentMethod(method: PaymentMethod): 'PIX' | 'CARD' | 'CRYPTO' {
  if (method === 'pix') return 'PIX';
  if (method === 'card') return 'CARD';
  return 'CRYPTO';
}

export function useCheckout(hash: string) {
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

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useCheckoutQuery(hash);

  const welcomeMessageSent = useRef(false);
  const abandonmentSentRef = useRef(false);
  const currentStateRef = useRef({
    mode: state.mode,
    checkoutStep: state.checkoutStep,
    paymentMethod: state.paymentMethod,
    productHash: state.product?.productHash ?? null,
  });

  useEffect(() => {
    if (product) {
      if (!state.product || state.product.id !== product.id) {
        stateActions.setProduct(product);
        welcomeMessageSent.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, state.product]);

  useEffect(() => {
    if (state.product && state.messages.length === 0 && !welcomeMessageSent.current) {
      welcomeMessageSent.current = true;
      void businessActions.addWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.product, state.messages.length]);

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

  useEffect(() => {
    currentStateRef.current = {
      mode: state.mode,
      checkoutStep: state.checkoutStep,
      paymentMethod: state.paymentMethod,
      productHash: state.product?.productHash ?? null,
    };
  }, [state.mode, state.checkoutStep, state.paymentMethod, state.product?.productHash]);

  useEffect(() => {
    if (!hash) return;
    void checkoutTrackingService.ensureSession(hash);
  }, [hash]);

  useEffect(() => {
    if (!hash) return;

    const interval = setInterval(() => {
      void checkoutTrackingService.sendCheckoutHeartbeat(hash);
    }, 30000);

    return () => clearInterval(interval);
  }, [hash]);

  useEffect(() => {
    if (!hash) return;

    const handlePageExit = () => {
      if (abandonmentSentRef.current) return;

      const shouldTrackAbandonment =
        currentStateRef.current.mode === 'checkout' &&
        currentStateRef.current.checkoutStep !== 'confirmation' &&
        currentStateRef.current.checkoutStep !== null;

      if (shouldTrackAbandonment) {
        abandonmentSentRef.current = true;
        const productHash = currentStateRef.current.productHash ?? hash;

        void checkoutTrackingService.abandonCheckout(productHash, {
          checkoutStep: currentStateRef.current.checkoutStep,
          paymentMethod: currentStateRef.current.paymentMethod,
        });
      }
    };

    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
    };
  }, [hash]);

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
