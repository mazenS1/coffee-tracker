import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Coffee,
  Flame,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { ROAST_LEVEL_LABELS } from "@coffee-tracker/shared";
import type { CreateCoffeeInput, RoastLevel } from "@coffee-tracker/shared";
import { COFFEE_COUNTRIES, getFlagEmoji } from "../data/countries";
import { DEFAULT_ROASTERS } from "../data/roasters";
import { useCoffeeStore } from "../store/coffeeStore";
import { cn } from "../lib/cn";
import {
  FormModalHeader,
  SectionNextButton,
} from "./forms/shared";
import {
  COFFEE_QUICK_NOTE_OPTIONS,
  serializeQuickNotes,
} from "./forms/quickNotes";
import { AccordionSection } from "./ui/accordion-section";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ModalShell } from "./ui/modal-shell";

const PREFILL_PREFIX = "prefill:";

interface AddCoffeeFormProps {
  onClose: () => void;
}

type SectionId = "basic" | "roast" | "flavor" | "notes";
const SECTION_ORDER: SectionId[] = ["basic", "roast", "flavor", "notes"];

type CoffeeFormState = {
  roasterId: string;
  origin: string;
  name: string;
  roastLevel: RoastLevel;
  quickNotes: string[];
  notes: string;
};

const roastLevels: RoastLevel[] = ["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"];

const selectClassName =
  "h-11 w-full appearance-none rounded-md border border-border bg-muted px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2";

function getRoasterOptions(roasters: { id: string; name: string }[]) {
  const apiNames = new Set(roasters.map((r) => r.name));
  const prefilledOnly = DEFAULT_ROASTERS.filter((name) => !apiNames.has(name));
  const options: { value: string; label: string }[] = [
    ...roasters.map((r) => ({ value: r.id, label: r.name })),
    ...prefilledOnly.map((name) => ({
      value: `${PREFILL_PREFIX}${name}`,
      label: name,
    })),
  ];
  return options.sort((a, b) => a.label.localeCompare(b.label, "ar"));
}

