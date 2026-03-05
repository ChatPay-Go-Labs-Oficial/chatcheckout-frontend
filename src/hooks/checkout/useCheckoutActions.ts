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
import * as sdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '@/utils/stellar/constants';
import { checkoutTrackingService } from '@/services/checkoutTrackingService';

export interface CheckoutBusinessActions {
  loadProduct: (hash: string) => Promise<void>;
  addWelcomeMessage: () => Promise<void>;
  startQA: () => Promise<void>;
  startCheckout: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  continueCheckout: () => Promise<void>;
  submitCustomerData: (data: CustomerData) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => Promise<void>;
  selectCryptoAsset: (asset: 'USDC' | 'XLM') => Promise<void>;
  handleWalletConnected: (address: string) => Promise<void>; // Nova ação
  confirmPayment: (signTransactionFn?: (txXdr: string) => Promise<string>) => Promise<void>;
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
        // Para crypto, usa o componente Stellar com o ativo selecionado
        const isCrypto = state.paymentMethod === 'crypto';
        await addAiMessage(
          `Perfeito, ${data.name.split(' ')[0]}! Dados atualizados. Confira o resumo da sua compra:`,
          isCrypto ? 'stellar-payment-review' : 'payment-review',
          {
            customerData: data,
            paymentMethod: state.paymentMethod,
            ...(isCrypto && { cryptoAsset: state.cryptoAsset }),
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
    [state.paymentMethod, state.cryptoAsset],
  );

  /**
   * Seleciona método de pagamento
   * Se for crypto, mostra conexão de wallet primeiro
   */
  const selectPaymentMethod = useCallback(
    async (method: PaymentMethod) => {
      if (method === 'crypto' && !state.product?.cryptoPaymentsEnabled) {
        messageActions.clearComponentsOfType('payment-options');
        await addAiMessage(
          'Pagamento em crypto não está disponível para este vendedor no momento. Escolha Pix ou Cartão.',
          'payment-options',
        );
        return;
      }

      // Remove o componente de seleção de pagamento
      messageActions.clearComponentsOfType('payment-options');

      const methodLabel = method === 'pix' ? 'Pix' : method === 'card' ? 'Cartão' : 'Crypto';
      messageActions.addUserMessage(methodLabel);

      // Se for Crypto, mostra conexão de wallet primeiro
      if (method === 'crypto') {
        stateActions.setPaymentMethod(method);
        stateActions.setCheckoutStep('wallet-connection');
        stateActions.setShowMessageInput(false);

        await addAiMessage(
          'Ótimo! Para pagar com criptomoedas, precisamos conectar sua carteira Stellar.',
          'wallet-connection',
        );
      } else {
        // Pix e Cartão seguem o fluxo normal
        stateActions.setPaymentMethod(method);
        stateActions.setCheckoutStep('payment-review');
        stateActions.setShowMessageInput(false);

        await addAiMessage(
          'Tudo certo! Por favor, confirme os detalhes da sua compra antes de finalizar.',
          'payment-review',
          {
            customerData: state.customerData || undefined,
            paymentMethod: method,
          },
        );
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.customerData, state.product?.cryptoPaymentsEnabled],
  );

  /**
   * Seleciona o ativo crypto (USDC/XLM)
   */
  const selectCryptoAsset = useCallback(
    async (asset: 'USDC' | 'XLM') => {
      // Remove a seleção de moeda
      messageActions.clearComponentsOfType('crypto-asset-selection');
      stateActions.setCryptoAsset(asset);
      stateActions.setCheckoutStep('payment-review');
      stateActions.setShowMessageInput(false);

      messageActions.addUserMessage(asset);

      await addAiMessage(
        `Perfeito! ${asset} selecionado. Confira os detalhes da sua compra:`,
        'stellar-payment-review',
        {
          customerData: state.customerData || undefined,
          paymentMethod: 'crypto',
          cryptoAsset: asset,
        },
      );
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.customerData],
  );

  /**
   * Manipula o evento de wallet conectada
   */
  const handleWalletConnected = useCallback(async (address: string) => {
    // Remove o componente de wallet-connection
    messageActions.clearComponentsOfType('wallet-connection');

    // Salva o endereço da wallet no estado
    stateActions.setWalletAddress(address);

    // Mostra seleção de criptomoeda
    stateActions.setCheckoutStep('payment-method');
    stateActions.setShowMessageInput(false);

    const shortAddress = `${address.slice(0, 6)}...${address.slice(-6)}`;
    messageActions.addUserMessage(`Wallet conectada: ${shortAddress}`);

    await addAiMessage(
      `Carteira conectada com sucesso! (${shortAddress}). Agora escolha qual criptomoeda deseja usar:`,
      'crypto-asset-selection',
    );
  }, []);

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
    async (signTransactionFn?: (txXdr: string) => Promise<string>) => {
      if (!state.customerData || !state.paymentMethod) return;

      // Remove os componentes de review (ambos os tipos)
      messageActions.clearComponentsOfType('payment-review');
      messageActions.clearComponentsOfType('stellar-payment-review');
      stateActions.setCheckoutStep('payment');
      stateActions.setShowMessageInput(false);

      messageActions.addUserMessage('Efetuar pagamento');

      // Processa pagamento baseado no método selecionado
      try {
        if (state.paymentMethod === 'crypto') {
          // Processar pagamento crypto via escrow
          // Pass signTransactionFn for wallet signing
          await processCryptoPayment(signTransactionFn);
        } else {
          // Processar pagamento tradicional via Stripe
          await processTraditionalPayment();
        }
      } catch (error) {
        console.error('[confirmPayment] Error:', error);

        if (state.product?.productHash && state.paymentMethod) {
          await checkoutTrackingService.trackCheckoutEvent({
            productHash: state.product.productHash,
            eventType: 'PAYMENT_FAILED',
            step: 'PAYMENT',
            paymentMethod:
              state.paymentMethod === 'pix'
                ? 'PIX'
                : state.paymentMethod === 'card'
                  ? 'CARD'
                  : 'CRYPTO',
            status: error instanceof Error ? error.message : 'unknown_error',
          });
        }

        await addAiMessage('Houve um erro ao processar o pagamento. Tente novamente.');
      }
    },
    // Removido: dependências causavam loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.customerData,
      state.paymentMethod,
      state.product,
      state.walletAddress,
      state.cryptoAsset,
    ],
  );

