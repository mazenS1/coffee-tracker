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
    <p className="mb-4 text-center text-xs font-medium text-muted-foreground">
      الخطوة {step} من 3
    </p>
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-4 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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
    <label className="flex flex-col gap-1.5">
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
      <Input className={cn("pr-9", className)} {...props} />
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
    <Button className="mt-1 h-11 w-full text-sm font-bold" type="submit" {...props}>
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

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2" aria-hidden="true">
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
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 text-sm font-semibold text-foreground transition-colors hover:bg-card disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

