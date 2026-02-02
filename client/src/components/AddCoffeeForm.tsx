import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useCoffeeStore } from "../store/coffeeStore";
import type { RoastLevel, CreateCoffeeInput } from "@coffee-tracker/shared";
import { ROAST_LEVEL_LABELS } from "@coffee-tracker/shared";

interface AddCoffeeFormProps {
  onClose: () => void;
}

export function AddCoffeeForm({ onClose }: AddCoffeeFormProps) {
  const { addCoffee, addRoaster, roasters, fetchCoffees } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewRoaster, setShowNewRoaster] = useState(false);
  const [newRoasterName, setNewRoasterName] = useState("");

  const [formData, setFormData] = useState<{
    roasterId: string;
    origin: string;
    name: string;
    roastLevel: RoastLevel;
  }>({
    roasterId: "",
    origin: "",
    name: "",
    roastLevel: "MEDIUM",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roasterId || !formData.name) return;

    setIsSubmitting(true);
    try {
      const coffeeInput: CreateCoffeeInput = {
        roasterId: formData.roasterId,
        name: formData.name,
        origin: formData.origin || undefined,
        roastLevel: formData.roastLevel,
      };
      await addCoffee(coffeeInput);
      await fetchCoffees();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRoaster = async () => {
    if (!newRoasterName.trim()) return;
    const roaster = await addRoaster(newRoasterName.trim());
    if (roaster) {
      setFormData({ ...formData, roasterId: roaster.id });
      setNewRoasterName("");
      setShowNewRoaster(false);
    }
  };

  const roastLevels: RoastLevel[] = ["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>إضافة قهوة جديدة</h2>
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="coffee-form">
          <div className="form-group">
            <label htmlFor="roaster">المحمصة</label>
            {!showNewRoaster ? (
              <div className="roaster-select-group">
                <select
                  id="roaster"
                  value={formData.roasterId}
                  onChange={(e) =>
                    setFormData({ ...formData, roasterId: e.target.value })
                  }
                  required
                >
                  <option value="">اختر محمصة...</option>
                  {roasters.map((roaster) => (
                    <option key={roaster.id} value={roaster.id}>
                      {roaster.name}
                    </option>
                  ))}
                </select>
                <motion.button
                  type="button"
                  className="add-roaster-button"
                  onClick={() => setShowNewRoaster(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  جديدة
                </motion.button>
              </div>
            ) : (
              <div className="new-roaster-input">
                <input
                  type="text"
                  value={newRoasterName}
                  onChange={(e) => setNewRoasterName(e.target.value)}
                  placeholder="اسم المحمصة الجديدة"
                  autoFocus
                />
                <motion.button
                  type="button"
                  onClick={handleAddRoaster}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إضافة
                </motion.button>
                <motion.button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowNewRoaster(false);
                    setNewRoasterName("");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إلغاء
                </motion.button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="origin">بلد المنشأ</label>
            <input
              type="text"
              id="origin"
              value={formData.origin}
              onChange={(e) =>
                setFormData({ ...formData, origin: e.target.value })
              }
              placeholder="مثال: إثيوبيا، كولومبيا"
            />
          </div>

          <div className="form-group">
            <label htmlFor="coffeeName">اسم القهوة</label>
            <input
              type="text"
              id="coffeeName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="مثال: يرغاشيف"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roastLevel">درجة التحميص</label>
            <div className="roast-selector">
              {roastLevels.map((level) => (
                <motion.button
                  key={level}
                  type="button"
                  className={`roast-option ${formData.roastLevel === level ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, roastLevel: level })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`roast-dot ${level.toLowerCase().replace("_", "-")}`} />
                  {ROAST_LEVEL_LABELS[level]}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !formData.roasterId || !formData.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            {isSubmitting ? "جاري الإضافة..." : "إضافة القهوة"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
