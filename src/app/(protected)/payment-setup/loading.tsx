import { Skeleton } from '@/components/ui/skeleton';

export default function GenericSkeletonLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-4 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div>
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[474px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
