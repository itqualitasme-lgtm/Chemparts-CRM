export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />
}

/** Neutral portal page loading state — a heading, a few metric tiles and a
 *  content block. Generic enough for the dashboard and list pages. */
export function PageSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="mt-6 h-72 w-full" />
    </div>
  )
}
