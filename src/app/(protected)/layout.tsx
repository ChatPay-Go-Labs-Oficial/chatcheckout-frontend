import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuthGuard();
  const { logout, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!accessToken) {
    // O redirecionamento já é feito pelo useAuthGuard
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-text-onPrimary flex flex-col py-8 px-4">
        <div className="mb-8 flex flex-col items-center">
          <span className="font-bold text-xl mb-2 text-secondary">ChatCheckout</span>
          <span className="text-sm text-surface">{user?.firstName}</span>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          <Link
            href="/dashboard"
            className="hover:bg-primary-dark px-3 py-2 rounded text-text-onPrimary"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="hover:bg-primary-dark px-3 py-2 rounded text-text-onPrimary"
          >
            Perfil
          </Link>
        </nav>
        <button
          className="mt-8 bg-secondary px-3 py-2 rounded hover:bg-secondary-dark transition text-text-onPrimary"
          onClick={logout}
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 bg-background p-8 text-primary">{children}</main>
    </div>
  );
}
