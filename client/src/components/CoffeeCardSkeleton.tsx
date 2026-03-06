export function CoffeeCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Roast color bar */}
      <div className="h-1.5 w-full animate-pulse rounded-none bg-muted" />

      <div className="p-3 md:p-4">
        {/* Name + roast badge */}
        <div className="mb-2.5 flex items-start justify-between gap-2 md:mb-3">
          <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Roaster + origin rows */}
        <div className="mb-3 flex flex-col gap-1.5 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="size-[22px] shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="size-[22px] shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        {/* Footer: cup count + rating */}
        <div className="flex items-center justify-between border-t border-border pt-2.5 md:pt-3">
          <div className="flex items-center gap-1.5">
            <div className="size-[26px] shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-9 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
