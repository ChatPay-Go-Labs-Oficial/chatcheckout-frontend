'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuthGuard();
  const { logout, user } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!accessToken) {
    // O redirecionamento já é feito pelo useAuthGuard
    return null;
  }

  return (
    <div className="h-screen flex bg-[#f7f8fa]">
      <Sidebar
        user={user ? { ...user, role: user.role as import('@/types/user').UserRole } : null}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 text-primary overflow-hidden">{children}</main>
    </div>
  );
}
