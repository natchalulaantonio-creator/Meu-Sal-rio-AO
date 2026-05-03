import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Download, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  Wallet,
  ArrowRight,
  FileText,
  Share2
} from 'lucide-react';
import { cn, calculateNetSalary, calculateSettlement, simulateSalaryBreakdown, calculateGrossFromNet, formatKz, type SalaryBreakdown, type SettlementBreakdown } from '../lib/utils';
import { generateProfessionalPDF } from '../lib/pdfService';
import { auth, db, addDoc, collection, serverTimestamp, updateDoc, doc, increment } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const SalaryCalculator = () => {
  const [user] = useAuthState(auth);
  const [mode, setMode] = useState<'mensal' | 'fecho' | 'proposta'>('mensal');

  // Mensal Inputs
  const [grossInput, setGrossInput] = useState<string>('0');
  const [foodInput, setFoodInput] = useState<string>('0');
  const [transportInput, setTransportInput] = useState<string>('0');
  const [housingInput, setHousingInput] = useState<string>('0');
  const [functionInput, setFunctionInput] = useState<string>('0');
  const [riskInput, setRiskInput] = useState<string>('0');
  const [bonusInput, setBonusInput] = useState<string>('0');
  const [commissionsInput, setCommissionsInput] = useState<string>('0');
  const [overtimeInput, setOvertimeInput] = useState<string>('0');
  const [familyInput, setFamilyInput] = useState<string>('0');
  
  // Fecho Inputs
  const [settlementMonthsCurrent, setSettlementMonthsCurrent] = useState<string>('0');
  const [settlementMonthsChristmas, setSettlementMonthsChristmas] = useState<string>('0');
  const [workedDaysFinalMonth, setWorkedDaysFinalMonth] = useState<string>('0');
  const [hasPrevVacation, setHasPrevVacation] = useState<boolean>(false);
  const [hasPrevAllowance, setHasPrevAllowance] = useState<boolean>(false);
  const [hasCurrentVacationTaken, setHasCurrentVacationTaken] = useState<boolean>(false);

  // Simulation (Proposta) Inputs
  const [targetNetTotal, setTargetNetTotal] = useState<string>('0');
  const [simConfig, setSimConfig] = useState({
    includeFood: true,
    includeTransport: true,
    includeHousing: false,
    includeFunction: false
  });

  // Fecho extra
  const [yearsWorked, setYearsWorked] = useState<string>('0');
  const [exitType, setExitType] = useState<'fair' | 'unfair' | 'resignation'>('resignation');

  const [results, setResults] = useState<SalaryBreakdown | null>(null);
  const [settlementResults, setSettlementResults] = useState<SettlementBreakdown | null>(null);
  const [simulationBreakdown, setSimulationBreakdown] = useState<any>(null);

  // Automatic calculation for Monthly and Proposta mode
  React.useEffect(() => {
    if (mode === 'mensal') {
      const data = calculateNetSalary(
        parseFloat(grossInput) || 0,
        parseFloat(foodInput) || 0,
        parseFloat(transportInput) || 0,
        parseFloat(housingInput) || 0,
        parseFloat(functionInput) || 0,
        parseFloat(riskInput) || 0,
        parseFloat(bonusInput) || 0,
        parseFloat(commissionsInput) || 0,
        parseFloat(overtimeInput) || 0,
        parseFloat(familyInput) || 0
      );
      setResults(data);
      setSettlementResults(null);
      setSimulationBreakdown(null);
    } else if (mode === 'proposta') {
      const { breakdown, grossPack } = calculateGrossFromNet(parseFloat(targetNetTotal) || 0, simConfig);
      setSimulationBreakdown(breakdown);
      
      // Calculate net for the simulated breakdown
      const data = calculateNetSalary(
        breakdown.base,
        breakdown.food,
        breakdown.transport,
        breakdown.housing,
        breakdown.function,
        0, 0, 0, 0, 0
      );
      setResults(data);
      setSettlementResults(null);
    }
  }, [mode, grossInput, foodInput, transportInput, housingInput, functionInput, riskInput, bonusInput, commissionsInput, overtimeInput, familyInput, targetNetTotal, simConfig]);

  const handleCalculate = () => {
    if (mode === 'mensal' || mode === 'proposta') {
      // Already handled by useEffect
    } else {
      const data = calculateSettlement(
        parseFloat(grossInput) || 0,
        parseFloat(settlementMonthsCurrent) || 0,
        parseFloat(settlementMonthsChristmas) || 0,
        hasPrevVacation,
        hasPrevAllowance,
        hasCurrentVacationTaken,
        parseFloat(workedDaysFinalMonth) || 0,
        parseFloat(foodInput) || 0,
        parseFloat(transportInput) || 0,
        parseFloat(yearsWorked) || 0,
        exitType
      );
      setSettlementResults(data);
      setResults(null);
      setSimulationBreakdown(null);
    }
  };

  // Calculate once on mount if needed, or just wait for the button
  // For better UX with "Calcular" button, we start with null or initial call

  const saveSimulation = async () => {
    if (!user || (!results && !settlementResults)) return;
    try {
      await addDoc(collection(db, 'calculations'), {
        userId: user.uid,
        ...(results || settlementResults),
        type: mode === 'mensal' ? 'salario' : 'fecho',
        createdAt: serverTimestamp()
      });
      
      // Update global stats
      updateDoc(doc(db, 'stats', 'global'), {
        totalSimulations: increment(1)
      }).catch(err => {
        console.warn("Global stats update failed (might not exist yet):", err.message);
      });

      alert('Simulação arquivada com sucesso no seu histórico!');
    } catch (e) {
      import('../firebase').then(({ handleFirestoreError, OperationType }) => {
        handleFirestoreError(e, OperationType.CREATE, 'calculations');
      });
    }
  };

  const shareSimulation = async () => {
    if (!results && !settlementResults) return;
    try {
      const shareData = {
        title: mode === 'mensal' ? 'Simulação de Salário' : mode === 'fecho' ? 'Fecho de Contas' : 'Proposta Salarial',
        data: results || settlementResults,
        createdAt: new Date().toISOString(),
        publicId: Math.random().toString(36).substring(2, 10).toUpperCase()
      };
      
      // In a real app we'd save to a 'shares' collection
      // For now, let's copy a link to clipboard
      const text = `Confira a minha simulação salarial no Kwanza: ID ${shareData.publicId}`;
      navigator.clipboard.writeText(text);
      alert(`Simulação preparada! ID de partilha: ${shareData.publicId}\n\n(Texto copiado para a área de transferência)`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportPDF = () => {
    if (mode === 'mensal' && results) {
      generateProfessionalPDF({
        title: 'Relatório de Salário Líquido',
        userName: user?.displayName || 'Trabalhador Angolano',
        details: [
          { label: 'Salário Base', value: formatKz(results.grossSalary) },
          { label: 'S. Alimentação', value: formatKz(results.foodAllowance) },
          { label: 'S. Transporte', value: formatKz(results.transportAllowance) },
          { label: 'S. Função/Risco', value: formatKz(results.functionAllowance + results.riskAllowance) },
          { label: 'Habitação', value: formatKz(results.housingAllowance) },
          { label: 'Variáveis (Bónus/Comissões)', value: formatKz(results.bonus + results.commissions + results.overtime) },
          { label: 'Abono Família', value: formatKz(results.familyAllowance) },
          { label: 'Dedução INSS (3%)', value: `- ${formatKz(results.inss)}` },
          { label: 'Base IRT (MC)', value: formatKz(results.taxableIncome) },
          { label: 'IRT Retido', value: `- ${formatKz(results.irt)}` },
        ],
        summary: [
          { label: 'SALÁRIO LÍQUIDO FINAL', value: formatKz(results.net) }
        ]
      });
    } else if (mode === 'fecho' && settlementResults) {
      generateProfessionalPDF({
        title: 'Relatório de Fecho de Contas',
        userName: user?.displayName || 'Trabalhador Angolano',
        details: [
          { label: 'Salário Base p/ Cálculo', value: formatKz(parseFloat(grossInput) || 0) },
          { label: 'Dias Trab. Último Mês', value: workedDaysFinalMonth },
          { label: 'Salário Último Mês', value: formatKz(settlementResults.finalMonthSalary) },
          { label: 'Férias Ano Anterior', value: formatKz(settlementResults.previousYearVacation) },
          { label: 'S. Férias Ano Anterior', value: formatKz(settlementResults.previousYearVacationAllowance) },
          { label: 'Férias Proporcional', value: formatKz(settlementResults.proportionalVacation) },
          { label: 'S. Férias Proporcional', value: formatKz(settlementResults.proportionalVacationAllowance) },
          { label: 'S. Natal Proporcional', value: formatKz(settlementResults.proportionalChristmas) },
          { label: 'Indemnização (Se aplicável)', value: formatKz(settlementResults.indemnity) },
          { label: 'Dedução INSS (3%)', value: `- ${formatKz(settlementResults.inss)}` },
          { label: 'IRT Retido (Terminal)', value: `- ${formatKz(settlementResults.irt)}` },
        ],
        summary: [
          { label: 'VALOR LÍQUIDO A RECEBER', value: formatKz(settlementResults.net) }
        ]
      });
    } else if (mode === 'proposta' && results) {
      generateProfessionalPDF({
        title: 'Proposta Salarial Optimizada',
        userName: user?.displayName || 'Trabalhador Angolano',
        details: [
          { label: 'Total Bruto Pretendido (Pack)', value: formatKz(results.totalGross) },
          { label: 'Salário Base Sugerido', value: formatKz(results.grossSalary) },
          { label: 'S. Alimentação (Otimizado)', value: formatKz(results.foodAllowance) },
          { label: 'S. Transporte (Otimizado)', value: formatKz(results.transportAllowance) },
          { label: 'S. Habitação', value: formatKz(results.housingAllowance) },
          { label: 'S. Função', value: formatKz(results.functionAllowance) },
          { label: 'Dedução INSS (3%)', value: `- ${formatKz(results.inss)}` },
          { label: 'IRT Retido', value: `- ${formatKz(results.irt)}` },
        ],
        summary: [
          { label: 'SALÁRIO LÍQUIDO DISPONÍVEL', value: formatKz(results.net) }
        ]
      });
    }
  };

  return (
    <div className="space-y-12 page-transition">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 pb-8 md:pb-10 border-b-4 border-primary/20 dark:border-white/10 transition-colors">
        <div className="space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Motor de Cálculo V2.6
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">NOVO CÁLCULO</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-sm sm:text-base">Simulação detalhada de rendimentos com base no código de IRT e INSS actualizados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {(results || settlementResults) && (
            <button 
              onClick={shareSimulation} 
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl sm:rounded-full text-[10px] font-black uppercase tracking-widest hover:border-primary text-slate-500 dark:text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> <span className="sm:inline">Partilhar</span>
            </button>
          )}
          {(results || settlementResults) && user && (
            <button onClick={saveSimulation} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white dark:bg-white/5 border-2 border-slate-900 dark:border-white rounded-xl sm:rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-all text-center">
              Arquivar
            </button>
          )}
          {(results || settlementResults) && (
            <button onClick={exportPDF} className="w-full sm:w-auto btn-primary rounded-xl sm:rounded-full group py-3 px-6 text-[10px] sm:text-xs">
              <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> 
              Exportar PDF
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-white/5 rounded-2xl w-full sm:w-fit border border-slate-100 dark:border-white/5">
        <button 
          onClick={() => { setMode('mensal'); setResults(null); setSettlementResults(null); setSimulationBreakdown(null); }}
          className={cn("flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all", mode === 'mensal' ? "bg-white dark:bg-primary text-primary dark:text-white shadow-md shadow-black/[0.03] border border-slate-100 dark:border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-white")}
        >
          <Wallet className="inline-block mr-2" size={16} />
          Mensal
        </button>
        <button 
          onClick={() => { setMode('fecho'); setResults(null); setSettlementResults(null); setSimulationBreakdown(null); }}
          className={cn("flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all", mode === 'fecho' ? "bg-white dark:bg-primary text-primary dark:text-white shadow-md shadow-black/[0.03] border border-slate-100 dark:border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-white")}
        >
          <FileText className="inline-block mr-2" size={16} />
          Fecho
        </button>
        <button 
          onClick={() => { setMode('proposta'); setResults(null); setSettlementResults(null); setSimulationBreakdown(null); }}
          className={cn("flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all", mode === 'proposta' ? "bg-white dark:bg-primary text-primary dark:text-white shadow-md shadow-black/[0.03] border border-slate-100 dark:border-white/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-white")}
        >
          <TrendingUp className="inline-block mr-2" size={16} />
          Proposta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Fixado & Base</label>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Salário Base</span>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={grossInput} 
                      onChange={(e) => setGrossInput(e.target.value)}
                      className="input-field pl-10"
                    />
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Alimentação</span>
                      <span className="text-[9px] text-slate-400 font-medium">Até 30k</span>
                    </div>
                    <input type="number" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} className="input-field text-sm" />
                  </label>
                  <label>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Transporte</span>
                      <span className="text-[9px] text-slate-400 font-medium">Até 30k</span>
                    </div>
                    <input type="number" value={transportInput} onChange={(e) => setTransportInput(e.target.value)} className="input-field text-sm" />
                  </label>
                </div>
              </div>
            </div>

            {mode === 'proposta' ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-700 mb-1 block">Rendimento Líquido Pretendido</span>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={targetNetTotal} 
                      onChange={(e) => setTargetNetTotal(e.target.value)}
                      className="input-field pl-10 border-primary/30"
                    />
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  </div>
                </label>

                <div className="space-y-3 pt-2 bg-white dark:bg-white/2 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Desejo incluir na proposta:</span>
                  
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simConfig.includeFood} 
                      onChange={(e) => setSimConfig({...simConfig, includeFood: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Subsídio de Alimentação</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simConfig.includeTransport} 
                      onChange={(e) => setSimConfig({...simConfig, includeTransport: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Subsídio de Transporte</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simConfig.includeHousing} 
                      onChange={(e) => setSimConfig({...simConfig, includeHousing: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Subsídio de Habitação</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={simConfig.includeFunction} 
                      onChange={(e) => setSimConfig({...simConfig, includeFunction: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Subsídio de Função</span>
                  </label>
                </div>
              </div>
            ) : mode === 'mensal' ? (
              <>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Subsídios & Extras</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Função</span>
                      <input type="number" value={functionInput} onChange={(e) => setFunctionInput(e.target.value)} className="input-field text-sm" />
                    </label>
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Turno/Risco</span>
                      <input type="number" value={riskInput} onChange={(e) => setRiskInput(e.target.value)} className="input-field text-sm" />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Habitação</span>
                      <input type="number" value={housingInput} onChange={(e) => setHousingInput(e.target.value)} className="input-field text-sm" />
                    </label>
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Abono Família</span>
                      <input type="number" value={familyInput} onChange={(e) => setFamilyInput(e.target.value)} className="input-field text-sm" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Rendimentos Variáveis</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Prémio/Bónus</span>
                      <input type="number" value={bonusInput} onChange={(e) => setBonusInput(e.target.value)} className="input-field text-sm" />
                    </label>
                    <label>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Comissões</span>
                      <input type="number" value={commissionsInput} onChange={(e) => setCommissionsInput(e.target.value)} className="input-field text-sm" />
                    </label>
                  </div>
                  <label className="block mt-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Horas Extras / Gratificações</span>
                    <input type="number" value={overtimeInput} onChange={(e) => setOvertimeInput(e.target.value)} className="input-field text-sm" />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Proporcional Férias (Meses)</span>
                      <input type="number" min="1" max="12" value={settlementMonthsCurrent} onChange={(e) => setSettlementMonthsCurrent(e.target.value)} className="input-field text-sm" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Proporcional Natal (Meses)</span>
                      <input type="number" min="1" max="12" value={settlementMonthsChristmas} onChange={(e) => setSettlementMonthsChristmas(e.target.value)} className="input-field text-sm" />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Dias trabalhados no último mês</span>
                    <input type="number" min="0" max="31" value={workedDaysFinalMonth} onChange={(e) => setWorkedDaysFinalMonth(e.target.value)} className="input-field text-sm" />
                  </label>

                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">Motivo da Saída / Indemnização</span>
                    <select 
                      value={exitType} 
                      onChange={(e) => setExitType(e.target.value as any)}
                      className="input-field mb-3 text-sm"
                    >
                      <option value="resignation">Por conta própria (Pedido de Demissão)</option>
                      <option value="unfair">Sem Justa Causa (Iniciativa do Empregador)</option>
                      <option value="fair">Com Justa Causa</option>
                    </select>

                    {exitType === 'unfair' && (
                      <label className="block animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">Anos de Casa (Para Indemnização)</span>
                        <input type="number" step="0.5" value={yearsWorked} onChange={(e) => setYearsWorked(e.target.value)} className="input-field text-sm" />
                      </label>
                    )}
                  </div>
                  
                  <div className="space-y-3 pt-2 bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Situação de Férias</span>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hasPrevVacation} 
                        onChange={(e) => setHasPrevVacation(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Não gozou férias no ano anterior</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hasPrevAllowance} 
                        onChange={(e) => setHasPrevAllowance(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Não recebeu S. Férias ano anterior</span>
                    </label>

                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1"></div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hasCurrentVacationTaken} 
                        onChange={(e) => setHasCurrentVacationTaken(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Já gozou férias no corrente ano?</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <button 
              onClick={handleCalculate}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Calculator size={20} />
              {mode === 'mensal' ? 'Processar Salário' : mode === 'fecho' ? 'Calcular Fecho' : 'Ver Simulação'}
            </button>

            <div className="p-4 bg-white rounded-xl border border-slate-100 flex gap-3">
              <Info className="text-slate-400 shrink-0" size={16} />
              <p className="text-[10px] text-slate-500 leading-tight">
                {mode === 'mensal' 
                  ? "* O INSS (3%) incide sobre quase tudo. Para o IRT, os subsídios de Alimentação e Transporte são isentos apenas até 30000 Kz cada."
                  : mode === 'fecho'
                  ? "* O Fecho de Contas inclui proporcionais de férias e natal. Férias não gozadas e subsídios são tributados em IRT e INSS."
                  : "* A simulação de proposta ajuda-te a distribuir o teu salário bruto total para maximizar a isenção de impostos."}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {!results && !settlementResults ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 glass-card opacity-60">
              <div className="w-16 h-16 bg-white dark:bg-white/5 border border-slate-100 dark:border-transparent rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Calculator size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pronto para Calcular?</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                Preenche os teus dados à esquerda e clica no botão para ver o detalhamento {mode === 'mensal' ? 'do teu salário' : 'do teu fecho de contas'}.
              </p>
              <ArrowRight className="mt-6 text-primary animate-bounce-x" size={24} />
            </div>
          ) : results ? (
            <>
              {/* Salário Mensal View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp size={20} /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salário Líquido</span>
                  </div>
                  <h3 className="text-4xl font-black text-primary tracking-tight">{formatKz(results.net)}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Valor final a cair na conta</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><TrendingDown size={20} /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descontos Totais</span>
                  </div>
                  <h3 className="text-4xl font-black text-red-500 tracking-tight">{formatKz(results.irt + results.inss)}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">IRT + INSS retidos</p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-8">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                  {mode === 'proposta' ? 'Proposta Salarial Optimizada' : 'Detalhamento Mensal'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Base Salarial</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{formatKz(results.grossSalary)}</span>
                    </div>
                    <ArrowRight className="text-primary/40" size={20} />
                    <div className="text-right">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Total Pack Bruto</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{formatKz(results.totalGross)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 px-1 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors rounded-lg text-slate-700 dark:text-slate-300">
                    <span className="text-sm font-medium">Salário Base Sugerido</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatKz(results.grossSalary)}</span>
                  </div>
                  {(results.foodAllowance > 0 || results.transportAllowance > 0 || results.familyAllowance > 0) && (
                    <div className="py-2 px-1 space-y-2">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Componentes Isentos (Limite IRT)</span>
                      {results.foodAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Alimentação (Isento até 30k)</span><span className="font-semibold text-slate-700">{formatKz(results.foodAllowance)}</span></div>}
                      {results.transportAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Transporte (Isento até 30k)</span><span className="font-semibold text-slate-700">{formatKz(results.transportAllowance)}</span></div>}
                      {results.familyAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Abono Família (Isento Total)</span><span className="font-semibold text-slate-700">{formatKz(results.familyAllowance)}</span></div>}
                    </div>
                  )}
                  {(results.housingAllowance > 0 || results.functionAllowance > 0 || results.riskAllowance > 0 || results.bonus > 0 || results.commissions > 0 || results.overtime > 0) && (
                    <div className="py-2 px-1 space-y-2">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Componentes Totalmente Tributáveis</span>
                      {results.functionAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Subsídio de Função</span><span className="font-semibold text-slate-700">{formatKz(results.functionAllowance)}</span></div>}
                      {results.riskAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Subsídio de Risco/Turno</span><span className="font-semibold text-slate-700">{formatKz(results.riskAllowance)}</span></div>}
                      {results.housingAllowance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Subsídio de Habitação</span><span className="font-semibold text-slate-700">{formatKz(results.housingAllowance)}</span></div>}
                      {results.bonus > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Prémio / Bónus</span><span className="font-semibold text-slate-700">{formatKz(results.bonus)}</span></div>}
                      {results.commissions > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Comissões</span><span className="font-semibold text-slate-700">{formatKz(results.commissions)}</span></div>}
                      {results.overtime > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Horas Extras / Gratificações</span><span className="font-semibold text-slate-700">{formatKz(results.overtime)}</span></div>}
                    </div>
                  )}
                  
                  <div className="h-px bg-slate-100 my-4"></div>

                  <div className="flex justify-between py-3 px-1">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Rendimento Bruto Total</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatKz(results.totalGross)}</span>
                  </div>
                  <div className="flex justify-between py-3 px-1">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Dedução INSS (3%)</span>
                    <span className="font-bold text-red-500">- {formatKz(results.inss)}</span>
                  </div>

                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 my-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-primary font-black text-xs uppercase tracking-widest">Matéria Colectável (MC)</span>
                      <span className="text-primary font-black text-xl">{formatKz(results.taxableIncome)}</span>
                    </div>
                    <p className="text-[9px] text-primary/60 italic font-medium">Base sujeita à tabela progressiva do IRT após deduções legais</p>
                  </div>

                  <div className="flex justify-between py-3 px-1">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">IRT Retido na Fonte</span>
                    <span className="font-bold text-red-500">- {formatKz(results.irt)}</span>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t-2 border-slate-100 dark:border-white/10 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Rendimento Final</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Salário Líquido</span>
                    </div>
                    <span className="text-4xl font-black text-primary tracking-tighter">{formatKz(results.net)}</span>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Fecho de Contas View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600"><TrendingUp size={20} /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Líquido Fecho</span>
                  </div>
                  <h3 className="text-4xl font-black text-emerald-600 tracking-tight">{formatKz(settlementResults.net)}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Valor total a receber na rescisão</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600"><TrendingDown size={20} /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impostos Retidos</span>
                  </div>
                  <h3 className="text-4xl font-black text-amber-600 tracking-tight">{formatKz(settlementResults.irt + settlementResults.inss)}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Deduções fiscais totais (IRT + INSS)</p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  Memória de Cálculo (Fecho)
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pagamentos Pendentes</span>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Férias Ano Anterior</span>
                        <span className="font-bold dark:text-white">{formatKz(settlementResults.previousYearVacation)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subsídio Férias Ano Anterior</span>
                        <span className="font-bold dark:text-white">{formatKz(settlementResults.previousYearVacationAllowance)}</span>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Salário Último Mês ({workedDaysFinalMonth} dias)</span>
                          <span className="font-bold dark:text-white">{formatKz(settlementResults.finalMonthSalary)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 italic">S. Alimentação Proporcional</span>
                          <span className="text-slate-500 italic">{formatKz(settlementResults.finalMonthFood)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 italic">S. Transporte Proporcional</span>
                          <span className="text-slate-500 italic">{formatKz(settlementResults.finalMonthTransport)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Direitos Proporcionais</span>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Férias ({settlementMonthsCurrent}/12 meses)</span>
                        <span className="font-bold dark:text-white">{formatKz(settlementResults.proportionalVacation)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subsídio Férias ({settlementMonthsCurrent}/12)</span>
                        <span className="font-bold dark:text-white">{formatKz(settlementResults.proportionalVacationAllowance)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-slate-100 dark:border-white/10">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Subsídio Natal ({settlementMonthsChristmas}/12)</span>
                        <span className="font-bold text-primary">{formatKz(settlementResults.proportionalChristmas)}</span>
                      </div>
                      {settlementResults.indemnity > 0 && (
                        <div className="flex justify-between text-sm pt-2 border-t border-primary/10 mt-2 bg-primary/5 p-2 rounded">
                          <span className="text-primary font-bold">Indemnização LGT</span>
                          <span className="font-black text-primary">{formatKz(settlementResults.indemnity)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Recibo Bruto Total</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatKz(settlementResults.totalGross)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Dedução INSS (3%)</span>
                      <span className="font-bold text-red-500">- {formatKz(settlementResults.inss)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">IRT Retido</span>
                      <span className="font-bold text-red-500">- {formatKz(settlementResults.irt)}</span>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-slate-100 dark:border-white/10 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Total a Pagar</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Valor Líquido de Rescisão</span>
                      </div>
                      <span className="text-4xl font-black text-emerald-600 tracking-tighter">{formatKz(settlementResults.net)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
