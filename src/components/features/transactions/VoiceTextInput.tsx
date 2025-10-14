'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentDateLocal } from '@/lib/dateUtils'

interface VoiceTextInputProps {
  onTransactionAdded: () => void
  metas: Array<{ id: string; nome: string; valor: number }>
  showToast: (message: string, type: 'success' | 'error') => void
}

export function VoiceTextInput({ onTransactionAdded, metas, showToast }: VoiceTextInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [transcript, setTranscript] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // Configurar reconhecimento de voz
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Reconhecimento de voz não suportado neste navegador', 'error')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'pt-BR'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript
      setTranscript(speechResult)
      setTextInput(speechResult)
      setIsListening(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      setIsListening(false)
      showToast('Erro no reconhecimento de voz. Tente novamente.', 'error')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  // Processar texto com IA
  const processWithAI = async (text: string) => {
    if (!text.trim()) {
      showToast('Digite ou fale algo para processar', 'error')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/ia-transacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          metas: metas
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao processar com IA')
      }

      const result = await response.json()

      if (result.success && result.transaction) {
        // Se é uma transação parcelada, criar múltiplas transações
        if (result.isInstallment && result.needsMultipleTransactions) {
          const installments = result.transaction.installments;
          const totalAmount = result.totalAmount;
          const installmentAmount = totalAmount / installments;
          
          // Usar a data atual (local) para a primeira parcela
          const currentDate = getCurrentDateLocal();
          
          try {
            // Criar transação única com múltiplas parcelas
            const parceladoTransaction = {
              ...result.transaction,
              amount: totalAmount, // Valor total
              installments: installments,
              description: result.transaction.description,
              date: currentDate, // ✅ Data local correta
            };
            
            // Remove campos desnecessários
            delete parceladoTransaction.needsMultipleTransactions;
            delete parceladoTransaction.isInstallment;
            
            console.log(`💳 Criando transação parcelada: ${installments}x de R$ ${installmentAmount.toFixed(2)}`);
            
            const transactionResponse = await fetch('/api/transactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(parceladoTransaction),
            });

            if (transactionResponse.ok) {
              const responseData = await transactionResponse.json();
              
              if (responseData.success) {
                showToast(responseData.message, 'success');
                console.log(`✅ ${responseData.transactions.length} parcelas criadas com sucesso!`);
              } else {
                showToast(`Transação parcelada criada: ${installments}x de R$ ${installmentAmount.toFixed(2)}`, 'success');
              }
              
              onTransactionAdded(); // Atualizar lista
            } else {
              const errorData = await transactionResponse.json();
              console.error('Erro ao criar transação parcelada:', errorData);
              showToast('Erro ao criar transação parcelada', 'error');
            }
          } catch (error) {
            console.error('Erro ao criar parcelas:', error);
            showToast('Erro ao criar as parcelas', 'error');
          }
        } else {
          // Criar a transação normal
          const transactionResponse = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.transaction),
          })

          if (!transactionResponse.ok) {
            throw new Error('Erro ao salvar transação')
          }

          let successMessage = `✨ Transação criada: ${result.transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${result.transaction.amount.toFixed(2)}`
          
          if (result.message) {
            successMessage += ` • ${result.message}`
          }

          showToast(successMessage, 'success')
        }
        
        setTextInput('')
        setTranscript('')
        onTransactionAdded()
      } else {
        showToast(result.message || 'IA não conseguiu interpretar a mensagem', 'error')
      }
    } catch (error) {
      console.error('Erro ao processar com IA:', error)
      showToast('Erro ao processar com IA. Tente novamente.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processWithAI(textInput)
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-purple-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
          🎤 Entrada Inteligente
          <span className="hidden sm:inline text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
            IA + VOZ
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input de Texto */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Digite ou fale sua transação
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: Gastei 50 reais no mercado hoje, ou Recebi 2000 de salário"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1"
                disabled={isListening || isProcessing}
              />
              
              {/* Botão de Voz */}
              <Button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`px-3 sm:px-4 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isListening ? '🔴' : '🎤'}
              </Button>
            </div>
            
            {/* Feedback de Voz */}
            {isListening && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
                🎤 Escutando... Fale agora!
              </p>
            )}
            
            {transcript && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Capturado: &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>

          {/* Botão de Processar */}
          <Button
            type="submit"
            disabled={!textInput.trim() || isListening || isProcessing}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">🧠</span>
                IA Processando...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Processar com IA
              </>
            )}
          </Button>
        </form>

        {/* Exemplos */}
        <div className="mt-6 p-3 bg-purple-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
            💡 Exemplos do que você pode dizer:
          </h4>
          <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
            <li>• &ldquo;Gastei 45 reais no mercado hoje&rdquo;</li>
            <li>• &ldquo;Recebi 2500 de salário ontem&rdquo;</li>
            <li>• &ldquo;Paguei 150 reais de gasolina&rdquo;</li>
            <li>• &ldquo;Comprei um notebook por 1200 em 3x&rdquo;</li>
            <li>• &ldquo;Gastei 500 reais para viagem&rdquo; (associa à meta)</li>
            <li>• &ldquo;Ganhei 300 reais de freelance&rdquo;</li>
            <li>• &ldquo;Parcelei uma TV em 10x de 150 reais&rdquo;</li>
          </ul>
        </div>

        {/* Compatibilidade */}
        <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
            🎤 Reconhecimento de voz funciona melhor no Chrome/Edge
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
