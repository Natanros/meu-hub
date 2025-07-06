import { Transaction } from "@/types/transaction";

interface Meta {
  id: string;
  nome: string;
  valor: number;
}

// Função para exportar como CSV avançado
export function exportAdvancedCSV(
  transactions: Transaction[],
  filename: string = "financeiro-avancado.csv"
) {
  const headers = [
    "Data",
    "Tipo",
    "Categoria",
    "Valor",
    "Descrição",
    "Meta Vinculada",
    "Mês/Ano",
    "Trimestre",
    "Dia da Semana",
  ];

  const csvContent = [
    headers.join(","),
    ...transactions.map((t) => {
      const date = new Date(t.date);
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const dayOfWeek = date.toLocaleDateString("pt-BR", { weekday: "long" });

      return [
        t.date,
        t.type === "income" ? "Receita" : "Despesa",
        `"${t.category}"`,
        t.amount.toFixed(2),
        `"${t.description || ""}"`,
        `"${t.metaId || "Sem meta"}"`,
        t.date.slice(0, 7),
        `${quarter}º Trimestre ${date.getFullYear()}`,
        dayOfWeek,
      ].join(",");
    }),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para gerar relatório PDF (simulado - em uma implementação real usaria jsPDF)
export function generatePDFReport(transactions: Transaction[], metas: Meta[]) {
  const report = {
    titulo: "Relatório Financeiro Executivo",
    periodo: `${transactions[0]?.date || "N/A"} até ${
      transactions[transactions.length - 1]?.date || "N/A"
    }`,
    resumo: {
      totalTransacoes: transactions.length,
      totalReceitas: transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0),
      totalDespesas: transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0),
      saldoFinal: transactions.reduce(
        (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
        0
      ),
      metasCriadas: metas.length,
      metasAtingidas: metas.filter((m) => {
        const valorAcumulado = transactions
          .filter((t) => t.metaId === m.id)
          .reduce(
            (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
            0
          );
        return valorAcumulado >= m.valor;
      }).length,
    },
    categorias: Object.entries(
      transactions.reduce((acc, t) => {
        acc[t.category] =
          (acc[t.category] || 0) + (t.type === "income" ? t.amount : -t.amount);
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a)),
    tendencias: {
      mesComMaiorGasto: (() => {
        const gastosPorMes = transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            const mes = t.date.slice(0, 7);
            acc[mes] = (acc[mes] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const maiorGasto = Object.entries(gastosPorMes).sort(
          ([, a], [, b]) => b - a
        )[0];
        return maiorGasto
          ? `${maiorGasto[0]}: R$ ${maiorGasto[1].toFixed(2)}`
          : "N/A";
      })(),
      categoriaComMaiorGasto: (() => {
        const gastosPorCategoria = transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);

        const maiorCategoria = Object.entries(gastosPorCategoria).sort(
          ([, a], [, b]) => b - a
        )[0];
        return maiorCategoria
          ? `${maiorCategoria[0]}: R$ ${maiorCategoria[1].toFixed(2)}`
          : "N/A";
      })(),
    },
  };

  // Simular download do PDF (em implementação real seria gerado um PDF real)
  const reportText = `
    ${report.titulo}
    Período: ${report.periodo}
    
    === RESUMO EXECUTIVO ===
    Total de Transações: ${report.resumo.totalTransacoes}
    Total de Receitas: R$ ${report.resumo.totalReceitas.toFixed(2)}
    Total de Despesas: R$ ${report.resumo.totalDespesas.toFixed(2)}
    Saldo Final: R$ ${report.resumo.saldoFinal.toFixed(2)}
    Metas Criadas: ${report.resumo.metasCriadas}
    Metas Atingidas: ${report.resumo.metasAtingidas}
    
    === ANÁLISE POR CATEGORIA ===
    ${report.categorias
      .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
      .join("\n")}
    
    === TENDÊNCIAS ===
    Mês com Maior Gasto: ${report.tendencias.mesComMaiorGasto}
    Categoria com Maior Gasto: ${report.tendencias.categoriaComMaiorGasto}
    
    === INSIGHTS ===
    - Taxa de economia: ${(
      (report.resumo.saldoFinal / Math.max(report.resumo.totalReceitas, 1)) *
      100
    ).toFixed(1)}%
    - Média de gastos mensais: R$ ${(
      report.resumo.totalDespesas /
      Math.max(new Set(transactions.map((t) => t.date.slice(0, 7))).size, 1)
    ).toFixed(2)}
    - Efetividade de metas: ${Math.round(
      (report.resumo.metasAtingidas / Math.max(report.resumo.metasCriadas, 1)) *
        100
    )}%
  `;

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "relatorio-executivo.txt");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return report;
}

// Função para exportar dados para Excel (simulado)
export function exportToExcel(transactions: Transaction[], metas: Meta[]) {
  const worksheetData = [
    ["RELATÓRIO FINANCEIRO - DADOS COMPLETOS"],
    [""],
    ["=== TRANSAÇÕES ==="],
    ["Data", "Tipo", "Categoria", "Valor", "Descrição", "Meta"],
    ...transactions.map((t) => [
      t.date,
      t.type === "income" ? "Receita" : "Despesa",
      t.category,
      t.amount,
      t.description || "",
      t.metaId || "Sem meta",
    ]),
    [""],
    ["=== RESUMO POR CATEGORIA ==="],
    ["Categoria", "Valor Total", "Percentual"],
    ...Object.entries(
      transactions.reduce((acc, t) => {
        acc[t.category] =
          (acc[t.category] || 0) + (t.type === "income" ? t.amount : -t.amount);
        return acc;
      }, {} as Record<string, number>)
    ).map(([cat, val]) => [
      cat,
      val.toFixed(2),
      `${(
        (Math.abs(val) / transactions.reduce((acc, t) => acc + t.amount, 0)) *
        100
      ).toFixed(1)}%`,
    ]),
    [""],
    ["=== METAS ==="],
    ["Meta", "Valor Objetivo", "Valor Atual", "Progresso"],
    ...metas.map((meta) => {
      const valorAcumulado = transactions
        .filter((t) => t.metaId === meta.id)
        .reduce(
          (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
          0
        );
      return [
        meta.nome,
        meta.valor.toFixed(2),
        valorAcumulado.toFixed(2),
        `${Math.round((valorAcumulado / meta.valor) * 100)}%`,
      ];
    }),
  ];

  const csvContent = worksheetData
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "financeiro-completo.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
