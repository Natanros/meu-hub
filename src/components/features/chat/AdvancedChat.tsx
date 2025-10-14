'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/types/transaction'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AdvancedChatProps {
  transactions: Transaction[]
  metas: Meta[]
  saldo: number
}

export function AdvancedChat({ transactions, metas, saldo }: AdvancedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '🤖 Olá! Sou sua IA Financeira Avançada. Posso analisar seus dados em tempo real e dar conselhos personalizados. Como posso ajudar?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Preparar contexto financeiro completo para a IA
      const context = {
        saldo,
        totalReceitas: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        totalDespesas: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
        totalTransacoes: transactions.length,
        metasAtivas: metas.length,
        categoriasMaisGastosas: getCategoriasMaisGastosas(),
        tendenciaUltimos30Dias: getTendenciaUltimos30Dias(),
        detalhesTransacoes: {
          ultimasTransacoes: transactions.slice(-5).map(t => ({
            tipo: t.type === 'income' ? 'receita' : 'despesa',
            valor: t.amount,
            categoria: t.category,
            descricao: t.description,
            data: new Date(t.date).toLocaleDateString('pt-BR')
          })),
          mediaGastosDiarios: (transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) / 30).toFixed(2),
          maiorReceita: Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0),
          maiorDespesa: Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0)
        },
        detalheMetas: metas.map(m => ({
          nome: m.nome,
          valor: m.valor
        }))
      }

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context
        }),
      })

      if (!response.ok) {
        throw new Error('Erro na comunicação com a IA')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '😞 Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoriasMaisGastosas = () => {
    const gastosPorCategoria = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(gastosPorCategoria)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoria, valor]) => ({ categoria, valor }))
  }

  const getTendenciaUltimos30Dias = () => {
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const transacoesRecentes = transactions.filter(t => new Date(t.date) >= trintaDiasAtras)
    const receitasRecentes = transacoesRecentes.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const despesasRecentes = transacoesRecentes.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    
    return {
      receitas: receitasRecentes,
      despesas: despesasRecentes,
      saldo: receitasRecentes - despesasRecentes
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const sugestoesProntas = [
    "Qual é minha situação financeira atual?",
    "Onde estou gastando mais dinheiro?",
    "Como estão minhas receitas?",
    "Qual a tendência dos últimos 30 dias?",
    "Quais são minhas últimas transações?",
    "Como posso economizar mais?",
    "Analise minhas metas financeiras",
    "Mostre minha média de gastos diários"
  ]

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-green-500 h-[500px] sm:h-[600px] flex flex-col w-full max-w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4 flex-shrink-0">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base truncate">
          🤖 IA Financeira Avançada
          <span className="hidden sm:inline text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded-full font-medium flex-shrink-0">
            REAL AI
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-2 sm:p-4 min-h-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 pr-1 sm:pr-2 min-h-0 scrollbar-thin">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg break-words ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}
                style={{
                  minWidth: '0',
                  overflow: 'hidden',
                  wordWrap: 'break-word'
                }}
              >
                <p 
                  className="text-xs sm:text-sm whitespace-pre-wrap break-words"
                  style={{
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%'
                  }}
                >
                  {message.content}
                </p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg rounded-bl-none max-w-[85%] sm:max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">💡 Sugestões rápidas:</p>
            <div className="grid grid-cols-1 gap-1 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto scrollbar-thin">
              {sugestoesProntas.slice(0, 4).map((sugestao, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(sugestao)}
                  className="text-xs sm:text-sm p-1 sm:p-2 h-auto text-left justify-start dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 leading-tight break-words whitespace-normal"
                >
                  <span className="truncate block w-full">{sugestao}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Sua pergunta..."
            disabled={isLoading}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs sm:text-sm flex-1 min-w-0"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-500 hover:bg-green-600 p-2 sm:p-3 min-w-[40px] sm:min-w-[44px] flex-shrink-0"
          >
            <span className="text-lg sm:text-xl">{isLoading ? '⏳' : '💬'}</span>
          </Button>
        </div>

        {/* Context Display */}
        <div className="mt-2 p-1 sm:p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 overflow-hidden flex-shrink-0">
          <span className="block truncate">
            📊 {transactions.length} transações | R$ {saldo.toFixed(2)} | {metas.length} metas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
