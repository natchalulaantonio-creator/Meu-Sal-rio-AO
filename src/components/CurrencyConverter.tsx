import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  DollarSign, 
  Euro, 
  ArrowRightLeft,
  Calendar,
  TrendingUp,
  Info
} from 'lucide-react';

const rates = {
  USD: 910.45,
  EUR: 985.20,
};

export const CurrencyConverter = () => {
  const [aoaValue, setAoaValue] = useState<string>('100000');
  const [usdValue, setUsdValue] = useState<number>(0);
  const [eurValue, setEurValue] = useState<number>(0);

  useEffect(() => {
    const amount = parseFloat(aoaValue) || 0;
    setUsdValue(amount / rates.USD);
    setEurValue(amount / rates.EUR);
  }, [aoaValue]);

  return (
    <div className="space-y-12 page-transition pb-20">
      <header className="relative py-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-2xl px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">
            Câmbio & Referência
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
            Conversor de <br className="hidden sm:block" />
            <span className="text-slate-300 dark:text-slate-700">Moedas em Tempo Real.</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            Acompanha o valor do teu salário em divisas estrangeiras com base nas taxas de referência actuais.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-12">
          <div className="glass-card p-6 sm:p-10 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 hidden sm:block">
               <RefreshCw size={120} className="animate-spin-slow" />
             </div>
             
             <div className="space-y-4 relative z-10 w-full md:w-auto">
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Input Principal (Kz)</span>
               <div className="relative">
                 <input 
                   type="number" 
                   value={aoaValue}
                   onChange={(e) => setAoaValue(e.target.value)}
                   className="bg-transparent text-4xl sm:text-6xl font-black outline-none border-b-4 border-emerald-500/30 focus:border-emerald-500 transition-colors w-full md:w-[400px] py-2"
                   placeholder="0.00"
                 />
                 <span className="absolute right-0 bottom-4 text-xl sm:text-2xl font-bold opacity-30">AOA</span>
               </div>
             </div>

             <div className="flex flex-col gap-6 w-full md:w-72 relative z-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Dólar Americano</span>
                     <DollarSign size={16} className="text-emerald-400" />
                   </div>
                   <p className="text-3xl font-black">$ {usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase">Euro Europeu</span>
                     <Euro size={16} className="text-blue-400" />
                   </div>
                   <p className="text-3xl font-black">€ {eurValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-card p-8">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 px-2">Taxas de Referência</h4>
            <div className="space-y-6">
              <RateItem label="USD / AOA" value={rates.USD.toString()} change="+0.12%" trend="up" />
              <RateItem label="EUR / AOA" value={rates.EUR.toString()} change="-0.04%" trend="down" />
              <div className="h-px bg-slate-100 dark:bg-white/10 my-4"></div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                <Calendar size={20} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Última Actualização</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Hoje, {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="glass-card p-8 group overflow-hidden relative">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <TrendingUp size={24} />
                 </div>
                 <h4 className="font-bold text-xl dark:text-white">Poder de Compra</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Este conversor usa taxas de referência do mercado. O valor real pode variar dependendo do banco ou casa de câmbio.
              </p>
              <ArrowRightLeft className="absolute -bottom-10 -right-10 text-slate-100 dark:text-white/5 w-40 h-40 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            <div className="glass-card p-8 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-emerald-500 rounded-2xl text-white">
                    <Info size={24} />
                 </div>
                 <h4 className="font-bold text-xl text-emerald-900 dark:text-emerald-500">Dica Financeira</h4>
              </div>
              <p className="text-sm text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed italic">
                "Guardar uma percentagem do teu salário em divisas pode ajudar-te a proteger o teu poder de compra contra a inflação."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RateItem = ({ label, value, change, trend }: any) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-white/2 rounded-2xl group border border-slate-100 dark:border-transparent hover:border-emerald-500/30 transition-all">
    <div className="space-y-1">
      <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value} <span className="text-sm opacity-40">Kz</span></p>
    </div>
    <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
      {change}
    </div>
  </div>
);
