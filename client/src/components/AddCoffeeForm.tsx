import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, ChevronDown } from "lucide-react";
import { useCoffeeStore } from "../store/coffeeStore";
import type { RoastLevel, CreateCoffeeInput } from "@coffee-tracker/shared";
import { ROAST_LEVEL_LABELS } from "@coffee-tracker/shared";
import { COFFEE_COUNTRIES, getFlagEmoji } from "../data/countries";
import { DEFAULT_ROASTERS } from "../data/roasters";

const PREFILL_PREFIX = "prefill:";

/** Roaster option: either from API (has id) or prefilled (value = prefill:name) */
function getRoasterOptions(roasters: { id: string; name: string }[]) {
  const apiNames = new Set(roasters.map((r) => r.name));
  const prefilledOnly = DEFAULT_ROASTERS.filter((name) => !apiNames.has(name));
  const options: { value: string; label: string }[] = [
    ...roasters.map((r) => ({ value: r.id, label: r.name })),
    ...prefilledOnly.map((name) => ({ value: `${PREFILL_PREFIX}${name}`, label: name })),
  ];
  return options.sort((a, b) => a.label.localeCompare(b.label, "ar"));
}

interface AddCoffeeFormProps {
  onClose: () => void;
}

const COFFEE_QUICK_NOTE_OPTIONS = [
  { value: "Fruity", label: "فواكهي" },
  { value: "Chocolatey", label: "شوكولاتي" },
  { value: "Classic", label: "كلاسيكي" },
  { value: "Nutty", label: "مكسراتي" },
  { value: "Floral", label: "زهري" },
  { value: "Citrusy", label: "حمضيات" },
  { value: "Sweet", label: "حلو" },
  { value: "Caramelly", label: "كراميل" },
  { value: "Tea-like", label: "شبيه بالشاي" },
  { value: "Spicy", label: "بهارات" },
] as const;

const serializeQuickNotes = (notes: string[]) =>
  notes.map((note) => note.trim()).filter(Boolean).join(", ");

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
    quickNotes: string[];
    notes: string;
  }>({
    roasterId: "",
    origin: "",
    name: "",
    roastLevel: "MEDIUM",
    quickNotes: [],
    notes: "",
  });

  const toggleQuickNote = (note: string) => {
    setFormData((prev) => {
      const exists = prev.quickNotes.includes(note);

      return {
        ...prev,
        quickNotes: exists
          ? prev.quickNotes.filter((item) => item !== note)
          : [...prev.quickNotes, note],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roasterId || !formData.name) return;

    setIsSubmitting(true);
    try {
      let roasterId = formData.roasterId;
      if (roasterId.startsWith(PREFILL_PREFIX)) {
        const roasterName = roasterId.slice(PREFILL_PREFIX.length);
        const roaster = await addRoaster(roasterName);
        if (!roaster) return;
        roasterId = roaster.id;
      }

      const coffeeInput: CreateCoffeeInput = {
        roasterId,
        name: formData.name,
        origin: formData.origin || undefined,
        roastLevel: formData.roastLevel,
        flavorProfile: serializeQuickNotes(formData.quickNotes) || undefined,
        notes: formData.notes || undefined,
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
        className="modal-content coffee-modal-v2"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for native feel */}
        <div className="modal-handle" />

        <div className="modal-header compact">
          <h2>قهوة جديدة</h2>
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="coffee-form-v2">
          {/* Roaster Selection - Dropdown */}
          <div className="form-section-v2">
            <label className="section-label-v2">المحمصة</label>
            
            {!showNewRoaster ? (
              <div className="roaster-select-row">
                <div className="select-wrapper flex-grow">
                  <select
                    value={formData.roasterId}
                    onChange={(e) =>
                      setFormData({ ...formData, roasterId: e.target.value })
                    }
                    className="form-select"
                    required
                  >
                    <option value="">اختر محمصة...</option>
                    {getRoasterOptions(roasters).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="select-icon" />
                </div>
                <motion.button
                  type="button"
                  className="add-roaster-btn"
                  onClick={() => setShowNewRoaster(true)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                </motion.button>
              </div>
            ) : (
              <div className="new-roaster-input-v2">
                <input
                  type="text"
                  value={newRoasterName}
                  onChange={(e) => setNewRoasterName(e.target.value)}
                  placeholder="اسم المحمصة"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRoaster();
                    }
                  }}
                />
                <motion.button
                  type="button"
                  className="action-btn primary"
                  onClick={handleAddRoaster}
                  disabled={!newRoasterName.trim()}
                  whileTap={{ scale: 0.95 }}
                >
                  إضافة
                </motion.button>
                <motion.button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    setShowNewRoaster(false);
                    setNewRoasterName("");
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  إلغاء
                </motion.button>
              </div>
            )}
          </div>

          {/* Coffee name and origin - inline layout */}
          <div className="form-row">
            <div className="form-field flex-2">
              <label className="section-label-v2" htmlFor="coffeeName">اسم القهوة</label>
              <input
                type="text"
                id="coffeeName"
                className="text-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="يرغاشيف، قوجي..."
                required
              />
            </div>
            <div className="form-field flex-1">
              <label className="section-label-v2" htmlFor="origin">المنشأ</label>
              <div className="select-wrapper">
                <select
                  id="origin"
                  className="form-select"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                >
                  <option value="">اختر بلد المنشأ...</option>
                  {COFFEE_COUNTRIES.map(({ name, code }) => (
                    <option key={code} value={name}>
                      {getFlagEmoji(code)} {name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="select-icon" />
              </div>
            </div>
          </div>

          {/* Roast level - Visual buttons */}
          <div className="form-section-v2">
            <label className="section-label-v2">درجة التحميص</label>
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

          {/* Notes */}
          <div className="form-section-v2">
            <label className="section-label-v2">ملاحظات سريعة (متعدد)</label>
            <div className="cup-quick-notes-picker">
              {COFFEE_QUICK_NOTE_OPTIONS.map((note) => {
                const selected = formData.quickNotes.includes(note.value);

                return (
                  <motion.button
                    key={note.value}
                    type="button"
                    className={`cup-quick-note-btn ${selected ? "selected" : ""}`}
                    onClick={() => toggleQuickNote(note.value)}
                    whileTap={{ scale: 0.96 }}
                    aria-pressed={selected}
                  >
                    {note.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="form-section-v2">
            <label className="section-label-v2" htmlFor="coffeeNotes">ملاحظات إضافية</label>
            <textarea
              id="coffeeNotes"
              className="notes-textarea"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="ملاحظات عن القهوة..."
              rows={2}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="submit-button-v2"
            disabled={isSubmitting || !formData.roasterId || !formData.name}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            {isSubmitting ? "جاري الإضافة..." : "إضافة"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
