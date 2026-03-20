import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil do Usuário</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Gerencie suas informações pessoais e configurações da plataforma com segurança.
        </p>
      </div>
      
      <div className="w-full max-w-2xl bg-card rounded-xl border border-muted/60 shadow-sm overflow-hidden mt-8">
        <div className="flex flex-col items-center justify-center p-8 bg-muted/10 border-b border-muted/30">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="p-6 bg-muted/20 border-t border-muted/30 flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
