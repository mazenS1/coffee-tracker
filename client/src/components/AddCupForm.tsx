import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Thermometer,
  X,
  Coffee as CoffeeIcon,
  Scale,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useCoffeeStore } from "../store/coffeeStore";
import { StarRating } from "./StarRating";
import type { BrewMethod, CreateCupInput, Cup, UpdateCupInput } from "@coffee-tracker/shared";
import { BREW_METHOD_LABELS } from "@coffee-tracker/shared";

interface AddCupFormProps {
  coffeeId: string;
  onClose: () => void;
  cup?: Cup;
}

const CUP_QUICK_NOTE_OPTIONS = [
  { value: "Fruity", label: "فواكهي" },
  { value: "Chocolatey", label: "شوكولاتي" },
  { value: "Classic", label: "كلاسيكي" },
  { value: "Nutty", label: "مكسراتي" },
  { value: "Floral", label: "زهري" },
  { value: "Citrusy", label: "حمضي/حمضيات" },
  { value: "Sweet", label: "حلو" },
  { value: "Caramelly", label: "كراميل" },
  { value: "Clean", label: "نظيف" },
  { value: "Juicy", label: "عصيري" },
] as const;

const TASTE_LEVELS = [
  "منخفض جداً",
  "منخفض",
  "متوازن",
  "مرتفع",
  "مرتفع جداً",
] as const;

const TASTE_FIELDS = [
  { key: "acidity", label: "الحموضة" },
  { key: "sweetness", label: "الحلاوة" },
  { key: "bitterness", label: "المرارة" },
  { key: "balance", label: "التوازن" },
] as const;

const toNumberOrDefault = (
  value: number | string | null | undefined,
  fallback: number
) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseQuickNotes = (value: string | null | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const serializeQuickNotes = (notes: string[]) =>
  notes.map((note) => note.trim()).filter(Boolean).join(", ");

type CupFormState = {
  time: number;
  grams: number;
  temperature: number;
  brewMethod: BrewMethod;
  notes: string;
  quickNotes: string[];
  rating: number;
  acidity: string;
  sweetness: string;
  bitterness: string;
  balance: string;
};

const buildInitialFormData = (cup?: Cup): CupFormState => ({
  time: toNumberOrDefault(cup?.time, 180),
  grams: toNumberOrDefault(cup?.grams, 18),
  temperature: toNumberOrDefault(cup?.temperature, 93),
  brewMethod: (cup?.brewMethod ?? "V60") as BrewMethod,
  notes: cup?.notes ?? "",
  quickNotes: parseQuickNotes(cup?.aroma),
  rating: cup?.rating ?? 0,
  acidity: cup?.acidity ?? "",
  sweetness: cup?.sweetness ?? "",
  bitterness: cup?.bitterness ?? "",
  balance: cup?.balance ?? "",
});

// Compact stepper component for precise numeric input
interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  presets?: { label: string; value: number }[];
  icon: React.ReactNode;
  label: string;
}

