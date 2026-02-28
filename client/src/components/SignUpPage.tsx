import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, CheckCircle2, Lock, Mail, User } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react";
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

type OAuthProviderStrategy = "oauth_google" | "oauth_apple";

export function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
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

  if (!isLoaded || !signUp || !setActive) {
    return (
      <AuthLayout
        title="إنشاء حساب"
        subtitle="أنشئ حسابك وابدأ بتتبع تجارب القهوة بكل تفاصيلها"
      >
        <AuthLoadingCard message="جاري تحميل تجربة إنشاء الحساب..." />
      </AuthLayout>
    );
  }

  const completeSignUp = async (sessionId: string | null) => {
    if (!sessionId) {
      throw new Error("تعذر إنشاء الجلسة. حاول مرة أخرى.");
    }

    await setActive({ session: sessionId });
    setStep("done");
  };

  const clearErrors = () => {
    setErrorMessage(null);
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    const emailAddress = email.trim().toLowerCase();
    if (!emailAddress) {
      setErrorMessage("أدخل البريد الإلكتروني.");
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      const result = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress,
        password,
      });

      if (result.status === "complete") {
        await completeSignUp(result.createdSessionId);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("otp");
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setErrorMessage("أدخل رمز التحقق أولاً.");
      return;
    }

    clearErrors();
    setIsSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: normalizedCode,
      });

      if (result.status === "complete") {
        await completeSignUp(result.createdSessionId);
        return;
      }

      throw new Error("رمز التحقق غير صحيح أو انتهت صلاحيته.");
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;

    clearErrors();
    setIsResending(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (error) {
      setErrorMessage(extractClerkErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const handleOAuth = async (provider: OAuthProviderStrategy) => {
    if (!isLoaded) return;

    clearErrors();
    setOauthLoading(provider);

    try {
      await signUp.authenticateWithRedirect({
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
      title="إنشاء حساب"
      subtitle="أنشئ حسابك وابدأ بتتبع تجارب القهوة بكل تفاصيلها"
    >
      {step === "done" ? (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <CheckCircle2 size={44} className="text-accent" />
          <h3 className="font-display text-xl text-foreground">تم إنشاء الحساب بنجاح</h3>
          <p className="text-sm text-muted-foreground">أهلاً بك. سيتم تحويلك الآن إلى التطبيق.</p>
        </div>
      ) : (
        <>
          <AuthStepIndicator step={stepNumber} />

          {errorMessage && <AuthErrorBanner message={errorMessage} />}

          {step === "form" ? (
            <form className="flex flex-col gap-3" onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AuthField label="الاسم الأول">
                  <AuthTextInput
                    icon={<User size={17} />}
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="الاسم الأول"
                    autoComplete="given-name"
                    required
                  />
                </AuthField>

                <AuthField label="اسم العائلة">
                  <AuthTextInput
                    icon={<User size={17} />}
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="اسم العائلة"
                    autoComplete="family-name"
                    required
                  />
                </AuthField>
              </div>

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

              <AuthField label="كلمة المرور">
                <AuthTextInput
                  icon={<Lock size={17} />}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8 أحرف على الأقل"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </AuthField>

              <div
                id="clerk-captcha"
                className="mt-1"
                data-cl-theme="auto"
                data-cl-size="flexible"
                data-cl-language="auto"
              />

              <AuthPrimaryButton
                disabled={isSubmitting || oauthLoading !== null}
                loading={isSubmitting}
                loadingText="جاري إنشاء الحساب..."
              >
                إنشاء الحساب وإرسال الرمز
              </AuthPrimaryButton>
            </form>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={handleVerifyOtp}>
              <p className="text-center text-sm text-muted-foreground">
                أدخل رمز التحقق المرسل إلى {email.trim()}
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
                    clearErrors();
                  }}
                  disabled={isSubmitting}
                >
                  رجوع
                </AuthSecondaryLinkButton>
              </div>
            </form>
          )}

          <AuthDivider label="أو استخدم" />

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
            لديك حساب بالفعل؟{" "}
            <Link className="font-bold text-accent hover:underline" to="/sign-in">
              تسجيل الدخول
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
