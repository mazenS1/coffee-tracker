import type { ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

interface FormModalHeaderProps {
  icon: ReactNode;
  title: string;
  step: number;
  totalSteps: number;
  onClose: () => void;
}

export function FormModalHeader({
  icon,
  title,
  step,
  totalSteps,
  onClose,
}: FormModalHeaderProps) {
  return (
    <>
      <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-border/70" />
      <div className="flex items-center justify-between px-4 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-accent">
            {icon}
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
            <span className="text-xs text-muted-foreground">
              {step} / {totalSteps}
            </span>
          </div>
        </div>
        <motion.button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted"
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          aria-label="إغلاق"
        >
          <X size={18} />
        </motion.button>
      </div>
    </>
  );
}

interface SectionNextButtonProps {
  onClick: () => void;
}

export function SectionNextButton({ onClick }: SectionNextButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-3 w-full border-accent/30 text-accent"
      onClick={onClick}
    >
      <span>التالي</span>
      <ChevronLeft size={16} />
    </Button>
  );
}
