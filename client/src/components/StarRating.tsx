import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          className={`star-button ${star <= rating ? "filled" : ""} ${readonly ? "readonly" : ""}`}
          onClick={() => !readonly && onRate?.(star)}
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
