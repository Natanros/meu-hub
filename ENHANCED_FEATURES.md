# 🚀 Funcionalidades Melhoradas - Sistema Financeiro

## 📋 Resumo das Melhorias

Este documento detalha as melhorias implementadas no sistema de extração de transações por IA/voz, focando no **fallback local inteligente** com suporte a **metas** e **parcelamento**.

---

## 🤖 Fallback Local Inteligente

### ✨ Funcionalidades

#### 🎯 **Associação com Metas**

- **Detecção automática**: Busca nomes de metas no texto da transação
- **Busca inteligente**: Primeiro por nome exato, depois por palavras-chave relacionadas
- **Mapeamento por contexto**: Reconhece contextos como "viagem", "casa", "carro" e associa às metas correspondentes

**Exemplos:**

- `"Gastei 500 reais para viagem"` → Associa à meta "Viagem"
- `"Comprei material para casa nova"` → Associa à meta "Casa"
- `"Economizei 200 para emergência"` → Associa à meta "Emergência"

#### 💳 **Detecção de Parcelamento**

- **Múltiplos padrões**: Reconhece várias formas de expressar parcelamento
- **Criação automática**: Cria múltiplas transações automaticamente
- **Distribuição mensal**: Cada parcela é criada no mês seguinte

**Padrões reconhecidos:**

- `"em 3x"`, `"3 vezes"`, `"2 parcelas"`
- `"parcelado em 4"`, `"dividido em 6"`
- `"3x de 100 reais"`, `"5 vezes sem juros"`

**Exemplos:**

- `"Comprei um notebook por 1200 em 3x"` → 3 parcelas de R$ 400,00
- `"Parcelei uma TV em 10x de 150 reais"` → 10 parcelas de R$ 150,00

---

## 🔧 Implementação Técnica

### 📦 Estruturas de Dados

#### **Meta Interface**

```typescript
interface Meta {
  id: string;
  nome: string;
  valor: number;
}
```

#### **Dados de Parcelamento**

```typescript
interface InstallmentData {
  installments?: number;
  adjustedAmount?: number;
}
```

### 🧠 Funções Helper

#### 1. **`detectInstallments(text: string)`**

- Usa regex para detectar padrões de parcelamento
- Valida limites razoáveis (1-100 parcelas)
- Retorna número de parcelas ou vazio

#### 2. **`findAssociatedMeta(text: string, metas: Meta[])`**

- Busca por nome exato da meta primeiro
- Depois busca por palavras-chave relacionadas
- Retorna ID da meta ou null

#### 3. **`extractAmount(text: string)`**

- Múltiplos padrões de valores monetários
- Suporte a diferentes formatos (R$, reais, números)
- Inclui gírias brasileiras (conto, pau, prata)

#### 4. **`determineTransactionType(text: string)`**

- Lista expandida de palavras-chave para receitas
- Padrão inteligente: despesa por padrão
- Reconhece contextos específicos

#### 5. **`determineCategory(text: string, type)`**

- Categorização separada para receitas e despesas
- Mapeamento abrangente por palavras-chave
- Categorias específicas do contexto brasileiro

---

## 📱 Interface do Usuário

### 🎤 **VoiceTextInput Melhorado**

#### **Exemplos Atualizados**

```
• "Gastei 45 reais no mercado hoje"
• "Recebi 2500 de salário ontem"
• "Comprei um notebook por 1200 em 3x"
• "Gastei 500 reais para viagem" (associa à meta)
• "Parcelei uma TV em 10x de 150 reais"
```

#### **Feedback Inteligente**

- **Transação normal**: `✨ Transação criada: Despesa de R$ 45,00 🤖 (Local)`
- **Com meta**: `✨ Transação criada: Despesa de R$ 500,00 🤖 (Local) • Associado à meta encontrada`
- **Parcelada**: `✨ 3 parcelas criadas: 3x de R$ 400,00 (Total: R$ 1.200,00) 🤖 Local`

---

## 🗃️ Banco de Dados

### **Campos Suportados**

```prisma
model Transaction {
  id            Int      @id @default(autoincrement())
  type          String   // 'income' ou 'expense'
  category      String
  amount        Float
  description   String?
  date          DateTime
  metaId        String?  // Associação com meta
  meta          Meta?    @relation(fields: [metaId], references: [id])
  installments  Int?     // Número de parcelas
  recurrence    String?  // Tipo de recorrência
  recurrenceCount Int?   // Quantidade de repetições
}
```

