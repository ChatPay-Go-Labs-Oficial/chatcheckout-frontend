import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { LoginPayload, LoginResponse, RefreshPayload, RefreshResponse } from '@/types/auth';
import { UserProfile, UserRole } from '@/types/user';
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'chatcheckout_access_token';
const REFRESH_TOKEN_KEY = 'chatcheckout_refresh_token';
const USER_KEY = 'chatcheckout_user';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setUserGlobal(newUser: UserProfile | null) {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    }
  }

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
      // Remove formatação de CPF/CNPJ antes de enviar ao servidor, preservando e-mail
      const cleanPayload = {
        ...payload,
        identifier: payload.identifier.includes('@')
          ? payload.identifier
          : payload.identifier.replace(/[^\w]/g, ''),
      };
      const res: LoginResponse = await authService.login(cleanPayload);
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);

      type JwtPayload = {
        sub: string;
        email?: string;
        cpf?: string;
        cnpj?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
      };
      const decoded: JwtPayload = jwtDecode(res.access_token);
      let userData: UserProfile = {
        id: decoded.sub,
        email: decoded.email ?? '',
        cpf: decoded.cpf ?? '',
        firstName: decoded.firstName ?? '',
        lastName: decoded.lastName ?? '',
        role:
          decoded.role && Object.values(UserRole).includes(decoded.role as UserRole)
            ? (decoded.role as UserRole)
            : UserRole.Client,
        companyName: undefined,
        cnpj: decoded.cnpj,
      };

      try {
        const profile = await userService.getProfile(res.access_token);
        userData = { ...userData, ...profile } as UserProfile;
      } catch {
        // TODO Se falhar, mantém dados do token
      }
      setUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      return { ...res, user: userData };
    } catch (err: unknown) {
      let errorMessage = 'Erro ao fazer login';

      if (err instanceof Error) {
        if (err.message.includes('not found') || err.message.includes('Invalid credentials')) {
          errorMessage = 'Credenciais inválidas';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        } else {
          errorMessage = 'Erro ao fazer login. Tente novamente';
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refresh(payload: RefreshPayload) {
    setLoading(true);
    setError(null);
    try {
      const res: RefreshResponse = await authService.refresh({
        refresh_token: payload.refresh_token,
      });
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

  async function logout() {
    try {
      if (accessToken) {
        await authService.logout({ token: accessToken });
      }
    } catch (error) {
      console.error('Erro ao invalidar token no servidor:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
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
    setUserGlobal,
  };
}
