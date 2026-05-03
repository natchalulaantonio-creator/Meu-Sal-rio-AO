export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface SalaryCalculation {
  id?: string;
  userId: string;
  grossSalary: number;
  inss: number;
  irt: number;
  net: number;
  createdAt: any;
  type: 'salario';
}

export interface SettlementCalculation {
  id?: string;
  userId: string;
  indemnity: number;
  vacation: number;
  thirteenth: number;
  total: number;
  createdAt: any;
  type: 'fecho';
}

export type CalcType = 'salario' | 'fecho' | 'indeminizacao';
