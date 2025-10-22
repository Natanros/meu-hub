'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentDateLocal } from '@/lib/dateUtils'

interface WhisperVoiceInputProps {
  onTransactionAdded: () => void
  metas: Array<{ id: string; nome: string; valor: number }>
  showToast: (message: string, type: 'success' | 'error') => void
}

export function WhisperVoiceInput({ onTransactionAdded, metas, showToast }: WhisperVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [transcript, setTranscript] = useState('')
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isHTTPS, setIsHTTPS] = useState(true)
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true)
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transcriberRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordingControllerRef = useRef<any>(null)

  // Verificar compatibilidade
  useEffect(() => {
    // Verificar HTTPS ou localhost (127.0.0.1 também é permitido)
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1'
    setIsHTTPS(isSecure)
    
    // Verificar se getUserMedia está disponível
    const hasMicrophone = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    setMicrophoneAvailable(hasMicrophone)
    
    if (!isSecure) {
      showToast('⚠️ Microfone não funciona em HTTP na rede local. Use HTTPS ou localhost', 'error')
    } else if (!hasMicrophone) {
      showToast('⚠️ Seu navegador não suporta gravação de áudio', 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Inicializar Whisper ao montar o componente
  useEffect(() => {
    const loadWhisperModel = async () => {
      try {
        // Importar dinamicamente o módulo
        const { getWhisperTranscriber } = await import('../transactions/teste.js')
        transcriberRef.current = getWhisperTranscriber()
        
        // Pré-carregar o modelo
        showToast('🔄 Carregando modelo de IA de voz...', 'success')
        await transcriberRef.current.initializeTranscriber()
        setModelLoaded(true)
        showToast('✅ Modelo de voz carregado!', 'success')
      } catch (error) {
        console.error('Erro ao carregar Whisper:', error)
        showToast('❌ Erro ao carregar modelo de voz', 'error')
      }
    }
    
    loadWhisperModel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = async () => {
    if (!transcriberRef.current) {
      showToast('⏳ Modelo de voz ainda não está pronto', 'error')
      return
    }

    try {
      setIsRecording(true)
      setTranscript('')
      
      recordingControllerRef.current = await transcriberRef.current.recordAndTranscribe(
        (text: string) => {
          setTranscript(text)
          setTextInput(text)
        }
      )
      
      showToast('🎤 Gravando... Fale agora!', 'success')
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      
      // Mostrar mensagem de erro específica
      const errorMessage = error instanceof Error ? error.message : 'Erro ao acessar microfone'
      
      if (errorMessage.includes('HTTPS') || errorMessage.includes('getUserMedia')) {
        showToast('🔒 Gravação de áudio requer HTTPS. Acesse via https:// ou localhost', 'error')
      } else if (errorMessage.includes('não suporta')) {
        showToast('❌ Seu navegador não suporta gravação de áudio', 'error')
      } else if (errorMessage.includes('negada')) {
        showToast('❌ Permissão de microfone negada. Permita o acesso nas configurações', 'error')
      } else {
        showToast(`❌ ${errorMessage}`, 'error')
      }
      
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    if (!recordingControllerRef.current) {
      return
    }

    try {
      setIsRecording(false)
      setIsTranscribing(true)
      showToast('🔄 Transcrevendo áudio...', 'success')
      
      const finalText = await recordingControllerRef.current.stop()
      
      setTranscript(finalText)
      setTextInput(finalText)
      setIsTranscribing(false)
      
      if (finalText.trim()) {
        showToast('✅ Transcrição concluída!', 'success')
      } else {
        showToast('⚠️ Nenhum áudio detectado', 'error')
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error)
      showToast('❌ Erro na transcrição', 'error')
      setIsTranscribing(false)
    }
  }

  // Processar texto com IA (mesmo código do VoiceTextInput)
  const processWithAI = async (text: string) => {
    if (!text.trim()) {
      showToast('Digite ou grave algo para processar', 'error')
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
          
          const currentDate = getCurrentDateLocal();
          
          try {
            const parceladoTransaction = {
              ...result.transaction,
              amount: totalAmount,
              installments: installments,
              description: result.transaction.description,
              date: currentDate,
            };
            
            delete parceladoTransaction.needsMultipleTransactions;
            delete parceladoTransaction.isInstallment;
            
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
              } else {
                showToast(`Transação parcelada criada: ${installments}x de R$ ${installmentAmount.toFixed(2)}`, 'success');
              }
              
              onTransactionAdded();
            } else {
              showToast('Erro ao criar transação parcelada', 'error');
            }
          } catch (error) {
            console.error('Erro ao criar parcelas:', error);
            showToast('Erro ao criar as parcelas', 'error');
          }
        } else {
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
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg p-3 sm:p-4">
        <CardTitle className="dark:text-white flex items-center gap-2 text-sm sm:text-base">
          🎙️ Entrada com Whisper AI
          <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            WHISPER + IA
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input de Texto */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Digite ou grave sua transação
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: Gastei 50 reais no mercado hoje, ou Recebi 2000 de salário"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1"
                disabled={isRecording || isTranscribing || isProcessing}
              />
              
              {/* Botão de Gravação */}
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!modelLoaded || isTranscribing || isProcessing || !isHTTPS || !microphoneAvailable}
                className={`px-3 sm:px-4 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                title={
                  !isHTTPS 
                    ? 'Requer HTTPS para gravação' 
                    : !microphoneAvailable 
                    ? 'Navegador não suporta gravação' 
                    : isRecording 
                    ? 'Parar gravação' 
                    : 'Iniciar gravação'
                }
              >
                {isRecording ? '⏹️' : '🎙️'}
              </Button>
            </div>
            
            {/* Avisos de Compatibilidade */}
            {!isHTTPS && (
              <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 p-2 rounded mt-2">
                🔒 <strong>Microfone bloqueado:</strong> Navegadores só permitem gravação de áudio em HTTPS por segurança.
                <br />
                <strong>Soluções:</strong>
                <br />
                📱 <strong>Para testar no celular:</strong> Faça deploy na Vercel (HTTPS automático)
                <br />
                💻 <strong>No PC:</strong> Acesse <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">localhost:3000</code>
                <br />
                🚀 <strong>Produção:</strong> Faça <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">git push</code> - a Vercel faz deploy automático com HTTPS
              </div>
            )}
            
            {!microphoneAvailable && isHTTPS && (
              <div className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-2 rounded mt-2">
                ❌ <strong>Erro:</strong> Seu navegador não suporta gravação de áudio.
                <br />
                Use Chrome, Edge, Safari ou Firefox atualizado.
              </div>
            )}
            
            {/* Feedback de Status */}
            {!modelLoaded && isHTTPS && microphoneAvailable && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ⏳ Carregando modelo Whisper...
              </p>
            )}
            
            {isRecording && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 animate-pulse">
                🔴 Gravando... Fale agora! Clique novamente para parar.
              </p>
            )}
            
            {isTranscribing && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
                🔄 Transcrevendo áudio com Whisper AI...
              </p>
            )}
            
            {transcript && !isTranscribing && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Transcrito: &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>

          {/* Botão de Processar */}
          <Button
            type="submit"
            disabled={!textInput.trim() || isRecording || isTranscribing || isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
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

        {/* Informações sobre Whisper */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🎙️ Sobre o Whisper AI:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Transcrição offline usando IA local (Whisper da OpenAI)</li>
            <li>• Funciona em português com alta precisão</li>
            <li>• Clique no botão 🎙️ para iniciar gravação</li>
            <li>• Fale naturalmente e clique ⏹️ para parar</li>
            <li>• A IA processa automaticamente após transcrever</li>
          </ul>
        </div>

        {/* Exemplos */}
        <div className="mt-4 p-3 bg-cyan-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-cyan-900 dark:text-cyan-300 mb-2">
            💡 Exemplos do que você pode falar:
          </h4>
          <ul className="text-xs text-cyan-700 dark:text-cyan-300 space-y-1">
            <li>• &ldquo;Gastei 45 reais no mercado hoje&rdquo;</li>
            <li>• &ldquo;Recebi 2500 de salário ontem&rdquo;</li>
            <li>• &ldquo;Paguei 150 reais de gasolina&rdquo;</li>
            <li>• &ldquo;Comprei um notebook por 1200 em 3 vezes&rdquo;</li>
            <li>• &ldquo;Parcelei uma TV em 10 vezes de 150 reais&rdquo;</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
