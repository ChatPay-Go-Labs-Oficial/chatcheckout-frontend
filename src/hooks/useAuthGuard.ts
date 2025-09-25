import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ACCESS_TOKEN_KEY = 'chatcheckout_access_token';

export function useAuthGuard() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    // Fallback: se o hook não carregou, tenta pegar do localStorage
    const token =
      accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null);
    if (!loading && !token) {
      router.replace('/login');
    }
    setTokenChecked(true);
  }, [accessToken, loading, router]);

  return {
    accessToken:
      accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null),
    loading: loading && !tokenChecked,
  };
}
