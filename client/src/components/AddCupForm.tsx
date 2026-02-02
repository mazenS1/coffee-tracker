import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Thermometer, X, Coffee as CoffeeIcon, Scale } from "lucide-react";
import { useCoffeeStore } from "../store/coffeeStore";
import { StarRating } from "./StarRating";
import type { BrewMethod, CreateCupInput } from "@coffee-tracker/shared";
import { BREW_METHOD_LABELS } from "@coffee-tracker/shared";

interface AddCupFormProps {
  coffeeId: string;
  onClose: () => void;
}

export function AddCupForm({ coffeeId, onClose }: AddCupFormProps) {
  const { addCup } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    time: 180, // seconds
    grams: 18,
    temperature: 93,
    brewMethod: "POUR_OVER" as BrewMethod,
    notes: "",
    rating: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cupInput: CreateCupInput = {
        coffeeId,
        time: formData.time,
        grams: formData.grams,
        temperature: formData.temperature,
        brewMethod: formData.brewMethod,
        notes: formData.notes || undefined,
        rating: formData.rating || undefined,
      };
      await addCup(cupInput);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const brewMethods = Object.keys(BREW_METHOD_LABELS) as BrewMethod[];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content cup-modal"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>تسجيل فنجان جديد</h2>
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="cup-form">
          <div className="brew-params">
            <div className="param-card">
              <div className="param-icon">
                <Clock size={20} />
              </div>
              <label>وقت التخمير</label>
              <div className="param-value">{formatTime(formData.time)}</div>
              <input
                type="range"
                min={30}
                max={600}
                step={5}
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: Number(e.target.value) })
                }
              />
            </div>

            <div className="param-card">
              <div className="param-icon">
                <Scale size={20} />
              </div>
              <label>كمية البن (جرام)</label>
              <div className="param-value">{formData.grams}g</div>
              <input
                type="range"
                min={5}
                max={50}
                step={0.5}
                value={formData.grams}
                onChange={(e) =>
                  setFormData({ ...formData, grams: Number(e.target.value) })
                }
              />
            </div>

            <div className="param-card">
              <div className="param-icon">
                <Thermometer size={20} />
              </div>
              <label>درجة الماء</label>
              <div className="param-value">{formData.temperature}°C</div>
              <input
                type="range"
                min={80}
                max={100}
                step={1}
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="form-section">
            <label>طريقة التحضير</label>
            <div className="brew-method-selector">
              {brewMethods.map((method) => (
                <motion.button
                  key={method}
                  type="button"
                  className={`brew-method-option ${formData.brewMethod === method ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, brewMethod: method })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {BREW_METHOD_LABELS[method]}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="notes">ملاحظات</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="أضف ملاحظاتك عن هذا الفنجان..."
              rows={3}
            />
          </div>

          <div className="form-section rating-section">
            <label>تقييم الفنجان</label>
            <StarRating
              rating={formData.rating}
              onRate={(rating) => setFormData({ ...formData, rating })}
              size="lg"
            />
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CoffeeIcon size={20} />
            {isSubmitting ? "جاري الحفظ..." : "حفظ الفنجان"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
