import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Coffee as CoffeeIcon,
  Flame,
  Gauge,
  Minus,
  Plus,
  Scale,
  Sparkles,
  Star,
  Thermometer,
  MessageSquare,
} from "lucide-react";
import { BREW_METHOD_LABELS } from "@coffee-tracker/shared";
import type {
  BrewMethod,
  CreateCupInput,
  Cup,
  UpdateCupInput,
} from "@coffee-tracker/shared";
import { useCoffeeStore } from "../store/coffeeStore";
import { cn } from "../lib/cn";
import { StarRating } from "./StarRating";
import {
  FormModalHeader,
  SectionNextButton,
} from "./forms/shared";
import {
  CUP_QUICK_NOTE_OPTIONS,
  parseQuickNotes,
  serializeQuickNotes,
} from "./forms/quickNotes";
import { AccordionSection } from "./ui/accordion-section";
import { Button } from "./ui/button";
import { ModalShell } from "./ui/modal-shell";

interface AddCupFormProps {
  coffeeId: string;
  onClose: () => void;
  cup?: Cup;
}

const TASTE_LEVELS = [
  { value: "منخفض جداً", short: "منخفض جداً" },
  { value: "منخفض", short: "منخفض" },
  { value: "متوازن", short: "متوازن" },
  { value: "مرتفع", short: "مرتفع" },
  { value: "مرتفع جداً", short: "مرتفع جداً" },
] as const;

type TasteFieldKey = "acidity" | "sweetness" | "bitterness" | "balance";

const TASTE_FIELDS: { key: TasteFieldKey; label: string; emoji: string }[] = [
  { key: "acidity", label: "الحموضة", emoji: "🍋" },
  { key: "sweetness", label: "الحلاوة", emoji: "🍯" },
  { key: "bitterness", label: "المرارة", emoji: "🍵" },
  { key: "balance", label: "التوازن", emoji: "⚖️" },
];

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

type SectionId = "brew" | "params" | "rating" | "flavor" | "taste" | "notes";
const SECTION_ORDER: SectionId[] = [
  "brew",
  "params",
  "rating",
  "flavor",
  "taste",
  "notes",
];

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

