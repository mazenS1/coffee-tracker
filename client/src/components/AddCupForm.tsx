import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Thermometer,
  X,
  Coffee as CoffeeIcon,
  Scale,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Flame,
  Star,
  Sparkles,
  Gauge,
  MessageSquare,
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
  { value: "Fruity", label: "فواكه", emoji: "🍎" },
  { value: "Chocolatey", label: "شوكولاتة", emoji: "🍫" },
  { value: "Classic", label: "كلاسيكي", emoji: "☕" },
  { value: "Nutty", label: "مكسرات", emoji: "🥜" },
  { value: "Floral", label: "زهري", emoji: "🌸" },
  { value: "Citrusy", label: "حمضيات", emoji: "🍋" },
  { value: "Sweet", label: "حلاوة", emoji: "🍯" },
  { value: "Caramelly", label: "كراميل", emoji: "🍮" },
  { value: "Clean", label: "نظيف", emoji: "💧" },
  { value: "Juicy", label: "عصير", emoji: "🍇" },
] as const;

const TASTE_LEVELS = [
  { value: "منخفض جداً", short: "منخفض جداً" },
  { value: "منخفض", short: "منخفض" },
  { value: "متوازن", short: "متوازن" },
  { value: "مرتفع", short: "مرتفع" },
  { value: "مرتفع جداً", short: "مرتفع جداً" },
] as const;

const TASTE_FIELDS = [
  { key: "acidity", label: "الحموضة", emoji: "🍋" },
  { key: "sweetness", label: "الحلاوة", emoji: "🍯" },
  { key: "bitterness", label: "المرارة", emoji: "🍵" },
  { key: "balance", label: "التوازن", emoji: "⚖️" },
] as const;

const BREW_METHOD_ICONS: Record<BrewMethod, string> = {
  V60: "☕",
  CHEMEX: "🫖",
  AEROPRESS: "🔄",
  FRENCH_PRESS: "🫖",
  ESPRESSO: "☕",
  MOKA: "🫖",
  FILTER: "💧",
  POUR_OVER: "💧",
  OTHER: "☕",
};

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

