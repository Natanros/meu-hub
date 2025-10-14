import { NextRequest, NextResponse } from "next/server";
import {
  Transaction as TxModel,
  Meta as MetaModel,
  Prisma,
} from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

type Period = "all" | "1m" | "3m" | "6m" | "1y" | "custom";
type ExportType = "csv" | "json" | "txt";

function computeDateRange(period: Period, start?: string, end?: string) {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  switch (period) {
    case "1m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      endDate = now;
      break;
    case "3m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      );
      endDate = now;
      break;
    case "6m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
      endDate = now;
      break;
    case "1y":
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      endDate = now;
      break;
    case "custom":
      if (start && end) {
        startDate = new Date(start);
        endDate = new Date(end);
      }
      break;
    case "all":
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
}

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCSV(transactions: TxModel[], metas: MetaModel[]) {
  const totalReceitas = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;

  let csv = `# RELATORIO FINANCEIRO\n`;
  csv += `# Total Receitas: ${totalReceitas.toFixed(2)}\n`;
  csv += `# Total Despesas: ${totalDespesas.toFixed(2)}\n`;
  csv += `# Saldo: ${saldo.toFixed(2)}\n\n`;

  csv += `TRANSAÇOES\n`;
  csv += `Data,Tipo,Categoria,Descrição,Valor,Meta,Parcelas,Recorrencia\n`;
  for (const t of transactions) {
    const meta = metas.find((m) => m.id === t.metaId);
    const row = [
      new Date(t.date).toISOString(),
      t.type === "income" ? "Receita" : "Despesa",
      csvEscape(t.category),
      csvEscape(t.description || ""),
      Number(t.amount).toFixed(2),
      csvEscape(meta?.nome || ""),
      t.installments ?? "",
      csvEscape(t.recurrence || ""),
    ].join(",");
    csv += row + "\n";
  }

  csv += `\nMETAS\n`;
  csv += `Nome,Valor Meta,Valor Acumulado,Progresso %\n`;
  for (const m of metas) {
    const valorAcumulado = transactions
      .filter((t) => t.metaId === m.id)
      .reduce(
        (acc, t) =>
          acc + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
        0
      );
    const progresso = (valorAcumulado / Number(m.valor)) * 100;
    csv += `${csvEscape(m.nome)},${Number(m.valor).toFixed(
      2
    )},${valorAcumulado.toFixed(2)},${progresso.toFixed(1)}%\n`;
  }

  return csv;
}

function buildJSON(transactions: TxModel[], metas: MetaModel[]) {
  const totalReceitas = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const exportObject = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: "1.0",
      source: "Meu Hub Financeiro",
    },
    transactions,
    metas,
    summary: {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
    },
  };
  return JSON.stringify(exportObject, null, 2);
}

function buildTXT(
  transactions: TxModel[],
  metas: MetaModel[],
  range?: { startDate: Date | null; endDate: Date | null }
) {
  const totalReceitas = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDespesas = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const saldo = totalReceitas - totalDespesas;

  const despesasPorCategoria = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    despesasPorCategoria.set(
      t.category,
      (despesasPorCategoria.get(t.category) || 0) + Number(t.amount)
    );
  }
  const topDespesas = Array.from(despesasPorCategoria.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const metasResumo = metas.map((m) => {
    const valorAcumulado = transactions
      .filter((t) => t.metaId === m.id)
      .reduce(
        (acc, t) =>
          acc + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
        0
      );
    const progresso = Number(m.valor)
      ? (valorAcumulado / Number(m.valor)) * 100
      : 0;
    return {
      nome: m.nome,
      valorMeta: Number(m.valor),
      valorAcumulado,
      progresso,
    };
  });

  const lines: string[] = [];
  lines.push("RELATÓRIO EXECUTIVO FINANCEIRO");
  lines.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`);
  if (range?.startDate || range?.endDate) {
    lines.push(
      `Período: ${
        range.startDate ? range.startDate.toLocaleDateString("pt-BR") : "início"
      } a ${
        range.endDate ? range.endDate.toLocaleDateString("pt-BR") : "agora"
      }`
    );
  }
  lines.push("");
  lines.push("SUMÁRIO");
  lines.push(`- Receitas: R$ ${totalReceitas.toFixed(2)}`);
  lines.push(`- Despesas: R$ ${totalDespesas.toFixed(2)}`);
  lines.push(`- Saldo: R$ ${saldo.toFixed(2)}`);
  lines.push("");

  lines.push("TOP 5 CATEGORIAS DE DESPESA");
  if (topDespesas.length === 0) {
    lines.push("(sem despesas no período)");
  } else {
    topDespesas.forEach(([cat, val], idx) => {
      lines.push(`${idx + 1}. ${cat}: R$ ${val.toFixed(2)}`);
    });
  }
  lines.push("");

  lines.push("METAS");
  if (metasResumo.length === 0) {
    lines.push("(nenhuma meta cadastrada)");
  } else {
    metasResumo.forEach((m) => {
      lines.push(
        `- ${m.nome}: ${m.progresso.toFixed(1)}% (R$ ${m.valorAcumulado.toFixed(
          2
        )} de R$ ${m.valorMeta.toFixed(2)})`
      );
    });
  }

  lines.push("");
  lines.push("OBSERVAÇÕES E DICAS");
  if (saldo < 0) {
    lines.push(
      "• O saldo está negativo. Considere reduzir gastos nas categorias do Top 5 e revisar metas de curto prazo."
    );
  } else if (saldo < totalDespesas * 0.2) {
    lines.push(
      "• O saldo é positivo, mas apertado. Avalie otimizações em despesas recorrentes e oportunidades de receita."
    );
  } else {
    lines.push(
      "• Boa saúde financeira geral. Considere aumentar aportes em metas prioritárias."
    );
  }

  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = (
      searchParams.get("type") || "csv"
    ).toLowerCase() as ExportType;
    const period = (
      searchParams.get("period") || "all"
    ).toLowerCase() as Period;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;
    const filename = searchParams.get("filename") || undefined;

    const { startDate, endDate } = computeDateRange(period, start, end);

    const where: Prisma.TransactionWhereInput = { userId: user.id };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [transactions, metas] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { date: "asc" } }),
      prisma.meta.findMany({ where: { userId: user.id } }),
    ]);

    if (type === "json") {
      const body = buildJSON(transactions, metas);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${
            filename || "backup-financeiro"
          }.json"`,
        },
      });
    }

    if (type === "txt") {
      const body = buildTXT(transactions, metas, { startDate, endDate });
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${
            filename || "relatorio-executivo"
          }.txt"`,
        },
      });
    }

    // default: csv
    const csv = buildCSV(transactions, metas);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${
          filename || "relatorio-financeiro"
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro no export:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
