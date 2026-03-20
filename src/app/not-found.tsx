'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

/**
 * Enterprise Ultra 404 Not Found Page
 * Provides a branded, helpful experience for missing routes.
 */
export default function NotFound() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleHomeClick = () => {
    if (loading) return;
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <span className="text-[40vw] font-black leading-none">404</span>
      </div>

      <div className="relative flex flex-col items-center max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
        {/* Branded Logo Section */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse group-hover:bg-primary/30 transition-all duration-1000" />
          <div className="relative">
            <Logo className="size-28 shadow-2xl shadow-primary/20" />
            <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
              !
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-3 px-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Parece que o caminho que você tentou acessar não existe ou foi movido.
            Não se preocupe, vamos te ajudar a se encontrar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full px-8 pt-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button 
            onClick={handleHomeClick} 
            disabled={loading}
            className="w-full sm:flex-1 h-11 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20"
          >
            <Home className="mr-2 size-4" />
            Início
          </Button>
          <Button onClick={() => router.back()} variant="outline" className="w-full sm:flex-1 h-11 px-6 rounded-xl font-semibold border-muted-foreground/30 hover:bg-muted/50 transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
