/**
 * Campo de input para enviar mensagens
 */

'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSend, isTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isTyping && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="px-5 py-4 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="relative flex items-center">
        <input
          className="w-full pl-5 pr-14 py-4 text-base text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400"
          placeholder={isTyping ? 'Aguardando resposta...' : 'Digite sua mensagem...'}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping || disabled}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isTyping || disabled}
          className="absolute right-2.5 w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          aria-label="Enviar mensagem"
        >
          <span className="material-symbols-outlined text-[22px]">send</span>
        </button>
      </div>
    </footer>
  );
}
