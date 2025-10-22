/**
 * 📄 PDF Report Generator
 * Sistema avançado de geração de relatórios PDF profissionais
 */

import { Transaction } from "@/types/transaction";
import { Meta } from "@/types/meta";

export interface ReportConfig {
  type: "mensal" | "anual" | "personalizado";
  periodo: {
    inicio: Date;
    fim: Date;
  };
  incluirGraficos: boolean;
  incluirMetas: boolean;
  incluirInsights: boolean;
  incluirProjecoes: boolean;
  formato: "executivo" | "detalhado" | "resumido";
}

export interface ReportData {
  transacoes: Transaction[];
  metas: Meta[];
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  categorias: { [key: string]: number };
  tendencia: "crescente" | "estavel" | "decrescente";
  insights: string[];
  projecoes: {
    proximoMes: number;
    proximoTrimestre: number;
    anoFiscal: number;
  };
}

export class PDFReportGenerator {
  private config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  /**
   * 📊 Analisa dados para o relatório
   */
  private analyzeData(transacoes: Transaction[], metas: Meta[]): ReportData {
    const inicioMs = this.config.periodo.inicio.getTime();
    const fimMs = this.config.periodo.fim.getTime();

    // Filtrar transações por período
    const transacoesFiltradas = transacoes.filter((t) => {
      const dataTs = new Date(t.date).getTime();
      return dataTs >= inicioMs && dataTs <= fimMs;
    });

    // Calcular totais
    const receitas = transacoesFiltradas
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const despesas = transacoesFiltradas
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const saldoLiquido = receitas - despesas;

    // Analisar categorias
    const categorias: { [key: string]: number } = {};
    transacoesFiltradas.forEach((t) => {
      if (t.type === "expense") {
        // Apenas despesas
        categorias[t.category] = (categorias[t.category] || 0) + t.amount;
      }
    });

    // Calcular tendência
    const metadeTransacoes = Math.floor(transacoesFiltradas.length / 2);
    const primeiraMetade = transacoesFiltradas
      .slice(0, metadeTransacoes)
      .reduce(
        (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
        0
      );
    const segundaMetade = transacoesFiltradas
      .slice(metadeTransacoes)
      .reduce(
        (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
        0
      );

    let tendencia: "crescente" | "estavel" | "decrescente" = "estavel";
    if (segundaMetade > primeiraMetade * 1.1) tendencia = "crescente";
    if (segundaMetade < primeiraMetade * 0.9) tendencia = "decrescente";

    // Gerar insights
    const insights = this.generateInsights(
      transacoesFiltradas,
      metas,
      categorias,
      saldoLiquido
    );

    // Calcular projeções
    const projecoes = this.calculateProjections(transacoesFiltradas);

    return {
      transacoes: transacoesFiltradas,
      metas,
      periodo: `${this.config.periodo.inicio.toLocaleDateString()} - ${this.config.periodo.fim.toLocaleDateString()}`,
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldoLiquido,
      categorias,
      tendencia,
      insights,
      projecoes,
    };
  }

  /**
   * 🧠 Gera insights inteligentes
   */
  private generateInsights(
    transacoes: Transaction[],
    metas: Meta[],
    categorias: { [key: string]: number },
    saldo: number
  ): string[] {
    const insights: string[] = [];

    // Insight de saldo
    if (saldo > 0) {
      insights.push(
        `💰 Saldo positivo de R$ ${saldo.toFixed(
          2
        )} demonstra controle financeiro`
      );
    } else {
      insights.push(
        `⚠️ Saldo negativo de R$ ${Math.abs(saldo).toFixed(2)} requer atenção`
      );
    }

    // Insight de categoria principal
    const categoriaTop = Object.entries(categorias).sort(
      ([, a], [, b]) => b - a
    )[0];
    if (categoriaTop) {
      const percentual = (
        (categoriaTop[1] /
          Object.values(categorias).reduce((a, b) => a + b, 0)) *
        100
      ).toFixed(1);
      insights.push(
        `📊 '${
          categoriaTop[0]
        }' representa ${percentual}% dos gastos (R$ ${categoriaTop[1].toFixed(
          2
        )})`
      );
    }

    // Insight de metas (assumindo que precisamos calcular progresso)
    if (metas.length > 0) {
      insights.push(`🎯 ${metas.length} meta(s) cadastrada(s) no sistema`);
    }

    // Insight de frequência de transações
    const transacoesPorDia =
      transacoes.length /
      Math.max(
        1,
        Math.ceil(
          (this.config.periodo.fim.getTime() -
            this.config.periodo.inicio.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
    if (transacoesPorDia > 3) {
      insights.push(
        `📈 Alta atividade financeira: ${transacoesPorDia.toFixed(
          1
        )} transações/dia`
      );
    }

    return insights;
  }

  /**
   * 🔮 Calcula projeções futuras
   */
  private calculateProjections(transacoes: Transaction[]): {
    proximoMes: number;
    proximoTrimestre: number;
    anoFiscal: number;
  } {
    if (transacoes.length === 0) {
      return { proximoMes: 0, proximoTrimestre: 0, anoFiscal: 0 };
    }

    // Calcular média mensal baseada no período
    const diasPeriodo = Math.ceil(
      (this.config.periodo.fim.getTime() -
        this.config.periodo.inicio.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const mediaDiaria =
      transacoes.reduce(
        (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
        0
      ) / Math.max(1, diasPeriodo);

    const proximoMes = mediaDiaria * 30;
    const proximoTrimestre = mediaDiaria * 90;
    const anoFiscal = mediaDiaria * 365;

    return {
      proximoMes,
      proximoTrimestre,
      anoFiscal,
    };
  }

  /**
   * 📄 Gera o relatório PDF
   */
  async generateReport(
    transacoes: Transaction[],
    metas: Meta[]
  ): Promise<Blob> {
    const data = this.analyzeData(transacoes, metas);

    // Simular geração de PDF (em produção, usaríamos uma biblioteca como jsPDF)
    const reportContent = this.generateReportContent(data);

    // Por enquanto, retornamos um blob de texto que pode ser usado pelo frontend
    return new Blob([reportContent], { type: "application/pdf" });
  }

  /**
   * 📝 Gera conteúdo estruturado do relatório
   */
  private generateReportContent(data: ReportData): string {
    const { formato } = this.config;

    let content = `
# 📊 RELATÓRIO FINANCEIRO ${formato.toUpperCase()}

**Período:** ${data.periodo}
**Gerado em:** ${new Date().toLocaleString()}

---

## 💰 RESUMO FINANCEIRO

- **Total de Receitas:** R$ ${data.totalReceitas.toFixed(2)}
- **Total de Despesas:** R$ ${data.totalDespesas.toFixed(2)}
- **Saldo Líquido:** R$ ${data.saldoLiquido.toFixed(2)}
- **Tendência:** ${
      data.tendencia === "crescente"
        ? "📈 Crescente"
        : data.tendencia === "decrescente"
        ? "📉 Decrescente"
        : "📊 Estável"
    }

---

## 📊 ANÁLISE POR CATEGORIAS

`;

    // Adicionar categorias
    Object.entries(data.categorias)
      .sort(([, a], [, b]) => b - a)
      .forEach(([categoria, valor]) => {
        const percentual = ((valor / data.totalDespesas) * 100).toFixed(1);
        content += `- **${categoria}:** R$ ${valor.toFixed(
          2
        )} (${percentual}%)\n`;
      });

    if (this.config.incluirInsights) {
      content += `\n---\n\n## 🧠 INSIGHTS INTELIGENTES\n\n`;
      data.insights.forEach((insight) => {
        content += `- ${insight}\n`;
      });
    }

    if (this.config.incluirMetas && data.metas.length > 0) {
      content += `\n---\n\n## 🎯 METAS CADASTRADAS\n\n`;
      data.metas.forEach((meta) => {
        content += `- 📋 **${meta.nome}:** R$ ${meta.valor.toFixed(2)}\n`;
      });
    }

    if (this.config.incluirProjecoes) {
      content += `\n---\n\n## 🔮 PROJEÇÕES FUTURAS\n\n`;
      content += `- **Próximo Mês:** R$ ${data.projecoes.proximoMes.toFixed(
        2
      )}\n`;
      content += `- **Próximo Trimestre:** R$ ${data.projecoes.proximoTrimestre.toFixed(
        2
      )}\n`;
      content += `- **Ano Fiscal:** R$ ${data.projecoes.anoFiscal.toFixed(
        2
      )}\n`;
    }

    if (formato === "detalhado") {
      content += `\n---\n\n## 📋 TRANSAÇÕES DETALHADAS\n\n`;
      data.transacoes.forEach((t) => {
        const tipo = t.type === "income" ? "💰" : "💸";
        const descricao = t.description || "Sem descrição";
        content += `- ${tipo} ${new Date(
          t.date
        ).toLocaleDateString()} - ${descricao} - R$ ${t.amount.toFixed(2)} (${
          t.category
        })\n`;
      });
    }

    content += `\n---\n\n*Relatório gerado automaticamente pelo Sistema Financeiro Inteligente*`;

    return content;
  }

  /**
   * 🎨 Templates pré-definidos
   */
  static getTemplates(): { [key: string]: Partial<ReportConfig> } {
    return {
      executivoMensal: {
        type: "mensal",
        incluirGraficos: true,
        incluirMetas: true,
        incluirInsights: true,
        incluirProjecoes: true,
        formato: "executivo",
      },
      resumoSemanal: {
        type: "personalizado",
        incluirGraficos: false,
        incluirMetas: false,
        incluirInsights: true,
        incluirProjecoes: false,
        formato: "resumido",
      },
      relatorioAnual: {
        type: "anual",
        incluirGraficos: true,
        incluirMetas: true,
        incluirInsights: true,
        incluirProjecoes: true,
        formato: "detalhado",
      },
    };
  }
}

export default PDFReportGenerator;
