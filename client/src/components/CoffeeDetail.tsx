import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Coffee as CoffeeIcon,
  Pencil,
  Plus,
  Thermometer,
  Trash2,
} from "lucide-react";
import type { Coffee, Cup } from "@coffee-tracker/shared";
import { getBrewMethodLabel, getRoastLevelLabel } from "@coffee-tracker/shared";
import { useCoffeeStore } from "../store/coffeeStore";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";

const AddCupForm = lazy(async () => {
  const module = await import("./AddCupForm");
  return { default: module.AddCupForm };
});

interface CoffeeDetailProps {
  coffeeId: string;
  coffee: Coffee | null;
  onBack: () => void;
}

const QUICK_NOTE_LABELS: Record<string, string> = {
  Fruity: "فواكهي",
  Chocolatey: "شوكولاتي",
  Classic: "كلاسيكي",
  Nutty: "مكسراتي",
  Floral: "زهري",
  Citrusy: "حمضيات",
  Sweet: "حلو",
  Caramelly: "كراميل",
  Clean: "نظيف",
  Juicy: "عصيري",
  "Tea-like": "شبيه بالشاي",
  Spicy: "بهارات",
};

const getQuickNoteLabel = (value: string) => QUICK_NOTE_LABELS[value] ?? value;

const getCupTasteBadges = (cup: Cup) =>
  [
    { key: "acidity", label: "الحموضة", value: cup.acidity },
    { key: "sweetness", label: "الحلاوة", value: cup.sweetness },
    { key: "bitterness", label: "المرارة", value: cup.bitterness },
    { key: "balance", label: "التوازن", value: cup.balance },
  ].filter((entry) => entry.value);

