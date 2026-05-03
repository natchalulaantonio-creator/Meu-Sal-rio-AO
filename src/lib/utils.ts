import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatKz = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0 Kz';
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0
  }).format(num);
};

export interface IRTGrade {
  limit: number;
  fixed: number;
  rate: number;
  excess: number;
}

// Tabela de IRT Oficial Angola - OGE 2026 (Lei n.º 14/25)
// Isenção até 150.000 Kz
export const IRT_TABLE_2026: IRTGrade[] = [
  { limit: 150000, fixed: 0, rate: 0, excess: 0 },
  { limit: 200000, fixed: 12500, rate: 0.16, excess: 150000 },
  { limit: 300000, fixed: 31250, rate: 0.18, excess: 200000 },
  { limit: 500000, fixed: 49250, rate: 0.19, excess: 300000 },
  { limit: 1000000, fixed: 87250, rate: 0.20, excess: 500000 },
  { limit: 1500000, fixed: 187250, rate: 0.21, excess: 1000000 },
  { limit: 2000000, fixed: 292250, rate: 0.22, excess: 1500000 },
  { limit: 2500000, fixed: 402250, rate: 0.23, excess: 2000000 },
  { limit: 5000000, fixed: 517250, rate: 0.24, excess: 2500000 },
  { limit: 10000000, fixed: 1117250, rate: 0.245, excess: 5000000 },
  { limit: Infinity, fixed: 2342250, rate: 0.25, excess: 10000000 },
];

export function calculateINSS(grossSalary: number): number {
  return grossSalary * 0.03; // Trabalhador paga 3%
}

export function calculateIRT(taxableIncome: number): number {
  if (taxableIncome <= 150000) return 0;

  const grade = IRT_TABLE_2026.find((g, i) => {
    const nextGrade = IRT_TABLE_2026[i + 1];
    return taxableIncome <= g.limit || !nextGrade;
  });

  if (!grade || grade.limit === 150000) return 0;

  const tax = grade.fixed + (taxableIncome - grade.excess) * grade.rate;
  return Math.round(tax * 100) / 100;
}

export interface SalaryBreakdown {
  grossSalary: number;
  foodAllowance: number;
  transportAllowance: number;
  housingAllowance: number;
  functionAllowance: number;
  riskAllowance: number;
  bonus: number;
  commissions: number;
  overtime: number;
  familyAllowance: number;
  totalGross: number;
  taxableForINSS: number;
  inss: number;
  taxableIncome: number;
  irt: number;
  net: number;
}

export function calculateNetSalary(
  grossSalary: number, 
  foodAllowance: number = 0,
  transportAllowance: number = 0,
  housingAllowance: number = 0,
  functionAllowance: number = 0,
  riskAllowance: number = 0,
  bonus: number = 0,
  commissions: number = 0,
  overtime: number = 0,
  familyAllowance: number = 0
): SalaryBreakdown {
  // 1. Rendimento Bruto Total
  const totalGross = grossSalary + foodAllowance + transportAllowance + housingAllowance + 
                    functionAllowance + riskAllowance + bonus + commissions + overtime + familyAllowance;

  // 2. Cálculo do INSS (3%)
  // O INSS incide sobre tudo excepto o Abono de Família
  const taxableForINSS = totalGross - familyAllowance;
  const inss = Math.round(taxableForINSS * 0.03 * 100) / 100;
  
  // 3. Matéria Colectável para IRT (MC)
  // Limites de isenção de IRT para Alimentação e Transporte: 30.000 Kz cada
  const foodExempt = Math.min(foodAllowance, 30000);
  const transportExempt = Math.min(transportAllowance, 30000);
  const familyExempt = familyAllowance;

  const taxableIncome = totalGross - inss - (foodExempt + transportExempt + familyExempt);

  // 4. Cálculo do IRT sobre a Matéria Colectável
  const irt = calculateIRT(taxableIncome);
  
  // 5. Salário Líquido Final
  const net = totalGross - inss - irt;

  return {
    grossSalary,
    foodAllowance,
    transportAllowance,
    housingAllowance,
    functionAllowance,
    riskAllowance,
    bonus,
    commissions,
    overtime,
    familyAllowance,
    totalGross,
    taxableForINSS,
    inss,
    taxableIncome, 
    irt,
    net
  };
}

