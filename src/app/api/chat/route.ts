import { NextRequest, NextResponse } from "next/server";
import { Transaction, Meta, ChatMessage, ChatRequest } from "@/types";

// Simulação de IA Financeira (em produção seria integração com OpenAI/Claude)
function generateFinancialAIResponse(
  messages: ChatMessage[],
  transactionData?: {
    transactions: Transaction[];
    metas: Meta[];
    saldo: number;
  }
): string {
  const lastMessage =
    messages[messages.length - 1]?.content.toLowerCase() || "";

  // Análises baseadas nos dados financeiros
  if (transactionData) {
    const { transactions, metas, saldo } = transactionData;

    // Respostas inteligentes baseadas em padrões
    if (
      lastMessage.includes("como está") ||
      lastMessage.includes("situação") ||
      lastMessage.includes("resumo")
    ) {
      const receitas = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);
      const despesas = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);
      const economia = receitas - despesas;

      return (
        `📊 **Análise da sua situação financeira:**\n\n` +
        `💰 **Saldo atual:** R$ ${saldo.toFixed(2)}\n` +
        `📈 **Total de receitas:** R$ ${receitas.toFixed(2)}\n` +
        `📉 **Total de despesas:** R$ ${despesas.toFixed(2)}\n` +
        `💡 **Taxa de economia:** ${(
          (economia / Math.max(receitas, 1)) *
          100
        ).toFixed(1)}%\n\n` +
        `${
          economia > 0
            ? "✅ Parabéns! Você está economizando."
            : "⚠️ Atenção: suas despesas estão altas."
        }\n\n` +
        `🎯 **Metas ativas:** ${metas.length} metas criadas\n\n` +
        `**Sugestão:** ${
          economia > 0
            ? "Continue assim e considere investir o excedente!"
            : "Revise suas categorias de gastos e identifique onde pode economizar."
        }`
      );
    }

    if (
      lastMessage.includes("economizar") ||
      lastMessage.includes("reduzir") ||
      lastMessage.includes("gasto")
    ) {
      const gastosPorCategoria = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc: Record<string, number>, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});

      const topCategorias = Object.entries(gastosPorCategoria)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3);

      return (
        `💡 **Dicas para economizar baseadas nos seus dados:**\n\n` +
        `🔍 **Suas maiores categorias de gasto:**\n` +
        topCategorias
          .map(
            ([cat, val], i) =>
              `${i + 1}. ${cat}: R$ ${(val as number).toFixed(2)}`
          )
          .join("\n") +
        `\n\n📋 **Sugestões personalizadas:**\n` +
        `• Analise a categoria "${topCategorias[0]?.[0]}" - é onde você mais gasta\n` +
        `• Defina um limite mensal para "${topCategorias[1]?.[0]}"\n` +
        `• Considere alternativas mais baratas para "${topCategorias[2]?.[0]}"\n\n` +
        `🎯 **Meta sugerida:** Reduzir 10-15% dos gastos na categoria principal`
      );
    }

    if (lastMessage.includes("meta") || lastMessage.includes("objetivo")) {
      const metasAtingidas = metas.filter((m) => {
        const valorAcumulado = transactions
          .filter((t) => t.metaId === m.id)
          .reduce(
            (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
            0
          );
        return valorAcumulado >= m.valor;
      }).length;

      return (
        `🎯 **Análise das suas metas:**\n\n` +
        `📊 **Status atual:** ${metasAtingidas}/${metas.length} metas atingidas\n` +
        `📈 **Taxa de sucesso:** ${Math.round(
          (metasAtingidas / Math.max(metas.length, 1)) * 100
        )}%\n\n` +
        `${
          metasAtingidas === metas.length
            ? "🎉 **Parabéns!** Você atingiu todas as suas metas!"
            : `💪 **Continue firme!** Você está a ${
                metas.length - metasAtingidas
              } meta(s) do seu objetivo.`
        }\n\n` +
        `💡 **Dica:** ${
          saldo > 0
            ? "Com seu saldo positivo, considere criar uma meta de investimento!"
            : "Foque primeiro em equilibrar suas finanças antes de criar novas metas."
        }`
      );
    }

    if (
      lastMessage.includes("investir") ||
      lastMessage.includes("aplicar") ||
      lastMessage.includes("rendimento")
    ) {
      const mediaEconomia = saldo / Math.max(transactions.length / 30, 1); // Economia por mês aproximada

      return (
        `💰 **Análise de investimentos baseada no seu perfil:**\n\n` +
        `📊 **Sua capacidade de investimento:**\n` +
        `• Saldo disponível: R$ ${saldo.toFixed(2)}\n` +
        `• Economia mensal estimada: R$ ${mediaEconomia.toFixed(2)}\n\n` +
        `🎯 **Sugestões de estratégia:**\n` +
        `${
          saldo > 1000
            ? "• Considere investir 70% em renda fixa e 30% em renda variável\n• Reserve uma parte para emergências (3-6 meses de gastos)"
            : "• Foque primeiro em criar uma reserva de emergência\n• Comece com investimentos de baixo risco"
        }\n\n` +
        `📈 **Próximos passos:**\n` +
        `1. Defina uma meta de investimento mensal\n` +
        `2. Estude sobre Tesouro Direto e CDBs\n` +
        `3. Considere aportes automáticos`
      );
    }
  }

  // Respostas gerais sobre finanças
  if (
    lastMessage.includes("orçamento") ||
    lastMessage.includes("planejamento")
  ) {
    return (
      `📋 **Dicas de planejamento financeiro:**\n\n` +
      `🏗️ **Regra 50-30-20:**\n` +
      `• 50% para necessidades (moradia, alimentação)\n` +
      `• 30% para desejos (lazer, compras)\n` +
      `• 20% para poupança e investimentos\n\n` +
      `📊 **Como organizar:**\n` +
      `1. Liste todas as receitas e despesas\n` +
      `2. Categorize os gastos por prioridade\n` +
      `3. Defina metas realistas para cada categoria\n` +
      `4. Monitore mensalmente e ajuste quando necessário`
    );
  }

  if (lastMessage.includes("emergência") || lastMessage.includes("reserva")) {
    return (
      `🆘 **Reserva de emergência:**\n\n` +
      `💡 **O que é:** Valor guardado para imprevistos\n` +
      `📊 **Quanto guardar:** 3 a 6 meses de gastos essenciais\n\n` +
      `🎯 **Como começar:**\n` +
      `1. Calcule seus gastos mensais básicos\n` +
      `2. Defina uma meta (ex: R$ 5.000)\n` +
      `3. Poupe um valor fixo todo mês\n` +
      `4. Mantenha em investimento de alta liquidez\n\n` +
      `✅ **Onde investir:** Poupança, CDB liquidez diária, ou Tesouro Selic`
    );
  }

  // Respostas padrão baseadas em palavras-chave
  const responses = {
    cumprimento:
      "Olá! 👋 Sou seu assistente financeiro inteligente. Posso te ajudar com análises, dicas de economia, planejamento e muito mais. Como posso te ajudar hoje?",
    despedida:
      "Foi um prazer te ajudar! 😊 Continue cuidando bem das suas finanças. Até a próxima! 💰",
    default:
      "🤖 Sou seu assistente financeiro! Posso te ajudar com:\n\n" +
      "📊 Análise da sua situação atual\n" +
      "💡 Dicas de economia personalizadas\n" +
      "🎯 Estratégias para atingir metas\n" +
      "💰 Sugestões de investimento\n" +
      "📋 Planejamento financeiro\n\n" +
      "O que você gostaria de saber?",
  };

  if (
    lastMessage.includes("oi") ||
    lastMessage.includes("olá") ||
    lastMessage.includes("tchau") ||
    lastMessage.includes("obrigado")
  ) {
    return responses.cumprimento;
  }

  return responses.default;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, transactionData } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Mensagens são obrigatórias" },
        { status: 400 }
      );
    }

    // Gerar resposta da IA
    const response = generateFinancialAIResponse(messages, transactionData);

    return NextResponse.json({
      message: {
        role: "assistant",
        content: response,
      },
    });
  } catch (error) {
    console.error("Erro na API de chat:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
