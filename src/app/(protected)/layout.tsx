'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuthGuard();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (loading || !hydrated) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!accessToken) {
    return null;
  }

  return (
    <div className="h-screen flex bg-[#f7f8fa]">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 p-8 text-primary overflow-y-auto">{children}</main>
    </div>
  );
}
