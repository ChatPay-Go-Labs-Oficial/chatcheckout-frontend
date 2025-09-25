import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function useAuthGuard() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.replace('/login');
    }
  }, [accessToken, loading, router]);

  return { accessToken, loading };
}
