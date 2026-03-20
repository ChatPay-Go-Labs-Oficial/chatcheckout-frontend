import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="w-full p-8 pt-4 mx-auto pb-6 bg-background min-w-0 max-w-[100vw]">
      <div className="flex flex-col mb-6 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Visão geral do desempenho e métricas em tempo real.
        </p>
      </div>

      <div className="mb-4 rounded border border-muted/60 bg-muted/20 px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
        Sincronizando dados...
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between space-y-4 min-h-[120px]"
          >
            <div className="flex flex-row items-center justify-between space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="space-y-2 text-left">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 mb-6 items-stretch min-h-[250px]">
        <div className="lg:col-span-8 rounded-xl border bg-card shadow-sm p-6">
          <Skeleton className="h-full w-full min-h-[200px]" />
        </div>
        <div className="lg:col-span-4 rounded-xl border bg-card shadow-sm p-6 h-full">
          <Skeleton className="h-full w-full min-h-[200px]" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card shadow-sm p-6 flex flex-col justify-center min-h-[150px] space-y-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
