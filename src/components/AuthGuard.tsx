'use client';

import { useEffect } from 'react';
import { AuthInterceptor } from '@/utils/authInterceptor';

/**
 * Componente que verifica token expirado periodicamente e ao carregar a página
 */
export function AuthGuard() {
  useEffect(() => {
    // Verifica imediatamente ao montar
    AuthInterceptor.checkTokenOnLoad();

    // Verifica a cada 30 segundos
    const intervalId = setInterval(() => {
      AuthInterceptor.checkTokenOnLoad();
    }, 30000);

    // Verifica quando a página volta a ter foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        AuthInterceptor.checkTokenOnLoad();
      }
    };

    const handleFocus = () => {
      AuthInterceptor.checkTokenOnLoad();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
}
