export type QuickNoteOption = {
  value: string;
  label: string;
  emoji: string;
};

export const COFFEE_QUICK_NOTE_OPTIONS: readonly QuickNoteOption[] = [
  { value: "Fruity", label: "فواكه", emoji: "🍎" },
  { value: "Chocolatey", label: "شوكولاتة", emoji: "🍫" },
  { value: "Classic", label: "كلاسيكي", emoji: "☕" },
  { value: "Nutty", label: "مكسرات", emoji: "🥜" },
  { value: "Floral", label: "زهري", emoji: "🌸" },
  { value: "Citrusy", label: "حمضيات", emoji: "🍋" },
  { value: "Sweet", label: "حلاوة", emoji: "🍯" },
  { value: "Caramelly", label: "كراميل", emoji: "🍮" },
  { value: "Spicy", label: "بهارات", emoji: "🌶️" },
];

export const CUP_QUICK_NOTE_OPTIONS: readonly QuickNoteOption[] = [
  ...COFFEE_QUICK_NOTE_OPTIONS,
  { value: "Clean", label: "نظيف", emoji: "💧" },
  { value: "Juicy", label: "عصير", emoji: "🍇" },
];

export const serializeQuickNotes = (notes: string[]) =>
  notes
    .map((note) => note.trim())
    .filter(Boolean)
    .join(", ");

export const parseQuickNotes = (value: string | null | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

