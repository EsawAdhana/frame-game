import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <main className="flex-1 px-5 py-6">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-4 h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-6 space-y-2 rounded-2xl border border-border bg-card p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-3 py-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
