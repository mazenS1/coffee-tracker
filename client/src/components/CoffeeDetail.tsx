import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Coffee as CoffeeIcon,
  Flame,
  Pencil,
  Plus,
  Star,
  Thermometer,
  Trash2,
} from "lucide-react";
import type { Coffee, Cup, RoastLevel } from "@coffee-tracker/shared";
import { getBrewMethodLabel, getRoastLevelLabel } from "@coffee-tracker/shared";
import { COFFEE_COUNTRIES, getFlagEmoji } from "../data/countries";
import { useCoffeeStore } from "../store/coffeeStore";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";

const ROAST_COLORS: Record<RoastLevel, string> = {
  LIGHT: "#c4a574",
  MEDIUM: "#8b6914",
  MEDIUM_DARK: "#5a4510",
  DARK: "#3d2914",
};

function getOriginFlag(origin: string | null | undefined): string | null {
  if (!origin) return null;
  const country = COFFEE_COUNTRIES.find((c) => c.name === origin);
  return country ? getFlagEmoji(country.code) : null;
}

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
        className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-0 pb-24 pt-3"
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
        <div className="rounded-xl border border-border bg-card p-4 text-center text-muted-foreground">
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
      className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-0 pb-24 pt-3"
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
          {/* Hero card */}
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Roast accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${ROAST_COLORS[coffee.roastLevel]}, ${ROAST_COLORS[coffee.roastLevel]}99)`,
              }}
            />
            {/* Roast colour wash */}
            <div
              className="pointer-events-none absolute inset-x-0 top-1.5 h-32 opacity-[0.07]"
              style={{
                background: `linear-gradient(180deg, ${ROAST_COLORS[coffee.roastLevel]}, transparent)`,
              }}
            />

            <div className="relative z-10 p-4 md:p-5">
              {/* Origin badge + roast badge */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {coffee.origin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    <span className="text-base leading-[0]">
                      {getOriginFlag(coffee.origin) ?? "🌍"}
                    </span>
                    {coffee.origin}
                  </span>
                ) : null}
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${ROAST_COLORS[coffee.roastLevel]}, ${ROAST_COLORS[coffee.roastLevel]}cc)`,
                    boxShadow: `0 2px 8px ${ROAST_COLORS[coffee.roastLevel]}50`,
                  }}
                >
                  <Flame size={11} />
                  {getRoastLevelLabel(coffee.roastLevel)}
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                {coffee.name || "قهوة بدون اسم"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {coffee.roaster?.name || "محمصة غير محددة"}
              </p>

              <div className="mt-4 space-y-1">
                <span className="text-xs font-medium text-muted-foreground">التقييم العام</span>
                <StarRating
                  rating={coffee.rating || 0}
                  onRate={handleRatingUpdate}
                  size="lg"
                />
              </div>
            </div>
          </section>

          {/* Stats row */}
          <section className="grid grid-cols-3 gap-2">
            <article className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
              <span
                className="flex size-8 items-center justify-center rounded-full text-white"
                style={{ background: ROAST_COLORS[coffee.roastLevel] }}
              >
                <CoffeeIcon size={15} />
              </span>
              <p className="font-display text-2xl font-bold text-accent">{cups.length}</p>
              <p className="text-[11px] text-muted-foreground">فنجان</p>
            </article>
            <article className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent/15">
                <Star size={15} className="text-accent" />
              </span>
              <p className="font-display text-2xl font-bold text-accent">
                {cups.length > 0 ? averageRating.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">متوسط التقييم</p>
            </article>
            <article className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                <Flame size={15} className="text-muted-foreground" />
              </span>
              <p className="font-display text-sm font-bold text-foreground">
                {getRoastLevelLabel(coffee.roastLevel)}
              </p>
              <p className="text-[11px] text-muted-foreground">التحميص</p>
            </article>
          </section>

          {coffee.notes || coffeeQuickNotes.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-3">
              <h2 className="font-display text-lg font-bold text-foreground">ملاحظات القهوة</h2>
              {coffeeQuickNotes.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {coffeeQuickNotes.map((note) => (
                    <span
                      key={`coffee-note-${coffee.id}-${note}`}
                      className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
                    >
                      {getQuickNoteLabel(note)}
                    </span>
                  ))}
                </div>
              ) : null}
              {coffee.notes ? (
                <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{coffee.notes}</p>
              ) : null}
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
                    className="rounded-xl border border-border bg-card p-6 text-center"
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
                      const cupNumber = cups.length - index;

                      return (
                        <motion.article
                          key={cup.id}
                          className="overflow-hidden rounded-xl border border-border bg-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          {/* Cup header row */}
                          <div className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
                                {cupNumber}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar size={12} />
                                {formatDate(cup.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <StarRating rating={cup.rating || 0} size="sm" readonly />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => setEditingCup(cup)}
                                aria-label="تعديل الفنجان"
                              >
                                <Pencil size={13} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => void deleteCup(cup.id)}
                                aria-label="حذف الفنجان"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </div>

                          <div className="p-2.5 space-y-2">
                            {/* Brew specs */}
                            <div className="flex flex-wrap gap-1.5 text-xs text-secondary-foreground">
                              {cup.brewMethod ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-semibold text-accent">
                                  <CoffeeIcon size={12} />
                                  {getBrewMethodLabel(cup.brewMethod)}
                                </span>
                              ) : null}
                              {cup.temperature ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                  <Thermometer size={12} />
                                  {cup.temperature}°C
                                </span>
                              ) : null}
                              {cup.time ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                  <Clock size={12} />
                                  {formatTime(cup.time)}
                                </span>
                              ) : null}
                            </div>

                            {tasteBadges.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {tasteBadges.map((badge) => (
                                  <span
                                    key={`${cup.id}-${badge.key}`}
                                    className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                                  >
                                    {badge.label}: {badge.value}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {quickNotes.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
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
                          </div>
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
