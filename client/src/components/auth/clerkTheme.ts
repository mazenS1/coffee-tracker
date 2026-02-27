import { arSA } from "@clerk/localizations";
import type { Appearance, LocalizationResource } from "@clerk/types";

const clerkSharedVariables: NonNullable<Appearance["variables"]> = {
  colorPrimary: "#4a2c17",
  colorBackground: "var(--bg-card, #ffffff)",
  colorText: "var(--text-primary, #1a0f0a)",
  colorForeground: "var(--text-primary, #1a0f0a)",
  colorTextSecondary: "var(--text-secondary, #4a2c17)",
  colorMutedForeground: "var(--text-muted, #8b7355)",
  colorInputBackground: "var(--bg-secondary, #f5e6d3)",
  colorInput: "var(--bg-secondary, #f5e6d3)",
  colorInputText: "var(--text-primary, #1a0f0a)",
  colorInputForeground: "var(--text-primary, #1a0f0a)",
  colorBorder: "var(--border, rgba(74, 44, 23, 0.1))",
  colorDanger: "#dc3545",
  colorSuccess: "#2f9e44",
  fontFamily: "'Tajawal', sans-serif",
  fontFamilyButtons: "'Tajawal', sans-serif",
  fontSize: "1rem",
  borderRadius: "12px",
  spacing: "1rem",
};

