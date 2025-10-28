import { apiClient } from '@/utils/api-client';
import {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RefreshPayload,
  LogoutPayload,
  LogoutResponse,
} from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const result = await apiClient.post<LoginResponse>('/auth/login', payload);

      return result;
    } catch (error) {
      console.error('Erro no login authService:', error);
      throw error;
    }
  },

  async refresh(payload: RefreshPayload): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>('/auth/refresh', payload);
  },

  async logout(payload: LogoutPayload): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>('/auth/logout', payload);
  },
};
