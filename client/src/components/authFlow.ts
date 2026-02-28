export type AuthStep = "form" | "otp" | "done";

export const OAUTH_REDIRECT_URL = "/sso-callback";
export const OAUTH_REDIRECT_COMPLETE = "/";

export function extractClerkErrorMessage(error: unknown): string {
  const fallback = "حدث خطأ أثناء محاولة تسجيل الدخول. حاول مرة أخرى.";

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errors = (
    error as {
      errors?: Array<{ longMessage?: string; message?: string; code?: string }>;
    }
  ).errors;

  if (Array.isArray(errors) && errors.length > 0) {
    const primary = errors[0];
    const errorCode =
      typeof primary.code === "string" ? primary.code.toLowerCase() : null;

    if (errorCode === "captcha_invalid") {
      return "فشل التحقق الأمني. جرّب متصفحًا آخر أو عطّل إضافات الحجب/VPN ثم أعد المحاولة.";
    }

    if (errorCode === "captcha_missing_token") {
      return "انتهت صلاحية اختبار التحقق الأمني. حدّث الصفحة ثم أعد المحاولة.";
    }

    if (errorCode === "captcha_not_enabled") {
      return "التحقق الأمني غير مفعّل في إعدادات Clerk. فعّله من Dashboard > Attack protection.";
    }

    if (errorCode === "host_invalid" || errorCode === "origin_invalid") {
      return "فشل التحقق من النطاق/الأصل. تأكد أنك تستخدم localhost الصحيح وإعدادات Clerk المناسبة.";
    }

    if (primary.longMessage) return primary.longMessage;
    if (primary.message) return primary.message;
  }

  if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return fallback;
}
