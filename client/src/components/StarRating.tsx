import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "../lib/cn";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRate,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const iconSize = sizes[size];

  return (
    <div className="flex flex-row-reverse gap-0.5 md:gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          className={cn(
            "rounded p-0.5 transition-colors",
            star <= rating ? "text-accent" : "text-border",
            readonly ? "cursor-default" : "cursor-pointer",
          )}
          onClick={() => !readonly && onRate?.(star)}
          aria-label={readonly ? `تقييم ${rating} من 5` : `اختيار ${star} من 5`}
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          disabled={readonly}
        >
          <Star
            size={iconSize}
            fill={star <= rating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </motion.button>
      ))}
    </div>
  );
}
