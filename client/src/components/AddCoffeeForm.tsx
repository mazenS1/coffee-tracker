import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown, ChevronUp, Coffee, MapPin, Flame, MessageSquare, Sparkles, ChevronLeft } from "lucide-react";
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
  { value: "Fruity", label: "فواكه", emoji: "🍎" },
  { value: "Chocolatey", label: "شوكولاتة", emoji: "🍫" },
  { value: "Classic", label: "كلاسيكي", emoji: "☕" },
  { value: "Nutty", label: "مكسرات", emoji: "🥜" },
  { value: "Floral", label: "زهري", emoji: "🌸" },
  { value: "Citrusy", label: "حمضيات", emoji: "🍋" },
  { value: "Sweet", label: "حلاوة", emoji: "🍯" },
  { value: "Caramelly", label: "كراميل", emoji: "🍮" },
  { value: "Spicy", label: "بهارات", emoji: "🌶️" },
] as const;

const serializeQuickNotes = (notes: string[]) =>
  notes.map((note) => note.trim()).filter(Boolean).join(", ");

type SectionId = "basic" | "roast" | "flavor" | "notes";

const SECTION_ORDER: SectionId[] = ["basic", "roast", "flavor", "notes"];

export function AddCoffeeForm({ onClose }: AddCoffeeFormProps) {
  const { addCoffee, addRoaster, roasters, fetchCoffees } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewRoaster, setShowNewRoaster] = useState(false);
  const [newRoasterName, setNewRoasterName] = useState("");
  const [expandedSection, setExpandedSection] = useState<SectionId | null>("basic");

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

  const toggleSection = (section: SectionId) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const goToNextSection = () => {
    const idx = SECTION_ORDER.indexOf(expandedSection ?? "basic");
    if (idx < SECTION_ORDER.length - 1) {
      setExpandedSection(SECTION_ORDER[idx + 1]);
    }
  };

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    basic: null,
    roast: null,
    flavor: null,
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
      case "basic":
        if (formData.roasterId && formData.name) return "complete";
        if (formData.roasterId || formData.name) return "partial";
        return "empty";
      case "roast":
        return formData.roastLevel ? "complete" : "empty";
      case "flavor":
        return formData.quickNotes.length > 0 ? "complete" : "empty";
      case "notes":
        return formData.notes ? "complete" : "empty";
      default:
        return "empty";
    }
  };

  const getSelectedRoasterName = () => {
    if (!formData.roasterId) return null;
    const options = getRoasterOptions(roasters);
    const found = options.find((o) => o.value === formData.roasterId);
    return found?.label || null;
  };

  const canSubmit = formData.roasterId && formData.name && !isSubmitting;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content coffee-modal-v3"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for native feel */}
        <div className="modal-handle" />

        <div className="modal-header-v3">
          <div className="modal-header-content">
            <Coffee size={20} className="modal-header-icon" />
            <div>
              <h2>قهوة جديدة</h2>
              <span className="form-progress">
                {SECTION_ORDER.indexOf(expandedSection ?? "basic") + 1} / {SECTION_ORDER.length}
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

        <form onSubmit={handleSubmit} className="coffee-form-v3">
          {/* Section 1: Basic Info (Required) */}
          <div
            ref={(el) => { sectionRefs.current.basic = el; }}
            className={`form-accordion ${expandedSection === "basic" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("basic")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("basic")}`}>
                  <Coffee size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">المعلومات الأساسية</span>
                  {expandedSection !== "basic" && (
                    <span className="accordion-preview">
                      {getSelectedRoasterName() && formData.name
                        ? `${getSelectedRoasterName()} - ${formData.name}`
                        : getSelectedRoasterName() || formData.name || "مطلوب"}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "basic" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "basic" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    {/* Roaster Selection */}
                    <div className="form-field-v3">
                      <label className="field-label-v3">المحمصة *</label>
                      
                      {!showNewRoaster ? (
                        <div className="roaster-select-row-v3">
                          <div className="select-wrapper-v3">
                            <select
                              value={formData.roasterId}
                              onChange={(e) =>
                                setFormData({ ...formData, roasterId: e.target.value })
                              }
                              className="form-select-v3"
                              required
                            >
                              <option value="">اختر محمصة...</option>
                              {getRoasterOptions(roasters).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="select-chevron" />
                          </div>
                          <motion.button
                            type="button"
                            className="add-new-btn"
                            onClick={() => setShowNewRoaster(true)}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus size={16} />
                            <span>جديد</span>
                          </motion.button>
                        </div>
                      ) : (
                        <div className="new-roaster-row">
                          <input
                            type="text"
                            className="text-input-v3"
                            value={newRoasterName}
                            onChange={(e) => setNewRoasterName(e.target.value)}
                            placeholder="اسم المحمصة الجديدة"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddRoaster();
                              }
                            }}
                          />
                          <div className="new-roaster-actions">
                            <motion.button
                              type="button"
                              className="action-btn-v3 primary"
                              onClick={handleAddRoaster}
                              disabled={!newRoasterName.trim()}
                              whileTap={{ scale: 0.95 }}
                            >
                              إضافة
                            </motion.button>
                            <motion.button
                              type="button"
                              className="action-btn-v3"
                              onClick={() => {
                                setShowNewRoaster(false);
                                setNewRoasterName("");
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              إلغاء
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coffee Name */}
                    <div className="form-field-v3">
                      <label className="field-label-v3" htmlFor="coffeeName">اسم القهوة *</label>
                      <input
                        type="text"
                        id="coffeeName"
                        className="text-input-v3"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="مثال: يرغاشيف، قوجي، سيدامو..."
                        required
                      />
                    </div>

                    {/* Origin */}
                    <div className="form-field-v3">
                      <label className="field-label-v3" htmlFor="origin">
                        <MapPin size={14} />
                        بلد المنشأ
                      </label>
                      <div className="select-wrapper-v3 full-width">
                        <select
                          id="origin"
                          className="form-select-v3"
                          value={formData.origin}
                          onChange={(e) =>
                            setFormData({ ...formData, origin: e.target.value })
                          }
                        >
                          <option value="">اختر بلد المنشأ (اختياري)</option>
                          {COFFEE_COUNTRIES.map(({ name, code }) => (
                            <option key={code} value={name}>
                              {getFlagEmoji(code)} {name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="select-chevron" />
                      </div>
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

          {/* Section 2: Roast Level */}
          <div
            ref={(el) => { sectionRefs.current.roast = el; }}
            className={`form-accordion ${expandedSection === "roast" ? "expanded" : ""}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection("roast")}
            >
              <div className="accordion-title">
                <div className={`accordion-icon-wrapper ${getSectionStatus("roast")}`}>
                  <Flame size={18} />
                </div>
                <div className="accordion-title-text">
                  <span className="accordion-label">درجة التحميص</span>
                  {expandedSection !== "roast" && (
                    <span className="accordion-preview">
                      {ROAST_LEVEL_LABELS[formData.roastLevel]}
                    </span>
                  )}
                </div>
              </div>
              <div className="accordion-chevron">
                {expandedSection === "roast" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSection === "roast" && (
                <motion.div
                  className="accordion-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="accordion-body">
                    <div className="roast-grid-v3">
                      {roastLevels.map((level) => (
                        <motion.button
                          key={level}
                          type="button"
                          className={`roast-card-v3 ${formData.roastLevel === level ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, roastLevel: level })}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className={`roast-circle ${level.toLowerCase().replace("_", "-")}`} />
                          <span className="roast-name">{ROAST_LEVEL_LABELS[level]}</span>
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

          {/* Section 3: Flavor Profile */}
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
                      {formData.quickNotes.length} نكهة محددة
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
                      {COFFEE_QUICK_NOTE_OPTIONS.map((note) => {
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

          {/* Section 4: Additional Notes */}
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
                      {formData.notes.slice(0, 30)}{formData.notes.length > 30 ? "..." : ""}
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
                      id="coffeeNotes"
                      className="notes-textarea-v3"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="أضف أي ملاحظات إضافية عن هذه القهوة..."
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
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="submit-loading">جاري الإضافة...</span>
              ) : (
                <>
                  <Plus size={20} />
                  <span>إضافة القهوة</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
