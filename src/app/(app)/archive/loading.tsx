import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex-1 px-5 py-6 space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-60" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
