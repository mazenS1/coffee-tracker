import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";

/**
 * Custom Sign In Page
 * 
 * A beautiful, RTL Arabic sign-in page that matches the coffee theme.
 * Uses Clerk's SignIn component with custom appearance overrides.
 * The page features:
 * - Coffee-themed background with warm gradients
 * - Arabic typography (Reem Kufi for display, Tajawal for body)
 * - RTL layout support
 * - Animated elements using framer-motion
 */
export function SignInPage() {
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
          <p className="auth-subtitle">سجّل دخولك لبدء رحلتك مع القهوة المختصة</p>
        </motion.div>

        {/* Clerk SignIn Component with custom appearance */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <SignIn
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
                privacyPageUrl: undefined,
                termsPageUrl: undefined,
              },
              variables: {
                // Colors matching coffee theme
                colorPrimary: "#4a2c17",
                colorBackground: "var(--bg-card)",
                colorText: "var(--text-primary)",
                colorTextSecondary: "var(--text-secondary)",
                colorInputBackground: "var(--bg-secondary)",
                colorInputText: "var(--text-primary)",
                colorDanger: "#dc3545",
                
                // Typography
                fontFamily: "'Tajawal', sans-serif",
                fontFamilyButtons: "'Tajawal', sans-serif",
                fontSize: "1rem",
                
                // Border radius matching theme
                borderRadius: "12px",
                
                // Spacing
                spacingUnit: "1rem",
              },
              elements: {
                // Root card styling
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
                
                // Header
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
                
                // Form fields
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
                
                // Buttons
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
                  "&:active": {
                    transform: "translateY(0)",
                  },
                },
                
                // Social buttons
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
                
                // Divider
                dividerLine: {
                  background: "var(--border)",
                },
                dividerText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                },
                
                // Footer links
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
                
                // Identity preview (when returning user)
                identityPreviewText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "var(--text-primary)",
                },
                identityPreviewEditButton: {
                  color: "#c68b3c",
                },
                
                // Alert messages
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
                
                // OTP input
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
                
                // Form error
                formFieldErrorText: {
                  fontFamily: "'Tajawal', sans-serif",
                  color: "#dc3545",
                  fontSize: "0.8rem",
                },
                
                // Loading states
                spinner: {
                  color: "#c68b3c",
                },
              },
            }}
            routing="hash"
            signUpUrl="#/sign-up"
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
