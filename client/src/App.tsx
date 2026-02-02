import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Coffee as CoffeeIcon, Search, Loader2 } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useCoffeeStore } from "./store/coffeeStore";
import { CoffeeCard } from "./components/CoffeeCard";
import { CoffeeDetail } from "./components/CoffeeDetail";
import { AddCoffeeForm } from "./components/AddCoffeeForm";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider } from "./components/AuthProvider";
import "./App.css";

function AppContent() {
  const [showAddCoffee, setShowAddCoffee] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    coffees,
    selectedCoffee,
    isLoading,
    error,
    fetchCoffees,
    fetchRoasters,
    setSelectedCoffee,
  } = useCoffeeStore();

  // Fetch coffees and roasters on mount
  useEffect(() => {
    fetchCoffees();
    fetchRoasters();
  }, [fetchCoffees, fetchRoasters]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoffees({ search: searchQuery || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCoffees]);

  const totalCups = coffees.reduce((acc, c) => acc + (c._count?.cups || 0), 0);

  return (
    <div className="app" dir="rtl">
      <div className="background-pattern" />
      <div className="background-glow" />

      <AnimatePresence mode="wait">
        {selectedCoffee ? (
          <CoffeeDetail
            key="detail"
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
              <motion.div
                className="logo"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="logo-icon">
                  <CoffeeIcon size={32} />
                </div>
                <div className="logo-text">
                  <h1>دفتر القهوة</h1>
                  <p>سجّل رحلتك مع القهوة المختصة</p>
                </div>
              </motion.div>

              <div className="header-actions">
                <motion.div
                  className="header-stats"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                <ThemeToggle />
                
                {/* Clerk Auth UI */}
                <motion.div
                  className="auth-buttons"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="auth-button sign-in">تسجيل الدخول</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="auth-button sign-up">إنشاء حساب</button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: {
                            width: 40,
                            height: 40,
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
                  <SignInButton mode="modal">
                    <motion.button
                      className="empty-add-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      تسجيل الدخول
                    </motion.button>
                  </SignInButton>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
