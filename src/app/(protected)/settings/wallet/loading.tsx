import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function WalletLoading() {
  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6">
      <div className="flex flex-col mb-6 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Carteira</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Gerencie seu saldo Stellar, consulte ativos elegíveis e realize resgates com segurança.
        </p>
      </div>

      <div className="mb-8">
        <Card className="shadow-sm border-muted/60 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-muted/10">
            <div className="lg:col-span-6 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-12 sm:gap-16">
                <div className="flex items-center gap-4 group">
                  <Skeleton className="size-12 rounded-2xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <Skeleton className="size-12 rounded-2xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                 <Skeleton className="h-3 w-40" />
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-8 flex-shrink-0" />
                 </div>
              </div>
            </div>
            <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6 min-h-[160px]">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-40" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-10 w-full max-w-[200px]" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
           <Card className="shadow-sm border-muted/60">
             <div className="p-6">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
