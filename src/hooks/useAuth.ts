import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  const [loadingInitialization, setLoadingInitialization] = useState(true);

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
    setLoadingInitialization(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // Remove formatação de CPF/CNPJ antes de enviar ao servidor, preservando e-mail
      const cleanPayload = {
        ...payload,
        identifier: payload.identifier.includes('@')
          ? payload.identifier
          : payload.identifier.replace(/[^\w]/g, ''),
      };
      
      const res: LoginResponse = await authService.login(cleanPayload);
      
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
        // Ignora erro de perfil e usa dados básicos do token
      }

      return { ...res, user: userData };
    },
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    },
    onError: (err: unknown) => {
        // React Query handles error state, functionality preserved here for clarity if needed
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async (payload: RefreshPayload) => {
      const res: RefreshResponse = await authService.refresh({
        refresh_token: payload.refresh_token,
      });
      return res;
    },
    onSuccess: (res) => {
      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
      }
    }
  });

  async function login(payload: LoginPayload) {
    return loginMutation.mutateAsync(payload);
  }

  async function refresh(payload: RefreshPayload) {
    return refreshMutation.mutateAsync(payload);
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

  const error = 
    (loginMutation.error as Error)?.message || 
    (refreshMutation.error as Error)?.message || 
    null;
    
  // Helper para formatar mensagem de erro amigável, seguindo lógica original
  const friendlyError = error ? (() => {
      const msg = error;
      if (msg.includes('not found') || msg.includes('Invalid credentials')) return 'Credenciais inválidas';
      if (msg.includes('rate limit')) return 'Muitas tentativas. Tente novamente em alguns minutos';
      return msg || 'Erro na autenticação';
  })() : null;


  return {
    user,
    accessToken,
    refreshToken,
    loading: loadingInitialization || loginMutation.isPending || refreshMutation.isPending,
    error: friendlyError,
    login,
    refresh,
    logout,
    setUserGlobal,
  };
}
