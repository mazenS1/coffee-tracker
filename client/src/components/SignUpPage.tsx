import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { AuthLayout } from "./AuthLayout";

/**
 * Custom Arabic sign up page for Clerk.
 */
export function SignUpPage() {
  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="ابدأ في توثيق تجارب القهوة الخاصة بك بخطوات بسيطة."
    >
      <SignUp.Root
        path="/sign-up"
        routing="path"
      >
        <SignUp.Step name="start" className="auth-elements-step">
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

          <div className="auth-elements-grid">
            <Clerk.Field
              name="firstName"
              className="auth-elements-field"
              alwaysShow
            >
              <Clerk.Label className="auth-elements-label">الاسم الأول</Clerk.Label>
              <Clerk.Input className="auth-elements-input" placeholder="أحمد" />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>

            <Clerk.Field
              name="lastName"
              className="auth-elements-field"
              alwaysShow
            >
              <Clerk.Label className="auth-elements-label">اسم العائلة</Clerk.Label>
              <Clerk.Input className="auth-elements-input" placeholder="محمد" />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>
          </div>

          <Clerk.Field name="emailAddress" className="auth-elements-field" alwaysShow>
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

          <Clerk.Field name="password" className="auth-elements-field" alwaysShow>
            <Clerk.Label className="auth-elements-label">كلمة المرور</Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              validatePassword
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.GlobalError className="auth-elements-global-error" />
          <SignUp.Captcha className="auth-elements-captcha" />

          <SignUp.Action submit className="auth-elements-submit">
            إنشاء الحساب
          </SignUp.Action>

          <p className="auth-elements-footnote">
            لديك حساب بالفعل؟{" "}
            <Clerk.Link navigate="sign-in" className="auth-elements-inline-link">
              تسجيل الدخول
            </Clerk.Link>
          </p>
        </SignUp.Step>

        <SignUp.Step name="continue" className="auth-elements-step">
          <h3 className="auth-elements-step-title">خطوة أخيرة</h3>
          <p className="auth-elements-hint">
            أكمل البيانات المطلوبة للمتابعة.
          </p>

          <Clerk.Field name="username" className="auth-elements-field" alwaysShow>
            <Clerk.Label className="auth-elements-label">اسم المستخدم</Clerk.Label>
            <Clerk.Input
              className="auth-elements-input"
              autoComplete="username"
              placeholder="coffee_lover"
            />
            <Clerk.FieldError className="auth-elements-error" />
          </Clerk.Field>

          <Clerk.GlobalError className="auth-elements-global-error" />

          <SignUp.Action submit className="auth-elements-submit">
            متابعة
          </SignUp.Action>
        </SignUp.Step>

        <SignUp.Step name="verifications" className="auth-elements-step">
          <SignUp.Strategy name="email_code">
            <h3 className="auth-elements-step-title">تحقق من بريدك الإلكتروني</h3>
            <p className="auth-elements-hint">
              أدخل رمز التحقق الذي وصلك عبر البريد.
            </p>

            <Clerk.Field name="code" className="auth-elements-field">
              <Clerk.Label className="auth-elements-label">رمز التحقق</Clerk.Label>
              <Clerk.Input type="otp" autoSubmit className="auth-elements-otp" />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>

            <Clerk.GlobalError className="auth-elements-global-error" />

            <SignUp.Action submit className="auth-elements-submit">
              تأكيد الرمز
            </SignUp.Action>

            <SignUp.Action
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
            </SignUp.Action>
          </SignUp.Strategy>

          <SignUp.Strategy name="phone_code">
            <h3 className="auth-elements-step-title">تحقق من رقم الهاتف</h3>

            <Clerk.Field name="code" className="auth-elements-field">
              <Clerk.Label className="auth-elements-label">رمز التحقق</Clerk.Label>
              <Clerk.Input type="otp" autoSubmit className="auth-elements-otp" />
              <Clerk.FieldError className="auth-elements-error" />
            </Clerk.Field>

            <Clerk.GlobalError className="auth-elements-global-error" />

            <SignUp.Action submit className="auth-elements-submit">
              تأكيد الرمز
            </SignUp.Action>
          </SignUp.Strategy>

          <SignUp.Strategy name="email_link">
            <h3 className="auth-elements-step-title">افتح بريدك الإلكتروني</h3>
            <p className="auth-elements-hint">
              أرسلنا رابط تحقق، افتحه في نفس الجهاز لإكمال إنشاء الحساب.
            </p>
          </SignUp.Strategy>
        </SignUp.Step>
      </SignUp.Root>
    </AuthLayout>
  );
}