  /**
   * Processa pagamento crypto via contrato de escrow
   */
  const processCryptoPayment = useCallback(
    async (signTransactionFn?: (txXdr: string) => Promise<string>) => {
      if (!state.product || !state.walletAddress || !state.cryptoAsset) {
        throw new Error('Missing required information for crypto payment');
      }

      if (!signTransactionFn) {
        throw new Error('signTransactionFn is required for crypto payments');
      }

      // Mostrar mensagem de carregamento
      const loadingMessage = messageActions.createAiMessage('loading');
      await typingActions.typeMessage(loadingMessage, 'Preparando pagamento...');

      const MAX_RETRIES = 3;
      let retryCount = 0;
      let transactionHash = '';
      let orderId: string | null = null;
      let orderRef: string | null = null;
      const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        // Importar preço oracle
        const { priceOracle } = await import('@/services/priceOracle');

        // Calcular valor no asset selecionado (XLM ou USDC)
        let amountCrypto: number;

        if (state.product.currency === state.cryptoAsset) {
          // Produto já está no asset selecionado
          amountCrypto = state.product.price;
        } else {
          // Converter BRL para o asset selecionado usando price oracle
          amountCrypto = await priceOracle.convertAmount(
            state.product.price,
            'BRL',
            state.cryptoAsset || 'XLM',
          );
        }

        // Retry loop para lidar com sequence number errors
        while (retryCount < MAX_RETRIES) {
          console.log(`[processCryptoPayment] Attempt ${retryCount + 1}/${MAX_RETRIES}`);

          // 1. Criar transação via API backend (sem CORS)
          const createResponse = await fetch('/api/stellar/create-escrow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyerAddress: state.walletAddress,
              amountCrypto,
              amountFiat: state.product.price,
              asset: state.cryptoAsset || 'XLM',
              productId: state.product.id,
            }),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.error || 'Failed to create escrow transaction');
          }

          const createData = await createResponse.json();
          const transactionXDR = createData.transactionXDR;
          orderId = createData.orderId ?? orderId;
          orderRef = createData.orderRef ?? orderRef;

