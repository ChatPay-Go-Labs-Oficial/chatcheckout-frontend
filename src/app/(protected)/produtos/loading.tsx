import { Skeleton } from '@/components/ui/skeleton';

export default function ProdutosLoading() {
  return (
    <div className="w-full p-8 pt-4">
      <div className="flex items-center justify-between mb-6 animate-pulse">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
        <div className="h-11 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[300px]">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-4 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
