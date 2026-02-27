import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { AuthLayout } from "./AuthLayout";

/**
 * Custom Arabic sign in page for Clerk.
 */
export function SignInPage() {
  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أدخل بياناتك للوصول إلى سجل القهوة الخاص بك."
    >
      <SignIn.Root
        path="/sign-in"
        routing="path"
      >
        <SignIn.Step name="start" className="auth-elements-step">
          <Clerk.Connection
            name="google"
            className="auth-elements-social-button"
          >
            <Clerk.Icon className="auth-elements-provider-icon" />
            <span>المتابعة باستخدام Google</span>
          </Clerk.Connection>

          <div className="auth-elements-divider">
            <span>أو</span>
          </div>

          <Clerk.Field name="identifier" className="auth-elements-field">
            <Clerk.Label className="auth-elements-label">
              البريد الإلكتروني
            </Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.Field name="password" className="auth-elements-field">
            <Clerk.Label className="auth-elements-label">كلمة المرور</Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.GlobalError className="auth-elements-global-error" />

          <SignIn.Action submit className="auth-elements-submit">
            تسجيل الدخول
          </SignIn.Action>

          <SignIn.Action
            navigate="forgot-password"
            type="button"
            className="auth-elements-link-button"
          >
            نسيت كلمة المرور؟
          </SignIn.Action>

          <p className="auth-elements-footnote">
            ليس لديك حساب؟{" "}
            <Clerk.Link navigate="sign-up" className="auth-elements-inline-link">
              إنشاء حساب
            </Clerk.Link>
          </p>
        </SignIn.Step>

        <SignIn.Step name="choose-strategy" className="auth-elements-step">
          <h3 className="auth-elements-step-title">اختر طريقة التحقق</h3>

          <SignIn.SupportedStrategy name="password" asChild>
            <button type="button" className="auth-elements-secondary-button">
              المتابعة بكلمة المرور
            </button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy name="email_code" asChild>
            <button type="button" className="auth-elements-secondary-button">
              إرسال رمز عبر البريد الإلكتروني
            </button>
          </SignIn.SupportedStrategy>

          <SignIn.Action
            navigate="previous"
            type="button"
            className="auth-elements-link-button"
          >
            رجوع
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name="forgot-password" className="auth-elements-step">
          <h3 className="auth-elements-step-title">استعادة الحساب</h3>
          <p className="auth-elements-hint">
            سنرسل رمز تحقق إلى بريدك الإلكتروني لإعادة تعيين كلمة المرور.
          </p>

          <SignIn.SupportedStrategy name="reset_password_email_code" asChild>
            <button type="button" className="auth-elements-submit">
              إرسال رمز التحقق
            </button>
          </SignIn.SupportedStrategy>

          <SignIn.Action
            navigate="start"
            type="button"
            className="auth-elements-link-button"
          >
            العودة لتسجيل الدخول
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name="reset-password" className="auth-elements-step">
          <h3 className="auth-elements-step-title">تعيين كلمة مرور جديدة</h3>

          <Clerk.Field name="password" className="auth-elements-field">
            <Clerk.Label className="auth-elements-label">
              كلمة المرور الجديدة
            </Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.Field name="confirmPassword" className="auth-elements-field">
            <Clerk.Label className="auth-elements-label">
              تأكيد كلمة المرور
            </Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.GlobalError className="auth-elements-global-error" />

          <SignIn.Action submit className="auth-elements-submit">
            حفظ كلمة المرور
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name="verifications" className="auth-elements-step">
          <SignIn.Strategy name="password">
            <h3 className="auth-elements-step-title">تأكيد الهوية</h3>

            <Clerk.Field name="password" className="auth-elements-field">
              <Clerk.Label className="auth-elements-label">كلمة المرور</Clerk.Label>
              <Clerk.Input
                className="auth-elements-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>

            <Clerk.GlobalError className="auth-elements-global-error" />

            <SignIn.Action submit className="auth-elements-submit">
              تأكيد تسجيل الدخول
            </SignIn.Action>
          </SignIn.Strategy>

          <SignIn.Strategy name="email_code">
            <h3 className="auth-elements-step-title">أدخل رمز التحقق</h3>
            <p className="auth-elements-hint">
              أرسلنا رمزاً إلى <strong><SignIn.SafeIdentifier /></strong>
            </p>

            <Clerk.Field name="code" className="auth-elements-field">
              <Clerk.Label className="auth-elements-label">رمز التحقق</Clerk.Label>
              <Clerk.Input type="otp" autoSubmit className="auth-elements-otp" />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>

            <Clerk.GlobalError className="auth-elements-global-error" />

            <SignIn.Action submit className="auth-elements-submit">
              تأكيد الرمز
            </SignIn.Action>

            <SignIn.Action
              resend
              type="button"
              className="auth-elements-link-button"
              fallback={({ resendableAfter }) => (
                <span className="auth-elements-resend-wait">
                  يمكنك إعادة الإرسال خلال {resendableAfter} ثانية
                </span>
              )}
            >
              إعادة إرسال الرمز
            </SignIn.Action>
          </SignIn.Strategy>
        </SignIn.Step>
      </SignIn.Root>
    </AuthLayout>
  );
}
