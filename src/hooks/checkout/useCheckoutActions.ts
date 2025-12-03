/**
 * Hook para implementar as ações de negócio do checkout
 */

'use client';

import { useCallback } from 'react';
import {
  CheckoutState,
  CustomerData,
  PaymentMethod,
  MessageComponentType,
  MessageComponentData,
} from '@/types/checkout';
import { decodeProduct, processPayment } from '@/services/checkoutService';
import { TYPING_DELAYS } from './checkoutHelpers';
import { CheckoutStateActions } from './useCheckoutState';
import { CheckoutMessageActions } from './useCheckoutMessages';
import { CheckoutStreamingActions } from './useCheckoutStreaming';
import { CheckoutTypingActions } from './useCheckoutTyping';

export interface CheckoutBusinessActions {
  loadProduct: (hash: string) => Promise<void>;
  addWelcomeMessage: () => Promise<void>;
  startQA: () => Promise<void>;
  startCheckout: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  continueCheckout: () => Promise<void>;
  submitCustomerData: (data: CustomerData) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => Promise<void>;
  confirmPayment: () => Promise<void>;
  confirmPaymentSuccess: () => Promise<void>;
  editCustomerData: () => Promise<void>;
  changePaymentMethod: () => Promise<void>;
  askQuestion: () => Promise<void>;
}

