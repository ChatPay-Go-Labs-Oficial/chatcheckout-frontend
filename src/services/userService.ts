import { NEXT_PUBLIC_API_URL } from '@/utils/env';
import { UserUpdatePayload } from '@/types/user';

export const userService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    cpf: string;
    password: string;
    role: string;
    companyName?: string;
    cnpj?: string;
  }) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getProfile(token: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async update(id: string, data: UserUpdatePayload, token: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/user/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async remove(id: string, token: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/user/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
