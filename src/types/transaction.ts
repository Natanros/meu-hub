export type Transaction = {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string;
  date: string;
  metaId?: string;
  installments?: number;
  recurrence?: string;
  recurrenceCount?: number;
};
