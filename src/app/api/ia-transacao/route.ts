import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/auth-helper";

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
    /em\s+(duas|dois|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+(?:vezes|parcelas?)/i, // "em duas vezes" até "em doze parcelas"
    /(duas|dois|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+(?:vezes|parcelas?)/i, // "duas vezes" até "doze parcelas"
    /(\d+)\s*(?:vez|vezes)(?:\s+de)?/i, // "2 vezes de", "3 vez"
    /em\s+(\d+)\s*(?:parte|partes)/i, // "em 2 partes"
    /(\d+)\s*(?:x)/i, // "2x", "3x" (padrão mais simples)
  ];

  // Mapeamento de números por extenso (até 12)
  const numberWords: Record<string, number> = {
    duas: 2,
    dois: 2,
    três: 3,
    tres: 3,
    quatro: 4,
    cinco: 5,
    seis: 6,
    sete: 7,
    oito: 8,
    nove: 9,
    dez: 10,
    onze: 11,
    doze: 12,
  };

  for (const pattern of installmentPatterns) {
    const match = textLower.match(pattern);
    if (match) {
      let installments = 0;

      if (match[1] && !isNaN(parseInt(match[1]))) {
        installments = parseInt(match[1]);
      } else if (match[1] && numberWords[match[1]]) {
        // Capturar números por extenso do match
        installments = numberWords[match[1]];
      } else {
        // Verificar números por extenso no texto inteiro
        for (const [word, num] of Object.entries(numberWords)) {
          if (textLower.includes(word)) {
            installments = num;
            break;
          }
        }
      }

      if (installments > 1 && installments <= 12) {
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
        return installments * installmentValue;
      }
    }
  }
  const patterns = [
    /r\$\s*(\d+(?:[,.]?\d+)?)/i, // "R$ 50", "R$100"
    /(\d+(?:[,.]?\d+)?)\s*(?:reais?|r\$|rs)/i, // "50 reais", "100 R$"
    /(\d+(?:[,.]?\d+)?)\s*(?:real|reais)/i, // "100 real"
    /(?:gastei|paguei|recebi|ganhei|custou|comprei|vendi)\s+(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "gastei R$ 50"
    /(?:valor|preço|preco)\s+(?:de\s+)?(?:r\$\s*)?(\d+(?:[,.]?\d+)?)/i, // "valor de R$ 100"
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

// Função de processamento local de IA
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
        recurrence: "monthly",
        description: `${description}`, // Sem modificar a descrição aqui, será feito no frontend
      },
      confidence: 0.9,
      source: "local_ai",
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
    confidence: 0.9,
    source: "local_ai",
    ...(metaId && { message: `Associado à meta encontrada` }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Não autorizado",
        },
        { status: 401 }
      );
    }

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

    // Usar processamento local de IA
    return fallbackLocalProcessing(text, metas);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