export const clerkArabicLocalization: LocalizationResource = {
  ...arSA,
  backButton: "رجوع",
  formButtonPrimary: "متابعة",
  formButtonPrimary__verify: "تحقق",
  formFieldAction__forgotPassword: "نسيت كلمة المرور؟",
  signInEnterPasswordTitle: "أدخل كلمة المرور",
  signIn: {
    ...arSA.signIn,
    start: {
      ...arSA.signIn?.start,
      title: "تسجيل الدخول",
      subtitle: "مرحباً بعودتك إلى دفتر القهوة",
      actionText: "ليس لديك حساب؟",
      actionLink: "إنشاء حساب",
      actionLink__use_email: "استخدم البريد الإلكتروني",
      actionLink__use_phone: "استخدم رقم الهاتف",
      actionLink__use_username: "استخدم اسم المستخدم",
      actionLink__use_email_username: "استخدم البريد أو اسم المستخدم",
    },
    password: {
      ...arSA.signIn?.password,
      title: "أدخل كلمة المرور",
      subtitle: "أكمل تسجيل الدخول إلى دفتر القهوة",
    },
    forgotPassword: {
      ...arSA.signIn?.forgotPassword,
      title: "استعادة الحساب",
      subtitle: "سنرسل لك رمز التحقق لإعادة تعيين كلمة المرور",
      subtitle_email: "أدخل البريد الإلكتروني المرتبط بحسابك",
      subtitle_phone: "أدخل رقم الهاتف المرتبط بحسابك",
      formTitle: "رمز التحقق",
      resendButton: "إعادة إرسال الرمز",
    },
    resetPassword: {
      ...arSA.signIn?.resetPassword,
      title: "تعيين كلمة مرور جديدة",
      formButtonPrimary: "حفظ كلمة المرور",
      successMessage: "تم تحديث كلمة المرور بنجاح",
      requiredMessage: "يرجى إكمال هذه الخطوة للمتابعة",
    },
    emailCode: {
      ...arSA.signIn?.emailCode,
      title: "تحقق من البريد الإلكتروني",
      subtitle: "أدخل الرمز المرسل إلى بريدك",
      formTitle: "رمز التحقق",
      resendButton: "إعادة إرسال الرمز",
    },
    phoneCode: {
      ...arSA.signIn?.phoneCode,
      title: "تحقق من رقم الهاتف",
      subtitle: "أدخل الرمز المرسل إلى هاتفك",
      formTitle: "رمز التحقق",
      resendButton: "إعادة إرسال الرمز",
    },
    alternativeMethods: {
      ...arSA.signIn?.alternativeMethods,
      title: "طريقة تسجيل أخرى",
      subtitle: "اختر طريقة بديلة لتسجيل الدخول",
      actionText: "تحتاج مساعدة؟",
      actionLink: "التواصل مع الدعم",
    },
    emailCodeMfa: {
      ...arSA.signIn?.emailCodeMfa,
      title: "التحقق بخطوتين عبر البريد",
      subtitle: "أدخل الرمز المرسل إلى بريدك",
      formTitle: "رمز التحقق",
      resendButton: "إعادة إرسال الرمز",
    },
    phoneCodeMfa: {
      ...arSA.signIn?.phoneCodeMfa,
      title: "التحقق بخطوتين عبر الهاتف",
      subtitle: "أدخل الرمز المرسل إلى هاتفك",
      formTitle: "رمز التحقق",
      resendButton: "إعادة إرسال الرمز",
    },
    totpMfa: {
      ...arSA.signIn?.totpMfa,
      title: "تطبيق المصادقة",
      subtitle: "أدخل الرمز من تطبيق المصادقة",
      formTitle: "رمز التحقق",
    },
    backupCodeMfa: {
      ...arSA.signIn?.backupCodeMfa,
      title: "استخدم رمز احتياطي",
      subtitle: "أدخل أحد الرموز الاحتياطية",
    },
  },
  signUp: {
    ...arSA.signUp,
    start: {
      ...arSA.signUp?.start,
      title: "إنشاء حساب جديد",
      subtitle: "ابدأ رحلتك مع القهوة المختصة",
      actionText: "لديك حساب بالفعل؟",
      actionLink: "تسجيل الدخول",
      actionLink__use_phone: "استخدم رقم الهاتف",
      actionLink__use_email: "استخدم البريد الإلكتروني",
    },
    continue: {
      ...arSA.signUp?.continue,
      title: "أكمل إنشاء حسابك",
      subtitle: "أضف بياناتك لإكمال التسجيل",
      actionText: "لديك حساب بالفعل؟",
      actionLink: "تسجيل الدخول",
    },
    emailCode: {
      ...arSA.signUp?.emailCode,
      title: "تأكيد البريد الإلكتروني",
      subtitle: "أدخل الرمز المرسل إلى بريدك",
      formTitle: "رمز التحقق",
      formSubtitle: "الرمز صالح لفترة قصيرة",
      resendButton: "إعادة إرسال الرمز",
    },
    phoneCode: {
      ...arSA.signUp?.phoneCode,
      title: "تأكيد رقم الهاتف",
      subtitle: "أدخل الرمز المرسل إلى هاتفك",
      formTitle: "رمز التحقق",
      formSubtitle: "الرمز صالح لفترة قصيرة",
      resendButton: "إعادة إرسال الرمز",
    },
    emailLink: {
      ...arSA.signUp?.emailLink,
      title: "تحقق من بريدك الإلكتروني",
      subtitle: "فتحنا خطوة التحقق عبر البريد",
      formTitle: "تحقق من البريد",
      formSubtitle: "افتح الرسالة واضغط رابط التأكيد",
      resendButton: "إعادة إرسال الرابط",
    },
  },
  userButton: {
    ...arSA.userButton,
    action__manageAccount: "إدارة الحساب",
    action__signOut: "تسجيل الخروج",
  },
  userProfile: {
    ...arSA.userProfile,
    start: {
      ...arSA.userProfile?.start,
      headerTitle__account: "الحساب",
      headerTitle__security: "الأمان",
      profileSection: {
        title: "الملف الشخصي",
      },
    },
  },
};

