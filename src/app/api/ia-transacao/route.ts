import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface para metas
interface Meta {
  id: string;
  nome: string;
  valor: number;
}

// Interface para dados de parcelamento
interface InstallmentData {
  installments?: number;
  adjustedAmount?: number;
}

// Função para detectar parcelamento
function detectInstallments(text: string): InstallmentData {
  const textLower = text.toLowerCase();

  // Padrões para detectar parcelamento
  const installmentPatterns = [
    /(?:em\s+)?(\d+)\s*(?:x|vezes|parcelas?)/i, // "em 3x", "3 vezes", "2 parcelas"
    /parcelad[oa]\s+(?:em\s+)?(\d+)/i, // "parcelado em 3"
    /dividid[oa]\s+(?:em\s+)?(\d+)/i, // "dividido em 4"
    /(\d+)\s*(?:x|vezes)\s+(?:de|sem\s+juros)/i, // "3x de", "2 vezes sem juros"
  ];

  for (const pattern of installmentPatterns) {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      const installments = parseInt(match[1]);
      if (installments > 1 && installments <= 100) {
        // limite razoável
        return { installments };
      }
    }
  }

  return {};
}

// Função para buscar meta associada
function findAssociatedMeta(text: string, metas: Meta[] = []): string | null {
  if (!metas || metas.length === 0) return null;

  const textLower = text.toLowerCase();

  // Buscar por nome exato primeiro
  for (const meta of metas) {
    const metaNameLower = meta.nome.toLowerCase();
    if (textLower.includes(metaNameLower)) {
      return meta.id;
    }
  }

  // Buscar por palavras-chave relacionadas a metas comuns
  const metaKeywords = [
    {
      keywords: ["viagem", "viajar", "turismo", "férias"],
      metaNames: ["viagem"],
    },
    {
      keywords: ["casa", "apartamento", "imóvel", "moradia"],
      metaNames: ["casa"],
    },
    { keywords: ["carro", "veículo", "automóvel"], metaNames: ["carro"] },
    {
      keywords: ["emergência", "reserva", "emergencia"],
      metaNames: ["emergência", "reserva"],
    },
    {
      keywords: ["curso", "educação", "estudo", "faculdade"],
      metaNames: ["educação", "curso"],
    },
  ];

  for (const keywordGroup of metaKeywords) {
    if (keywordGroup.keywords.some((keyword) => textLower.includes(keyword))) {
      for (const metaName of keywordGroup.metaNames) {
        const foundMeta = metas.find((m) =>
          m.nome.toLowerCase().includes(metaName)
        );
        if (foundMeta) {
          return foundMeta.id;
        }
      }
    }
  }

  return null;
}

