// src/types/financial.ts
// Tipos relacionados a dados financeiros e análises

import { Transaction } from "./transaction";

export interface FinancialSummary {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryData {
  category?: string;
  name?: string;
  amount?: number;
  value?: number;
  percentage: number;
  trend?: "up" | "down" | "stable";
}

export interface PaymentPeriod {
  period?: string;
  name?: string;
  total?: number;
  transactions?: Transaction[];
  start?: Date;
  end?: Date;
  color?: string;
  icon?: string;
}
