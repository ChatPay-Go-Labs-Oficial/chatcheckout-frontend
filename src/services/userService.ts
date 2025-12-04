import { UserUpdatePayload, UserProfile } from '@/types/user';
import { apiClient } from '@/utils/api-client';

export const userService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    cpf: string;
    password: string;
    confirmPassword: string;
    role: string;
    companyName?: string;
    cnpj?: string;
  }) {
    // Remove campos undefined antes de enviar
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    return apiClient.post('/user/register', cleanData);
  },

  async getProfile(token: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/user/profile', token);
  },

  async update(id: string, data: UserUpdatePayload, token: string): Promise<UserProfile> {
    return apiClient.patch<UserProfile>(`/user/${id}`, data, token);
  },

  async remove(id: string, token: string) {
    await apiClient.delete(`/user/${id}`, token);
    return { success: true };
  },
};
