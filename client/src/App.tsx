import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Coffee as CoffeeIcon,
  Search,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  AuthenticateWithRedirectCallback,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useCoffeeStore } from "./store/coffeeStore";
import { CoffeeCard } from "./components/CoffeeCard";
import { CoffeeDetail } from "./components/CoffeeDetail";
import { AddCoffeeForm } from "./components/AddCoffeeForm";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider } from "./components/AuthProvider";
import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";
import "./App.css";

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
  } = useCoffeeStore();

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
    const timer = setTimeout(() => {
      fetchCoffees({ search: searchQuery || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCoffees, isLoaded, isSignedIn]);

  const totalCups = coffees.reduce((acc, c) => acc + (c._count?.cups || 0), 0);

  return (
    <div className="app" dir="rtl">
      <div className="background-pattern" />
      <div className="background-glow" />

      <AnimatePresence mode="wait">
        {selectedCoffeeId ? (
          <CoffeeDetail
            key={`detail-${selectedCoffeeId}`}
            coffeeId={selectedCoffeeId}
            coffee={selectedCoffee}
            onBack={() => setSelectedCoffee(null)}
          />
        ) : (
          <motion.main
            key="home"
            className="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="app-header">
              <div className="header-leading">
                <motion.div
                  className="header-stats"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="header-stat">
                    <span className="stat-number">{coffees.length}</span>
                    <span className="stat-text">قهوة</span>
                  </div>
                  <div className="header-stat">
                    <span className="stat-number">{totalCups}</span>
                    <span className="stat-text">فنجان</span>
                  </div>
                </motion.div>
              </div>

              <motion.h1
                className="app-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                دفتر القهوة
              </motion.h1>

              <div className="header-trailing">
                <ThemeToggle />

                <motion.div
                  className="auth-buttons"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SignedOut>
                    <Link to="/sign-in" className="auth-button sign-in">
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
                            border: "2px solid var(--accent, #c68b3c)",
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
              className="search-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Search size={20} />
              <input
                type="text"
                placeholder="ابحث عن قهوة، محمصة، أو بلد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <SignedIn>
              <section className="coffees-grid">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <motion.div
                      className="loading-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="spinner" size={48} />
                      <p>جاري التحميل...</p>
                    </motion.div>
                  ) : coffees.length === 0 && !searchQuery ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="empty-illustration">
                        <CoffeeIcon size={64} />
                      </div>
                      <h2>ابدأ رحلتك</h2>
                      <p>أضف أول قهوة لك وابدأ بتتبع تجاربك</p>
                      <motion.button
                        className="empty-add-button"
                        onClick={() => setShowAddCoffee(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={20} />
                        إضافة قهوة جديدة
                      </motion.button>
                    </motion.div>
                  ) : coffees.length === 0 ? (
                    <motion.div
                      className="no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Search size={48} />
                      <p>لم نجد نتائج لـ "{searchQuery}"</p>
                    </motion.div>
                  ) : (
                    coffees.map((coffee, index) => (
                      <CoffeeCard
                        key={coffee.id}
                        coffee={coffee}
                        index={index}
                        onClick={() => setSelectedCoffee(coffee.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </section>

              {coffees.length > 0 && (
                <motion.button
                  className="fab"
                  onClick={() => setShowAddCoffee(true)}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={28} />
                </motion.button>
              )}
            </SignedIn>

            <SignedOut>
              <motion.section
                className="signed-out-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="empty-illustration">
                  <CoffeeIcon size={64} />
                </div>
                <h2>مرحباً بك في دفتر القهوة</h2>
                <p>سجّل دخولك لبدء تتبع رحلتك مع القهوة المختصة</p>
                <div className="signed-out-actions">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/sign-in" className="empty-add-button">
                      تسجيل الدخول
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/sign-up" className="secondary-auth-button">
                      إنشاء حساب
                    </Link>
                  </motion.div>
                </div>
              </motion.section>
            </SignedOut>
          </motion.main>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddCoffee && (
          <AddCoffeeForm onClose={() => setShowAddCoffee(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SignedOutOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="auth-page" dir="rtl">
        <div className="auth-background" />
        <div className="auth-container">
          <div className="auth-card auth-loading-card">
            <Loader2 className="spinner" size={30} />
            <p>جاري تحميل المصادقة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function SsoCallbackPage() {
  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-background" />
      <div className="auth-container">
        <div className="auth-card auth-loading-card">
          <div className="auth-callback-icon">
            <ArrowRight size={22} />
          </div>
          <h2 className="auth-callback-title">جاري إتمام تسجيل الدخول</h2>
          <p className="auth-callback-subtitle">لا تغلق هذه الصفحة</p>
          <AuthenticateWithRedirectCallback
            signInFallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>
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
            <SignInPage />
          </SignedOutOnlyRoute>
        }
      />
      <Route
        path="/sign-up"
        element={
          <SignedOutOnlyRoute>
            <SignUpPage />
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