export function AddCoffeeForm({ onClose }: AddCoffeeFormProps) {
  const { addCoffee, addRoaster, roasters, fetchCoffees } = useCoffeeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewRoaster, setShowNewRoaster] = useState(false);
  const [newRoasterName, setNewRoasterName] = useState("");
  const [expandedSection, setExpandedSection] = useState<SectionId>("basic");
  const [formData, setFormData] = useState<CoffeeFormState>({
    roasterId: "",
    origin: "",
    name: "",
    roastLevel: "MEDIUM",
    quickNotes: [],
    notes: "",
  });

  const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
    basic: null,
    roast: null,
    flavor: null,
    notes: null,
  });

  useEffect(() => {
    sectionRefs.current[expandedSection]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [expandedSection]);

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

  const goToNextSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(expandedSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      setExpandedSection(SECTION_ORDER[currentIndex + 1]);
    }
  };

  const getSectionStatus = (section: SectionId): "empty" | "partial" | "complete" => {
    if (section === "basic") {
      if (formData.roasterId && formData.name) return "complete";
      if (formData.roasterId || formData.name) return "partial";
      return "empty";
    }

    if (section === "roast") {
      return formData.roastLevel ? "complete" : "empty";
    }

    if (section === "flavor") {
      return formData.quickNotes.length > 0 ? "complete" : "empty";
    }

    return formData.notes ? "complete" : "empty";
  };

  const getSelectedRoasterName = () => {
    if (!formData.roasterId) return null;
    const found = getRoasterOptions(roasters).find(
      (item) => item.value === formData.roasterId,
    );
    return found?.label ?? null;
  };

  const handleAddRoaster = async () => {
    if (!newRoasterName.trim()) return;
    const roaster = await addRoaster(newRoasterName.trim());
    if (!roaster) return;

    setFormData((prev) => ({ ...prev, roasterId: roaster.id }));
    setNewRoasterName("");
    setShowNewRoaster(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.roasterId || !formData.name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let roasterId = formData.roasterId;
      if (roasterId.startsWith(PREFILL_PREFIX)) {
        const roasterName = roasterId.slice(PREFILL_PREFIX.length);
        const createdRoaster = await addRoaster(roasterName);
        if (!createdRoaster) return;
        roasterId = createdRoaster.id;
      }

      const payload: CreateCoffeeInput = {
        roasterId,
        name: formData.name,
        origin: formData.origin || undefined,
        roastLevel: formData.roastLevel,
        flavorProfile: serializeQuickNotes(formData.quickNotes) || undefined,
        notes: formData.notes || undefined,
      };

      await addCoffee(payload);
      await fetchCoffees();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!formData.roasterId && !!formData.name && !isSubmitting;
  const options = getRoasterOptions(roasters);

  return (
    <ModalShell
      onClose={onClose}
      panelClassName="min-h-[88dvh] max-h-[96dvh] md:min-h-0 md:max-h-[92dvh]"
    >
      <FormModalHeader
        icon={<Coffee size={18} />}
        title="قهوة جديدة"
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
              sectionRefs.current.basic = node;
            }}
          >
            <AccordionSection
              title="المعلومات الأساسية"
              open={expandedSection === "basic"}
              onToggle={() => setExpandedSection("basic")}
              status={getSectionStatus("basic")}
              preview={
                getSelectedRoasterName() && formData.name
                  ? `${getSelectedRoasterName()} - ${formData.name}`
                  : getSelectedRoasterName() || formData.name || "مطلوب"
              }
              icon={<Coffee size={16} />}
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-secondary-foreground">
                    المحمصة *
                  </label>
                  {!showNewRoaster ? (
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <div className="relative">
                        <select
                          value={formData.roasterId}
                          onChange={(event) =>
                            setFormData((prev) => ({
                              ...prev,
                              roasterId: event.target.value,
                            }))
                          }
                          className={selectClassName}
                          required
                        >
                          <option value="">اختر محمصة...</option>
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-11 px-3"
                        onClick={() => setShowNewRoaster(true)}
                      >
                        <Plus size={15} />
                        جديد
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={newRoasterName}
                        onChange={(event) => setNewRoasterName(event.target.value)}
                        placeholder="اسم المحمصة الجديدة"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleAddRoaster();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-10 flex-1"
                          onClick={() => void handleAddRoaster()}
                          disabled={!newRoasterName.trim()}
                        >
                          إضافة
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 flex-1"
                          onClick={() => {
                            setShowNewRoaster(false);
                            setNewRoasterName("");
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="coffeeName"
                    className="text-sm font-semibold text-secondary-foreground"
                  >
                    اسم القهوة *
                  </label>
                  <Input
                    id="coffeeName"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="مثال: يرغاشيف، قوجي، سيدامو..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="origin"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-foreground"
                  >
                    <MapPin size={14} />
                    بلد المنشأ
                  </label>
                  <div className="relative">
                    <select
                      id="origin"
                      className={selectClassName}
                      value={formData.origin}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, origin: event.target.value }))
                      }
                    >
                      <option value="">اختر بلد المنشأ (اختياري)</option>
                      {COFFEE_COUNTRIES.map(({ name, code }) => (
                        <option key={code} value={name}>
                          {getFlagEmoji(code)} {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>
                <SectionNextButton onClick={goToNextSection} />
              </div>
            </AccordionSection>
          </div>

          <div
            ref={(node) => {
              sectionRefs.current.roast = node;
            }}
          >
            <AccordionSection
              title="درجة التحميص"
              open={expandedSection === "roast"}
              onToggle={() => setExpandedSection("roast")}
              status={getSectionStatus("roast")}
              preview={ROAST_LEVEL_LABELS[formData.roastLevel]}
              icon={<Flame size={16} />}
            >
              <div className="grid grid-cols-2 gap-2">
                {roastLevels.map((level) => (
                  <motion.button
                    key={level}
                    type="button"
                    className={cn(
                      "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium",
                      formData.roastLevel === level
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border bg-muted text-secondary-foreground",
                    )}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, roastLevel: level }))
                    }
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        level === "LIGHT" && "bg-amber-300",
                        level === "MEDIUM" && "bg-amber-600",
                        level === "MEDIUM_DARK" && "bg-amber-900",
                        level === "DARK" && "bg-stone-900",
                      )}
                    />
                    {ROAST_LEVEL_LABELS[level]}
                  </motion.button>
                ))}
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
                  ? `${formData.quickNotes.length} نكهة محددة`
                  : "اختياري"
              }
              icon={<Sparkles size={16} />}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {COFFEE_QUICK_NOTE_OPTIONS.map((note) => {
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
                  ? `${formData.notes.slice(0, 30)}${formData.notes.length > 30 ? "..." : ""}`
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
                placeholder="أضف أي ملاحظات إضافية عن هذه القهوة..."
              />
            </AccordionSection>
          </div>
        </div>

        <div className="sticky bottom-0 mt-3 bg-gradient-to-t from-card via-card pt-3">
          <Button
            type="submit"
            className="h-11 w-full text-sm font-bold"
            disabled={!canSubmit}
          >
            {isSubmitting ? "جاري الإضافة..." : "إضافة القهوة"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
