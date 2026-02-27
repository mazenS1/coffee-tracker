import { SignUp } from "@clerk/clerk-react";
import { AuthShell } from "./auth/AuthShell";
import { clerkAuthPageAppearance } from "./auth/clerkTheme";

export function SignUpPage() {
  return (
    <AuthShell subtitle="أنشئ حسابك وابدأ رحلتك مع القهوة المختصة">
      <SignUp
        appearance={clerkAuthPageAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
