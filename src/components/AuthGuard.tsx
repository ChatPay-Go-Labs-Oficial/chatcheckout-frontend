'use client';

import { useEffect } from 'react';
import { AuthInterceptor } from '@/utils/authInterceptor';

/**
 * Componente que verifica token expirado ao carregar a página
 */
export function AuthGuard() {
  useEffect(() => {
    // Verifica se o token está expirado ao carregar a página
    AuthInterceptor.checkTokenOnLoad();
  }, []);

  return null;
}