export interface SettlementBreakdown {
  previousYearVacation: number;
  previousYearVacationAllowance: number;
  proportionalVacation: number;
  proportionalVacationAllowance: number;
  proportionalChristmas: number;
  finalMonthSalary: number;
  finalMonthFood: number;
  finalMonthTransport: number;
  indemnity: number;
  totalGross: number;
  taxableForINSS: number;
  inss: number;
  taxableIncome: number;
  irt: number;
  net: number;
}

export function calculateSettlement(
  baseSalary: number,
  monthsWorkedCurrent: number,
  monthsForChristmas: number,
  hasPreviousYearVacation: boolean,
  hasPreviousYearAllowance: boolean,
  hasCurrentYearVacationTaken: boolean,
  workedDaysFinalMonth: number = 0,
  monthlyFoodAllowance: number = 0,
  monthlyTransportAllowance: number = 0,
  yearsWorkedForIndemnity: number = 0,
  exitType: 'fair' | 'unfair' | 'resignation' = 'resignation'
): SettlementBreakdown {
  // 1. Cálculos de Base (Proporcionais e Pendentes)
  // Férias e Subsídios pendentes do ano anterior
  const previousYearVacation = hasPreviousYearVacation ? baseSalary : 0;
  const previousYearVacationAllowance = hasPreviousYearAllowance ? baseSalary : 0;

  // Proporcionais do ano atual (Base / 12 x meses)
  // Se já gozou férias este ano, o proporcional de férias é 0
  const proportionalVacation = hasCurrentYearVacationTaken ? 0 : (baseSalary / 12) * monthsWorkedCurrent;
  // Subsídios de Férias e Natal são 50% do valor base proporcional
  const proportionalVacationAllowance = ((baseSalary / 12) * monthsWorkedCurrent) * 0.5;
  const proportionalChristmas = ((baseSalary / 12) * monthsForChristmas) * 0.5;

  // Salário do mês final (proporcional aos dias trabalhados)
  const finalMonthSalary = (baseSalary / 30) * workedDaysFinalMonth;
  const finalMonthFood = (monthlyFoodAllowance / 30) * workedDaysFinalMonth;
  const finalMonthTransport = (monthlyTransportAllowance / 30) * workedDaysFinalMonth;

  // Indemnização
  const indemnity = calculateIndemnity(baseSalary, yearsWorkedForIndemnity, exitType);

  // Total Bruto de Fecho
  const totalGross = previousYearVacation + previousYearVacationAllowance + 
                     proportionalVacation + proportionalVacationAllowance + 
                     proportionalChristmas + finalMonthSalary + finalMonthFood + finalMonthTransport + indemnity;

  // 2. INSS (3%)
  // O INSS incide sobre componentes salariais
  // Indemnização geralmente é isenta de INSS em Angola
  const taxableForINSS = totalGross - (finalMonthFood + finalMonthTransport + indemnity); 
  const inss = Math.round(taxableForINSS * 0.03 * 100) / 100;

  // 3. IRT
  // Matéria colectável
  // Indemnização até certo limite é isenta de IRT (geralmente baseada em anos de serviço), mas para simplificar:
  const foodExempt = Math.min(finalMonthFood, 30000);
  const transportExempt = Math.min(finalMonthTransport, 30000);
  
  // Isenção IRT sobre indemnização: a LGT diz que compensações por cessação de contrato são isentas até ao limite da lei
  const indemnityExempt = indemnity; 

  const taxableIncome = totalGross - inss - (foodExempt + transportExempt + indemnityExempt);
  const irt = calculateIRT(taxableIncome);

  // 4. Líquido
  const net = totalGross - inss - irt;

  return {
    previousYearVacation,
    previousYearVacationAllowance,
    proportionalVacation,
    proportionalVacationAllowance,
    proportionalChristmas,
    finalMonthSalary,
    finalMonthFood,
    finalMonthTransport,
    indemnity,
    totalGross,
    taxableForINSS,
    inss,
    taxableIncome,
    irt,
    net
  };
}

