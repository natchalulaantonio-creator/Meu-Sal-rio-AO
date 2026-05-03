import React from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  FileText, 
  Calculator,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, collection, query, where, onSnapshot, deleteDoc, doc } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatKz } from '../lib/utils';

export const History = () => {
  const [user] = useAuthState(auth);
  const [calculations, setCalculations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'calculations'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalculations(items.sort((a, b) => {
        const dateA = (a as any).createdAt?.seconds || 0;
        const dateB = (b as any).createdAt?.seconds || 0;
        return dateB - dateA;
      }));
      setLoading(false);
    }, (error) => {
      import('../firebase').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(error, OperationType.GET, 'calculations');
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteCalculation = async (id: string) => {
    if (!confirm('Eliminar esta simulação permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'calculations', id));
    } catch (e) {
      import('../firebase').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.DELETE, `calculations/${id}`);
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 page-transition">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-4 border-slate-900 dark:border-white transition-colors">
        <div>
          <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4 uppercase">Teu Arquivo</h2>
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Histórico de Cálculos & Simulações</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Registos</p>
             <p className="text-2xl font-black text-slate-900 dark:text-white">{calculations.length}</p>
           </div>
           <div className="w-px h-10 bg-slate-200 dark:bg-white/10"></div>
           <HistoryIcon className="text-primary hidden md:block" size={40} />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 dark:border-white/5 border-t-slate-900 dark:border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Dados...</p>
        </div>
      ) : calculations.length === 0 ? (
        <div className="bg-white dark:bg-white/5 rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200 dark:border-white/10">
          <Search className="mx-auto text-slate-300 dark:text-slate-800 mb-6" size={80} />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Arquivo Vazio</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto text-sm">Ainda não tens simulações guardadas. Começa a calcular para preencheres o teu arquivo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {calculations.map((calc, idx) => (
            <motion.div 
              key={calc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 p-8 rounded-[40px] hover:border-slate-900 dark:hover:border-white transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 dark:bg-white/10 rounded-full group-hover:bg-primary/5 transition-colors -z-0"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-10">
                  <div className={`p-4 rounded-2xl ${calc.type === 'salario' ? 'bg-slate-900 dark:bg-primary text-white' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}>
                    {calc.type === 'salario' ? <Calculator size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Cálculo</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {calc.createdAt?.seconds ? format(new Date(calc.createdAt.seconds * 1000), "dd/MM/yyyy", { locale: pt }) : 'Recentemente'}
                    </p>
                  </div>
                </div>

                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                     {calc.type === 'salario' ? 'Rendimento Líquido' : 'Total Rescisão'}
                   </p>
                   <div className="flex items-end justify-between">
                     <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                       {formatKz(calc.type === 'salario' ? calc.net : (calc.total || calc.net))}
                     </h4>
                     <button 
                        onClick={() => deleteCalculation(calc.id)}
                        className="p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex gap-4">
                   <div className="flex-1 px-4 py-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-transparent rounded-xl text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                     IRT: {formatKz(calc.irt || 0)}
                   </div>
                   <div className="flex-1 px-4 py-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-transparent rounded-xl text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                     INSS: {formatKz(calc.inss || 0)}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