---

## 🔄 Fluxo de Processamento

### **1. Entrada do Usuário**

- Voz (Speech Recognition) ou texto manual
- Enviado para `/api/ia-transacao`

### **2. Tentativa OpenAI**

- Se disponível e com quota, usa GPT-3.5-turbo
- Se falhar, automaticamente usa fallback local

### **3. Processamento Local**

```
Texto → Extração de Valor → Tipo → Categoria → Parcelamento → Meta → Resposta
```

### **4. Criação de Transações**

- **Normal**: 1 transação criada
- **Parcelada**: N transações criadas (uma por mês)

### **5. Feedback ao Usuário**

- Confirmação visual com detalhes
- Indicação da fonte (IA ou Local)
- Informações específicas (meta, parcelas)

---

## 🎯 Categorias Suportadas

### **💰 Receitas**

- `salario` - Salário, trabalho
- `freelance` - Trabalho autônomo
- `vendas` - Vendas, comércio
- `investimentos` - Dividendos, rendimentos
- `presentes` - Presentes, doações
- `outros` - Outras receitas

### **💸 Despesas**

- `alimentacao` - Mercado, restaurante, delivery
- `transporte` - Gasolina, Uber, transporte público
- `saude` - Médico, remédios, farmácia
- `casa` - Aluguel, contas, reforma
- `vestuario` - Roupas, sapatos, moda
- `lazer` - Cinema, shows, entretenimento
- `educacao` - Cursos, livros, material escolar
- `outros` - Outras despesas

---

## 🧪 Testes e Validação

### **Cenários de Teste**

#### **Parcelamento**

- ✅ `"Comprei em 3x de 100 reais"` → 3 parcelas de R$ 100
- ✅ `"Parcelado em 6 vezes"` → 6 parcelas
- ✅ `"Dividido em 2x"` → 2 parcelas

#### **Metas**

- ✅ `"Para viagem"` → Associa meta viagem
- ✅ `"Material da casa"` → Associa meta casa
- ✅ `"Emergência médica"` → Associa meta emergência

#### **Valores**

- ✅ `"R$ 50"`, `"50 reais"`, `"gastei 50"`
- ✅ `"100 contos"`, `"2 paus"` (gírias)

#### **Categorias**

- ✅ Alimentação: mercado, comida, restaurante
- ✅ Transporte: uber, gasolina, ônibus
- ✅ Saúde: médico, remédio, farmácia

---

## 🚀 Benefícios das Melhorias

### **🎯 Para o Usuário**

- **Entrada natural**: Fala como falaria naturalmente
- **Sem configuração**: Funciona automaticamente
- **Inteligente**: Associa com metas e detecta parcelamento
- **Robusto**: Sempre funciona, mesmo sem internet/OpenAI

### **⚡ Para o Sistema**

- **Fallback confiável**: Nunca falha completamente
- **Processamento local**: Independente de APIs externas
- **Extensível**: Fácil adicionar novas regras
- **Performático**: Processamento instantâneo

### **💡 Para Manutenção**

- **Código organizado**: Funções especializadas
- **Fácil extensão**: Adicionar novas categorias/padrões
- **Documentado**: Comportamento claro e previsível
- **Testável**: Funções isoladas e testáveis

---

## 📈 Próximos Passos

### **Possíveis Melhorias**

1. **🤖 ML Local**: Modelo de machine learning treinado localmente
2. **📅 Datas inteligentes**: "ontem", "semana passada", "mês que vem"
3. **🔄 Recorrência**: "todo mês", "semanalmente"
4. **📊 Análise contextual**: Histórico para melhorar predições
5. **🎨 UI/UX**: Interface mais visual para parcelamento
6. **📱 Mobile**: Otimizações para dispositivos móveis

### **Métricas de Sucesso**

- Taxa de sucesso do fallback local: **> 95%**
- Precisão na categorização: **> 90%**
- Detecção de parcelamento: **> 95%**
- Associação com metas: **> 85%**

---

_Sistema atualizado em: Janeiro 2025_
_Versão: 2.0 - Fallback Inteligente_
