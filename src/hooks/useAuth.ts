import { useState } from 'react';
import { authService } from '@/services/authService';
import { LoginPayload, LoginResponse, RefreshPayload, RefreshResponse } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(payload: LoginPayload) {
    setLoading(true);
    setError(null);
    try {
      const res: LoginResponse = await authService.login(payload.email, payload.password);
      setUser(res.user);
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao fazer login');
      } else {
        setError('Erro ao fazer login');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refresh(payload: RefreshPayload) {
    setLoading(true);
    setError(null);
    try {
      const res: RefreshResponse = await authService.refresh(payload.refresh_token);
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao renovar token');
      } else {
        setError('Erro ao renovar token');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    refresh,
    logout,
  };
}
