export type AuthStep = "form" | "otp" | "done";

export const OAUTH_REDIRECT_URL = "/sso-callback";
export const OAUTH_REDIRECT_COMPLETE = "/";

export function extractClerkErrorMessage(error: unknown): string {
  const fallback = "حدث خطأ أثناء محاولة تسجيل الدخول. حاول مرة أخرى.";

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;

  if (Array.isArray(errors) && errors.length > 0) {
    const primary = errors[0];
    if (primary.longMessage) return primary.longMessage;
    if (primary.message) return primary.message;
  }

  if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return fallback;
}
