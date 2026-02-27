import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-background">
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="auth-branding"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="auth-logo">
            <Coffee size={40} />
          </div>
          <h1 className="auth-title">دفتر القهوة</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </motion.div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
