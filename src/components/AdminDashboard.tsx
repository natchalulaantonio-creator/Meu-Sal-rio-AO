import React, { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  doc,
  getDocFromServer
} from '../firebase';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  ArrowLeft,
  Clock,
  User,
  Calculator
} from 'lucide-react';
import { formatKz } from '../lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export const AdminDashboard = ({ onBack, userRole }: { onBack: () => void, userRole: string | null }) => {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalSimulations: 0,
    lastUpdate: null
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canManageRoles = userRole === 'super_admin';
  const canExport = ['super_admin', 'admin'].includes(userRole || '');

  useEffect(() => {
    // Real-time stats listener
    const unsubStats = onSnapshot(doc(db, 'stats', 'global'), (doc) => {
      if (doc.exists()) {
        setStats(doc.data());
      }
    }, (error) => {
      console.warn("Error fetching global stats:", error.message);
    });

    // Recent users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUsers(users.sort((a: any, b: any) => 
        (b.lastActive?.seconds || 0) - (a.lastActive?.seconds || 0)
      ).slice(0, 20));
      setLoading(false);
    }, (error) => {
      import('../firebase').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
      setLoading(false);
    });

    return () => {
      unsubStats();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-4 border-slate-900 dark:border-white">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Voltar ao Painel
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Área Admin</h2>
            <RoleBadge role={userRole} />
          </div>
          <p className="text-slate-500 font-medium max-w-md">Controlo centralizado de métricas e utilizadores da KwanzaSalary.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="p-4 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 rotate-3">
             <ShieldCheck size={32} />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<Users size={24} />} 
          label="Total Utilizadores" 
          value={stats.totalUsers || recentUsers.length} 
          trend="+12%" 
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Simulações Realizadas" 
          value={stats.totalSimulations || "150+"} 
          trend="+5%" 
        />
        <StatCard 
          icon={<Activity size={24} />} 
          label="Actividade Hoje" 
          value="Calculando..." 
          isLive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Utilizadores do Sistema
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{recentUsers.length} visíveis</span>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-3xl flex items-center justify-between hover:border-primary transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name} {u.surname}</p>
                      <RoleBadge role={u.role} size="sm" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono italic">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Accão</p>
                  <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                    {u.lastActive?.seconds ? format(new Date(u.lastActive.seconds * 1000), 'HH:mm (dd MMM)', { locale: pt }) : 'Recentemente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-primary/10 rounded-[48px] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
          <BarChart3 className="absolute -top-10 -right-10 text-white/5 w-64 h-64 rotate-12 transition-transform group-hover:rotate-6 duration-700" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tight mb-4 text-white">Relatório de IA</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-10">
              {canExport 
                ? "Como administrador, tens acesso total à exportação de dados analíticos para planeamento estratégico."
                : "Acesso limitado. O teu cargo de moderador permite apenas a visualização de métricas em tempo real."}
            </p>
            <div className="space-y-4">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-primary shadow-[0_0_20px_rgba(255,77,77,0.5)]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                <span>Capacidade Base</span>
                <span>65% Utilizado</span>
              </div>
            </div>
          </div>
          {canExport && (
            <button className="relative z-10 mt-12 w-full py-5 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-2xl">
              Exportar Médias Mensais (CSV)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role, size = 'default' }: { role: string | null, size?: 'sm' | 'default' }) => {
  const styles: any = {
    super_admin: "bg-red-500 text-white border-red-400",
    admin: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-white",
    moderator: "bg-emerald-500 text-white border-emerald-400",
    customer: "bg-slate-100 dark:bg-white/10 text-slate-400 border-slate-200 dark:border-white/5"
  };

  return (
    <span className={`
      inline-flex items-center font-black uppercase tracking-widest border rounded
      ${styles[role || 'customer']}
      ${size === 'sm' ? 'text-[7px] px-1 py-0' : 'text-[9px] px-2 py-0.5'}
    `}>
      {role || 'Customer'}
    </span>
  );
};

const StatCard = ({ icon, label, value, trend, isLive }: any) => (
  <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-10 rounded-[48px] relative overflow-hidden group hover:border-primary transition-all">
    <div className="absolute top-6 right-10 text-slate-50 dark:text-white/5 group-hover:text-primary/5 transition-colors">
       {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">{label}</p>
    <div className="flex items-end gap-3">
      <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
      {isLive && (
        <span className="mb-2 px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-black text-white uppercase tracking-widest animate-pulse">LIVE</span>
      )}
      {trend && (
        <span className="mb-2 text-emerald-500 text-xs font-bold">{trend}</span>
      )}
    </div>
  </div>
);
