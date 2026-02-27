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
    <div className="auth-page" dir="rtl">
      <div className="auth-background">
        <div className="auth-pattern" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <div className="auth-topbar">
        <ThemeToggle />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="auth-branding"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="auth-logo">
            <Coffee size={40} />
          </div>
          <h1 className="auth-title">دفتر القهوة</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </motion.div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <div className="authx-card-header">
            <h2 className="authx-card-title">{title}</h2>
          </div>
          {children}
        </motion.div>

        <div className="auth-decoration" aria-hidden="true">
          <motion.div
            className="coffee-bean bean-1"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="coffee-bean bean-2"
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
