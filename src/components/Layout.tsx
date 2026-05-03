import React, { useState } from 'react';
import { 
  Home, 
  Calculator, 
  FileText, 
  History, 
  ShieldCheck, 
  BookOpen,
  RefreshCw,
  Menu, 
  X, 
  User, 
  LogOut,
  TrendingUp,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { auth, signOut } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin?: boolean;
  role?: string | null;
}

export const Layout = ({ children, activeTab, setActiveTab, isDark, toggleTheme, isAdmin, role }: LayoutProps) => {
  const [user] = useAuthState(auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black transition-colors duration-700 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
            <Calculator size={18} />
          </div>
          <span className="font-black text-sm tracking-tighter dark:text-white uppercase">Kwanza</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-slate-900 dark:text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-80 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-white/5 p-8 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center justify-between mb-14 px-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-500 dark:from-primary dark:to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <Calculator size={32} />
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-900 dark:text-white leading-none tracking-tighter">Kwanza</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Salary & Finance</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all text-slate-400 group">
             {isDark ? <Sun size={20} className="group-hover:rotate-90 transition-transform" /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 p-1">
          <SidebarItem 
            icon={<Home size={20} />} 
            label="Início" 
            active={activeTab === 'home'} 
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={<TrendingUp size={20} />} 
            label="Novo Cálculo" 
            active={['salary', 'settlement', 'indemnity'].includes(activeTab)} 
            onClick={() => { setActiveTab('salary'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={<BookOpen size={20} />} 
            label="Guia Jurídico" 
            active={activeTab === 'legal'} 
            onClick={() => { setActiveTab('legal'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={<RefreshCw size={20} />} 
            label="Câmbio / Moedas" 
            active={activeTab === 'currency'} 
            onClick={() => { setActiveTab('currency'); setIsMobileMenuOpen(false); }} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Histórico GERAL" 
            active={activeTab === 'history'} 
            onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }} 
          />
          {isAdmin && (
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Área Administração" 
              active={activeTab === 'admin'} 
              onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} 
              className="mt-6 border-2 border-primary/20 text-primary hover:bg-primary/10"
            />
          )}
        </nav>

        <div className="mt-auto px-1">
          <div className="bg-white dark:bg-white/5 p-5 rounded-[28px] border border-slate-100 dark:border-white/5">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{user.displayName || user.email?.split('@')[0]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                      role === 'super_admin' ? "bg-red-500 text-white" :
                      role === 'admin' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" :
                      role === 'moderator' ? "bg-emerald-500 text-white" :
                      "bg-slate-200 dark:bg-white/10 text-slate-500"
                    )}>
                      {role || 'Customer'}
                    </span>
                    <button 
                      onClick={logout}
                      className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-80 transition-all"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 md:p-12 lg:p-16 pt-24 md:pt-12 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}

const SidebarItem = ({ icon, label, active, onClick, className }: SidebarItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all transition-transform active:scale-95",
      active 
        ? "bg-primary dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-primary/20" 
        : cn("text-slate-400 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-white/2 hover:text-slate-900 dark:hover:text-white border border-transparent", className)
    )}
  >
    {icon}
    <span className="uppercase tracking-widest text-[10px]">{label}</span>
  </button>
);
