import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { SalaryCalculator } from './components/SalaryCalculator';
import { SettlementCalculator } from './components/SettlementCalculator';
import { IndemnityCalculator } from './components/IndemnityCalculator';
import { History } from './components/History';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalGuide } from './components/LegalGuide';
import { CurrencyConverter } from './components/CurrencyConverter';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc, onSnapshot } from './firebase';
import { AuthScreen } from './components/Auth';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    // Real-time role tracking
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setRole(doc.data().role);
      }
    }, (error) => {
      console.error("Error fetching user role:", error);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    // Auto-redirect admin levels to dashboard if they are on home
    const isAnyAdminLevel = role && ['super_admin', 'admin', 'moderator'].includes(role);
    if (isAnyAdminLevel && activeTab === 'home') {
      setActiveTab('admin');
    }
  }, [role, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], borderRadius: ["20%", "50%", "20%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 bg-primary shadow-[0_0_40px_rgba(255,77,77,0.4)]"
        ></motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const toggleTheme = () => setIsDark(!isDark);
  const hasAdminAccess = role && ['super_admin', 'admin', 'moderator'].includes(role);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500"
      >
        <Layout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDark={isDark} 
          toggleTheme={toggleTheme}
          isAdmin={!!hasAdminAccess}
          role={role}
        >
          {activeTab === 'home' && (
            <Home 
              setActiveTab={setActiveTab} 
              isDark={isDark} 
              toggleTheme={toggleTheme} 
            />
          )}
          {activeTab === 'salary' && <SalaryCalculator />}
          {activeTab === 'settlement' && <SettlementCalculator />}
          {activeTab === 'indemnity' && <IndemnityCalculator />}
          {activeTab === 'legal' && <LegalGuide />}
          {activeTab === 'currency' && <CurrencyConverter />}
          {activeTab === 'history' && <History />}
          {activeTab === 'admin' && hasAdminAccess && (
            <AdminDashboard onBack={() => setActiveTab('home')} userRole={role} />
          )}
        </Layout>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
