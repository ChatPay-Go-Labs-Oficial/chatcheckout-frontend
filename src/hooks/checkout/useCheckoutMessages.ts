/**
 * Hook para gerenciar criação e manipulação de mensagens
 */

'use client';

import { useCallback } from 'react';
import { Message, MessageComponentType, MessageComponentData } from '@/types/checkout';
import { generateMessageId } from './checkoutHelpers';
import { CheckoutStateActions } from './useCheckoutState';

export interface CheckoutMessageActions {
  addUserMessage: (content: string) => void;
  createAiMessage: (
    componentType?: MessageComponentType,
    componentData?: MessageComponentData,
  ) => string;
  clearComponentsOfType: (type: MessageComponentType) => void;
  updateComponentDataOfType: (
    type: MessageComponentType,
    partialData: Partial<MessageComponentData>,
    messages: Message[],
  ) => void;
}

export function useCheckoutMessages(stateActions: CheckoutStateActions): CheckoutMessageActions {
  /**
   * Adiciona uma mensagem do usuário
   */
  const addUserMessage = useCallback(
    (content: string) => {
      const newMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      stateActions.addMessage(newMessage);
    },
    [stateActions],
  );

  /**
   * Cria mensagem vazia da IA (será preenchida com typing)
   * Retorna o ID da mensagem criada
   */
  const createAiMessage = useCallback(
    (componentType?: MessageComponentType, componentData?: MessageComponentData) => {
      const messageId = generateMessageId();
      const message: Message = {
        id: messageId,
        role: 'ai',
        content: '',
        timestamp: new Date(),
        componentType,
        componentData,
      };
      stateActions.addMessage(message);
      return messageId;
    },
    [stateActions],
  );

  /**
   * Remove componentes de mensagens anteriores do tipo especificado
   */
  const clearComponentsOfType = useCallback(
    (type: MessageComponentType) => {
      stateActions.removeComponentFromMessage(type);
    },
    [stateActions],
  );

  /**
   * Atualiza componentData de uma mensagem pelo tipo (ex: marcar completed=true)
   */
  const updateComponentDataOfType = useCallback(
    (type: MessageComponentType, partialData: Partial<MessageComponentData>, messages: Message[]) => {
      const msg = messages.find((m) => m.componentType === type);
      if (!msg) return;
      stateActions.updateMessage(msg.id, {
        componentData: { ...msg.componentData, ...partialData },
      });
    },
    [stateActions],
  );

  return {
    addUserMessage,
    createAiMessage,
    clearComponentsOfType,
    updateComponentDataOfType,
  };
}
