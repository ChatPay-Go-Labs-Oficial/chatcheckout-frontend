import { UserUpdatePayload, UserProfile } from '@/types/user';
import { apiClient } from '@/utils/api-client';

type UpsertWalletPayload = {
  walletAddress: string;
};

type UpsertWalletResponse = UserProfile;

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

  async upsertWalletAddress(walletAddress: string): Promise<UpsertWalletResponse> {
    const payload: UpsertWalletPayload = { walletAddress };
    return apiClient.put<UpsertWalletResponse>('/user/wallet', payload);
  },

  async removeWalletAddress(): Promise<void> {
    await apiClient.delete('/user/wallet');
  },
};
