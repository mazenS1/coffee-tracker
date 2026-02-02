import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  Thermometer,
  Coffee as CoffeeIcon,
  Calendar,
  Loader2,
} from "lucide-react";
import { useCoffeeStore } from "../store/coffeeStore";
import { StarRating } from "./StarRating";
import { AddCupForm } from "./AddCupForm";
import type { Coffee } from "@coffee-tracker/shared";
import { getRoastLevelLabel, getBrewMethodLabel } from "@coffee-tracker/shared";

interface CoffeeDetailProps {
  coffee: Coffee;
  onBack: () => void;
}

export function CoffeeDetail({ coffee, onBack }: CoffeeDetailProps) {
  const [showAddCup, setShowAddCup] = useState(false);
  const { updateCoffee, deleteCup, deleteCoffee, isLoadingCoffee } =
    useCoffeeStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذه القهوة؟")) {
      await deleteCoffee(coffee.id);
      onBack();
    }
  };

  const handleRatingUpdate = async (rating: number) => {
    await updateCoffee(coffee.id, { rating });
  };

  const cups = coffee.cups || [];
  const averageRating =
    cups.length > 0
      ? cups.reduce((acc, cup) => acc + (cup.rating || 0), 0) / cups.length
      : 0;

  return (
    <motion.div
      className="coffee-detail"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <header className="detail-header">
        <motion.button
          className="back-button"
          onClick={onBack}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight size={24} />
          العودة
        </motion.button>

        <motion.button
          className="delete-button"
          onClick={handleDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={20} />
        </motion.button>
      </header>

      {isLoadingCoffee ? (
        <div className="loading-state">
          <Loader2 className="spinner" size={48} />
          <p>جاري التحميل...</p>
        </div>
      ) : (
        <>
          <div className="detail-hero">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {coffee.origin && (
                <span className="origin-badge">{coffee.origin}</span>
              )}
              <h1>{coffee.name || "قهوة بدون اسم"}</h1>
              <p className="roastery-name">
                {coffee.roaster?.name || "محمصة غير محددة"}
              </p>

              <div className="overall-rating">
                <span className="rating-label">التقييم العام</span>
                <StarRating
                  rating={coffee.rating || 0}
                  onRate={handleRatingUpdate}
                  size="lg"
                />
              </div>
            </motion.div>

            <div className="hero-decoration">
              <div className="coffee-beans" />
            </div>
          </div>

          <div className="detail-stats">
            <div className="stat-card">
              <span className="stat-value">{cups.length}</span>
              <span className="stat-label">فنجان</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {cups.length > 0 ? averageRating.toFixed(1) : "—"}
              </span>
              <span className="stat-label">متوسط التقييم</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {getRoastLevelLabel(coffee.roastLevel)}
              </span>
              <span className="stat-label">درجة التحميص</span>
            </div>
          </div>

          <section className="cups-section">
            <div className="section-header">
              <h2>سجل الفناجين</h2>
              <motion.button
                className="add-cup-button"
                onClick={() => setShowAddCup(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                إضافة فنجان
              </motion.button>
            </div>

            <div className="cups-list">
              <AnimatePresence mode="popLayout">
                {cups.length === 0 ? (
                  <motion.div
                    className="empty-cups"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CoffeeIcon size={48} />
                    <p>لم تسجل أي فنجان بعد</p>
                    <span>ابدأ بتسجيل أول فنجان لك من هذه القهوة</span>
                  </motion.div>
                ) : (
                  cups
                    .slice()
                    .reverse()
                    .map((cup, index) => (
                      <motion.div
                        key={cup.id}
                        className="cup-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <div className="cup-header">
                          <div className="cup-date">
                            <Calendar size={14} />
                            {formatDate(cup.createdAt)}
                          </div>
                          <div className="cup-actions">
                            <StarRating
                              rating={cup.rating || 0}
                              size="sm"
                              readonly
                            />
                            <motion.button
                              className="cup-delete"
                              onClick={() => deleteCup(cup.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                        </div>

                        <div className="cup-params">
                          <span className="cup-param">
                            <Clock size={14} />
                            {formatTime(cup.time)}
                          </span>
                          <span className="cup-param">
                            <Thermometer size={14} />
                            {cup.temperature ? `${cup.temperature}°C` : "—"}
                          </span>
                          {cup.brewMethod && (
                            <span className="cup-param">
                              <CoffeeIcon size={14} />
                              {getBrewMethodLabel(cup.brewMethod)}
                            </span>
                          )}
                        </div>

                        {cup.notes && <p className="cup-notes">{cup.notes}</p>}
                      </motion.div>
                    ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </>
      )}

      <AnimatePresence>
        {showAddCup && (
          <AddCupForm
            coffeeId={coffee.id}
            onClose={() => setShowAddCup(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
