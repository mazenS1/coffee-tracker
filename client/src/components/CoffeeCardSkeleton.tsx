export function CoffeeCardSkeleton() {
  return (
    <div className="relative min-h-[173px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Roast color bar */}
      <div className="skeleton-glow h-1.5 w-full rounded-none" />

      <div className="p-3 md:p-4">
        {/* Name + roast badge */}
        <div className="mb-2.5 flex items-start justify-between gap-2 md:mb-3">
          <div className="skeleton-glow skeleton-glow-soft h-6 w-36 rounded-md" />
          <div className="skeleton-glow skeleton-glow-soft h-6 w-16 rounded-full" />
        </div>

        {/* Roaster + origin rows */}
        <div className="mb-3 flex min-h-[3.625rem] flex-col gap-1.5 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="skeleton-glow skeleton-glow-soft size-[22px] shrink-0 rounded-full" />
            <div className="skeleton-glow skeleton-glow-soft h-4 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton-glow skeleton-glow-soft size-[22px] shrink-0 rounded-full" />
            <div className="skeleton-glow skeleton-glow-soft h-4 w-20 rounded-md" />
          </div>
        </div>

        {/* Footer: cup count + rating */}
        <div className="flex items-center justify-between border-t border-border pt-2.5 md:pt-3">
          <div className="flex items-center gap-1.5">
            <div className="skeleton-glow skeleton-glow-soft size-[26px] shrink-0 rounded-full" />
            <div className="skeleton-glow skeleton-glow-soft h-7 w-7 rounded-md" />
            <div className="skeleton-glow skeleton-glow-soft h-4 w-9 rounded-md" />
          </div>
          <div className="skeleton-glow skeleton-glow-soft h-4 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
