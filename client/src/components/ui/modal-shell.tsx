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
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm md:items-center md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={cn(
          "w-full rounded-t-2xl border border-border bg-card shadow-2xl md:max-w-2xl md:rounded-2xl",
          panelClassName,
        )}
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

