import { NEXT_PUBLIC_API_URL } from '@/utils/env';

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async refresh(refresh_token: string) {
    const res = await fetch(`${NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    return res.json();
  },
};
