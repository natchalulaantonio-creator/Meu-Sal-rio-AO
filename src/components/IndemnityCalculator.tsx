import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Info, 
  Scale, 
  HelpCircle,
  FileWarning,
  ExternalLink
} from 'lucide-react';
import { calculateIndemnity } from '../lib/utils';

const formatKz = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0
  }).format(value);
};

export const IndemnityCalculator = () => {
  const [salary, setSalary] = useState('0');
  const [years, setYears] = useState('0');
  const [reason, setReason] = useState('unfair');

  const amount = calculateIndemnity(parseFloat(salary), parseFloat(years), reason as any);

  return (
    <div className="space-y-8 sm:space-y-12 page-transition">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 pb-8 md:pb-10 border-b-4 border-primary/20 dark:border-white/10 transition-colors">
        <div className="space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Base de Legislação
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Indemnização</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-sm sm:text-base">Conhece os teus direitos em caso de cessação do contrato de trabalho.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-4">
             <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block lowercase tracking-tight">Último Salário Base</span>
                <input 
                  type="number" 
                  value={salary} 
                  onChange={(e) => setSalary(e.target.value)}
                  className="input-field"
                />
             </label>
             <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block lowercase tracking-tight">Tempo de Serviço (Anos)</span>
                <input 
                  type="number" 
                  value={years} 
                  onChange={(e) => setYears(e.target.value)}
                  className="input-field"
                />
             </label>
             <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block lowercase tracking-tight">Motivo de Saída</span>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field"
                >
                  <option value="unfair">Despedimento s/ Justa Causa</option>
                  <option value="objective">Causas Objectivas (Económicas)</option>
                  <option value="fair">Justa Causa (Faltas/Infracção)</option>
                </select>
             </label>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-white/5">
             <div className="p-4 bg-primary text-white rounded-2xl shadow-lg">
                <p className="text-xs font-bold uppercase opacity-80">Indemnização Estimada</p>
                <h3 className="text-3xl font-black mt-1">{formatKz(amount)}</h3>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card p-6 border-l-4 border-l-accent">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Scale className="text-accent" size={20} />
                O que diz a LGT?
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Segundo a Lei Geral do Trabalho de Angola, em caso de despedimento s/ justa causa, o trabalhador tem direito a uma indemnização correspondente ao salário base por cada ano de serviço.
              </p>
           </div>

           <div className="glass-card p-6 bg-slate-900 dark:bg-slate-900 text-white">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <FileWarning className="text-red-400" size={20} />
                Situações Criticas
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent mt-2" />
                  <span>Se a empresa declarar falência, o processo de indemnização tem prioridade sobre outros credores.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent mt-2" />
                  <span>O não pagamento da indemnização no prazo legal permite recurso à Inspecção Geral do Trabalho.</span>
                </li>
              </ul>
           </div>

           <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <HelpCircle className="text-primary dark:text-white opacity-60" />
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dúvidas Jurídicas?</span>
              </div>
              <button className="text-primary dark:text-white font-bold text-xs flex items-center gap-1 hover:underline">
                Portal do Governo <ExternalLink size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
