import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Coffee as CoffeeIcon, Flame } from "lucide-react";
import type { Coffee, RoastLevel } from "@coffee-tracker/shared";
import { getRoastLevelLabel } from "@coffee-tracker/shared";
import { COFFEE_COUNTRIES, getFlagEmoji } from "../data/countries";
import { StarRating } from "./StarRating";
import { cn } from "../lib/cn";

function getOriginFlag(origin: string | null | undefined): string | null {
  if (!origin) return null;
  const country = COFFEE_COUNTRIES.find((c) => c.name === origin);
  return country ? getFlagEmoji(country.code) : null;
}

interface CoffeeCardProps {
  coffee: Coffee;
  onSelect: (coffeeId: string) => void;
  onPrefetch?: (coffeeId: string) => void;
  index: number;
}

const ROAST_COLORS: Record<RoastLevel, string> = {
  LIGHT: "#c4a574",
  MEDIUM: "#8b6914",
  MEDIUM_DARK: "#5a4510",
  DARK: "#3d2914",
};

export const CoffeeCard = memo(function CoffeeCard({
  coffee,
  onSelect,
  onPrefetch,
  index,
}: CoffeeCardProps) {
  const cupsCount = coffee._count?.cups || coffee.cups?.length || 0;
  const roastColor = ROAST_COLORS[coffee.roastLevel];
  const shouldAnimateIn = index < 12;
  const entryDelay = Math.min(index, 6) * 0.03;

  // onPointerDown fires the moment a finger touches the screen (~100-150 ms
  // before the click event), giving us a prefetch head-start on mobile.
  // onMouseEnter covers desktop hover (even more lead time).
  // Both call the same handler; the store deduplicates in-flight requests.
  const handlePrefetch = useCallback(() => {
    onPrefetch?.(coffee.id);
  }, [coffee.id, onPrefetch]);

  return (
    <motion.article
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card",
        "shadow-sm transition-shadow hover:shadow-md",
      )}
      onClick={() => onSelect(coffee.id)}
      onPointerDown={handlePrefetch}
      onMouseEnter={handlePrefetch}
      initial={shouldAnimateIn ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut", delay: shouldAnimateIn ? entryDelay : 0 }}
    >
      {/* Roast color bar — gradient for depth */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${roastColor}, ${roastColor}99)`,
        }}
      />

      {/* Subtle colour wash from roast bar downward */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1.5 h-20 opacity-[0.07]"
        style={{ background: `linear-gradient(180deg, ${roastColor}, transparent)` }}
      />

      <div className="relative p-3 md:p-4">
        {/* Name + roast badge */}
        <div className="mb-2.5 flex items-start justify-between gap-2 md:mb-3">
          <h3 className="font-display text-lg font-bold leading-tight text-foreground md:text-xl">
            {coffee.name || "قهوة بدون اسم"}
          </h3>
          <div
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white md:text-xs"
            style={{
              background: `linear-gradient(135deg, ${roastColor}, ${roastColor}cc)`,
              boxShadow: `0 2px 8px ${roastColor}50`,
            }}
          >
            <Flame size={11} />
            {getRoastLevelLabel(coffee.roastLevel)}
          </div>
        </div>

        {/* Roaster + origin with icon pill containers */}
        <div className="mb-3 flex flex-col gap-1.5 text-sm text-muted-foreground md:mb-4">
          <span className="inline-flex items-center gap-2">
            <span
              className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: roastColor }}
            >
              <CoffeeIcon size={11} />
            </span>
            <span className="font-medium text-secondary-foreground">
              {coffee.roaster?.name || "محمصة غير محددة"}
            </span>
          </span>
          {coffee.origin && (
            <span className="inline-flex items-center gap-2">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-muted text-sm leading-[0]">
                {getOriginFlag(coffee.origin) ?? "🌍"}
              </span>
              <span>{coffee.origin}</span>
            </span>
          )}
        </div>

        {/* Footer: cup count + star rating */}
        <div className="flex items-center justify-between border-t border-border pt-2.5 md:pt-3">
          <div className="inline-flex items-center gap-1.5">
            <span
              className="flex size-[26px] shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: roastColor }}
            >
              <CoffeeIcon size={13} />
            </span>
            <span className="font-display text-2xl font-bold leading-none text-accent md:text-3xl">
              {cupsCount}
            </span>
            <span className="text-xs text-muted-foreground">فنجان</span>
          </div>

          {coffee.rating && coffee.rating > 0 && (
            <StarRating rating={coffee.rating} size="sm" readonly />
          )}
        </div>
      </div>

      {/* Hover: roast-tinted inner glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${roastColor}35` }}
      />
    </motion.article>
  );
});

CoffeeCard.displayName = "CoffeeCard";