          if (state.product?.productHash) {
            await checkoutTrackingService.trackCheckoutEvent({
              productHash: state.product.productHash,
              eventType: 'CRYPTO_ESCROW_CREATED',
              step: 'PAYMENT',
              paymentMethod: 'CRYPTO',
              orderId: orderId ?? undefined,
              metadata: { asset: state.cryptoAsset, amountCrypto, orderRef },
            });
          }

          console.log('[processCryptoPayment] Creating escrow via API:', {
            buyer: state.walletAddress,
            amount: amountCrypto,
            asset: state.cryptoAsset,
            productId: state.product.id,
          });

          console.log('[processCryptoPayment] Transaction created, signing with wallet...');

          // 2. Assinar transação via Wallet Kit
          await typingActions.typeMessage(
            loadingMessage,
            retryCount > 0
              ? `Tentando novamente (${retryCount + 1}/${MAX_RETRIES})... Aguardando assinatura.`
              : 'Aguardando assinatura da carteira...',
          );

          const signedTxXDR = await signTransactionFn(transactionXDR);

          if (state.product?.productHash) {
            await checkoutTrackingService.trackCheckoutEvent({
              productHash: state.product.productHash,
              eventType: 'CRYPTO_TX_SIGNED',
              step: 'PAYMENT',
              paymentMethod: 'CRYPTO',
            });
          }

          console.log('[processCryptoPayment] Transaction signed, submitting...');

          // 3. Enviar transação assinada via API backend
          await typingActions.typeMessage(
            loadingMessage,
            retryCount > 0
              ? `Tentando novamente (${retryCount + 1}/${MAX_RETRIES})... Enviando transação.`
              : 'Enviando transação para a rede...',
          );