const toNumberOrDefault = (
  value: number | string | null | undefined,
  fallback: number,
) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
    <div className="rounded-lg border border-border bg-muted p-2 text-center">
      <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>
        <span>{label}</span>
      </div>

      <div className="mb-1 flex items-center justify-center gap-1.5">
        <motion.button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground disabled:opacity-40"
          onClick={decrement}
          disabled={value <= min}
          whileTap={{ scale: 0.9 }}
        >
          <Minus size={15} />
        </motion.button>
        <span className="min-w-12 font-display text-base font-semibold text-foreground">
          {formatValue(value)}
        </span>
        <motion.button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground disabled:opacity-40"
          onClick={increment}
          disabled={value >= max}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={15} />
        </motion.button>
      </div>

      {presets && presets.length > 0 ? (
        <div className="flex justify-center gap-1">
          {presets.map((preset) => (
            <motion.button
              key={preset.value}
              type="button"
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px]",
                value === preset.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground",
              )}
              onClick={() => onChange(preset.value)}
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AddCupForm({ coffeeId, onClose, cup }: AddCupFormProps) {
  const isEditMode = Boolean(cup);
  const { addCup, updateCup } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<SectionId>("brew");
  const [formData, setFormData] = useState<CupFormState>(() =>
    buildInitialFormData(cup),
  );

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    brew: null,
    params: null,
    rating: null,
    flavor: null,
    taste: null,
    notes: null,
  });

  useEffect(() => {
    sectionRefs.current[expandedSection]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [expandedSection]);

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

  const toggleQuickNote = (note: string) => {
    setFormData((prev) => {
      const exists = prev.quickNotes.includes(note);
      return {
        ...prev,
        quickNotes: exists
          ? prev.quickNotes.filter((entry) => entry !== note)
          : [...prev.quickNotes, note],
      };
    });
  };

  const getSectionStatus = (section: SectionId): "empty" | "partial" | "complete" => {
    if (section === "brew" || section === "params") {
      return "complete";
    }
    if (section === "rating") {
      return formData.rating > 0 ? "complete" : "empty";
    }
    if (section === "flavor") {
      return formData.quickNotes.length > 0 ? "complete" : "empty";
    }
    if (section === "notes") {
      return formData.notes ? "complete" : "empty";
    }

    const hasAnyTaste =
      formData.acidity ||
      formData.sweetness ||
      formData.bitterness ||
      formData.balance;
    const hasAllTaste =
      formData.acidity &&
      formData.sweetness &&
      formData.bitterness &&
      formData.balance;
    if (hasAllTaste) return "complete";
    if (hasAnyTaste) return "partial";
    return "empty";
  };

  const getTastePreview = () => {
    const filledCount = [
      formData.acidity,
      formData.sweetness,
      formData.bitterness,
      formData.balance,
    ].filter(Boolean).length;

    if (filledCount === 0) return "غير محدد";
    if (filledCount === 4) return "مكتمل";
    return `${filledCount}/4`;
  };

  const goToNextSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(expandedSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      setExpandedSection(SECTION_ORDER[currentIndex + 1]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const stringValue = (value: string) => (isEditMode ? value : value || undefined);
      const payload: Omit<CreateCupInput, "coffeeId"> & UpdateCupInput = {
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
        await updateCup(cup.id, payload);
      } else {
        await addCup({
          coffeeId,
          ...payload,
        });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      panelClassName="min-h-[88dvh] max-h-[96dvh] md:min-h-0 md:max-h-[92dvh] md:max-w-3xl"
    >
      <FormModalHeader
        icon={<CoffeeIcon size={18} />}
        title={isEditMode ? "تعديل الفنجان" : "فنجان جديد"}
        step={SECTION_ORDER.indexOf(expandedSection) + 1}
        totalSteps={SECTION_ORDER.length}
        onClose={onClose}
      />

      <form
        className="flex max-h-[calc(96dvh-4.5rem)] flex-col overflow-y-auto px-3 pb-4 md:max-h-[calc(92dvh-4.5rem)] md:px-4"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <div
            ref={(node) => {
              sectionRefs.current.brew = node;
            }}
          >
            <AccordionSection
              title="طريقة التحضير"
              open={expandedSection === "brew"}
              onToggle={() => setExpandedSection("brew")}
              status={getSectionStatus("brew")}
              preview={`${BREW_METHOD_ICONS[formData.brewMethod]} ${BREW_METHOD_LABELS[formData.brewMethod]}`}
              icon={<Flame size={16} />}
            >
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {brewMethods.map((method) => (
                  <motion.button
                    key={method}
                    type="button"
                    className={cn(
                      "inline-flex min-h-12 flex-col items-center justify-center rounded-md border px-1 py-1 text-center",
                      formData.brewMethod === method
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border bg-muted text-secondary-foreground",
                    )}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, brewMethod: method }))
                    }
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-sm">{BREW_METHOD_ICONS[method]}</span>
                    <span className="text-[11px]">{BREW_METHOD_LABELS[method]}</span>
                  </motion.button>
                ))}
              </div>
              <SectionNextButton onClick={goToNextSection} />
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.params = node;
            }}
          >
            <AccordionSection
              title="إعدادات التحضير"
              open={expandedSection === "params"}
              onToggle={() => setExpandedSection("params")}
              status={getSectionStatus("params")}
              preview={`${formatTime(formData.time)} · ${formData.grams}g · ${formData.temperature}°`}
              icon={<Scale size={16} />}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StepperInput
                  value={formData.time}
                  onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
                  min={30}
                  max={600}
                  step={15}
                  formatValue={formatTime}
                  presets={timePresets}
                  icon={<Clock size={15} />}
                  label="الوقت"
                />
                <StepperInput
                  value={formData.grams}
                  onChange={(grams) => setFormData((prev) => ({ ...prev, grams }))}
                  min={5}
                  max={50}
                  step={1}
                  formatValue={(value) => `${value}g`}
                  presets={gramsPresets}
                  icon={<Scale size={15} />}
                  label="البن"
                />
                <StepperInput
                  value={formData.temperature}
                  onChange={(temperature) =>
                    setFormData((prev) => ({ ...prev, temperature }))
                  }
                  min={80}
                  max={100}
                  step={1}
                  formatValue={(value) => `${value}°`}
                  presets={tempPresets}
                  icon={<Thermometer size={15} />}
                  label="الحرارة"
                />
              </div>
              <SectionNextButton onClick={goToNextSection} />
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.rating = node;
            }}
          >
            <AccordionSection
              title="التقييم"
              open={expandedSection === "rating"}
              onToggle={() => setExpandedSection("rating")}
              status={getSectionStatus("rating")}
              preview={
                formData.rating > 0
                  ? `${"★".repeat(formData.rating)}${"☆".repeat(5 - formData.rating)}`
                  : "غير مقيّم"
              }
              icon={<Star size={16} />}
            >
              <div className="flex flex-col items-center gap-2 py-1">
                <StarRating
                  rating={formData.rating}
                  onRate={(rating) => setFormData((prev) => ({ ...prev, rating }))}
                  size="md"
                />
                <span className="text-xs text-muted-foreground">
                  اضغط على النجوم لتقييم الفنجان
                </span>
              </div>
              <SectionNextButton onClick={goToNextSection} />
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.flavor = node;
            }}
          >
            <AccordionSection
              title="النكهات"
              open={expandedSection === "flavor"}
              onToggle={() => setExpandedSection("flavor")}
              status={getSectionStatus("flavor")}
              preview={
                formData.quickNotes.length > 0
                  ? `${formData.quickNotes.length} نكهة`
                  : "اختياري"
              }
              icon={<Sparkles size={16} />}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CUP_QUICK_NOTE_OPTIONS.map((note) => {
                  const selected = formData.quickNotes.includes(note.value);
                  return (
                    <motion.button
                      key={note.value}
                      type="button"
                      className={cn(
                        "inline-flex min-h-11 items-center justify-center gap-1 rounded-full border px-3 text-sm",
                        selected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-muted text-secondary-foreground",
                      )}
                      onClick={() => toggleQuickNote(note.value)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{note.emoji}</span>
                      <span>{note.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <SectionNextButton onClick={goToNextSection} />
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.taste = node;
            }}
          >
            <AccordionSection
              title="الانطباع الحسي"
              open={expandedSection === "taste"}
              onToggle={() => setExpandedSection("taste")}
              status={getSectionStatus("taste")}
              preview={getTastePreview()}
              icon={<Gauge size={16} />}
            >
              <div className="space-y-3">
                {TASTE_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                      <span>{field.emoji}</span>
                      <span>{field.label}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TASTE_LEVELS.map((level, index) => {
                        const selected = formData[field.key] === level.value;
                        return (
                          <motion.button
                            key={level.value}
                            type="button"
                            className={cn(
                              "min-h-9 rounded-md border text-xs font-semibold",
                              selected
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-muted text-muted-foreground",
                            )}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                [field.key]:
                                  prev[field.key] === level.value ? "" : level.value,
                              }))
                            }
                            whileTap={{ scale: 0.95 }}
                            aria-label={`${field.label} ${index + 1}`}
                          >
                            {index + 1}
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>منخفض</span>
                      <span>مرتفع</span>
                    </div>
                  </div>
                ))}
              </div>
              <SectionNextButton onClick={goToNextSection} />
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.notes = node;
            }}
          >
            <AccordionSection
              title="ملاحظات إضافية"
              open={expandedSection === "notes"}
              onToggle={() => setExpandedSection("notes")}
              status={getSectionStatus("notes")}
              preview={
                formData.notes
                  ? `${formData.notes.slice(0, 28)}${formData.notes.length > 28 ? "..." : ""}`
                  : "اختياري"
              }
              icon={<MessageSquare size={16} />}
            >
              <textarea
                className="min-h-28 w-full resize-none rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
                value={formData.notes}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="أضف ملاحظاتك عن هذا الفنجان..."
              />
            </AccordionSection>
          </div>
        </div>

        <div className="sticky bottom-0 mt-3 bg-gradient-to-t from-card via-card pt-3">
          <Button type="submit" className="h-11 w-full text-sm font-bold" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "جاري التحديث..."
                : "جاري الحفظ..."
              : isEditMode
                ? "حفظ التعديلات"
                : "حفظ الفنجان"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