const parseNotes = (value: string | undefined | null) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(seconds: number | string | null) {
  if (!seconds) return "—";
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds)) return "—";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CoffeeDetail({ coffeeId, coffee, onBack }: CoffeeDetailProps) {
  const [showAddCup, setShowAddCup] = useState(false);
  const [editingCup, setEditingCup] = useState<Cup | null>(null);
  const { updateCoffee, deleteCup, deleteCoffee, isLoadingCoffee } =
    useCoffeeStore();

  const isDetailLoading =
    isLoadingCoffee && (!coffee || coffee.id !== coffeeId || !coffee.cups);

  const handleDelete = async () => {
    if (!coffee) return;
    if (confirm("هل أنت متأكد من حذف هذه القهوة؟")) {
      await deleteCoffee(coffee.id);
      onBack();
    }
  };

  const handleRatingUpdate = async (rating: number) => {
    if (!coffee) return;
    await updateCoffee(coffee.id, { rating });
  };

  if (!coffee && !isLoadingCoffee) {
    return (
      <motion.div
        className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-24 pt-3 md:px-6"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <header className="flex items-center justify-start">
          <Button type="button" variant="ghost" className="h-10 px-2" onClick={onBack}>
            <ArrowRight size={20} />
            العودة
          </Button>
        </header>
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          تعذر تحميل القهوة
        </div>
      </motion.div>
    );
  }

  const cups = coffee?.cups ?? [];
  const coffeeQuickNotes = parseNotes(coffee?.flavorProfile);
  const averageRating =
    cups.length > 0
      ? cups.reduce((acc, cup) => acc + (cup.rating || 0), 0) / cups.length
      : 0;

  return (
    <motion.div
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-24 pt-3 md:px-6"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <header className="flex items-center justify-between">
        <Button type="button" variant="ghost" className="h-10 px-2" onClick={onBack}>
          <ArrowRight size={20} />
          العودة
        </Button>

        {!isDetailLoading && coffee ? (
          <Button type="button" variant="ghost" size="icon" onClick={() => void handleDelete()}>
            <Trash2 size={18} />
          </Button>
        ) : null}
      </header>

      {isDetailLoading ? (
        <div className="space-y-3">
          <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 animate-pulse rounded-xl border border-border bg-card" />
            <div className="h-20 animate-pulse rounded-xl border border-border bg-card" />
            <div className="h-20 animate-pulse rounded-xl border border-border bg-card" />
          </div>
          <div className="space-y-2">
            <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
            <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
          </div>
        </div>
      ) : coffee ? (
        <>
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="relative z-10 max-w-2xl">
              {coffee.origin ? (
                <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {coffee.origin}
                </span>
              ) : null}
              <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
                {coffee.name || "قهوة بدون اسم"}
              </h1>
              <p className="mt-1 text-sm text-secondary-foreground">
                {coffee.roaster?.name || "محمصة غير محددة"}
              </p>

              <div className="mt-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">التقييم العام</span>
                <StarRating
                  rating={coffee.rating || 0}
                  onRate={handleRatingUpdate}
                  size="lg"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          </section>

          <section className="grid grid-cols-3 gap-2">
            <article className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-display text-2xl font-bold text-accent">{cups.length}</p>
              <p className="text-xs text-muted-foreground">فنجان</p>
            </article>
            <article className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-display text-2xl font-bold text-accent">
                {cups.length > 0 ? averageRating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">متوسط التقييم</p>
            </article>
            <article className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-display text-sm font-semibold text-foreground">
                {getRoastLevelLabel(coffee.roastLevel)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">درجة التحميص</p>
            </article>
          </section>

          {coffee.notes || coffeeQuickNotes.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-display text-xl font-semibold text-foreground">ملاحظات القهوة</h2>
              {coffeeQuickNotes.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {coffeeQuickNotes.map((note) => (
                    <span
                      key={`coffee-note-${coffee.id}-${note}`}
                      className="rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent"
                    >
                      {getQuickNoteLabel(note)}
                    </span>
                  ))}
                </div>
              ) : null}
              {coffee.notes ? <p className="mt-3 text-sm text-secondary-foreground">{coffee.notes}</p> : null}
            </section>
          ) : null}

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">سجل الفناجين</h2>
              <Button type="button" size="sm" className="h-9" onClick={() => setShowAddCup(true)}>
                <Plus size={16} />
                إضافة فنجان
              </Button>
            </header>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {cups.length === 0 ? (
                  <motion.div
                    className="rounded-xl border border-border bg-card p-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CoffeeIcon size={40} className="mx-auto text-accent" />
                    <p className="mt-2 font-medium text-foreground">لم تسجل أي فنجان بعد</p>
                    <span className="text-sm text-muted-foreground">
                      ابدأ بتسجيل أول فنجان لك من هذه القهوة
                    </span>
                  </motion.div>
                ) : (
                  cups
                    .slice()
                    .reverse()
                    .map((cup, index) => {
                      const tasteBadges = getCupTasteBadges(cup);
                      const quickNotes = parseNotes(cup.aroma);

                      return (
                        <motion.article
                          key={cup.id}
                          className="rounded-xl border border-border bg-card p-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar size={14} />
                              {formatDate(cup.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <StarRating rating={cup.rating || 0} size="sm" readonly />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setEditingCup(cup)}
                                aria-label="تعديل الفنجان"
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => void deleteCup(cup.id)}
                                aria-label="حذف الفنجان"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>

                          <div className="mb-2 flex flex-wrap gap-2 text-xs text-secondary-foreground">
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Clock size={13} />
                              {formatTime(cup.time)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              <Thermometer size={13} />
                              {cup.temperature ? `${cup.temperature}°C` : "—"}
                            </span>
                            {cup.brewMethod ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                                <CoffeeIcon size={13} />
                                {getBrewMethodLabel(cup.brewMethod)}
                              </span>
                            ) : null}
                          </div>

                          {tasteBadges.length > 0 ? (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {tasteBadges.map((badge) => (
                                <span
                                  key={`${cup.id}-${badge.key}`}
                                  className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent"
                                >
                                  {badge.label}: {badge.value}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {quickNotes.length > 0 ? (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {quickNotes.map((note) => (
                                <span
                                  key={`${cup.id}-note-${note}`}
                                  className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                                >
                                  {getQuickNoteLabel(note)}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {cup.notes ? (
                            <p className="text-sm text-secondary-foreground">{cup.notes}</p>
                          ) : null}
                        </motion.article>
                      );
                    })
                )}
              </AnimatePresence>
            </div>
          </section>
        </>
      ) : null}

      <AnimatePresence>
        {showAddCup ? (
          <Suspense fallback={null}>
            <AddCupForm
              key={`cup-add-${coffeeId}`}
              coffeeId={coffeeId}
              onClose={() => setShowAddCup(false)}
            />
          </Suspense>
        ) : null}
        {editingCup ? (
          <Suspense fallback={null}>
            <AddCupForm
              key={`cup-edit-${editingCup.id}`}
              coffeeId={coffeeId}
              cup={editingCup}
              onClose={() => setEditingCup(null)}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
