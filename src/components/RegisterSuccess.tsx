import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterSuccessProps {
  showLoader: boolean;
  message?: string;
  loading?: boolean;
}

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ showLoader, message, loading }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full py-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 shadow-sm">
        <CheckCircle2 className="size-10" />
      </div>
      
      <div className="space-y-1.5 px-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Cadastro realizado!
        </h2>
        <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
          Sua conta foi criada com sucesso. Estamos preparando tudo.
        </p>
      </div>

      <div className="w-full max-w-[260px] space-y-4 pt-2">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-primary/10">
          <div
            className={cn(
              "h-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)] shadow-primary",
              showLoader && "animate-loaderBar"
            )}
          />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Redirecionando...
              </>
            ) : (
              message || 'Iniciando sessão...'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