function StepperInput({
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  presets,
  icon,
  label,
}: StepperInputProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  return (
    <div className="stepper-input compact">
      <div className="stepper-header">
        <span className="stepper-icon">{icon}</span>
        <span className="stepper-label">{label}</span>
      </div>

      <div className="stepper-controls">
        <motion.button
          type="button"
          className="stepper-btn"
          onClick={decrement}
          disabled={value <= min}
          whileTap={{ scale: 0.9 }}
        >
          <Minus size={14} />
        </motion.button>

        <span className="stepper-value">{formatValue(value)}</span>

        <motion.button
          type="button"
          className="stepper-btn"
          onClick={increment}
          disabled={value >= max}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={14} />
        </motion.button>
      </div>

      {presets && presets.length > 0 && (
        <div className="stepper-presets">
          {presets.map((preset) => (
            <motion.button
              key={preset.value}
              type="button"
              className={`preset-chip ${value === preset.value ? "active" : ""}`}
              onClick={() => onChange(preset.value)}
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddCupForm({ coffeeId, onClose, cup }: AddCupFormProps) {
  const isEditMode = Boolean(cup);
  const { addCup, updateCup } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CupFormState>(() =>
    buildInitialFormData(cup)
  );

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
    setIsSubmitting(true);

    try {
      const stringValue = (value: string) =>
        isEditMode ? value : value || undefined;

      const baseCupData: Omit<CreateCupInput, "coffeeId"> & UpdateCupInput = {
        time: formData.time,
        grams: formData.grams,
        temperature: formData.temperature,
        brewMethod: formData.brewMethod,
        notes: stringValue(formData.notes),
        aroma: stringValue(serializeQuickNotes(formData.quickNotes)),
        rating: formData.rating || undefined,
        acidity: stringValue(formData.acidity),
        sweetness: stringValue(formData.sweetness),
        bitterness: stringValue(formData.bitterness),
        balance: stringValue(formData.balance),
      };

      if (cup) {
        await updateCup(cup.id, baseCupData);
      } else {
        const cupInput: CreateCupInput = {
          coffeeId,
          ...baseCupData,
        };
        await addCup(cupInput);
      }

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

  const timePresets = [
    { label: "2:30", value: 150 },
    { label: "3:00", value: 180 },
    { label: "3:30", value: 210 },
  ];

  const gramsPresets = [
    { label: "15", value: 15 },
    { label: "18", value: 18 },
    { label: "20", value: 20 },
  ];

  const tempPresets = [
    { label: "92", value: 92 },
    { label: "93", value: 93 },
    { label: "96", value: 96 },
  ];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content cup-modal-v2"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-header compact">
          <h2>{isEditMode ? "تعديل الفنجان" : "فنجان جديد"}</h2>
          <motion.button
            className="close-button"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="cup-form-v2">
          <div className="form-section-compact">
            <label className="section-label">طريقة التحضير</label>
            <div className="select-wrapper">
              <select
                value={formData.brewMethod}
                onChange={(e) =>
                  setFormData({ ...formData, brewMethod: e.target.value as BrewMethod })
                }
                className="form-select"
              >
                {brewMethods.map((method) => (
                  <option key={method} value={method}>
                    {BREW_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="select-icon" />
            </div>
          </div>

          <div className="brew-params-v2">
            <StepperInput
              value={formData.time}
              onChange={(time) => setFormData({ ...formData, time })}
              min={30}
              max={600}
              step={15}
              formatValue={formatTime}
              presets={timePresets}
              icon={<Clock size={14} />}
              label="الوقت"
            />

            <StepperInput
              value={formData.grams}
              onChange={(grams) => setFormData({ ...formData, grams })}
              min={5}
              max={50}
              step={1}
              formatValue={(v) => `${v}g`}
              presets={gramsPresets}
              icon={<Scale size={14} />}
              label="البن"
            />

            <StepperInput
              value={formData.temperature}
              onChange={(temperature) => setFormData({ ...formData, temperature })}
              min={80}
              max={100}
              step={1}
              formatValue={(v) => `${v}°`}
              presets={tempPresets}
              icon={<Thermometer size={14} />}
              label="الحرارة"
            />
          </div>

          <div className="rating-section-v2">
            <label className="section-label">التقييم</label>
            <StarRating
              rating={formData.rating}
              onRate={(rating) => setFormData({ ...formData, rating })}
              size="lg"
            />
          </div>

          <div className="form-section-compact">
            <label className="section-label">ملاحظات سريعة (متعدد)</label>
            <div className="cup-quick-notes-picker">
              {CUP_QUICK_NOTE_OPTIONS.map((note) => {
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

          <div className="form-section-compact">
            <label className="section-label">الانطباع الحسي</label>
            <div className="taste-grid">
              {TASTE_FIELDS.map((field) => (
                <div key={field.key} className="taste-select-field">
                  <label className="section-label" htmlFor={`cup-${field.key}`}>
                    {field.label}
                  </label>
                  <div className="select-wrapper">
                    <select
                      id={`cup-${field.key}`}
                      value={formData[field.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="form-select"
                    >
                      <option value="">غير محدد</option>
                      {TASTE_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="select-icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section-compact">
            <label className="section-label">ملاحظات إضافية</label>
            <textarea
              className="notes-textarea"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="أضف ملاحظاتك..."
              rows={2}
            />
          </div>

          <motion.button
            type="submit"
            className="submit-button-v2"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <CoffeeIcon size={20} />
            {isSubmitting
              ? isEditMode
                ? "جاري التحديث..."
                : "جاري الحفظ..."
              : isEditMode
                ? "حفظ التعديلات"
                : "حفظ"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
