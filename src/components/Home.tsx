import React from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  FileText, 
  ShieldCheck, 
  TrendingUp,
  ArrowRight,
  Shield,
  Star,
  Users,
  Moon,
  Sun,
  History,
  Clock,
  Sparkles,
  BookOpen,
  RefreshCw
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex items-center gap-4 group cursor-default"
  >
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg transition-transform group-hover:scale-110 duration-500`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{value}</p>
    </div>
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  show: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const Home = ({ setActiveTab, isDark, toggleTheme }: any) => {
  return (
    <div className="space-y-24 page-transition pb-20">
      <header className="relative pt-12 pb-6">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
        
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-8 lg:space-y-10 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-100"></span>
                </div>
                Portal de Finanças Angola 2026
              </motion.div>
              
              <motion.button 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
              >
                {isDark ? <Sun size={14} className="text-accent" /> : <Moon size={14} className="text-blue-400" />}
                {isDark ? 'Luz' : 'Trevas'}
              </motion.button>
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-7xl lg:text-[85px] font-black text-slate-900 dark:text-white leading-[0.9] lg:leading-[0.85] tracking-tighter">
                SALÁRIO <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 dark:from-slate-800 dark:via-slate-600 dark:to-slate-800">TRANSPARENTE.</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 text-lg sm:text-2xl font-medium leading-[1.3] max-w-xl"
            >
              Não adivinhes o teu futuro. <span className="text-slate-900 dark:text-white font-black underline decoration-primary/30 underline-offset-8">Simula o teu valor real</span> com os algoritmos mais avançados da LGT Angolana. 
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-8 pt-4"
            >
              <button 
                onClick={() => setActiveTab('salary')}
                className="btn-primary scale-110 !px-10 group"
              >
                Simular Rendimento <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col gap-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                      className="w-10 h-10 rounded-xl border-4 border-white dark:border-slate-950 bg-white overflow-hidden shadow-sm"
                    >
                      <img src={`https://i.pravatar.cc/150?img=${i+20}`} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Confiança total em Angola</p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="flex-1 w-full lg:w-auto relative"
          >
            <div className="absolute inset-0 bg-primary/20 dark:bg-primary/40 rounded-[60px] blur-[80px] -z-10 animate-pulse"></div>
            <div className="glass-card p-12 relative overflow-hidden group border-4 border-white dark:border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} />
              </div>
              <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-primary dark:text-accent uppercase tracking-[0.3em]">Smart Insight</h4>
                    <p className="text-sm font-bold text-slate-500">Proposta Salarial Ideal</p>
                  </div>
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-end justify-between border-b-2 border-slate-50 dark:border-white/5 pb-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salário Bruto</p>
                       <p className="text-4xl font-black text-slate-900 dark:text-white">850.000 <span className="text-lg opacity-40">Kz</span></p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-black text-red-500 uppercase">Dedução IRT</p>
                       <p className="text-lg font-bold text-slate-900 dark:text-white">- 115.420 Kz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-primary rounded-[32px] text-white shadow-2xl shadow-primary/40 transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">Líquido Mensal</p>
                      <p className="text-4xl font-black">709.080 Kz</p>
                    </div>
                    <Star className="opacity-40 animate-spin-slow" size={32} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Simulação Real-Time</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="p-3 bg-slate-900 text-white rounded-2xl"
                  >
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="divider-mono">
        <div className="divider-line"></div>
        Arsenal de Cálculo
        <div className="divider-line"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
      >
        <ToolCard 
          icon={<TrendingUp className="text-primary" size={32} />}
          title="Salário Líquido"
          desc="Calcula rendimentos, IRT, INSS e subsídios aplicáveis."
          onClick={() => setActiveTab('salary')}
          number="01"
          color="emerald"
          className="lg:col-span-2 lg:row-span-2 min-h-[400px]"
          isLarge
        />
        <ToolCard 
          icon={<FileText className="text-amber-500" size={32} />}
          title="Fecho Contas"
          desc="Proporcionais de férias e bónus."
          onClick={() => setActiveTab('settlement')}
          number="02"
          color="amber"
          className="lg:col-span-1"
        />
        <ToolCard 
          icon={<BookOpen className="text-blue-500" size={32} />}
          title="Guia Jurídico"
          desc="Explore a LGT 2026 e os teus direitos."
          onClick={() => setActiveTab('legal')}
          number="03"
          color="blue"
          className="lg:col-span-1"
        />
        <ToolCard 
          icon={<RefreshCw className="text-emerald-500" size={32} />}
          title="Conversor"
          desc="Câmbio AOA/USD/EUR em tempo real."
          onClick={() => setActiveTab('currency')}
          number="04"
          color="emerald"
          className="lg:col-span-1"
        />
        <ToolCard 
          icon={<ShieldCheck className="text-red-500" size={32} />}
          title="Indemnização"
          desc="Direitos de rescisão LGT 2026."
          onClick={() => setActiveTab('indemnity')}
          number="05"
          color="red"
          className="lg:col-span-2 min-h-[200px]"
        />
      </motion.div>

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12"
      >
        <div className="glass-card p-10 space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <ShieldCheck size={32} />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">Compliance 2026</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Algoritmos validados segundo a nova Lei Geral do Trabalho e tabelas de IRT actuais.
          </p>
        </div>

        <div className="glass-card p-10 space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
            <Users size={32} />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">Foco no Utilizador</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Interface desenhada para ser intuitiva tanto para RHs como para trabalhadores individuais.
          </p>
        </div>

        <div className="glass-card p-10 space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
            <Shield size={32} />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">Privacidade Total</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Os teus dados são processados com segurança total e nunca partilhados com terceiros.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ToolCard = ({ icon, title, desc, onClick, number, color, className = "", isLarge = false }: any) => {
  const getGlow = () => {
    switch(color) {
      case 'emerald': return 'group-hover:bg-primary/20';
      case 'amber': return 'group-hover:bg-amber-500/20';
      case 'red': return 'group-hover:bg-red-500/20';
      case 'blue': return 'group-hover:bg-blue-500/20';
      default: return 'group-hover:bg-primary/20';
    }
  };

  return (
    <motion.button 
      variants={itemVariants}
      onClick={onClick}
      className={`group relative bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-10 rounded-[48px] text-left hover:border-slate-900 dark:hover:border-white transition-all duration-700 hover:shadow-2xl flex flex-col overflow-hidden ${className}`}
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${getGlow()}`}></div>
      
      <div className="absolute top-8 right-10 text-7xl font-black text-slate-50 dark:text-white/5 group-hover:scale-110 group-hover:-translate-x-2 transition-all duration-700 z-0 select-none">
        {number}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-5 bg-white dark:bg-white/10 rounded-3xl w-fit mb-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
          {icon}
        </div>
        
        <div className="mt-8">
          <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black text-slate-900 dark:text-white leading-tight group-hover:translate-x-2 transition-transform duration-500`}>
            {title}
          </h3>
          <p className={`mt-3 text-slate-500 dark:text-slate-400 font-medium leading-relaxed ${isLarge ? 'text-lg max-w-[300px]' : 'text-sm max-w-[200px]'}`}>
            {desc}
          </p>
          
          <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-all duration-500">
            <span className="border-b-2 border-transparent group-hover:border-current transition-all">Abrir Ferramenta</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};


const CheckCircle2 = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
