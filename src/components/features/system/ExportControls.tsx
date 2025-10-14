'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Transaction } from '@/types/transaction'
import { ExportManager, ExportData } from '@/lib/exportManager'
import { getCurrentDateLocal } from '@/lib/dateUtils'

interface Meta {
  id: string
  nome: string
  valor: number
}

interface ExportControlsProps {
  transactions: Transaction[]
  metas: Meta[]
  onExportComplete?: (type: string, filename: string) => void
}

export function ExportControls({ transactions, metas, onExportComplete }: ExportControlsProps) {
  const [exportType, setExportType] = useState<'csv' | 'txt' | 'json'>('csv')
  const [period, setPeriod] = useState<'all' | '1m' | '3m' | '6m' | '1y' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [filename, setFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const generateExportData = (): ExportData => {
    let filteredTransactions = transactions
    let periodLabel = 'Todos os dados'

    if (period !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case '1m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          periodLabel = 'Último mês'
          break
        case '3m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          periodLabel = 'Últimos 3 meses'
          break
        case '6m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          periodLabel = 'Últimos 6 meses'
          break
        case '1y':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          periodLabel = 'Último ano'
          break
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate)
            const endDate = new Date(customEndDate)
            filteredTransactions = transactions.filter(t => {
              const transactionDate = new Date(t.date)
              return transactionDate >= startDate && transactionDate <= endDate
            })
            periodLabel = `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`
          } else {
            startDate = new Date(0) // Se não definiu datas, pega tudo
          }
          break
        default:
          startDate = new Date(0)
      }

      if (period !== 'custom') {
        filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate)
      }
    }

    const totalReceitas = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDespesas = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      transactions: filteredTransactions,
      metas,
      summary: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        periodo: periodLabel
      }
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const exportData = generateExportData()
      const exportFilename = filename || `relatorio-${exportType}-${getCurrentDateLocal()}`

      switch (exportType) {
        case 'csv':
          ExportManager.exportToCSV(exportData, exportFilename)
          break
        case 'txt':
          ExportManager.exportExecutiveReport(exportData, exportFilename)
          break
        case 'json':
          ExportManager.exportToJSON(exportData, exportFilename)
          break
      }

      onExportComplete?.(exportType, exportFilename)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Exporta via servidor (API /api/export) para grandes volumes e aderência aos dados do backend
  const handleServerExport = async () => {
    setIsExporting(true)
    try {
  const exportFilename = filename || `relatorio-${exportType}-${getCurrentDateLocal()}`
  // Agora o servidor suporta csv | json | txt
  const serverType = exportType
      const params = new URLSearchParams()
      params.set('type', serverType)
      params.set('period', period)
      if (period === 'custom') {
        if (customStartDate) params.set('start', customStartDate)
        if (customEndDate) params.set('end', customEndDate)
      }
      params.set('filename', exportFilename)

      const res = await fetch(`/api/export?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': serverType === 'json' ? 'application/json' : (serverType === 'txt' ? 'text/plain' : 'text/csv') },
      })
      if (!res.ok) throw new Error(`Falha no export (${res.status})`)

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
  link.download = `${exportFilename}.${serverType}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      onExportComplete?.(serverType, exportFilename)
    } catch (e) {
      console.error('Erro ao exportar (servidor):', e)
    } finally {
      setIsExporting(false)
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case 'csv':
        return 'Planilha com transações, metas e análises detalhadas'
      case 'txt':
        return 'Relatório executivo em texto com insights e recomendações'
      case 'json':
        return 'Backup completo dos dados em formato JSON'
      default:
        return ''
    }
  }

  const getExportIcon = () => {
    switch (exportType) {
      case 'csv': return '📊'
      case 'txt': return '📋'
      case 'json': return '💾'
      default: return '📄'
    }
  }

  const previewData = generateExportData()

  return (
    <Card className="w-full shadow-lg border-t-4 border-t-blue-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <CardTitle className="flex items-center gap-2">
          📤 Sistema de Exportação Avançado
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            PRO
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Tipo de Exportação */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tipo de Relatório</label>
          <Select value={exportType} onValueChange={(value) => setExportType(value as typeof exportType)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">📊 CSV - Planilha Detalhada</SelectItem>
              <SelectItem value="txt">📋 TXT - Relatório Executivo</SelectItem>
              <SelectItem value="json">💾 JSON - Backup Completo</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {getExportIcon()} {getExportDescription()}
          </p>
        </div>

        {/* Período */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Período dos Dados</label>
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📅 Todos os dados</SelectItem>
              <SelectItem value="1m">📊 Último mês</SelectItem>
              <SelectItem value="3m">📈 Últimos 3 meses</SelectItem>
              <SelectItem value="6m">📉 Últimos 6 meses</SelectItem>
              <SelectItem value="1y">🗓️ Último ano</SelectItem>
              <SelectItem value="custom">🎯 Período personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Datas customizadas */}
        {period === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Nome do arquivo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Arquivo (opcional)</label>
          <Input
            placeholder={`relatorio-${exportType}-${getCurrentDateLocal()}`}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Deixe vazio para usar nome automático
          </p>
        </div>

        {/* Preview dos dados */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            👀 Preview dos Dados
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Transações</div>
              <div className="font-bold">{previewData.transactions.length}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Receitas</div>
              <div className="font-bold text-green-600">R$ {previewData.summary.totalReceitas.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Despesas</div>
              <div className="font-bold text-red-600">R$ {previewData.summary.totalDespesas.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Saldo</div>
              <div className={`font-bold ${previewData.summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {previewData.summary.saldo.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            📅 Período: {previewData.summary.periodo}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <Button 
            onClick={handleExport}
            disabled={isExporting || (period === 'custom' && (!customStartDate || !customEndDate))}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                {getExportIcon()} Exportar {exportType.toUpperCase()}
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleServerExport}
            disabled={isExporting || (period === 'custom' && (!customStartDate || !customEndDate))}
            title="Exportar pelo servidor (recomendado para muitos dados)"
          >
            🌐 Servidor
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setFilename('')
              setPeriod('all')
              setCustomStartDate('')
              setCustomEndDate('')
            }}
            disabled={isExporting}
          >
            🔄 Limpar
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
          💡 <strong>Dicas:</strong>
          <ul className="mt-1 space-y-1 ml-4">
            <li>• CSV: Melhor para análise em Excel/Google Sheets</li>
            <li>• TXT: Relatório executivo para apresentações</li>
            <li>• JSON: Backup completo para restauração de dados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