const clerkAuthElements: NonNullable<Appearance["elements"]> = {
  rootBox: {
    width: "100%",
    maxWidth: "100%",
    direction: "rtl",
    fontFamily: "'Tajawal', sans-serif",
  },
  card: {
    background: "transparent",
    boxShadow: "none",
    border: "none",
    padding: "0",
    margin: "0",
  },
  main: {
    direction: "rtl",
  },
  header: {
    direction: "rtl",
  },
  headerTitle: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-secondary)",
    textAlign: "center",
    lineHeight: 1.6,
  },
  headerBackLink: {
    color: "var(--text-muted)",
    fontFamily: "'Tajawal', sans-serif",
  },
  backRow: {
    justifyContent: "flex-end",
  },
  backLink: {
    color: "var(--text-muted)",
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
  },
  form: {
    direction: "rtl",
  },
  formContainer: {
    direction: "rtl",
  },
  formHeaderTitle: {
    fontFamily: "'Reem Kufi', sans-serif",
    color: "var(--text-primary)",
    textAlign: "right",
  },
  formHeaderSubtitle: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-muted)",
    textAlign: "right",
  },
  formField: {
    direction: "rtl",
  },
  formFieldLabelRow: {
    justifyContent: "space-between",
    direction: "rtl",
  },
  formFieldLabel: {
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: "600",
    color: "var(--text-secondary)",
    fontSize: "0.875rem",
    textAlign: "right",
  },
  formFieldHintText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-muted)",
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
  },
  formFieldInputShowPasswordButton: {
    color: "var(--text-muted)",
  },
  formFieldAction: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--accent)",
  },
  formFieldErrorText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "#dc3545",
    fontSize: "0.85rem",
    textAlign: "right",
  },
  formFieldWarningText: {
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
  },
  formFieldSuccessText: {
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
  },
  formFieldInfoText: {
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
  },
  formButtonPrimary: {
    background: "linear-gradient(135deg, #4a2c17, #2d1810)",
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: "700",
    fontSize: "1rem",
    padding: "0.875rem 1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(45, 24, 16, 0.3)",
  },
  formButtonReset: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-muted)",
  },
  formResendCodeLink: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--accent)",
    fontWeight: "600",
  },
  dividerLine: {
    background: "var(--border)",
  },
  dividerText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
  socialButtonsRoot: {
    gap: "0.625rem",
  },
  socialButtonsBlockButton: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "0.75rem 1rem",
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-primary)",
    flexDirection: "row-reverse",
    textAlign: "right",
  },
  socialButtonsBlockButtonText: {
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: "500",
  },
  alternativeMethods: {
    direction: "rtl",
    gap: "0.5rem",
  },
  alternativeMethodsBlockButton: {
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    flexDirection: "row-reverse",
    textAlign: "right",
  },
  alternativeMethodsBlockButtonText: {
    fontFamily: "'Tajawal', sans-serif",
  },
  verificationLinkStatusBox: {
    border: "1px solid var(--border)",
    borderRadius: "12px",
    background: "var(--bg-secondary)",
  },
  verificationLinkStatusText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-secondary)",
  },
  otpCodeField: {
    direction: "ltr",
  },
  otpCodeFieldInputs: {
    direction: "ltr",
    justifyContent: "center",
  },
  otpCodeFieldInput: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: "1.2rem",
    color: "var(--text-primary)",
  },
  otpCodeFieldErrorText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "#dc3545",
    textAlign: "right",
  },
  otpCodeFieldSuccessText: {
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
  },
  alert: {
    background: "rgba(220, 53, 69, 0.1)",
    border: "1px solid rgba(220, 53, 69, 0.25)",
    borderRadius: "12px",
    color: "#dc3545",
    fontFamily: "'Tajawal', sans-serif",
    direction: "rtl",
  },
  alertText: {
    fontFamily: "'Tajawal', sans-serif",
    textAlign: "right",
    width: "100%",
  },
  identityPreview: {
    direction: "rtl",
  },
  identityPreviewText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-primary)",
    textAlign: "right",
  },
  identityPreviewEditButton: {
    color: "var(--accent)",
  },
  footerAction: {
    justifyContent: "center",
  },
  footerActionText: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--text-muted)",
  },
  footerActionLink: {
    fontFamily: "'Tajawal', sans-serif",
    color: "var(--accent)",
    fontWeight: "700",
  },
  footerPages: {
    justifyContent: "center",
  },
  footerPagesLink: {
    fontFamily: "'Tajawal', sans-serif",
  },
  spinner: {
    color: "var(--accent)",
  },
};