// Função para extrair valor monetário
function extractAmount(text: string): number {
  const textLower = text.toLowerCase();

  // Primeiro, verificar se há padrão "X vezes de Y" para calcular total
  const installmentValuePatterns = [
    /(\d+)\s*(?:x|vezes|parcelas?)\s+de\s+(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "3x de R$ 100"
    /(\d+)\s*(?:x|vezes|parcelas?)\s+(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "3x R$ 100"
    /em\s+(\d+)\s*(?:x|vezes|parcelas?)\s+de\s+(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "em 3x de R$ 100"
  ];

  for (const pattern of installmentValuePatterns) {
    const match = textLower.match(pattern);
    if (match && match[1] && match[2]) {
      const installments = parseInt(match[1]);
      const installmentValue = parseFloat(match[2].replace(",", "."));
      if (installments > 0 && installmentValue > 0) {
        // Se encontrou padrão "X vezes de Y", o total é X * Y
        return installments * installmentValue;
      }
    }
  }

  // Padrões para capturar valores em diferentes formatos (valor total)
  const patterns = [
    /r\$\s*(\d+(?:[,.]?\d+)?)/i, // "R$ 50", "R$100"
    /(\d+(?:[,.]?\d+)?)\s*(?:reais?|r\$|rs)/i, // "50 reais", "100 R$"
    /(\d+(?:[,.]?\d+)?)\s*(?:real|reais)/i, // "100 real"
    /(?:gastei|paguei|recebi|ganhei|custou|comprei|vendi)\s+(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "gastei R$ 50"
    /(?:valor|preço|preco)\s+(?:de\s+)?(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "valor de R$ 100"
    /(\d+(?:[,.]?\d+)?)\s*(?:conto|contos|pau|paus|pratas?|dinheiro)/i, // gírias
    /(\d+(?:[,.]?\d+)?)/i, // qualquer número (último recurso)
  ];

  for (const pattern of patterns) {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(",", "."));
      if (amount > 0) {
        return amount;
      }
    }
  }

  return 0;
}

// Função para determinar tipo de transação
function determineTransactionType(text: string): "income" | "expense" {
  const textLower = text.toLowerCase();

  const incomeWords = [
    "recebi",
    "ganhei",
    "receita",
    "salário",
    "salario",
    "ganho",
    "entrada",
    "recebimento",
    "pagamento recebido",
    "dinheiro que recebi",
    "lucro",
    "rendimento",
    "venda",
    "vendeu",
    "vendi",
    "freelance",
    "freela",
    "bonificação",
    "bônus",
    "prêmio",
    "comissão",
    "dividendos",
  ];

  return incomeWords.some((word) => textLower.includes(word))
    ? "income"
    : "expense";
}

// Função para determinar categoria
function determineCategory(text: string, type: "income" | "expense"): string {
  const textLower = text.toLowerCase();

  if (type === "income") {
    // Categorias para receitas
    if (
      textLower.includes("salário") ||
      textLower.includes("salario") ||
      textLower.includes("trabalho")
    ) {
      return "salario";
    } else if (
      textLower.includes("freelance") ||
      textLower.includes("freela")
    ) {
      return "freelance";
    } else if (
      textLower.includes("venda") ||
      textLower.includes("vendeu") ||
      textLower.includes("vendi")
    ) {
      return "vendas";
    } else if (
      textLower.includes("investimento") ||
      textLower.includes("dividendo") ||
      textLower.includes("renda")
    ) {
      return "investimentos";
    } else if (
      textLower.includes("presente") ||
      textLower.includes("gift") ||
      textLower.includes("doação")
    ) {
      return "presentes";
    }
    return "outros";
  }

  // Categorias para despesas
  const categoryMappings = [
    {
      category: "alimentacao",
      keywords: [
        "mercado",
        "comida",
        "alimento",
        "supermercado",
        "açougue",
        "acougue",
        "padaria",
        "restaurante",
        "lanche",
        "pizza",
        "hambúrguer",
        "hamburguer",
        "delivery",
        "ifood",
      ],
    },
    {
      category: "transporte",
      keywords: [
        "gasolina",
        "transporte",
        "uber",
        "taxi",
        "ônibus",
        "onibus",
        "metro",
        "metrô",
        "combustível",
        "combustivel",
        "estacionamento",
        "99",
        "viagem",
        "passagem",
        "pedágio",
        "pedagio",
      ],
    },
    {
      category: "saude",
      keywords: [
        "remédio",
        "remedio",
        "médico",
        "medico",
        "saúde",
        "saude",
        "hospital",
        "farmácia",
        "farmacia",
        "consulta",
        "exame",
        "dentista",
        "plano de saúde",
        "plano de saude",
      ],
    },
    {
      category: "casa",
      keywords: [
        "casa",
        "aluguel",
        "moradia",
        "apartamento",
        "condomínio",
        "condominio",
        "água",
        "agua",
        "luz",
        "energia",
        "internet",
        "gás",
        "gas",
        "iptu",
        "reforma",
      ],
    },
    {
      category: "vestuario",
      keywords: [
        "roupa",
        "sapato",
        "camisa",
        "calça",
        "calca",
        "vestido",
        "tênis",
        "tenis",
        "moda",
        "loja",
        "shopping",
      ],
    },
    {
      category: "lazer",
      keywords: [
        "cinema",
        "show",
        "festa",
        "diversão",
        "entretenimento",
        "jogo",
        "streaming",
        "netflix",
        "spotify",
      ],
    },
    {
      category: "educacao",
      keywords: [
        "curso",
        "educação",
        "educacao",
        "livro",
        "faculdade",
        "escola",
        "ensino",
        "aula",
        "material escolar",
      ],
    },
  ];

  for (const mapping of categoryMappings) {
    if (mapping.keywords.some((keyword) => textLower.includes(keyword))) {
      return mapping.category;
    }
  }

  return "outros";
}

// Função de fallback que processa localmente
function fallbackLocalProcessing(text: string, metas: Meta[] = []) {
  // 1. Extrair valor
  const amount = extractAmount(text);
  if (amount <= 0) {
    return NextResponse.json({
      success: false,
      message: "Não foi possível identificar o valor da transação",
    });
  }

  // 2. Determinar tipo (receita ou despesa)
  const type = determineTransactionType(text);

  // 3. Determinar categoria
  const category = determineCategory(text, type);

  // 4. Detectar parcelamento
  const installmentData = detectInstallments(text);

  // 5. Buscar meta associada
  const metaId = findAssociatedMeta(text, metas);

  // 6. Data atual
  const today = new Date();
  const date = today.toISOString().split("T")[0];

  // 7. Descrição limpa (preserva acentos, remove caracteres especiais problemáticos)
  let description = text.trim();
  // Remover apenas caracteres realmente problemáticos, preservando acentos e pontuação básica
  description = description.replace(
    /[^\w\s\dáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ.,!?()$/€£¥%+-]/g,
    ""
  );
  if (description.length > 100) {
    description = description.substring(0, 100) + "...";
  }

  // 8. Preparar resposta base
  const baseTransaction = {
    type,
    amount,
    description,
    category,
    date,
    metaId,
  };

  // 9. Se há parcelamento, retornar com informações especiais
  if (installmentData.installments && installmentData.installments > 1) {
    const installmentAmount = amount / installmentData.installments;

    return NextResponse.json({
      success: true,
      transaction: {
        ...baseTransaction,
        amount: installmentAmount, // valor por parcela
        installments: installmentData.installments,
        description: `${description} (${
          installmentData.installments
        }x de R$ ${installmentAmount.toFixed(2)})`,
      },
      confidence: 0.8,
      source: "fallback_local",
      isInstallment: true,
      totalAmount: amount,
      needsMultipleTransactions: true,
      message: `Transação parcelada detectada: ${
        installmentData.installments
      }x de R$ ${installmentAmount.toFixed(2)}`,
    });
  }

  // 10. Resposta normal (sem parcelamento)
  return NextResponse.json({
    success: true,
    transaction: baseTransaction,
    confidence: 0.8,
    source: "fallback_local",
    ...(metaId && { message: `Associado à meta encontrada` }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { text, metas } = await request.json();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Texto é obrigatório",
        },
        { status: 400 }
      );
    }

    // Se não há chave da OpenAI, usar fallback direto
    if (!process.env.OPENAI_API_KEY) {
      console.log(
        "🔄 Chave da OpenAI não configurada, usando fallback local..."
      );
      return fallbackLocalProcessing(text, metas);
    }

    // Preparar contexto das metas
    const metasContext =
      metas && metas.length > 0
        ? `\nMetas disponíveis: ${metas
            .map(
              (meta: { id: string; nome: string; valor: number }) => meta.nome
            )
            .join(", ")}`
        : "";

    const prompt = `
Você é um assistente financeiro especializado em extrair informações de transações de texto em português brasileiro.

Analise o seguinte texto e extraia as informações da transação financeira:
"${text}"
${metasContext}

REGRAS IMPORTANTES:
1. Determine se é uma RECEITA (income) ou DESPESA (expense)
2. Extraia o valor numérico (apenas números, sem R$ ou símbolos)
3. Identifique a categoria mais apropriada
4. Se uma meta for mencionada e existir na lista, use o ID da meta
5. Use a data atual se não especificada
6. Seja preciso na interpretação

CATEGORIAS VÁLIDAS:
Para DESPESAS: alimentacao, transporte, saude, educacao, lazer, casa, vestuario, outros
Para RECEITAS: salario, freelance, investimentos, vendas, presentes, outros

Responda APENAS com um JSON válido no seguinte formato:
{
  "success": true,
  "transaction": {
    "type": "income" ou "expense",
    "amount": número,
    "description": "descrição clara",
    "category": "categoria",
    "date": "YYYY-MM-DD",
    "metaId": "id_da_meta_se_aplicavel_ou_null"
  },
  "confidence": número_entre_0_e_1
}

Se não conseguir extrair informações suficientes, responda:
{
  "success": false,
  "message": "Não foi possível interpretar a transação. Tente ser mais específico."
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente financeiro especializado em extrair dados de transações de texto em português brasileiro. Responda sempre com JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const responseText = completion.choices[0].message.content;

      if (!responseText) {
        return NextResponse.json(
          {
            success: false,
            message: "Erro na resposta da IA",
          },
          { status: 500 }
        );
      }

      try {
        const result = JSON.parse(responseText);

        // Validar estrutura da resposta
        if (result.success && result.transaction) {
          const { type, amount, description, category, date } =
            result.transaction;

          if (!type || !amount || !description || !category || !date) {
            return NextResponse.json(
              {
                success: false,
                message: "Dados da transação incompletos",
              },
              { status: 400 }
            );
          }

          if (type !== "income" && type !== "expense") {
            return NextResponse.json(
              {
                success: false,
                message: "Tipo de transação inválido",
              },
              { status: 400 }
            );
          }

          if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
              {
                success: false,
                message: "Valor da transação inválido",
              },
              { status: 400 }
            );
          }
        }

        return NextResponse.json(result);
      } catch (parseError) {
        console.error("Erro ao fazer parse da resposta da IA:", parseError);
        console.log("🔄 Erro no parse da OpenAI, usando fallback local...");
        return fallbackLocalProcessing(text, metas);
      }
    } catch (openaiError) {
      console.error("Erro na OpenAI:", openaiError);

      // Fallback: Se a OpenAI falhar (quota, rede, etc), usar processamento local
      if (
        openaiError instanceof Error &&
        (openaiError.message.includes("429") ||
          openaiError.message.includes("quota") ||
          openaiError.message.includes("exceeded"))
      ) {
        console.log("🔄 Quota da OpenAI excedida, usando fallback local...");
      } else {
        console.log("🔄 Erro na OpenAI, usando fallback local...");
      }

      return fallbackLocalProcessing(text, metas);
    }
  } catch (error) {
    console.error("Erro geral na API de IA:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
