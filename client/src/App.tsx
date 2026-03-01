import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Coffee as CoffeeIcon,
  BookOpen,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import {
  AuthenticateWithRedirectCallback,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { CoffeeCard } from "./components/CoffeeCard";
import { ThemeToggle } from "./components/ThemeToggle";
import { useCoffeeStore } from "./store/coffeeStore";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useShallow } from "zustand/react/shallow";

const CoffeeDetail = lazy(async () => {
  const module = await import("./components/CoffeeDetail");
  return { default: module.CoffeeDetail };
});

const AddCoffeeForm = lazy(async () => {
  const module = await import("./components/AddCoffeeForm");
  return { default: module.AddCoffeeForm };
});

const SignInPage = lazy(async () => {
  const module = await import("./components/SignInPage");
  return { default: module.SignInPage };
});

const SignUpPage = lazy(async () => {
  const module = await import("./components/SignUpPage");
  return { default: module.SignUpPage };
});

function HomePage() {
  const [showAddCoffee, setShowAddCoffee] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const hasMountedSearch = useRef(false);
  const { isLoaded, isSignedIn } = useAuth();

  const {
    coffees,
    selectedCoffeeId,
    selectedCoffee,
    isLoading,
    error,
    fetchCoffees,
    fetchRoasters,
    setSelectedCoffee,
  } = useCoffeeStore(
    useShallow((state) => ({
      coffees: state.coffees,
      selectedCoffeeId: state.selectedCoffeeId,
      selectedCoffee: state.selectedCoffee,
      isLoading: state.isLoading,
      error: state.error,
      fetchCoffees: state.fetchCoffees,
      fetchRoasters: state.fetchRoasters,
      setSelectedCoffee: state.setSelectedCoffee,
    })),
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchCoffees();
    fetchRoasters();
  }, [fetchCoffees, fetchRoasters, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!hasMountedSearch.current) {
      hasMountedSearch.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      fetchCoffees({ search: searchQuery || undefined });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, fetchCoffees, isLoaded, isSignedIn]);

  const totalCups = useMemo(
    () => coffees.reduce((acc, coffee) => acc + (coffee._count?.cups || 0), 0),
    [coffees],
  );

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-background px-4 pb-4 pt-6 md:px-6"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a2c17' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute -left-1/4 top-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {selectedCoffeeId ? (
          <Suspense fallback={<PageLoadingFallback label="جاري تحميل تفاصيل القهوة..." />}>
            <CoffeeDetail
              key={`detail-${selectedCoffeeId}`}
              coffeeId={selectedCoffeeId}
              coffee={selectedCoffee}
              onBack={() => setSelectedCoffee(null)}
            />
          </Suspense>
        ) : (
          <motion.main
            key="home"
            className="relative z-10 mx-auto w-full max-w-6xl pb-28 md:pb-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="mb-6 flex min-h-12 items-center justify-between gap-2 md:mb-8">
              <motion.div
                className="flex min-w-24 items-stretch gap-1.5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card px-2.5 py-1 text-center md:min-h-[3rem] md:px-3">
                  <div className="flex items-center gap-1">
                    <BookOpen size={11} className="text-accent" />
                    <span className="font-display text-base font-bold text-accent md:text-xl">
                      {coffees.length}
                    </span>
                  </div>
                  <span className="block text-[10px] text-muted-foreground">قهوة</span>
                </div>
                <div className="flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-card px-2.5 py-1 text-center md:min-h-[3rem] md:px-3">
                  <span className="font-display text-base font-bold text-accent md:text-xl">
                    {totalCups}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">فنجان</span>
                </div>
              </motion.div>

              <motion.h1
                className="font-display text-lg font-semibold text-foreground md:text-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                دفتر القهوة
              </motion.h1>

              <div className="flex min-w-24 items-center justify-end gap-2 md:min-w-32">
                <ThemeToggle />
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SignedOut>
                    <Link
                      to="/sign-in"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      دخول
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: {
                            width: 36,
                            height: 36,
                            border: "2px solid var(--color-accent, #c68b3c)",
                          },
                          userButtonPopoverCard: {
                            direction: "rtl",
                          },
                        },
                      }}
                      userProfileMode="modal"
                      userProfileProps={{
                        appearance: {
                          elements: {
                            rootBox: {
                              direction: "rtl",
                            },
                            card: {
                              direction: "rtl",
                            },
                          },
                        },
                      }}
                    />
                  </SignedIn>
                </motion.div>
              </div>
            </header>

            <motion.div
              className="mb-8 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-ring/50 md:mb-10 md:px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Search size={18} className="shrink-0 text-muted-foreground" />
              <Input
                className="h-auto border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                type="text"
                placeholder="ابحث عن قهوة، محمصة، أو بلد..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </motion.div>

            {error ? (
              <motion.div
                className="mb-4 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            ) : null}

            <SignedIn>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      className="col-span-full rounded-xl border border-border bg-card p-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 size={46} className="mx-auto animate-spin text-accent" />
                      <p className="mt-3 text-sm text-muted-foreground">جاري التحميل...</p>
                    </motion.div>
                  ) : coffees.length === 0 && !searchQuery ? (
                    <motion.div
                      className="col-span-full rounded-xl border border-border bg-card p-8 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="mx-auto mb-4 inline-flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30">
                        <CoffeeIcon size={38} />
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-foreground">
                        ابدأ رحلتك
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        أضف أول قهوة لك وابدأ بتتبع تجاربك
                      </p>
                      <Button
                        type="button"
                        className="mt-4"
                        onClick={() => setShowAddCoffee(true)}
                      >
                        <Plus size={18} />
                        إضافة قهوة جديدة
                      </Button>
                    </motion.div>
                  ) : coffees.length === 0 ? (
                    <motion.div
                      className="col-span-full rounded-xl border border-border bg-card p-8 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Search size={40} className="mx-auto text-muted-foreground" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        لم نجد نتائج لـ "{searchQuery}"
                      </p>
                    </motion.div>
                  ) : (
                    coffees.map((coffee, index) => (
                      <CoffeeCard
                        key={coffee.id}
                        coffee={coffee}
                        index={index}
                        onSelect={setSelectedCoffee}
                      />
                    ))
                  )}
                </AnimatePresence>
              </section>

              {coffees.length > 0 ? (
                <motion.button
                  type="button"
                  className="fixed bottom-[calc(1rem+var(--safe-bottom))] left-4 z-20 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground md:bottom-6 md:left-6 md:size-16"
                  onClick={() => setShowAddCoffee(true)}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="إضافة قهوة جديدة"
                >
                  <Plus size={28} />
                </motion.button>
              ) : null}
            </SignedIn>

            <SignedOut>
              <motion.section
                className="rounded-xl border border-border bg-card p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mx-auto mb-4 inline-flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30">
                  <CoffeeIcon size={38} />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  مرحباً بك في دفتر القهوة
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  سجّل دخولك لبدء تتبع رحلتك مع القهوة المختصة
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/sign-in"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/sign-up"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              </motion.section>
            </SignedOut>
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCoffee ? (
          <Suspense fallback={null}>
            <AddCoffeeForm onClose={() => setShowAddCoffee(false)} />
          </Suspense>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PageLoadingFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4" dir="rtl">
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Loader2 className="mx-auto animate-spin text-accent" size={30} />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function SignedOutOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoadingFallback label="جاري تحميل المصادقة..." />;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function SsoCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
          <ArrowRight size={22} />
        </div>
        <h2 className="mt-3 font-display text-2xl text-foreground">جاري إتمام تسجيل الدخول</h2>
        <p className="mt-1 text-sm text-muted-foreground">لا تغلق هذه الصفحة</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/sign-in"
        element={
          <SignedOutOnlyRoute>
            <Suspense fallback={<PageLoadingFallback label="جاري تحميل صفحة الدخول..." />}>
              <SignInPage />
            </Suspense>
          </SignedOutOnlyRoute>
        }
      />
      <Route
        path="/sign-up"
        element={
          <SignedOutOnlyRoute>
            <Suspense fallback={<PageLoadingFallback label="جاري تحميل صفحة التسجيل..." />}>
              <SignUpPage />
            </Suspense>
          </SignedOutOnlyRoute>
        }
      />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
