import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Apple, CheckCircle2, Loader2, Lock, Mail, User } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react";
import { AuthLayout } from "./AuthLayout";
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
        <div className="auth-loading-card">
          <Loader2 size={24} className="spinner" />
          <p>جاري تحميل تجربة إنشاء الحساب...</p>
        </div>
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
        <div className="authx-done">
          <CheckCircle2 size={44} />
          <h3>تم إنشاء الحساب بنجاح</h3>
          <p>أهلاً بك. سيتم تحويلك الآن إلى التطبيق.</p>
        </div>
      ) : (
        <>
          <p className="authx-step-indicator">الخطوة {stepNumber} من 3</p>

          {errorMessage && <div className="authx-error">{errorMessage}</div>}

          {step === "form" ? (
            <form className="authx-form" onSubmit={handleCreateAccount}>
              <div className="authx-name-row">
                <label className="authx-field">
                  <span>الاسم الأول</span>
                  <div className="authx-input-wrap">
                    <User size={17} />
                    <input
                      className="authx-input"
                      type="text"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="الاسم الأول"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </label>

                <label className="authx-field">
                  <span>اسم العائلة</span>
                  <div className="authx-input-wrap">
                    <User size={17} />
                    <input
                      className="authx-input"
                      type="text"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="اسم العائلة"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </label>
              </div>

              <label className="authx-field">
                <span>البريد الإلكتروني</span>
                <div className="authx-input-wrap">
                  <Mail size={17} />
                  <input
                    className="authx-input"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="authx-field">
                <span>كلمة المرور</span>
                <div className="authx-input-wrap">
                  <Lock size={17} />
                  <input
                    className="authx-input"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="8 أحرف على الأقل"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              </label>

              <div
                id="clerk-captcha"
                className="authx-captcha"
                data-cl-theme="auto"
                data-cl-size="flexible"
                data-cl-language="auto"
              />

              <button
                className="authx-primary-btn"
                type="submit"
                disabled={isSubmitting || oauthLoading !== null}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء الحساب وإرسال الرمز"
                )}
              </button>
            </form>
          ) : (
            <form className="authx-form" onSubmit={handleVerifyOtp}>
              <p className="authx-otp-hint">
                أدخل رمز التحقق المرسل إلى {email.trim()}
              </p>
              <label className="authx-field">
                <span>رمز التحقق</span>
                <input
                  className="authx-input authx-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </label>

              <button
                className="authx-primary-btn"
                type="submit"
                disabled={isSubmitting || isResending || oauthLoading !== null}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    جاري التأكيد...
                  </>
                ) : (
                  "تأكيد الرمز"
                )}
              </button>

              <div className="authx-secondary-actions">
                <button
                  className="authx-link-btn"
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting}
                >
                  {isResending ? "جاري إعادة الإرسال..." : "إعادة إرسال الرمز"}
                </button>
                <button
                  className="authx-link-btn"
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setCode("");
                    clearErrors();
                  }}
                  disabled={isSubmitting}
                >
                  رجوع
                </button>
              </div>
            </form>
          )}

          <div className="authx-divider" aria-hidden="true">
            <span />
            <p>أو استخدم</p>
            <span />
          </div>

          <div className="authx-oauth-grid">
            <button
              type="button"
              className="authx-oauth-btn"
              onClick={() => handleOAuth("oauth_google")}
              disabled={isSubmitting || isResending || oauthLoading !== null}
            >
              {oauthLoading === "oauth_google" ? (
                <Loader2 size={16} className="spinner" />
              ) : (
                <span className="authx-oauth-badge">G</span>
              )}
              Google
            </button>
            <button
              type="button"
              className="authx-oauth-btn"
              onClick={() => handleOAuth("oauth_apple")}
              disabled={isSubmitting || isResending || oauthLoading !== null}
            >
              {oauthLoading === "oauth_apple" ? (
                <Loader2 size={16} className="spinner" />
              ) : (
                <Apple size={16} />
              )}
              Apple
            </button>
          </div>

          <p className="authx-switch-link">
            لديك حساب بالفعل؟ <Link to="/sign-in">تسجيل الدخول</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
