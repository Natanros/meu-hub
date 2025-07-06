import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mapeamento dos campos para português
const headerMap: Record<string, string> = {
  id: "ID",
  type: "Tipo",
  category: "Categoria",
  amount: "Valor",
  description: "Descrição",
  date: "Data",
  income: "Receita",
  expense: "Despesa",
};

export function exportToCSV(
  data: Array<{ [key: string]: unknown }>,
  filename = "dados.csv"
) {
  if (!data.length) return;

  const csvRows = [];
  const headers = Object.keys(data[0]);
  // Traduz os cabeçalhos para português se existir no map
  const translatedHeaders = headers.map((h) => headerMap[h] || h);
  csvRows.push(translatedHeaders.join(";"));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
    });
    csvRows.push(values.join(";"));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
