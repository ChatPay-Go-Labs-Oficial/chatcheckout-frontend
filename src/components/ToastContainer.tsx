'use client';

import React from 'react';
import { Toast } from './Toast';
import { ToastState } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastState[];
  onClose: (id: number) => void;
}

/**
 * Container que renderiza múltiplos toasts empilhados
 * Deve ser colocado no layout raiz da aplicação
 */
export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onClose(toast.id)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
}
