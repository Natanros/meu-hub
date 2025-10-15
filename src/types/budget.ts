// src/types/budget.ts
// Tipos relacionados ao sistema de orçamentos

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}
