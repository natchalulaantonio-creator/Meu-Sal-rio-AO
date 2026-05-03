import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Download, 
  Calendar,
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { calculateVacation, calculateIndemnity } from '../lib/utils';
import { generateProfessionalPDF } from '../lib/pdfService';
import { auth, db, addDoc, collection, serverTimestamp } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const formatKz = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0
  }).format(value);
};

export const SettlementCalculator = () => {
  const [user] = useAuthState(auth);
  const [salary, setSalary] = useState<string>('0');
  const [months, setMonths] = useState<string>('0');
  const [years, setYears] = useState<string>('0');
  const [exitType, setExitType] = useState<'fair' | 'unfair'>('fair');

  const vacationVal = calculateVacation(parseFloat(salary) || 0, parseFloat(months) || 0);
  const indemnityVal = calculateIndemnity(parseFloat(salary) || 0, parseFloat(years) || 0, exitType);
  const thirteenthVal = (parseFloat(salary) || 0) * (parseFloat(months) || 0) / 12;
  const totalVal = vacationVal + indemnityVal + thirteenthVal;

  const saveSimulation = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'calculations'), {
        userId: user.uid,
        salary,
        vacation: vacationVal,
        indemnity: indemnityVal,
        thirteenth: thirteenthVal,
        total: totalVal,
        type: 'fecho',
        createdAt: serverTimestamp()
      });
      alert('Simulação de fecho guardada!');
    } catch (e) {
      import('../firebase').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.CREATE, 'calculations');
      });
    }
  };

  const exportPDF = () => {
    generateProfessionalPDF({
      title: 'Relatório de Fecho de Contas',
      userName: user?.displayName || 'Trabalhador Angolano',
      details: [
        { label: 'Salário Base', value: formatKz(parseFloat(salary)) },
        { label: 'Tempo de Serviço (Anos)', value: years },
        { label: 'Meses Trabalhados no Ciclo', value: months },
        { label: 'Tipo de Saída', value: exitType === 'fair' ? 'Cessação Normal/Acordo' : 'Despedimento s/ Justa Causa' },
        { label: 'Indemnização', value: formatKz(indemnityVal) },
        { label: 'Subv. Férias Proporcionais', value: formatKz(vacationVal) },
        { label: '13º Mês Proporcional', value: formatKz(thirteenthVal) },
      ],
      summary: [
        { label: 'TOTAL A RECEBER NO FECHO', value: formatKz(totalVal) }
      ]
    });
  };

  return (
    <div className="space-y-8 sm:space-y-12 page-transition">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 pb-8 md:pb-10 border-b-4 border-primary/20 dark:border-white/10 transition-colors">
        <div className="space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Cálculo de Demissão
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Fecho de Contas</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-sm sm:text-base">Calcula o valor total a receber no final do teu contrato laboral.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={exportPDF} className="w-full sm:w-auto btn-primary rounded-xl sm:rounded-full group py-3 px-6 text-[10px] sm:text-xs">
            <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> 
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Salário Mensal Base</span>
              <input 
                type="number" 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)}
                className="input-field"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Meses Trabalhados este Ano</span>
              <input 
                type="number" 
                value={months} 
                onChange={(e) => setMonths(e.target.value)}
                className="input-field"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Anos Totais na Empresa</span>
              <input 
                type="number" 
                value={years} 
                onChange={(e) => setYears(e.target.value)}
                className="input-field"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Tipo de Saída</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setExitType('fair')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    exitType === 'fair' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                >
                  Acordo / Término
                </button>
                <button 
                  onClick={() => setExitType('unfair')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    exitType === 'unfair' 
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                  }`}
                >
                  Sem Justa Causa
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-500 text-sm">Atenção!</h4>
              <p className="text-xs text-amber-800 dark:text-amber-200/60 leading-relaxed mt-1">
                Para despedimentos com justa causa previstos na LGT, o trabalhador pode não ter direito à indemnização.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="bg-primary p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Valor Total Bruto</span>
                <h3 className="text-5xl font-bold mt-2">{formatKz(totalVal)}</h3>
              </div>
              <Briefcase className="absolute -right-4 -bottom-4 text-white/10" size={160} />
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Férias</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{formatKz(vacationVal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">13º Mês</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{formatKz(thirteenthVal)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Indemnização</span>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{formatKz(indemnityVal)}</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                 <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <CheckCircle2 className="text-emerald-500" size={20} />
                   Itens Incluídos
                 </h4>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {['Férias não gozadas', 'Proporcionais de férias', 'Subsídio de Natal', 'Indemnização p/ Antiguidade'].map(item => (
                     <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" />
                       {item}
                     </li>
                   ))}
                 </ul>
               </div>

               {user && (
                 <button onClick={saveSimulation} className="w-full btn-secondary bg-slate-100 dark:bg-white/5 dark:text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                   <History size={18} /> Salvar no Histórico
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