export function simulateSalaryBreakdown(
  targetGrossTotal: number,
  config: {
    includeFood: boolean;
    includeTransport: boolean;
    includeHousing: boolean;
    includeFunction: boolean;
  }
): { base: number; food: number; transport: number; housing: number; function: number } {
  let remaining = targetGrossTotal;
  let food = 0;
  let transport = 0;
  let housing = 0;
  let func = 0;

  // Política padrão de distribuição para otimização fiscal em Angola
  if (config.includeFood) {
    food = Math.min(remaining, 30000);
    remaining -= food;
  }
  if (config.includeTransport) {
    transport = Math.min(remaining, 30000);
    remaining -= transport;
  }
  if (config.includeHousing) {
    // Geralmente habitação é 10% ou valor fixo, vamos pôr 10% do total se possível
    housing = Math.min(remaining, targetGrossTotal * 0.1);
    remaining -= housing;
  }
  if (config.includeFunction) {
    // Subsídio de função geralmente 10-15%
    func = Math.min(remaining, targetGrossTotal * 0.1);
    remaining -= func;
  }

  return {
    base: Math.max(0, remaining),
    food,
    transport,
    housing,
    function: func
  };
}

export function calculateVacation(baseSalary: number, monthsWorked: number): number {
  // 2 dias por mês, max 22 dias
  const days = Math.min(monthsWorked * 2, 22);
  return (baseSalary / 22) * days;
}

export function calculateIndemnity(baseSalary: number, yearsWorked: number, exitType: 'fair' | 'unfair' | 'resignation'): number {
  // Legislação Geral do Trabalho (LGT) de Angola - Lei 14/23 de 28 de Dezembro
  // Simplificação:
  // - Unfair (Sem justa causa pelo empregador): Geralmente 1 salário por cada ano (ou fração relevante)
  // - Fair (Com justa causa): 0
  // - Resignation (Pedido de demissão / Por conta própria): 0
  if (exitType === 'unfair') {
    return baseSalary * yearsWorked;
  }
  return 0;
}

export function calculateGrossFromNet(
  targetNet: number,
  config: {
    includeFood: boolean;
    includeTransport: boolean;
    includeHousing: boolean;
    includeFunction: boolean;
  }
): { grossPack: number; breakdown: { base: number; food: number; transport: number; housing: number; function: number } } {
  // Se o líquido for 0, o bruto é 0
  if (targetNet <= 0) {
    return { grossPack: 0, breakdown: { base: 0, food: 0, transport: 0, housing: 0, function: 0 } };
  }

  // Abordagem iterativa (Binary Search) para encontrar o bruto necessário
  // Sabemos que o bruto será sempre maior que o líquido.
  // Limite inferior: líquido. Limite superior: líquido * 2 (seguro na maioria dos casos em Angola)
  let low = targetNet;
  let high = targetNet * 3; 
  let iterations = 0;
  let bestGross = targetNet;

  while (iterations < 25) { // 25 iterações dão precisão de centavos
    const mid = (low + high) / 2;
    
    // Distribuímos o bruto atual 'mid' conforme a configuração
    const { base, food, transport, housing, function: func } = simulateSalaryBreakdown(mid, config);
    
    // Calculamos o líquido resultante
    const result = calculateNetSalary(base, food, transport, housing, func, 0, 0, 0, 0, 0);
    
    if (result.net < targetNet) {
      low = mid;
    } else {
      high = mid;
      bestGross = mid;
    }
    iterations++;
  }

  const breakdown = simulateSalaryBreakdown(bestGross, config);
  return { grossPack: bestGross, breakdown };
}
