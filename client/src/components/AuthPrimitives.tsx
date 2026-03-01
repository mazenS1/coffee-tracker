import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AuthLoadingCard({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <Loader2 size={24} className="animate-spin text-accent" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AuthStepIndicator({ step }: { step: number }) {
  return (
    <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
      الخطوة {step} من 3
    </p>
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-2 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-1.5 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}

interface AuthFieldProps {
  label: string;
  children: ReactNode;
}

export function AuthField({ label, children }: AuthFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-secondary-foreground">{label}</span>
      {children}
    </label>
  );
}

interface AuthTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
}

export function AuthTextInput({ icon, className, ...props }: AuthTextInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <Input className={cn("h-9 pr-9", className)} {...props} />
    </div>
  );
}

interface AuthPrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function AuthPrimaryButton({
  children,
  loading = false,
  loadingText = "جاري التنفيذ...",
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <Button className="mt-0.5 h-10 w-full text-sm font-bold" type="submit" {...props}>
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function AuthSecondaryLinkButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      type="button"
      className="bg-transparent text-xs font-semibold text-accent underline-offset-2 hover:underline disabled:opacity-60"
      {...props}
    />
  );
}

/** Official Google "G" logo SVG (brand colors) */
export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2" aria-hidden="true">
      <span className="h-px bg-border" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <span className="h-px bg-border" />
    </div>
  );
}

interface AuthOAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon: ReactNode;
}

export function AuthOAuthButton({
  loading = false,
  icon,
  children,
  className,
  ...props
}: AuthOAuthButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-muted px-4 text-base font-semibold text-foreground transition-colors hover:bg-card disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