export function useCheckoutActions(
  state: CheckoutState,
  stateActions: CheckoutStateActions,
  messageActions: CheckoutMessageActions,
  streamingActions: CheckoutStreamingActions,
  typingActions: CheckoutTypingActions,
): CheckoutBusinessActions {
  /**
   * Adiciona mensagem da IA com animação
   */
  const addAiMessage = useCallback(
    async (
      content: string,
      componentType?: MessageComponentType,
      componentData?: MessageComponentData,
      typingDelay: number = TYPING_DELAYS.AI_THINKING,
    ) => {
      stateActions.setAiTyping(true);
      await new Promise((resolve) => setTimeout(resolve, typingDelay));
      stateActions.setAiTyping(false);

      const messageId = messageActions.createAiMessage(componentType, componentData);
      await typingActions.typeMessage(messageId, content);
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Carrega informações do produto via hash
   */
  const loadProduct = useCallback(
    async (hash: string) => {
      try {
        stateActions.setLoading(true);
        stateActions.setError(null);
        const product = await decodeProduct(hash);
        stateActions.setProduct(product);
        stateActions.setLoading(false);
      } catch (error) {
        stateActions.setLoading(false);
        stateActions.setError(error instanceof Error ? error.message : 'Erro ao carregar produto');
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Adiciona mensagem de boas-vindas
   */
  const addWelcomeMessage = useCallback(
    async () => {
      const brandName = state.product?.infoproducer.companyName || 'nossa marca';
      const productName = state.product?.name || 'este produto';

      await addAiMessage(
        `Olá! Sou a assistente da ${brandName}. Quer saber mais sobre ${productName} ou já deseja finalizar sua compra?`,
        'buttons',
        {
          buttons: [
            { label: 'Finalizar compra', action: 'start-checkout', variant: 'primary' },
            { label: 'Tirar dúvidas', action: 'start-qa', variant: 'secondary' },
          ],
        },
        TYPING_DELAYS.WELCOME_DELAY,
      );
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.product],
  );

  /**
   * Inicia o modo de perguntas e respostas
   */
  const startQA = useCallback(
    async () => {
      messageActions.clearComponentsOfType('buttons');
      stateActions.setMode('qa');
      stateActions.setShowMessageInput(true);

      messageActions.addUserMessage('Tirar dúvidas');

      const productName = state.product?.name || 'este produto';
      await addAiMessage(`Ótimo! Em que posso ajudar com o ${productName}?`);
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.product],
  );

  /**
   * Inicia o fluxo de checkout
   */
  const startCheckout = useCallback(
    async () => {
      messageActions.clearComponentsOfType('buttons');
      stateActions.setMode('checkout');
      stateActions.setCheckoutStep('customer-data');
      stateActions.setShowMessageInput(false);

      messageActions.addUserMessage('Finalizar compra');

      await addAiMessage('Ótimo! Para finalizar, por favor, preencha seus dados abaixo.', 'form', {
        formType: 'customer-data',
      });
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Envia uma mensagem para a IA com efeito de digitação
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !state.product) return;

      // Remove o botão "Ir para finalização" de mensagens anteriores
      messageActions.clearComponentsOfType('buttons');
      stateActions.setAiTyping(true);

      messageActions.addUserMessage(message);

      try {
        // Streaming real: acumula chunks no buffer
        if (!state.product.productHash) {
          throw new Error('Product hash not available');
        }

        const { messageId, fullText } = await streamingActions.streamAiResponse(
          state.product.productHash,
          message,
        );

        // Adiciona "Posso ajudar em algo mais?" no mesmo balão se estiver em Q&A
        if (state.mode === 'qa' || state.mode === 'interrupted') {
          const finalText = `${fullText}\n\nPosso ajudar em algo mais?`;

          stateActions.updateMessage(messageId, { content: finalText });

          // Aguarda um pouco para o usuário ler antes de mostrar o botão
          await new Promise((resolve) => setTimeout(resolve, TYPING_DELAYS.BUTTON_DELAY));

          // Adiciona botão de continuar checkout
          stateActions.updateMessage(messageId, {
            componentType: 'buttons',
            componentData: {
              buttons: [
                {
                  label: 'Ir para finalização da compra',
                  action: 'continue-checkout',
                  variant: 'primary',
                },
              ],
            },
            isTypingComplete: true,
          });
        }
      } catch {
        stateActions.setAiTyping(false);
        await addAiMessage(
          'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?',
        );
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.product, state.mode],
  );

  /**
   * Continua o checkout após Q&A
   */
  const continueCheckout = useCallback(
    async () => {
      const targetStep = state.savedStep || 'customer-data';

      // Remove o botão de continuar
      messageActions.clearComponentsOfType('buttons');
      stateActions.setMode('checkout');
      stateActions.setCheckoutStep(targetStep);
      stateActions.setSavedStep(null);
      stateActions.setShowMessageInput(false);

      // Reexibe o componente da etapa salva
      if (targetStep === 'customer-data') {
        await addAiMessage('Certo! Voltando... Por favor, preencha seus dados abaixo.', 'form', {
          formType: 'customer-data',
        });
      } else if (targetStep === 'payment-method') {
        await addAiMessage('Agora, como você prefere pagar?', 'payment-options');
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.savedStep],
  );

  /**
   * Submete os dados do cliente
   */
  const submitCustomerData = useCallback(
    async (data: CustomerData) => {
      // Verifica se já existe método de pagamento (usuário está editando dados)
      const isEditing = state.paymentMethod !== null;

      // Remove o formulário de todas as mensagens que o contêm
      messageActions.clearComponentsOfType('form');
      stateActions.setCustomerData(data);
      stateActions.setCheckoutStep(isEditing ? 'payment-review' : 'payment-method');
      stateActions.setShowMessageInput(false);

      messageActions.addUserMessage('Dados enviados');

      // Se está editando, volta pro resumo. Se não, pergunta forma de pagamento
      if (isEditing && state.paymentMethod) {
        await addAiMessage(
          `Perfeito, ${data.name.split(' ')[0]}! Dados atualizados. Confira o resumo da sua compra:`,
          'payment-review',
          {
            customerData: data,
            paymentMethod: state.paymentMethod,
          },
        );
      } else {
        await addAiMessage(
          `Obrigada, ${data.name.split(' ')[0]}. Seus dados foram salvos! Agora, como você prefere pagar?`,
          'payment-options',
        );
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.paymentMethod],
  );

  /**
   * Seleciona método de pagamento
   */
  const selectPaymentMethod = useCallback(
    async (method: PaymentMethod) => {
      // Remove o componente de seleção de pagamento
      messageActions.clearComponentsOfType('payment-options');
      stateActions.setPaymentMethod(method);
      stateActions.setCheckoutStep('payment-review');
      stateActions.setShowMessageInput(false);

      const methodLabel = method === 'pix' ? 'Pix' : method === 'card' ? 'Cartão' : 'Crypto';
      messageActions.addUserMessage(methodLabel);
      await addAiMessage(
        'Tudo certo! Por favor, confirme os detalhes da sua compra antes de finalizar.',
        'payment-review',
        {
          customerData: state.customerData || undefined,
          paymentMethod: method,
        },
      );
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.customerData],
  );

  /**
   * Confirmação de pagamento bem-sucedido
   */
  const confirmPaymentSuccess = useCallback(
    async () => {
      stateActions.setCheckoutStep('confirmation');
      stateActions.setShowMessageInput(false);

      await addAiMessage(
        'Pagamento confirmado com sucesso! Acesse agora o seu produto digital ou verifique seu e-mail para mais detalhes.',
        'success',
        {
          downloadUrl: '#', // TODO: Backend deve retornar URL de download após pagamento confirmado
        },
      );
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Confirma o pagamento
   */
  const confirmPayment = useCallback(
    async () => {
      if (!state.customerData || !state.paymentMethod) return;

      // Remove o componente payment-review
      messageActions.clearComponentsOfType('payment-review');
      stateActions.setCheckoutStep('payment');
      stateActions.setShowMessageInput(false);

      messageActions.addUserMessage('Efetuar pagamento');

      // Simula processamento
      try {
        const result = await processPayment(
          state.product?.id || '',
          state.customerData,
          state.paymentMethod,
        );

        if (state.paymentMethod === 'pix' && result.qrCode) {
          await addAiMessage('Pagamento via Pix iniciado. Escaneie o QR Code abaixo:', 'qr-code', {
            qrCodeUrl: result.qrCode,
            pixCode: result.pixCode,
            expiresIn: '10 minutos',
          });

          // REMOVIDO: Não simula mais confirmação automática
          // O pagamento deve ser confirmado via webhook ou polling real
        }
      } catch {
        await addAiMessage('Houve um erro ao processar o pagamento. Tente novamente.');
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.customerData, state.paymentMethod, state.product],
  );

  /**
   * Edita dados do cliente
   */
  const editCustomerData = useCallback(
    async () => {
      // Remove o componente payment-review
      messageActions.clearComponentsOfType('payment-review');
      stateActions.setCheckoutStep('customer-data');
      stateActions.setShowMessageInput(false);

      await addAiMessage('Certo! Você pode editar seus dados abaixo:', 'form', {
        formType: 'customer-data',
      });
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Muda método de pagamento
   */
  const changePaymentMethod = useCallback(
    async () => {
      // Remove o componente payment-review
      messageActions.clearComponentsOfType('payment-review');
      stateActions.setCheckoutStep('payment-method');
      stateActions.setPaymentMethod(null);
      stateActions.setShowMessageInput(false);

      await addAiMessage('Sem problemas! Escolha outra forma de pagamento:', 'payment-options');
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Pausa checkout para fazer perguntas
   */
  const askQuestion = useCallback(
    async () => {
      stateActions.setMode('interrupted');
      stateActions.setSavedStep(state.checkoutStep);
      stateActions.setShowMessageInput(true);

      await addAiMessage('Claro! Como posso ajudar?');
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.checkoutStep],
  );

  return {
    loadProduct,
    addWelcomeMessage,
    startQA,
    startCheckout,
    sendMessage,
    continueCheckout,
    submitCustomerData,
    selectPaymentMethod,
    confirmPayment,
    confirmPaymentSuccess,
    editCustomerData,
    changePaymentMethod,
    askQuestion,
  };
}
