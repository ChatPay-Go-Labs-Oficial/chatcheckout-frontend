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

import { useEffect } from 'react';
import { useCheckoutState } from './checkout/useCheckoutState';
import { useCheckoutMessages } from './checkout/useCheckoutMessages';
import { useCheckoutTyping } from './checkout/useCheckoutTyping';
import { useCheckoutStreaming } from './checkout/useCheckoutStreaming';
import { useCheckoutActions } from './checkout/useCheckoutActions';

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

  /**
   * Carrega produto na inicialização
   */
  useEffect(() => {
    if (hash) {
      businessActions.loadProduct(hash);
    }
    // Removido businessActions das dependências para evitar loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  /**
   * Adiciona mensagem de boas-vindas após carregar produto
   */
  useEffect(() => {
    if (state.product && state.messages.length === 0) {
      businessActions.addWelcomeMessage();
    }
    // Removido businessActions das dependências para evitar loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.product, state.messages.length]);

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
    confirmPayment: businessActions.confirmPayment,
    confirmPaymentSuccess: businessActions.confirmPaymentSuccess,
    editCustomerData: businessActions.editCustomerData,
    changePaymentMethod: businessActions.changePaymentMethod,
    askQuestion: businessActions.askQuestion,
  };
}
