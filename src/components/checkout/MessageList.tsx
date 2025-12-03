/**
 * Lista de mensagens do chat
 */

'use client';

import { Message, CheckoutActions, CheckoutState } from '@/types/checkout';
import { MessageBubble } from './index';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  actions: CheckoutActions;
  state: CheckoutState;
}

export function MessageList({ messages, actions, state }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} actions={actions} state={state} />
      ))}

      {state.isAiTyping && (
        <div className="flex items-start space-x-3 max-w-xs">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gradient-from to-gradient-to flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">support_agent</span>
          </div>
          <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
