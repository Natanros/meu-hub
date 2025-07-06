"use client";

import { Transaction } from "@/types/transaction";

interface Meta {
  id: string;
  nome: string;
  valor: number;
}

export interface ExportData {
  transactions: Transaction[];
  metas: Meta[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    periodo: string;
  };
}

export class ExportManager {
  // Exportar para CSV avançado
  static exportToCSV(
    data: ExportData,
    filename: string = "relatorio-financeiro"
  ) {
    const { transactions, metas, summary } = data;

    // Header do relatório
    let csvContent = `# RELATÓRIO FINANCEIRO - ${new Date().toLocaleDateString(
      "pt-BR"
    )}\n`;
    csvContent += `# Período: ${summary.periodo}\n`;
    csvContent += `# Total Receitas: R$ ${summary.totalReceitas.toFixed(2)}\n`;
    csvContent += `# Total Despesas: R$ ${summary.totalDespesas.toFixed(2)}\n`;
    csvContent += `# Saldo: R$ ${summary.saldo.toFixed(2)}\n\n`;

    // Seção de Transações
    csvContent += `TRANSAÇÕES\n`;
    csvContent += `Data,Tipo,Categoria,Descrição,Valor,Meta,Parcelas,Recorrência\n`;

    transactions.forEach((t) => {
      const meta = metas.find((m) => m.id === t.metaId);
      csvContent += `${t.date},${t.type === "income" ? "Receita" : "Despesa"},${
        t.category
      },"${t.description || ""}",${t.amount.toFixed(2)},"${meta?.nome || ""}",${
        t.installments || ""
      },${t.recurrence || ""}\n`;
    });

    // Seção de Metas
    csvContent += `\nMETAS\n`;
    csvContent += `Nome,Valor Meta,Valor Acumulado,Progresso %\n`;

    metas.forEach((meta) => {
      const valorAcumulado = transactions
        .filter((t) => t.metaId === meta.id)
        .reduce(
          (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
          0
        );

      const progresso = (valorAcumulado / meta.valor) * 100;
      csvContent += `"${meta.nome}",${meta.valor.toFixed(
        2
      )},${valorAcumulado.toFixed(2)},${progresso.toFixed(1)}%\n`;
    });

    // Análise por categoria
    csvContent += `\nANÁLISE POR CATEGORIA\n`;
    csvContent += `Categoria,Valor Total,Percentual\n`;

    const categorias = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(categorias)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, valor]) => {
        const percentual = (valor / summary.totalDespesas) * 100;
        csvContent += `${cat},${valor.toFixed(2)},${percentual.toFixed(1)}%\n`;
      });

    this.downloadFile(csvContent, `${filename}.csv`, "text/csv");
  }

  // Exportar relatório executivo em TXT
  static exportExecutiveReport(
    data: ExportData,
    filename: string = "relatorio-executivo"
  ) {
    const { transactions, metas, summary } = data;
    const agora = new Date();

    let report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           RELATÓRIO EXECUTIVO FINANCEIRO                    ║
║                              ${agora.toLocaleDateString(
      "pt-BR"
    )} - ${agora.toLocaleTimeString("pt-BR")}                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 RESUMO GERAL
═══════════════════════════════════════════════════════════════════════════════
💰 Saldo Atual: R$ ${summary.saldo.toFixed(2)} ${
      summary.saldo > 0 ? "✅" : "⚠️"
    }
📈 Total Receitas: R$ ${summary.totalReceitas.toFixed(2)}
📉 Total Despesas: R$ ${summary.totalDespesas.toFixed(2)}
📊 Taxa de Economia: ${
      summary.totalReceitas > 0
        ? ((summary.saldo / summary.totalReceitas) * 100).toFixed(1)
        : "0"
    }%
📅 Período Analisado: ${summary.periodo}
🔢 Total de Transações: ${transactions.length}

🎯 STATUS DAS METAS (${metas.length} metas)
═══════════════════════════════════════════════════════════════════════════════`;

    if (metas.length === 0) {
      report += `
❌ Nenhuma meta definida
💡 Recomendação: Defina metas financeiras para melhor controle!`;
    } else {
      metas.forEach((meta, index) => {
        const valorAcumulado = transactions
          .filter((t) => t.metaId === meta.id)
          .reduce(
            (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
            0
          );

        const progresso = (valorAcumulado / meta.valor) * 100;
        const status =
          progresso >= 100
            ? "✅"
            : progresso >= 80
            ? "🔥"
            : progresso >= 50
            ? "⚡"
            : "⏳";

        report += `
${index + 1}. ${status} ${meta.nome}
   └─ Progresso: ${progresso.toFixed(1)}% (R$ ${valorAcumulado.toFixed(
          2
        )} / R$ ${meta.valor.toFixed(2)})
   └─ Faltam: R$ ${Math.max(0, meta.valor - valorAcumulado).toFixed(2)}`;
      });
    }

    // Análise de categorias
    const categorias = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    report += `

📊 ANÁLISE DE GASTOS POR CATEGORIA
═══════════════════════════════════════════════════════════════════════════════`;

    if (Object.keys(categorias).length === 0) {
      report += `
❌ Nenhuma despesa registrada`;
    } else {
      Object.entries(categorias)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([categoria, valor], index) => {
          const percentual = (valor / summary.totalDespesas) * 100;
          const barLength = Math.floor(percentual / 2);
          const bar =
            "█".repeat(barLength) + "░".repeat(Math.max(0, 25 - barLength));

          report += `
${index + 1}. ${categoria.toUpperCase()}
   ├─ Valor: R$ ${valor.toFixed(2)} (${percentual.toFixed(1)}%)
   └─ [${bar}]`;
        });
    }

    // Insights e recomendações
    report += `

💡 INSIGHTS E RECOMENDAÇÕES
═══════════════════════════════════════════════════════════════════════════════`;

    if (summary.saldo < 0) {
      report += `
⚠️  ALERTA: Saldo negativo detectado!
📝 Ação recomendada: Revisar gastos urgentemente
🎯 Foque em: ${
        Object.entries(categorias).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "controle de despesas"
      }`;
    } else if (summary.saldo > summary.totalReceitas * 0.3) {
      report += `
💰 EXCELENTE: Boa reserva financeira!
📈 Sugestão: Considere investir o excedente
🎯 Oportunidade: Aumentar suas metas de economia`;
    } else {
      report += `
✅ BOM: Situação financeira equilibrada
📊 Continue: Mantendo o controle atual
🎯 Melhoria: Tente economizar mais 5-10%`;
    }

    // Categorias que merecem atenção
    const categoriaProblematica = Object.entries(categorias).find(
      ([, valor]) => valor / summary.totalDespesas > 0.4
    );

    if (categoriaProblematica) {
      report += `
⚠️  ATENÇÃO: Categoria "${categoriaProblematica[0]}" consome ${(
        (categoriaProblematica[1] / summary.totalDespesas) *
        100
      ).toFixed(1)}% do orçamento
💡 Recomendação: Revisar gastos nesta categoria`;
    }

    // Análise temporal
    const ultimoMes = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      return transactionDate >= umMesAtras;
    });

    const gastosUltimoMes = ultimoMes
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    report += `

📅 ANÁLISE TEMPORAL (ÚLTIMOS 30 DIAS)
═══════════════════════════════════════════════════════════════════════════════
📊 Transações: ${ultimoMes.length}
💸 Gastos: R$ ${gastosUltimoMes.toFixed(2)}
📈 Média diária: R$ ${(gastosUltimoMes / 30).toFixed(2)}
🎯 Status: ${
      gastosUltimoMes > summary.totalDespesas * 0.4
        ? "Gastos elevados ⚠️"
        : "Gastos controlados ✅"
    }`;

    report += `

═══════════════════════════════════════════════════════════════════════════════
📋 Relatório gerado automaticamente pelo Meu Hub Financeiro
🤖 Para mais análises, acesse a seção de IA do sistema
═══════════════════════════════════════════════════════════════════════════════`;

    this.downloadFile(report, `${filename}.txt`, "text/plain");
  }

  // Exportar dados para JSON (backup)
  static exportToJSON(
    data: ExportData,
    filename: string = "backup-financeiro"
  ) {
    const exportObject = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        source: "Meu Hub Financeiro",
      },
      ...data,
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, "application/json");
  }

  // Função auxiliar para download
  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Gerar relatório personalizado baseado em período
  static generatePeriodReport(
    transactions: Transaction[],
    metas: Meta[],
    startDate: Date,
    endDate: Date
  ): ExportData {
    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalReceitas = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDespesas = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions: filteredTransactions,
      metas,
      summary: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        periodo: `${startDate.toLocaleDateString(
          "pt-BR"
        )} a ${endDate.toLocaleDateString("pt-BR")}`,
      },
    };
  }
}
