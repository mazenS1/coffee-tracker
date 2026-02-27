import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const featureItems = [
  {
    icon: NotebookPen,
    title: "ملاحظات لكل فنجان",
    description: "دوّن الطحن، الوزن، والوقت حتى ترجع لأفضل وصفة بسهولة.",
  },
  {
    icon: TimerReset,
    title: "متابعة الرحلة كاملة",
    description: "سجل كل تجربة من أول يوم حتى بناء روتين قهوة ثابت.",
  },
  {
    icon: ShieldCheck,
    title: "بياناتك بأمان",
    description: "تسجيل دخول آمن عبر Clerk مع تجربة سلسة باللغة العربية.",
  },
] as const;

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page auth-page-v2" dir="rtl">
      <div className="auth-background">
        <div className="auth-pattern" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <motion.div
        className="auth-layout"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <motion.aside
          className="auth-story"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <span className="auth-story-badge">
            <Sparkles size={14} />
            رفيقك اليومي للقهوة
          </span>

          <div className="auth-brand-line">
            <div className="auth-logo auth-logo-v2">
              <Coffee size={30} />
            </div>
            <h1 className="auth-story-title">دفتر القهوة</h1>
          </div>

          <p className="auth-story-copy">
            منصة بسيطة لتسجيل وصفاتك، نكهاتك، وتقييماتك لكل جلسة تحضير.
          </p>

          <ul className="auth-feature-list">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="auth-feature-item">
                  <span className="auth-feature-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.aside>

        <motion.section
          className="auth-card auth-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <header className="auth-panel-header">
            <p className="auth-kicker">القسم الآمن</p>
            <h2 className="auth-panel-title">{title}</h2>
            <p className="auth-panel-subtitle">{subtitle}</p>
          </header>
          <div className="auth-clerk-slot">{children}</div>
        </motion.section>
      </motion.div>

      <div className="auth-decoration">
        <motion.div
          className="coffee-bean bean-1"
          animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="coffee-bean bean-2"
          animate={{ y: [0, 10, 0], rotate: [0, -7, 0] }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />
      </div>
    </div>
  );
}
