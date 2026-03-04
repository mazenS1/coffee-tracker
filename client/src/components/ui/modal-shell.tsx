import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface ModalShellProps {
  children: ReactNode;
  onClose: () => void;
  panelClassName?: string;
}

export function ModalShell({ children, onClose, panelClassName }: ModalShellProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-transparent p-0 md:items-center md:bg-black/55 md:p-4 md:backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={cn(
          "w-full max-h-full rounded-t-2xl border border-border bg-card shadow-2xl md:max-w-2xl md:rounded-2xl",
          panelClassName,
        )}
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "tween", duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

