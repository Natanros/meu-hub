import sys
import re
import json
from datetime import datetime, timedelta

texto = sys.argv[1].lower()

# Tipo (income/expense)
tipo = None
if re.search(r"\b(recebi|ganhei|entrada|depositaram|vendi|salário|bonus|recebimento|entrou|lucro|venda|recebido|pix|transferência)\b", texto):
    tipo = "income"
elif re.search(r"\b(paguei|gastei|comprei|pago|gasto|pagar|despesa|compra|pagamento|saída|debitei|debito|transferi|enviei|retirei|retirada|pix|boleto|cartão)\b", texto):
    tipo = "expense"

# Valor (aceita "R$ 100", "100 reais", "100,50", "100.50", "120" isolado, etc)
valor = None
match = re.search(r"(r\$[\s]*)?(\d{1,5}(?:[.,]\d{1,2})?)\s*(reais|r\$)?", texto)
if match:
    valor = float(match.group(2).replace(",", "."))

# Categoria (palavra ou grupo de palavras após preposição, ou última palavra relevante)
categoria = None
cat_match = re.search(r"(?:na|no|em|para|do|da|de|pro|pra|ao|aos|às|dos|das)\s+([a-zçãáéíóúâêôõü\s]+?)(?:\s|$|\d|r\$)", texto)
if cat_match:
    categoria = cat_match.group(1).strip()
else:
    # Palavras-chave comuns e compostas
    palavras_chave = [
        "mercado", "pizzaria", "restaurante", "farmácia", "aluguel", "salário", "transporte",
        "lazer", "luz", "água", "internet", "padaria", "cinema", "bar", "academia", "escola",
        "faculdade", "livro", "presente", "viagem", "combustível", "gasolina", "energia", "telefone",
        "cartão crédito", "cartão débito", "cartão", "boleto", "pix", "iptu", "ipva", "seguro", "condomínio"
    ]
    for palavra in palavras_chave:
        if palavra in texto:
            categoria = palavra
            break
    # Se ainda não achou, pega a última palavra relevante (não número, não preposição)
    if not categoria:
        tokens = [t for t in re.findall(r"\b[a-zçãáéíóúâêôõü]+\b", texto) if t not in [
            "na", "no", "em", "para", "do", "da", "de", "pro", "pra", "ao", "aos", "às", "dos", "das",
            "reais", "recebi", "ganhei", "entrada", "depositaram", "vendi", "paguei", "gastei", "comprei",
            "pago", "gasto", "pagar", "despesa", "compra", "pagamento", "ontem", "hoje", "amanhã"
        ]]
        if tokens:
            categoria = tokens[-1]

# Data (relativa, explícita, ou padrão hoje)
hoje = datetime.now().date()
data = str(hoje)
if "ontem" in texto:
    data = str(hoje - timedelta(days=1))
elif "amanhã" in texto:
    data = str(hoje + timedelta(days=1))
else:
    # Procura por datas explícitas: "10/06/2025", "10-06-2025", "dia 10"
    data_match = re.search(r"(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?", texto)
    if data_match:
        dia = int(data_match.group(1))
        mes = int(data_match.group(2))
        ano = int(data_match.group(3)) if data_match.group(3) else hoje.year
        try:
            data = str(datetime(ano, mes, dia).date())
        except:
            data = str(hoje)
    else:
        data_match = re.search(r"dia\s+(\d{1,2})", texto)
        if data_match:
            dia = int(data_match.group(1))
            try:
                data = str(datetime(hoje.year, hoje.month, dia).date())
            except:
                data = str(hoje)

# Se não achar tipo, tenta inferir: se tem "recebi" ou "ganhei" = income, senão = expense
if not tipo:
    tipo = "income" if any(w in texto for w in ["recebi", "ganhei", "entrada", "depositaram", "vendi", "salário", "bonus", "recebimento"]) else "expense"

descricao = texto

print(json.dumps({
    "type": tipo,
    "amount": valor,
    "category": categoria,
    "date": data,
    "description": descricao
}))