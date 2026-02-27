import { SignIn } from "@clerk/clerk-react";
import { AuthShell } from "./auth/AuthShell";
import { clerkAuthPageAppearance } from "./auth/clerkTheme";

export function SignInPage() {
  return (
    <AuthShell subtitle="سجّل دخولك لبدء رحلتك مع القهوة المختصة">
      <SignIn
        appearance={clerkAuthPageAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
