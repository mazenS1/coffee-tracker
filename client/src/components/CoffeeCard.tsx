import { motion } from "framer-motion";
import { MapPin, Coffee as CoffeeIcon, Flame } from "lucide-react";
import type { Coffee, RoastLevel } from "@coffee-tracker/shared";
import { getRoastLevelLabel } from "@coffee-tracker/shared";
import { StarRating } from "./StarRating";

interface CoffeeCardProps {
  coffee: Coffee;
  onClick: () => void;
  index: number;
}

export function CoffeeCard({ coffee, onClick, index }: CoffeeCardProps) {
  const cupsCount = coffee._count?.cups || coffee.cups?.length || 0;

  const getRoastColor = (level: RoastLevel) => {
    switch (level) {
      case "LIGHT":
        return "#c4a574";
      case "MEDIUM":
        return "#8b6914";
      case "MEDIUM_DARK":
        return "#5a4510";
      case "DARK":
        return "#3d2914";
      default:
        return "#8b6914";
    }
  };

  return (
    <motion.article
      className="coffee-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      layout
    >
      <div
        className="card-accent"
        style={{ background: getRoastColor(coffee.roastLevel) }}
      />

      <div className="card-content">
        <div className="card-header">
          <h3 className="coffee-name">{coffee.name || "قهوة بدون اسم"}</h3>
          <div
            className="roast-badge"
            style={{ background: getRoastColor(coffee.roastLevel) }}
          >
            <Flame size={12} />
            {getRoastLevelLabel(coffee.roastLevel)}
          </div>
        </div>

        <div className="coffee-meta">
          <span className="meta-item">
            <CoffeeIcon size={14} />
            {coffee.roaster?.name || "محمصة غير محددة"}
          </span>
          {coffee.origin && (
            <span className="meta-item">
              <MapPin size={14} />
              {coffee.origin}
            </span>
          )}
        </div>

        <div className="card-footer">
          <div className="cups-count">
            <span className="count-number">{cupsCount}</span>
            <span className="count-label">فنجان</span>
          </div>

          {coffee.rating && coffee.rating > 0 && (
            <div className="rating-display">
              <StarRating rating={coffee.rating} size="sm" readonly />
            </div>
          )}
        </div>
      </div>

      <motion.div
        className="card-hover-glow"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.article>
  );
}
