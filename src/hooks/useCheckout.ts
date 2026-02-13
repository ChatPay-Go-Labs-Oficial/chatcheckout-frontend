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
  }, [product, state.product, stateActions]);

  /**
   * Dispara mensagem de boas-vindas quando produto está carregado e sincronizado
   */
  useEffect(() => {
    if (state.product && state.messages.length === 0 && !welcomeMessageSent.current) {
      // Set flag immediately to prevent race conditions from multiple renders
      welcomeMessageSent.current = true;
      void businessActions.addWelcomeMessage();
    }
  }, [state.product, state.messages.length, businessActions]);

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
  }, [isLoadingProduct, productError, stateActions]);

  // ========================================
  // API Pública (Mantém compatibilidade)
  // ========================================

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    product: state.product,
    mode: state.mode,
    checkoutStep: state.checkoutStep,
    customerData: state.customerData,
    paymentMethod: state.paymentMethod,
    messages: state.messages,
    aiTyping: state.isAiTyping,
    showMessageInput: state.showMessageInput,

    // Ações
    startQA: businessActions.startQA,
    startCheckout: businessActions.startCheckout,
    sendMessage: businessActions.sendMessage,
    continueCheckout: businessActions.continueCheckout,
    submitCustomerData: businessActions.submitCustomerData,
    selectPaymentMethod: businessActions.selectPaymentMethod,
    selectCryptoAsset: businessActions.selectCryptoAsset, // Nova ação
    confirmPayment: businessActions.confirmPayment,
    confirmPaymentSuccess: businessActions.confirmPaymentSuccess,
    editCustomerData: businessActions.editCustomerData,
    changePaymentMethod: businessActions.changePaymentMethod,
    askQuestion: businessActions.askQuestion,
  };
}
