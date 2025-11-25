'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer } from '@/components/ToastContainer';
import { ToastType } from '@/components/Toast';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Funções estáveis que não precisam de useCallback
  const success = (message: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type: 'success' }]);
  };

  const error = (message: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type: 'error' }]);
  };

  const warning = (message: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type: 'warning' }]);
  };

  const info = (message: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type: 'info' }]);
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast deve ser usado dentro de ToastProvider');
  }
  return context;
}
