import { NextRequest, NextResponse } from "next/server";

interface CategoriaGasto {
  categoria: string;
  valor: number;
}

interface DetalheMeta {
  nome: string;
  valor: number;
}

interface UltimaTransacao {
  tipo: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    console.log("📊 Contexto recebido:", JSON.stringify(context, null, 2));
    console.log("💬 Mensagem:", message);

    // Análise avançada do contexto para respostas mais precisas
    let response = "";
    const messageLower = message.toLowerCase();

    if (!context) {
      return NextResponse.json({
        response:
          "Desculpe, não consegui acessar seus dados financeiros no momento. Tente novamente.",
        timestamp: new Date().toISOString(),
      });
    }

    const {
      saldo,
      totalReceitas,
      totalDespesas,
      totalTransacoes,
      metasAtivas,
      categoriasMaisGastosas,
      tendenciaUltimos30Dias,
      detalhesTransacoes,
      detalheMetas,
    } = context;

    // Respostas baseadas em análise específica dos dados
    if (messageLower.includes("saldo") || messageLower.includes("situação")) {
      if (saldo > 0) {
        response = `✅ Sua situação financeira está positiva! Você tem um saldo de R$ ${saldo.toFixed(
          2
        )}. `;
        if (saldo > 5000) {
          response +=
            "Com esse saldo, você está em uma excelente posição para fazer investimentos ou criar uma reserva de emergência.";
        } else if (saldo > 1000) {
          response +=
            "É um bom valor para manter como reserva de emergência e talvez investir uma parte.";
        } else {
          response +=
            "É importante manter esse saldo positivo e tentar aumentá-lo gradualmente.";
        }
      } else {
        response = `⚠️ Atenção! Você está com saldo negativo de R$ ${Math.abs(
          saldo
        ).toFixed(
          2
        )}. Precisa urgentemente reduzir gastos ou aumentar receitas.`;
      }
    } else if (
      messageLower.includes("gasto") ||
      messageLower.includes("despesa")
    ) {
      response = `💸 Você teve R$ ${totalDespesas.toFixed(2)} em despesas. `;

      if (categoriasMaisGastosas && categoriasMaisGastosas.length > 0) {
        response += `Suas maiores despesas são: `;
        categoriasMaisGastosas.forEach((cat: CategoriaGasto, index: number) => {
          response += `${index + 1}º ${cat.categoria} (R$ ${cat.valor.toFixed(
            2
          )})`;
          if (index < categoriasMaisGastosas.length - 1) response += ", ";
        });
        response += ". ";

        const maiorCategoria = categoriasMaisGastosas[0];
        const percentualMaior = (
          (maiorCategoria.valor / totalDespesas) *
          100
        ).toFixed(1);
        response += `A categoria "${maiorCategoria.categoria}" representa ${percentualMaior}% dos seus gastos.`;
      }

      if (totalDespesas > totalReceitas) {
        response += " ⚠️ Suas despesas estão maiores que suas receitas!";
      }
    } else if (
      messageLower.includes("receita") ||
      messageLower.includes("renda")
    ) {
      response = `💰 Suas receitas totalizam R$ ${totalReceitas.toFixed(2)}. `;

      if (totalReceitas > totalDespesas) {
        const sobra = totalReceitas - totalDespesas;
        response += `Parabéns! Você tem uma sobra de R$ ${sobra.toFixed(
          2
        )} este período. Considere investir essa quantia.`;
      } else if (totalReceitas === totalDespesas) {
        response +=
          "Suas receitas e despesas estão equilibradas, mas seria ideal ter uma margem de segurança.";
      } else {
        const deficit = totalDespesas - totalReceitas;
        response += `Atenção! Você tem um déficit de R$ ${deficit.toFixed(
          2
        )}. Precisa aumentar receitas ou reduzir gastos.`;
      }
    } else if (
      messageLower.includes("meta") ||
      messageLower.includes("objetivo")
    ) {
      response = `🎯 Você tem ${metasAtivas} meta(s) ativa(s). `;
      if (metasAtivas === 0) {
        response +=
          "Que tal estabelecer algumas metas financeiras? Isso ajuda muito no controle das finanças!";
      } else {
        if (detalheMetas && detalheMetas.length > 0) {
          response += "Suas metas: ";
          detalheMetas.forEach((meta: DetalheMeta, index: number) => {
            response += `${meta.nome} (R$ ${meta.valor.toFixed(2)})`;
            if (index < detalheMetas.length - 1) response += ", ";
          });
          response += ". ";
        }
        response +=
          "Continue focado em suas metas! Elas são fundamentais para o sucesso financeiro.";
      }
    } else if (
      messageLower.includes("economizar") ||
      messageLower.includes("economia")
    ) {
      if (categoriasMaisGastosas && categoriasMaisGastosas.length > 0) {
        const maiorGasto = categoriasMaisGastosas[0];
        response = `💡 Para economizar, foque na categoria "${
          maiorGasto.categoria
        }" onde você gasta R$ ${maiorGasto.valor.toFixed(2)}. `;
        response += "Tente reduzir 10-20% nessa categoria no próximo mês.";
      } else {
        response =
          "💡 Para economizar: revise gastos desnecessários, compare preços antes de comprar e estabeleça um orçamento mensal para cada categoria.";
      }
    } else if (
      messageLower.includes("tendência") ||
      messageLower.includes("últimos")
    ) {
      if (tendenciaUltimos30Dias) {
        const {
          receitas,
          despesas,
          saldo: saldoTendencia,
        } = tendenciaUltimos30Dias;
        response = `📈 Nos últimos 30 dias: receitas R$ ${receitas.toFixed(
          2
        )}, despesas R$ ${despesas.toFixed(2)}. `;

        if (saldoTendencia > 0) {
          response += `Resultado positivo de R$ ${saldoTendencia.toFixed(
            2
          )}! Tendência boa.`;
        } else {
          response += `Resultado negativo de R$ ${Math.abs(
            saldoTendencia
          ).toFixed(2)}. Precisa melhorar a tendência.`;
        }
      }
    } else if (
      messageLower.includes("transaç") ||
      messageLower.includes("moviment")
    ) {
      response = `📊 Você tem ${totalTransacoes} transações registradas. `;
      if (totalTransacoes < 5) {
        response +=
          "Que tal registrar mais movimentações para ter um controle financeiro mais preciso?";
      } else {
        response += "Ótimo controle! ";
        if (detalhesTransacoes && detalhesTransacoes.ultimasTransacoes) {
          response += `Suas últimas movimentações: `;
          detalhesTransacoes.ultimasTransacoes
            .slice(0, 3)
            .forEach((t: UltimaTransacao, index: number) => {
              response += `${t.tipo} de R$ ${t.valor.toFixed(2)} (${
                t.categoria
              })`;
              if (
                index < 2 &&
                index < detalhesTransacoes.ultimasTransacoes.length - 1
              )
                response += ", ";
            });
          response += `. Média diária de gastos: R$ ${detalhesTransacoes.mediaGastosDiarios}.`;
        }
      }
    } else {
      // Resposta geral com resumo dos dados
      const balancoGeral = totalReceitas - totalDespesas;
      response = `📊 Resumo financeiro: Saldo R$ ${saldo.toFixed(2)}, `;
      response += `${totalTransacoes} transações, ${metasAtivas} metas ativas. `;

      if (balancoGeral > 0) {
        response += `Balanço positivo de R$ ${balancoGeral.toFixed(2)}! 💚`;
      } else if (balancoGeral < 0) {
        response += `Balanço negativo de R$ ${Math.abs(balancoGeral).toFixed(
          2
        )}. ⚠️`;
      } else {
        response += "Balanço equilibrado. ⚖️";
      }

      response +=
        "\n\nPerguntação mais específica sobre gastos, receitas, metas ou tendências para análises detalhadas!";
    }

    return NextResponse.json({
      response: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro na API de chat:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Para implementação com OpenAI real, descomente e configure:
/*
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    const systemPrompt = `Você é um assistente financeiro inteligente e amigável. 
    Ajude o usuário com análises financeiras personalizadas baseadas em seus dados.
    Contexto atual: ${JSON.stringify(context)}
    
    Sempre:
    - Seja prático e objetivo
    - Dê conselhos financeiros responsáveis
    - Use emojis para tornar as respostas mais amigáveis
    - Baseie suas respostas nos dados fornecidos
    - Sugira ações concretas quando apropriado`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    return NextResponse.json({ 
      response: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro na OpenAI API:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
*/
