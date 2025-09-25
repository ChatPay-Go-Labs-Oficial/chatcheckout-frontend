import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { LoginPayload, LoginResponse, RefreshPayload, RefreshResponse } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'chatcheckout_access_token';
const REFRESH_TOKEN_KEY = 'chatcheckout_refresh_token';
const USER_KEY = 'chatcheckout_user';

export function useAuth() {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const storedAccessToken =
      typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    const storedRefreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (storedAccessToken) setAccessToken(storedAccessToken);
    if (storedRefreshToken) setRefreshToken(storedRefreshToken);
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  async function login(payload: LoginPayload) {
    setLoading(true);
    setError(null);
    try {
      const res: LoginResponse = await authService.login(payload.email, payload.password);
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
      // Buscar perfil atualizado após login
      let userData = res.user;
      try {
        const profile = await userService.getProfile(res.access_token);
        userData = { ...userData, ...profile };
      } catch {
        // Se falhar, mantém dados do login
      }
      setUser(userData);
      // Persistir no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      return { ...res, user: userData };
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
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
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
