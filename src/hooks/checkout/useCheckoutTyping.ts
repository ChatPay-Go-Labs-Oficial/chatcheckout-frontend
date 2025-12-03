/**
 * Hook para gerenciar animações de digitação (typing effect)
 */

'use client';

import { useCallback } from 'react';
import { getCharacterDelay } from './checkoutHelpers';
import { CheckoutStateActions } from './useCheckoutState';

export interface CheckoutTypingActions {
  typeMessage: (messageId: string, content: string) => Promise<void>;
}

export function useCheckoutTyping(stateActions: CheckoutStateActions): CheckoutTypingActions {
  /**
   * Anima texto caractere por caractere em uma mensagem
   */
  const typeMessage = useCallback(
    async (messageId: string, content: string) => {
      let currentText = '';
      for (let i = 0; i < content.length; i++) {
        currentText += content[i];
        stateActions.updateMessage(messageId, { content: currentText });

        const delay = getCharacterDelay(content[i]);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Marca como completo para mostrar componentes
      stateActions.updateMessage(messageId, { isTypingComplete: true });
    },
    [stateActions],
  );

  return { typeMessage };
}
