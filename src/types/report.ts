// src/types/report.ts
// Tipos relacionados a relatórios e exportação

import { Transaction } from "./transaction";

export interface ReportConfig {
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  includeCharts?: boolean;
  includeInsights?: boolean;
  format?: "pdf" | "excel" | "csv";
}

export interface ReportData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  };
  transactions: Transaction[];
  categoryBreakdown?: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  insights?: string[];
  period: {
    start: Date;
    end: Date;
  };
  // Propriedades em português para compatibilidade com código legado
  totalReceitas?: number;
  totalDespesas?: number;
  saldo?: number;
  transacoesPeriodo?: Transaction[];
  receitasPorCategoria?: { [key: string]: number };
  despesasPorCategoria?: { [key: string]: number };
  proximosPagamentos?: Transaction[];
  metricasComparativas?: {
    mesAnterior?: {
      receitas: number;
      despesas: number;
      saldo: number;
    };
  };
}

export interface DateRange {
  start: Date | string;
  end: Date | string;
}
