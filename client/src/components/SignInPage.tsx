import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, CheckCircle2, Lock, Mail } from "lucide-react";
import { useSignIn } from "@clerk/clerk-react";
import { AuthLayout } from "./AuthLayout";
import {
  AuthDivider,
  AuthErrorBanner,
  AuthField,
  AuthLoadingCard,
  AuthOAuthButton,
  AuthPrimaryButton,
  AuthSecondaryLinkButton,
  AuthStepIndicator,
  AuthTextInput,
} from "./AuthPrimitives";
import {
  OAUTH_REDIRECT_COMPLETE,
  OAUTH_REDIRECT_URL,
  extractClerkErrorMessage,
} from "./authFlow";
import type { AuthStep } from "./authFlow";

type SignInMethod = "password" | "otp";
type OAuthProviderStrategy = "oauth_google" | "oauth_apple";

type EmailCodeFactor = {
  strategy: "email_code";
  emailAddressId: string;
  safeIdentifier?: string;
};

type OtpContext =
  | {
      flow: "first_factor";
      emailAddressId: string;
      safeIdentifier?: string;
    }
  | {
      flow: "second_factor";
      emailAddressId?: string;
      safeIdentifier?: string;
    };

const getEmailCodeFactor = (factors: unknown[] | null | undefined) => {
  if (!Array.isArray(factors)) return null;

  const factor = factors.find((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const maybe = entry as { strategy?: unknown; emailAddressId?: unknown };
    return (
      maybe.strategy === "email_code" && typeof maybe.emailAddressId === "string"
    );
  });

  if (!factor || typeof factor !== "object") return null;

  const maybe = factor as {
    strategy?: unknown;
    emailAddressId?: unknown;
    safeIdentifier?: unknown;
  };

  if (
    maybe.strategy !== "email_code" ||
    typeof maybe.emailAddressId !== "string"
  ) {
    return null;
  }

  return {
    strategy: "email_code",
    emailAddressId: maybe.emailAddressId,
    safeIdentifier:
      typeof maybe.safeIdentifier === "string" ? maybe.safeIdentifier : undefined,
  } satisfies EmailCodeFactor;
};