export const clerkAuthPageAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    privacyPageUrl: undefined,
    termsPageUrl: undefined,
  },
  variables: clerkSharedVariables,
  elements: clerkAuthElements,
};

export const clerkGlobalAppearance: Appearance = {
  variables: clerkSharedVariables,
  elements: {
    rootBox: {
      fontFamily: "'Tajawal', sans-serif",
      direction: "rtl",
    },
    card: {
      background: "var(--bg-card, #ffffff)",
      border: "1px solid var(--border, rgba(74, 44, 23, 0.1))",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(26, 15, 10, 0.15)",
    },
    headerTitle: {
      fontFamily: "'Reem Kufi', sans-serif",
      color: "var(--text-primary, #1a0f0a)",
      textAlign: "right",
    },
    headerSubtitle: {
      fontFamily: "'Tajawal', sans-serif",
      color: "var(--text-secondary, #4a2c17)",
      textAlign: "right",
    },
    formFieldLabel: {
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: "600",
      color: "var(--text-secondary, #4a2c17)",
      textAlign: "right",
    },
    formFieldInput: {
      fontFamily: "'Tajawal', sans-serif",
      background: "var(--bg-secondary, #f5e6d3)",
      border: "1px solid var(--border, rgba(74, 44, 23, 0.1))",
      borderRadius: "12px",
      direction: "rtl",
      textAlign: "right",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #4a2c17, #2d1810)",
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(45, 24, 16, 0.25)",
    },
    userButtonAvatarBox: {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "2px solid var(--accent, #c68b3c)",
    },
    userButtonPopoverCard: {
      background: "var(--bg-card, #ffffff)",
      border: "1px solid var(--border, rgba(74, 44, 23, 0.1))",
      borderRadius: "16px",
      boxShadow: "0 12px 40px rgba(26, 15, 10, 0.2)",
      direction: "rtl",
    },
    userButtonPopoverActions: {
      direction: "rtl",
    },
    userButtonPopoverActionButton: {
      fontFamily: "'Tajawal', sans-serif",
      color: "var(--text-primary, #1a0f0a)",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      flexDirection: "row-reverse",
      justifyContent: "flex-end",
      textAlign: "right",
      gap: "0.75rem",
    },
    userButtonPopoverActionButtonIcon: {
      color: "var(--accent, #c68b3c)",
    },
    userButtonPopoverActionButtonText: {
      fontFamily: "'Tajawal', sans-serif",
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
    },
    userButtonPopoverFooter: {
      borderTop: "1px solid var(--border, rgba(74, 44, 23, 0.1))",
      direction: "rtl",
      textAlign: "center",
    },
    modalContent: {
      background: "var(--bg-card, #ffffff)",
      direction: "rtl",
    },
    navbar: {
      background: "var(--bg-secondary, #f5e6d3)",
      borderRight: "none",
      borderLeft: "1px solid var(--border, rgba(74, 44, 23, 0.1))",
    },
    navbarButton: {
      fontFamily: "'Tajawal', sans-serif",
      color: "var(--text-secondary, #4a2c17)",
    },
    navbarButtonIcon: {
      color: "var(--accent, #c68b3c)",
    },
    pageScrollBox: {
      padding: "1.5rem",
    },
    page: {
      direction: "rtl",
    },
    profilePage: {
      direction: "rtl",
    },
    avatarBox: {
      border: "2px solid var(--accent, #c68b3c)",
    },
    avatarImage: {
      borderRadius: "50%",
    },
    badge: {
      fontFamily: "'Tajawal', sans-serif",
      background: "rgba(198, 139, 60, 0.15)",
      color: "var(--text-primary, #1a0f0a)",
    },
  },
};