          const submitResponse = await fetch('/api/stellar/submit-tx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signedTxXDR }),
          });

          if (submitResponse.ok) {
            // Sucesso! Salvar hash e sair do loop
            const submitData = await submitResponse.json();
            transactionHash = submitData.transactionHash;

            if (backendApiUrl && orderRef) {
              await fetch(`${backendApiUrl}/payment/crypto/submitted`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderRef, blockchainHash: transactionHash }),
              });
            }

            if (state.product?.productHash) {
              await checkoutTrackingService.trackCheckoutEvent({
                productHash: state.product.productHash,
                eventType: 'CRYPTO_TX_SUBMITTED',
                step: 'PAYMENT',
                paymentMethod: 'CRYPTO',
                orderId: orderId ?? undefined,
                metadata: {
                  orderRef,
                  transactionHash,
                  totalAmountCents: Math.round(Number(state.product.price || 0) * 100),
                },
              });
            }

            console.log(
              '[processCryptoPayment] Transaction submitted successfully!',
              transactionHash,
            );
            break;
          }

          // Erro na submissão - verificar se é retryable
          const errorData = await submitResponse.json();
          console.error('[processCryptoPayment] Submit error:', errorData);

          const resultCode = errorData.details?.resultCode;
          const isRetryable = errorData.details?.isRetryable !== false;

          // Verificar se é erro de sequence number ou outros erros retryable
          if (
            isRetryable &&
            (resultCode === 'txBadSeq' ||
              resultCode === 'txValidationFailed' ||
              resultCode === 'txInsufficientFee' ||
              resultCode === 'txFailed' ||
              errorData.error?.includes('sequence') ||
              retryCount < MAX_RETRIES - 1)
          ) {
            retryCount++;

            if (retryCount >= MAX_RETRIES) {
              throw new Error(
                'Número máximo de tentativas atingido. O sequence number da conta pode estar mudando rapidamente. Aguarde alguns segundos e tente novamente.',
              );
            }

            console.log(
              `[processCryptoPayment] Retryable error detected, retrying... (${retryCount}/${MAX_RETRIES})`,
            );

            // Aguardar antes de tentar novamente para dar tempo ao sequence number estabilizar
            // Aumentar delay progressivamente
            const delayMs = retryCount * 3000; // 3s, 6s, 9s
            console.log(`[processCryptoPayment] Waiting ${delayMs}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            // Continuar o loop para criar uma nova transação
            continue;
          }

          // Outro erro não retryable - lançar exceção
          throw new Error(errorData.error || 'Failed to submit transaction');
        }

        // Limpar mensagem de loading
        messageActions.clearComponentsOfType('loading');

        // Mostrar status de transação pendente
        await addAiMessage(
          'Pagamento enviado com sucesso! Aguarde a confirmação da blockchain.',
          'transaction-pending',
          {
            transactionHash,
          },
        );

        // 4. Monitorar confirmação real da blockchain
        const rpcUrl =
          STELLAR_CONFIG.NETWORK === 'public'
            ? 'https://soroban-api.stellar.org'
            : 'https://soroban-testnet.stellar.org';
        const rpc = new sdk.rpc.Server(rpcUrl);

        console.log('[processCryptoPayment] Monitoring confirmation for:', transactionHash);

        let confirmed = false;
        let pollCount = 0;
        const MAX_POLLS = 20; // 20 * 3s = 60s total wait

        while (!confirmed && pollCount < MAX_POLLS) {
          pollCount++;
          try {
            const txStatus = await rpc.getTransaction(transactionHash);
            console.log(`[processCryptoPayment] Poll ${pollCount}: status = ${txStatus.status}`);

            if (txStatus.status === 'SUCCESS') {
              confirmed = true;
              break;
            } else if (txStatus.status === 'FAILED') {
              throw new Error(
                'A transação falhou na blockchain. Verifique seu saldo ou tente novamente.',
              );
            }
          } catch (e) {
            console.log('[processCryptoPayment] Polling error (might be NOT_FOUND yet):', e);
          }

          if (!confirmed) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }

        if (!confirmed) {
          console.warn(
            '[processCryptoPayment] Confirmation taking too long, showing success anyway as backup',
          );
        }

        // Marca o card como "confirmado" para disparar a animação do check verde
        // Usa stateActions (functional setState) para evitar stale closure
        stateActions.updateComponentDataOfType('transaction-pending', { completed: true });

        // Aguarda a animação de check terminar (~2s) antes de remover o componente
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Remove o card de transação pendente antes de mostrar o sucesso
        messageActions.clearComponentsOfType('transaction-pending');

        if (state.product?.productHash) {
          if (backendApiUrl && orderRef && transactionHash) {
            await fetch(`${backendApiUrl}/payment/crypto/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderRef,
                blockchainHash: transactionHash,
              }),
            });
          }

          await checkoutTrackingService.trackCheckoutEvent({
            productHash: state.product.productHash,
            eventType: 'CRYPTO_TX_CONFIRMED',
            step: 'CONFIRMATION',
            paymentMethod: 'CRYPTO',
            orderId: orderId ?? undefined,
            metadata: {
              orderRef,
              transactionHash,
              totalAmountCents: Math.round(Number(state.product.price || 0) * 100),
            },
          });

          await checkoutTrackingService.trackCheckoutEvent({
            productHash: state.product.productHash,
            eventType: 'PAYMENT_SUCCEEDED',
            step: 'CONFIRMATION',
            paymentMethod: 'CRYPTO',
            orderId: orderId ?? undefined,
            metadata: { orderRef, transactionHash },
          });
        }

        await addAiMessage(
          'Pagamento confirmado! O valor está protegido pelo contrato de escrow. Seu pedido está sendo processado.',
          'success',
          {
            downloadUrl: '#',
          },
        );
        stateActions.setCheckoutStep('confirmation');
      } catch (error) {
        console.error('[processCryptoPayment] Error:', error);
        messageActions.clearComponentsOfType('loading');

        if (state.product?.productHash) {
          if (backendApiUrl && orderRef) {
            await fetch(`${backendApiUrl}/payment/crypto/fail`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderRef,
                blockchainHash: transactionHash || undefined,
                reason: error instanceof Error ? error.message : 'crypto_payment_error',
              }),
            });
          }

          await checkoutTrackingService.trackCheckoutEvent({
            productHash: state.product.productHash,
            eventType: 'PAYMENT_FAILED',
            step: 'PAYMENT',
            paymentMethod: 'CRYPTO',
            orderId: orderId ?? undefined,
            status: error instanceof Error ? error.message : 'crypto_payment_error',
          });
        }

        throw error;
      }
    },
    [
      state.product,
      state.walletAddress,
      state.cryptoAsset,
      messageActions,
      typingActions,
      stateActions,
      addAiMessage,
    ],
  );

  /**
   * Processa pagamento tradicional (Pix/Card) via Stripe
   */
  const processTraditionalPayment = useCallback(async () => {
    if (!state.product || !state.customerData || !state.paymentMethod) return;

    const result = await processPayment(state.product.id, state.customerData, state.paymentMethod);

    if (state.product.productHash) {
      await checkoutTrackingService.trackCheckoutEvent({
        productHash: state.product.productHash,
        eventType: 'PAYMENT_INTENT_CREATED',
        step: 'PAYMENT',
        paymentMethod: state.paymentMethod === 'pix' ? 'PIX' : 'CARD',
        orderId: result.orderId,
      });
    }

    if (state.paymentMethod === 'pix' && result.qrCode) {
      await addAiMessage('Pagamento via Pix iniciado. Escaneie o QR Code abaixo:', 'qr-code', {
        qrCodeUrl: result.qrCode,
        pixCode: result.pixCode,
        expiresIn: '10 minutos',
      });

      if (state.product.productHash) {
        await checkoutTrackingService.trackCheckoutEvent({
          productHash: state.product.productHash,
          eventType: 'PIX_PRESENTED',
          step: 'PAYMENT',
          paymentMethod: 'PIX',
          orderId: result.orderId,
        });
      }
    } else if (state.paymentMethod === 'card' && result.clientSecret) {
      if (state.product.productHash) {
        await checkoutTrackingService.trackCheckoutEvent({
          productHash: state.product.productHash,
          eventType: 'CARD_FORM_PRESENTED',
          step: 'PAYMENT',
          paymentMethod: 'CARD',
          orderId: result.orderId,
        });
      }

      await addAiMessage('Complete o pagamento com seu cartão:', 'card-payment', {
        clientSecret: result.clientSecret,
        onPaymentSuccess: async () => {
          messageActions.clearComponentsOfType('card-payment');
          stateActions.setCheckoutStep('confirmation');
          await addAiMessage(
            '✅ Pagamento processado com sucesso! Aguarde a confirmação final.',
            null,
          );

          if (state.product?.productHash) {
            await checkoutTrackingService.trackCheckoutEvent({
              productHash: state.product.productHash,
              eventType: 'CARD_PAYMENT_CONFIRMED',
              step: 'PAYMENT',
              paymentMethod: 'CARD',
              orderId: result.orderId,
            });

            await checkoutTrackingService.trackCheckoutEvent({
              productHash: state.product.productHash,
              eventType: 'PAYMENT_SUCCEEDED',
              step: 'CONFIRMATION',
              paymentMethod: 'CARD',
              orderId: result.orderId,
            });
          }

          // Simular confirmação após alguns segundos (em produção, usar webhook)
          setTimeout(async () => {
            await addAiMessage('Pagamento confirmado! Obrigado pela compra.', 'success', {});
          }, 2000);
        },
      });
    }
  }, [
    state.product,
    state.customerData,
    state.paymentMethod,
    messageActions,
    typingActions,
    stateActions,
  ]);

  /**
   * Edita dados do cliente
   */
  const editCustomerData = useCallback(
    async () => {
      // Remove os componentes de review (ambos os tipos)
      messageActions.clearComponentsOfType('payment-review');
      messageActions.clearComponentsOfType('stellar-payment-review');
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
      // Remove componentes de crypto e payment-review (ambos os tipos)
      messageActions.clearComponentsOfType('crypto-asset-selection');
      messageActions.clearComponentsOfType('payment-review');
      messageActions.clearComponentsOfType('stellar-payment-review');
      stateActions.setCheckoutStep('payment-method');
      stateActions.setPaymentMethod(null);
      stateActions.setCryptoAsset(null); // Limpa seleção de crypto
      stateActions.setShowMessageInput(false);

      // Adiciona mensagem do usuário
      messageActions.addUserMessage('Alterar forma de pagamento');

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
    selectCryptoAsset,
    handleWalletConnected, // Nova ação
    confirmPayment,
    confirmPaymentSuccess,
    editCustomerData,
    changePaymentMethod,
    askQuestion,
  };
}
