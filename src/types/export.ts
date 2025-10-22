// src/types/export.ts
// Tipos relacionados a exportação de dados

import { Meta } from "./meta";
import { Transaction } from "./transaction";

export interface ExportData {
  transactions: Transaction[];
  metas: Meta[];
  period?: {
    start: string;
    end: string;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    // Propriedades em português para compatibilidade com código legado
    totalReceitas?: number;
    totalDespesas?: number;
    saldo?: number;
    periodo?: string;
  };
}
