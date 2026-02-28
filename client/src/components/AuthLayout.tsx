import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background px-4 pb-8 pt-8 md:px-6" dir="rtl">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a2c17' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -left-1/4 top-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl justify-start">
        <ThemeToggle />
      </div>

      <motion.div
        className="relative z-10 mx-auto mt-4 flex w-full max-w-xl flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="w-full text-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Coffee size={40} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            دفتر القهوة
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>
        </motion.div>

        <motion.div
          className="w-full rounded-xl border border-border/90 bg-card/95 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <div className="mb-4 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
          </div>
          {children}
        </motion.div>

        <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block" aria-hidden="true">
          <motion.div
            className="absolute -left-8 top-20 h-8 w-5 rounded-full bg-primary/30"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-8 top-40 h-8 w-5 rounded-full bg-accent/40"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