// Enhanced stepper component with larger touch targets
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
    <div className="stepper-input-v3">
      <div className="stepper-header-v3">
        <span className="stepper-icon-v3">{icon}</span>
        <span className="stepper-label-v3">{label}</span>
      </div>

      <div className="stepper-controls-v3">
        <motion.button
          type="button"
          className="stepper-btn-v3"
          onClick={decrement}
          disabled={value <= min}
          whileTap={{ scale: 0.9 }}
        >
          <Minus size={16} />
        </motion.button>

        <span className="stepper-value-v3">{formatValue(value)}</span>

        <motion.button
          type="button"
          className="stepper-btn-v3"
          onClick={increment}
          disabled={value >= max}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {presets && presets.length > 0 && (
        <div className="stepper-presets-v3">
          {presets.map((preset) => (
            <motion.button
              key={preset.value}
              type="button"
              className={`preset-chip-v3 ${value === preset.value ? "active" : ""}`}
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

type SectionId = "brew" | "params" | "rating" | "flavor" | "taste" | "notes";

const CUP_SECTION_ORDER: SectionId[] = ["brew", "params", "rating", "flavor", "taste", "notes"];

export function AddCupForm({ coffeeId, onClose, cup }: AddCupFormProps) {
  const isEditMode = Boolean(cup);
  const { addCup, updateCup } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<SectionId | null>("brew");
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
    { label: "15g", value: 15 },
    { label: "18g", value: 18 },
    { label: "20g", value: 20 },
  ];

  const tempPresets = [
    { label: "92°", value: 92 },
    { label: "93°", value: 93 },
    { label: "96°", value: 96 },
  ];

  const toggleSection = (section: SectionId) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const goToNextSection = () => {
    const idx = CUP_SECTION_ORDER.indexOf(expandedSection ?? "brew");
    if (idx < CUP_SECTION_ORDER.length - 1) {
      setExpandedSection(CUP_SECTION_ORDER[idx + 1]);
    }
  };

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    brew: null,
    params: null,
    rating: null,
    flavor: null,
    taste: null,
    notes: null,
  });

  useEffect(() => {
    if (expandedSection) {
      sectionRefs.current[expandedSection]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [expandedSection]);

  const getSectionStatus = (section: SectionId): "empty" | "partial" | "complete" => {
    switch (section) {
      case "brew":
        return formData.brewMethod ? "complete" : "empty";
      case "params":
        return "complete";
      case "rating":
        return formData.rating > 0 ? "complete" : "empty";
      case "flavor":
        return formData.quickNotes.length > 0 ? "complete" : "empty";
      case "taste":
        const hasTaste = formData.acidity || formData.sweetness || formData.bitterness || formData.balance;
        const allTaste = formData.acidity && formData.sweetness && formData.bitterness && formData.balance;
        if (allTaste) return "complete";
        if (hasTaste) return "partial";
        return "empty";
      case "notes":
        return formData.notes ? "complete" : "empty";
      default:
        return "empty";
    }
  };

  const getTastePreview = () => {
    const filled = [formData.acidity, formData.sweetness, formData.bitterness, formData.balance].filter(Boolean).length;
    if (filled === 0) return "غير محدد";
    if (filled === 4) return "مكتمل";
    return `${filled}/4`;
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content cup-modal-v3"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle" />

        <div className="modal-header-v3">
          <div className="modal-header-content">
            <CoffeeIcon size={20} className="modal-header-icon" />
            <div>
              <h2>{isEditMode ? "تعديل الفنجان" : "فنجان جديد"}</h2>
              <span className="form-progress">
                {CUP_SECTION_ORDER.indexOf(expandedSection ?? "brew") + 1} / {CUP_SECTION_ORDER.length}
              </span>
            </div>
          </div>
          <motion.button
            className="close-button-v3"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="cup-form-v3">
          {/* Section 1: Brew Method */}
          <div
            ref={(el) => { sectionRefs.current.brew = el; }}
            className={`form-accordion ${expandedSection === "brew" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("brew")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("brew")}`}>
                  <Flame size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">طريقة التحضير</span>
                  {expandedSection !== "brew" && (
                    <span className="accordion-preview">
                      {BREW_METHOD_ICONS[formData.brewMethod]} {BREW_METHOD_LABELS[formData.brewMethod]}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "brew" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "brew" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="brew-method-grid-v3">
                      {brewMethods.map((method) => (
                        <motion.button
                          key={method}
                          type="button"
                          className={`brew-method-card-v3 ${formData.brewMethod === method ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, brewMethod: method })}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="brew-emoji">{BREW_METHOD_ICONS[method]}</span>
                          <span className="brew-name">{BREW_METHOD_LABELS[method]}</span>
                        </motion.button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="section-next-btn"
                      onClick={goToNextSection}
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Brew Parameters */}
          <div
            ref={(el) => { sectionRefs.current.params = el; }}
            className={`form-accordion ${expandedSection === "params" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("params")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("params")}`}>
                  <Scale size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">إعدادات التحضير</span>
                  {expandedSection !== "params" && (
                    <span className="accordion-preview">
                      {formatTime(formData.time)} · {formData.grams}g · {formData.temperature}°
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "params" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "params" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="brew-params-grid-v3">
                      <StepperInput
                        value={formData.time}
                        onChange={(time) => setFormData({ ...formData, time })}
                        min={30}
                        max={600}
                        step={15}
                        formatValue={formatTime}
                        presets={timePresets}
                        icon={<Clock size={16} />}
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
                        icon={<Scale size={16} />}
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
                        icon={<Thermometer size={16} />}
                        label="الحرارة"
                      />
                    </div>
                    <button
                      type="button"
                      className="section-next-btn"
                      onClick={goToNextSection}
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Rating */}
        

          {/* Section 4: Flavor Notes */}
          <div
            ref={(el) => { sectionRefs.current.flavor = el; }}
            className={`form-accordion ${expandedSection === "flavor" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("flavor")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("flavor")}`}>
                  <Sparkles size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">النكهات</span>
                  {expandedSection !== "flavor" && formData.quickNotes.length > 0 && (
                    <span className="accordion-preview">
                      {formData.quickNotes.length} نكهة
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "flavor" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "flavor" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="flavor-grid-v3">
                      {CUP_QUICK_NOTE_OPTIONS.map((note) => {
                        const selected = formData.quickNotes.includes(note.value);

                        return (
                          <motion.button
                            key={note.value}
                            type="button"
                            className={`flavor-chip-v3 ${selected ? "selected" : ""}`}
                            onClick={() => toggleQuickNote(note.value)}
                            whileTap={{ scale: 0.95 }}
                            aria-pressed={selected}
                          >
                            <span className="flavor-emoji">{note.emoji}</span>
                            <span className="flavor-label">{note.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="section-next-btn"
                      onClick={goToNextSection}
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 5: Taste Profile */}
          <div
            ref={(el) => { sectionRefs.current.taste = el; }}
            className={`form-accordion ${expandedSection === "taste" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("taste")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("taste")}`}>
                  <Gauge size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">الانطباع الحسي</span>
                  {expandedSection !== "taste" && (
                    <span className="accordion-preview">
                      {getTastePreview()}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "taste" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "taste" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="taste-profile-v3">
                      {TASTE_FIELDS.map((field) => (
                        <div key={field.key} className="taste-field-v3">
                          <div className="taste-field-header">
                            <span className="taste-emoji">{field.emoji}</span>
                            <span className="taste-label">{field.label}</span>
                          </div>
                          <div className="taste-levels-v3">
                            {TASTE_LEVELS.map((level, index) => (
                              <motion.button
                                key={level.value}
                                type="button"
                                className={`taste-level-btn ${formData[field.key] === level.value ? "selected" : ""}`}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    [field.key]: formData[field.key] === level.value ? "" : level.value,
                                  })
                                }
                                whileTap={{ scale: 0.95 }}
                                style={{ "--level-intensity": index / 4 } as React.CSSProperties}
                              >
                                {index + 1}
                              </motion.button>
                            ))}
                          </div>
                          <div className="taste-scale-labels">
                            <span>منخفض</span>
                            <span>مرتفع</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="section-next-btn"
                      onClick={goToNextSection}
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            ref={(el) => { sectionRefs.current.rating = el; }}
            className={`form-accordion ${expandedSection === "rating" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("rating")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("rating")}`}>
                  <Star size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">التقييم</span>
                  {expandedSection !== "rating" && (
                    <span className="accordion-preview">
                      {formData.rating > 0 ? `${"★".repeat(formData.rating)}${"☆".repeat(5 - formData.rating)}` : "غير مقيّم"}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "rating" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "rating" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="rating-container-v3">
                      <StarRating
                        rating={formData.rating}
                        onRate={(rating) => setFormData({ ...formData, rating })}
                        size="md"
                      />
                      <span className="rating-hint">اضغط على النجوم لتقييم الفنجان</span>
                    </div>
                    <button
                      type="button"
                      className="section-next-btn"
                      onClick={goToNextSection}
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 6: Notes */}
          <div
            ref={(el) => { sectionRefs.current.notes = el; }}
            className={`form-accordion ${expandedSection === "notes" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("notes")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("notes")}`}>
                  <MessageSquare size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">ملاحظات إضافية</span>
                  {expandedSection !== "notes" && formData.notes && (
                    <span className="accordion-preview accordion-preview-truncate">
                      {formData.notes.slice(0, 25)}{formData.notes.length > 25 ? "..." : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "notes" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "notes" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <textarea
                      className="notes-textarea-v3"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="أضف ملاحظاتك عن هذا الفنجان..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Submit Button */}
          <div className="submit-container-v3">
            <motion.button
              type="submit"
              className="submit-button-v3"
              disabled={isSubmitting}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="submit-loading">
                  {isEditMode ? "جاري التحديث..." : "جاري الحفظ..."}
                </span>
              ) : (
                <>
                  <CoffeeIcon size={20} />
                  <span>{isEditMode ? "حفظ التعديلات" : "حفظ الفنجان"}</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
