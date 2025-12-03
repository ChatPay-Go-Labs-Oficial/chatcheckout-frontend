/**
 * Funções auxiliares e constantes para o fluxo de checkout
 */

import { Message, MessageComponentType } from '@/types/checkout';

/**
 * Constantes consolidadas para delays de animação
 */
export const TYPING_DELAYS = {
  SENTENCE_END: 100, // Delay após pontos finais (. ! ?)
  COMMA: 50, // Delay após vírgulas
  DEFAULT_CHAR: 15, // Delay padrão entre caracteres
  AI_THINKING: 800, // Delay para simular IA "pensando"
  WELCOME_DELAY: 1000, // Delay para mensagem de boas-vindas
  FIRST_CHUNK_WAIT: 100, // Aguardar primeiro chunk do streaming
  AFTER_CHUNK: 200, // Delay após receber primeiro chunk
  BUTTON_DELAY: 300, // Delay antes de mostrar botões
  CHUNK_POLL: 50, // Polling para novos chunks
} as const;

/**
 * Calcula o delay apropriado para um caractere baseado em sua pontuação
 */
export const getCharacterDelay = (char: string): number => {
  if (char === '.' || char === '!' || char === '?') {
    return TYPING_DELAYS.SENTENCE_END;
  }
  if (char === ',') {
    return TYPING_DELAYS.COMMA;
  }
  return TYPING_DELAYS.DEFAULT_CHAR;
};

/**
 * Remove componente de mensagens que correspondem ao tipo especificado
 */
export const removeComponentFromMessages = (
  messages: Message[],
  componentType: MessageComponentType,
): Message[] => {
  return messages.map((msg) =>
    msg.componentType === componentType
      ? { ...msg, componentType: undefined, componentData: undefined }
      : msg,
  );
};

/**
 * Atualiza uma mensagem específica por ID
 */
export const updateMessageById = (
  messages: Message[],
  messageId: string,
  updates: Partial<Message>,
): Message[] => {
  return messages.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg));
};

/**
 * Gera um ID único para mensagem
 */
export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random()}`;
};
