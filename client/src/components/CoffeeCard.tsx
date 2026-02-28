import { motion } from "framer-motion";
import { MapPin, Coffee as CoffeeIcon, Flame } from "lucide-react";
import type { Coffee, RoastLevel } from "@coffee-tracker/shared";
import { getRoastLevelLabel } from "@coffee-tracker/shared";
import { StarRating } from "./StarRating";
import { cn } from "../lib/cn";

interface CoffeeCardProps {
  coffee: Coffee;
  onClick: () => void;
  index: number;
}

const ROAST_COLORS: Record<RoastLevel, string> = {
  LIGHT: "#c4a574",
  MEDIUM: "#8b6914",
  MEDIUM_DARK: "#5a4510",
  DARK: "#3d2914",
};

export function CoffeeCard({ coffee, onClick, index }: CoffeeCardProps) {
  const cupsCount = coffee._count?.cups || coffee.cups?.length || 0;
  const roastColor = ROAST_COLORS[coffee.roastLevel];

  return (
    <motion.article
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card",
        "shadow-md transition-colors will-change-transform md:hover:shadow-xl",
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      layout
    >
      <div
        className="h-1 w-full"
        style={{ background: roastColor }}
      />

      <div className="p-3 md:p-4">
        <div className="mb-2 flex items-start justify-between gap-2 md:mb-3">
          <h3 className="font-display text-lg font-semibold text-foreground md:text-xl">
            {coffee.name || "قهوة بدون اسم"}
          </h3>
          <div
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-white md:text-xs"
            style={{ background: roastColor }}
          >
            <Flame size={12} />
            {getRoastLevelLabel(coffee.roastLevel)}
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-1.5 text-sm text-secondary-foreground md:mb-4">
          <span className="inline-flex items-center gap-2">
            <CoffeeIcon size={14} />
            {coffee.roaster?.name || "محمصة غير محددة"}
          </span>
          {coffee.origin && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} />
              {coffee.origin}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2 md:pt-3">
          <div className="inline-flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold text-accent md:text-3xl">
              {cupsCount}
            </span>
            <span className="text-sm text-muted-foreground">فنجان</span>
          </div>

          {coffee.rating && coffee.rating > 0 && (
            <div>
              <StarRating rating={coffee.rating} size="sm" readonly />
            </div>
          )}
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-accent/10 opacity-0 md:group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.article>
  );
}
