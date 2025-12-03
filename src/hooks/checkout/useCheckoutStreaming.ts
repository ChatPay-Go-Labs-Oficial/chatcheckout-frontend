/**
 * Hook para gerenciar streaming de respostas da IA
 */

'use client';

import { useCallback } from 'react';
import { Message } from '@/types/checkout';
import { sendChatMessage } from '@/services/checkoutService';
import { generateMessageId, getCharacterDelay, TYPING_DELAYS } from './checkoutHelpers';
import { CheckoutStateActions } from './useCheckoutState';

export interface CheckoutStreamingActions {
  streamAiResponse: (
    productHash: string,
    userMessage: string,
  ) => Promise<{ messageId: string; fullText: string }>;
}

export function useCheckoutStreaming(stateActions: CheckoutStateActions): CheckoutStreamingActions {
  /**
   * Processa streaming com typing em tempo real
   */
  const streamAiResponse = useCallback(
    async (
      productHash: string,
      userMessage: string,
    ): Promise<{ messageId: string; fullText: string }> => {
      // Buffer para acumular chunks
      let fullTextBuffer = '';
      let displayedText = '';
      let isStreamingComplete = false;
      let messageCreated = false;
      let firstChunkReceived = false;

      const streamingMessageId = generateMessageId();

      // Função interna: typing em tempo real enquanto recebe chunks
      const startTypingEffect = async () => {
        // Aguarda primeiro chunk
        while (!firstChunkReceived) {
          await new Promise((resolve) => setTimeout(resolve, TYPING_DELAYS.FIRST_CHUNK_WAIT));
        }

        stateActions.setAiTyping(false);
        await new Promise((resolve) => setTimeout(resolve, TYPING_DELAYS.AFTER_CHUNK));

        // Digita enquanto buffer cresce
        while (!isStreamingComplete || displayedText.length < fullTextBuffer.length) {
          if (displayedText.length < fullTextBuffer.length) {
            const nextChar = fullTextBuffer[displayedText.length];
            displayedText += nextChar;

            if (!messageCreated) {
              const message: Message = {
                id: streamingMessageId,
                role: 'ai',
                content: displayedText,
                timestamp: new Date(),
              };
              stateActions.addMessage(message);
              messageCreated = true;
            } else {
              stateActions.updateMessage(streamingMessageId, {
                content: displayedText,
              });
            }

            const delay = getCharacterDelay(nextChar);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            await new Promise((resolve) => setTimeout(resolve, TYPING_DELAYS.CHUNK_POLL));
          }
        }
      };

      // Inicia typing em paralelo
      const typingPromise = startTypingEffect();

      // Faz chamada de streaming
      await sendChatMessage(productHash, userMessage, (chunk: string) => {
        if (!firstChunkReceived) firstChunkReceived = true;
        fullTextBuffer += chunk;
      });

      isStreamingComplete = true;
      await typingPromise;

      return { messageId: streamingMessageId, fullText: fullTextBuffer };
    },
    [stateActions],
  );

  return { streamAiResponse };
}
