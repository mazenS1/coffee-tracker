import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import { clerkArabicLocalization, clerkGlobalAppearance } from "./components/auth/clerkTheme";
import "./index.css";

document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";
document.body.dir = "rtl";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      localization={clerkArabicLocalization}
      appearance={clerkGlobalAppearance}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
