import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";

/**
 * Custom Sign Up Page
 * 
 * A beautiful, RTL Arabic sign-up page that matches the coffee theme.
 * Mirrors the SignInPage design for consistency.
 */
export function SignUpPage() {
  return (
    <div className="auth-page" dir="rtl">
      {/* Background decorations */}
      <div className="auth-background">
        <div className="auth-pattern" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Branding header */}
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
          <p className="auth-subtitle">أنشئ حسابك وابدأ رحلتك مع القهوة المختصة</p>
        </motion.div>

        {/* Clerk SignUp Component with custom appearance */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <SignUp
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
                privacyPageUrl: undefined,
                termsPageUrl: undefined,
              },
              variables: {
                colorPrimary: "#4a2c17",
                colorBackground: "var(--bg-card)",
                colorText: "var(--text-primary)",
                colorTextSecondary: "var(--text-secondary)",
                colorInputBackground: "var(--bg-secondary)",
                colorInputText: "var(--text-primary)",
                colorDanger: "#dc3545",
                fontFamily: "'Tajawal', sans-serif",
                fontFamilyButtons: "'Tajawal', sans-serif",
                fontSize: "1rem",
                borderRadius: "12px",
                spacingUnit: "1rem",
              },
              elements: {
                rootBox: {
                  width: "100%",
                  maxWidth: "100%",
                },
                card: {
                  background: "transparent",
                  boxShadow: "none",
                  padding: "0",
                  margin: "0",
                },
                headerTitle: {
                  fontFamily: "'Reem Kufi', sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  textAlign: "center",
                },
                headerSubtitle: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                },
                formFieldLabel: {
                  fontFamily: "'Tajawal', sans-serif",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  textAlign: "right",
                },
                formFieldInput: {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "0.875rem 1rem",
                  fontSize: "1rem",
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-primary)",
                  direction: "rtl",
                  textAlign: "right",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:focus": {
                    borderColor: "var(--accent)",
                    boxShadow: "0 0 0 3px rgba(198, 139, 60, 0.15)",
                  },
                },
                formFieldInputShowPasswordButton: {
                  color: "var(--text-muted)",
                },
                formButtonPrimary: {
                  background: "linear-gradient(135deg, #4a2c17, #2d1810)",
                  fontFamily: "'Tajawal', sans-serif",
                  fontWeight: "600",
                  fontSize: "1rem",
                  padding: "0.875rem 1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(45, 24, 16, 0.3)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    boxShadow: "0 6px 28px rgba(45, 24, 16, 0.4)",
                    transform: "translateY(-1px)",
                  },
                },
                socialButtonsBlockButton: {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "var(--bg-card)",
                    borderColor: "var(--accent)",
                  },
                },
                socialButtonsBlockButtonText: {
                  fontFamily: "'Tajawal', sans-serif",
                  fontWeight: "500",
                },
                dividerLine: {
                  background: "var(--border)",
                },
                dividerText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                },
                footerActionLink: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#c68b3c",
                  fontWeight: "600",
                  "&:hover": {
                    color: "#b8860b",
                  },
                },
                footerActionText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-muted)",
                },
                alert: {
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid rgba(220, 53, 69, 0.3)",
                  borderRadius: "12px",
                  color: "#dc3545",
                  fontFamily: "'Tajawal', sans-serif",
                },
                alertText: {
                  fontFamily: "'Tajawal', sans-serif",
                },
                otpCodeFieldInput: {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontFamily: "'Reem Kufi', sans-serif",
                  fontSize: "1.25rem",
                  "&:focus": {
                    borderColor: "var(--accent)",
                    boxShadow: "0 0 0 3px rgba(198, 139, 60, 0.15)",
                  },
                },
                formFieldErrorText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#dc3545",
                  fontSize: "0.8rem",
                },
                spinner: {
                  color: "#c68b3c",
                },
              },
            }}
            routing="hash"
            signInUrl="#/sign-in"
          />
        </motion.div>

        {/* Decorative coffee beans */}
        <div className="auth-decoration">
          <motion.div
            className="coffee-bean bean-1"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="coffee-bean bean-2"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0],
            }}
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
