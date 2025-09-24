import { useState } from 'react';
import { userService } from '@/services/userService';
import { UserRegisterPayload, UserProfile, UserUpdatePayload } from '@/types/user';

export function useUser(accessToken?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(payload: UserRegisterPayload) {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.register(payload);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao cadastrar usuário');
      } else {
        setError('Erro ao cadastrar usuário');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getProfile() {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res: UserProfile = await userService.getProfile(accessToken);
      setProfile(res);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao buscar perfil');
      } else {
        setError('Erro ao buscar perfil');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: string, payload: UserUpdatePayload) {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await userService.update(id, payload, accessToken);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao atualizar usuário');
      } else {
        setError('Erro ao atualizar usuário');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await userService.remove(id, accessToken);
      return res;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Erro ao remover usuário');
      } else {
        setError('Erro ao remover usuário');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    profile,
    loading,
    error,
    register,
    getProfile,
    update,
    remove,
  };
}
