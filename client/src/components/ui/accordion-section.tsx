import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/cn";

export type AccordionStatus = "empty" | "partial" | "complete";

interface AccordionSectionProps {
  title: string;
  preview?: ReactNode;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  status?: AccordionStatus;
  children: ReactNode;
  className?: string;
}

function statusClasses(status: AccordionStatus) {
  if (status === "complete") {
    return "border-accent/70 bg-accent/15 text-accent";
  }

  if (status === "partial") {
    return "border-secondary-foreground/20 bg-muted text-secondary-foreground";
  }

  return "border-border bg-muted text-muted-foreground";
}

export function AccordionSection({
  title,
  preview,
  icon,
  open,
  onToggle,
  status = "empty",
  children,
  className,
}: AccordionSectionProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-3 text-right transition-colors hover:bg-muted/45"
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full border",
              statusClasses(status),
            )}
          >
            {icon}
          </span>
          <span className="flex min-w-0 flex-col items-start">
            <span className="font-medium text-foreground">{title}</span>
            {!open && preview ? (
              <span className="max-w-[15rem] truncate text-xs text-muted-foreground">
                {preview}
              </span>
            ) : null}
          </span>
        </span>
        {open ? (
          <ChevronUp size={18} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border p-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