export function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("form");
  const [method, setMethod] = useState<SignInMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpContext, setOtpContext] = useState<OtpContext | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProviderStrategy | null>(
    null,
  );

  useEffect(() => {
    if (step !== "done") return;
    const timer = window.setTimeout(() => {
      navigate("/", { replace: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate, step]);

  if (!isLoaded || !signIn || !setActive) {
    return (
      <AuthLayout
        title="تسجيل الدخول"
        subtitle="سجّل دخولك لمتابعة رحلتك مع القهوة المختصة"
      >
        <AuthLoadingCard message="جاري تحميل تجربة تسجيل الدخول..." />
      </AuthLayout>
    );
  }

  const clearFlowErrors = () => {
    setErrorMessage(null);
  };

  const completeSignIn = async (sessionId: string | null) => {
    if (!sessionId) {
      throw new Error("تعذر إكمال الجلسة. حاول مرة أخرى.");
    }

    await setActive({ session: sessionId });
    setStep("done");
  };

  const startOtpSignIn = async (identifier: string) => {
    const created = await signIn.create({ identifier });
    const emailFactor = getEmailCodeFactor(created.supportedFirstFactors);

    if (!emailFactor) {
      throw new Error("تسجيل الدخول برمز البريد غير متاح لهذا الحساب.");
    }

    await signIn.prepareFirstFactor({
      strategy: "email_code",
      emailAddressId: emailFactor.emailAddressId,
    });

    setOtpContext({
      flow: "first_factor",
      emailAddressId: emailFactor.emailAddressId,
      safeIdentifier: emailFactor.safeIdentifier,
    });
    setStep("otp");
  };

  const startPasswordSignIn = async (identifier: string) => {
    const result = await signIn.create({
      strategy: "password",
      identifier,
      password,
    });

    if (result.status === "complete") {
      await completeSignIn(result.createdSessionId);
      return;
    }

    if (result.status === "needs_second_factor") {
      const secondFactor = getEmailCodeFactor(result.supportedSecondFactors);
      await signIn.prepareSecondFactor(
        secondFactor
          ? {
              strategy: "email_code",
              emailAddressId: secondFactor.emailAddressId,
            }
          : {
              strategy: "email_code",
            },
      );

      setOtpContext({
        flow: "second_factor",
        emailAddressId: secondFactor?.emailAddressId,
        safeIdentifier: secondFactor?.safeIdentifier,
      });
      setStep("otp");
      return;
    }

    throw new Error("لم نتمكن من إكمال تسجيل الدخول. تحقق من بياناتك.");
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    const identifier = email.trim().toLowerCase();
    if (!identifier) {
      setErrorMessage("أدخل البريد الإلكتروني أولاً.");
      return;
    }

    clearFlowErrors();
    setIsSubmitting(true);

    try {
      if (method === "password") {
        if (!password) {
          setErrorMessage("أدخل كلمة المرور.");
          return;
        }

        await startPasswordSignIn(identifier);
      } else {
        await startOtpSignIn(identifier);
      }
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded || !otpContext) return;

    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setErrorMessage("أدخل رمز التحقق المرسل إلى بريدك.");
      return;
    }

    clearFlowErrors();
    setIsSubmitting(true);

    try {
      const attempt =
        otpContext.flow === "first_factor"
          ? await signIn.attemptFirstFactor({
              strategy: "email_code",
              code: normalizedCode,
            })
          : await signIn.attemptSecondFactor({
              strategy: "email_code",
              code: normalizedCode,
            });

      if (attempt.status === "complete") {
        await completeSignIn(attempt.createdSessionId);
        return;
      }

      throw new Error("رمز التحقق غير صحيح أو منتهي الصلاحية.");
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !otpContext) return;

    clearFlowErrors();
    setIsResending(true);

    try {
      if (otpContext.flow === "first_factor") {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: otpContext.emailAddressId,
        });
      } else {
        await signIn.prepareSecondFactor(
          otpContext.emailAddressId
            ? {
                strategy: "email_code",
                emailAddressId: otpContext.emailAddressId,
              }
            : {
                strategy: "email_code",
              },
        );
      }
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleOAuth = async (provider: OAuthProviderStrategy) => {
    if (!isLoaded) return;

    clearFlowErrors();
    setOauthLoading(provider);

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: OAUTH_REDIRECT_URL,
        redirectUrlComplete: OAUTH_REDIRECT_COMPLETE,
      });
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
      setOauthLoading(null);
    }
  };

  const stepNumber = step === "form" ? 1 : step === "otp" ? 2 : 3;

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="سجّل دخولك لمتابعة رحلتك مع القهوة المختصة"
    >
      {step === "done" ? (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <CheckCircle2 size={44} className="text-accent" />
          <h3 className="font-display text-xl text-foreground">تم تسجيل الدخول بنجاح</h3>
          <p className="text-sm text-muted-foreground">سيتم تحويلك الآن إلى الصفحة الرئيسية...</p>
        </div>
      ) : (
        <>
          <AuthStepIndicator step={stepNumber} />

          {step === "form" && (
            <div
              className="mb-4 grid grid-cols-2 gap-1 rounded-md border border-border bg-muted p-1"
              role="tablist"
              aria-label="طريقة الدخول"
            >
              <button
                type="button"
                className={
                  method === "password"
                    ? "min-h-10 rounded-md bg-card px-3 text-sm font-semibold text-foreground shadow-sm"
                    : "min-h-10 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card/70"
                }
                onClick={() => {
                  setMethod("password");
                  clearFlowErrors();
                }}
              >
                كلمة المرور
              </button>
              <button
                type="button"
                className={
                  method === "otp"
                    ? "min-h-10 rounded-md bg-card px-3 text-sm font-semibold text-foreground shadow-sm"
                    : "min-h-10 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card/70"
                }
                onClick={() => {
                  setMethod("otp");
                  clearFlowErrors();
                }}
              >
                رمز البريد
              </button>
            </div>
          )}

          {errorMessage && <AuthErrorBanner message={errorMessage} />}

          {step === "form" ? (
            <form className="flex flex-col gap-3" onSubmit={handleSubmitForm}>
              <AuthField label="البريد الإلكتروني">
                <AuthTextInput
                  icon={<Mail size={17} />}
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </AuthField>

              {method === "password" && (
                <AuthField label="كلمة المرور">
                  <AuthTextInput
                    icon={<Lock size={17} />}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </AuthField>
              )}

              <AuthPrimaryButton
                disabled={isSubmitting || oauthLoading !== null}
                loading={isSubmitting}
                loadingText="جاري التحقق..."
              >
                {method === "password" ? "متابعة" : "إرسال رمز التحقق"}
              </AuthPrimaryButton>
            </form>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={handleVerifyOtp}>
              <p className="text-center text-sm text-muted-foreground">
                أدخل الرمز المرسل إلى {otpContext?.safeIdentifier ?? email}
              </p>
              <AuthField label="رمز التحقق">
                <AuthTextInput
                  icon={<Mail size={17} />}
                  className="text-center tracking-[0.2em]"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </AuthField>

              <AuthPrimaryButton
                disabled={isSubmitting || isResending || oauthLoading !== null}
                loading={isSubmitting}
                loadingText="جاري التأكيد..."
              >
                تأكيد الرمز
              </AuthPrimaryButton>

              <div className="mt-1 flex justify-between gap-3">
                <AuthSecondaryLinkButton
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting}
                >
                  {isResending ? "جاري إعادة الإرسال..." : "إعادة إرسال الرمز"}
                </AuthSecondaryLinkButton>
                <AuthSecondaryLinkButton
                  onClick={() => {
                    setStep("form");
                    setCode("");
                    setOtpContext(null);
                    clearFlowErrors();
                  }}
                  disabled={isSubmitting}
                >
                  رجوع
                </AuthSecondaryLinkButton>
              </div>
            </form>
          )}

          <AuthDivider label="أو تابع باستخدام" />

          <div className="grid grid-cols-2 gap-2">
            <AuthOAuthButton
              onClick={() => handleOAuth("oauth_google")}
              disabled={isSubmitting || isResending || oauthLoading !== null}
              loading={oauthLoading === "oauth_google"}
              icon={
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[11px] font-black text-red-600">
                  G
                </span>
              }
            >
              Google
            </AuthOAuthButton>
            <AuthOAuthButton
              onClick={() => handleOAuth("oauth_apple")}
              disabled={isSubmitting || isResending || oauthLoading !== null}
              loading={oauthLoading === "oauth_apple"}
              icon={<Apple size={16} />}
            >
              Apple
            </AuthOAuthButton>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            لا تملك حساباً بعد؟{" "}
            <Link className="font-bold text-accent hover:underline" to="/sign-up">
              أنشئ حسابك
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
