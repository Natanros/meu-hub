'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Transaction } from '@/types/transaction'

type Meta = {
  id: string
  nome: string
  valor: number
}

type Props = {
  metas: Meta[]
  transactions: Transaction[]
}

export function MetasProgressChartAdvanced({ metas, transactions }: Props) {
  const data = metas.map(meta => {
    const valorAcumulado = transactions
      .filter(t => t.metaId === meta.id)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    
    const progresso = Math.min(100, Math.max(0, Math.round((valorAcumulado / meta.valor) * 100)))
    
    return {
      nome: meta.nome.length > 15 ? meta.nome.substring(0, 15) + '...' : meta.nome,
      progresso,
      valorAcumulado,
      valor: meta.valor,
      status: progresso >= 100 ? '✅' : progresso >= 80 ? '🔥' : progresso >= 50 ? '⚡' : '⏳'
    }
  })

  type TooltipProps = {
    active?: boolean
    payload?: Array<{
      payload: {
        nome: string
        progresso: number
        valorAcumulado: number
        valor: number
        status: string
      }
    }>
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${data.status} ${data.nome}`}</p>
          <p className="text-green-600">{`Progresso: ${data.progresso}%`}</p>
          <p className="text-blue-600">{`Acumulado: R$ ${data.valorAcumulado.toFixed(2)}`}</p>
          <p className="text-gray-600">{`Meta: R$ ${data.valor.toFixed(2)}`}</p>
          <p className="text-purple-600">{`Faltam: R$ ${Math.max(0, data.valor - data.valorAcumulado).toFixed(2)}`}</p>
        </div>
      )
    }
    return null
  }

  if (metas.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p>Nenhuma meta cadastrada</p>
          <p className="text-sm">Crie suas metas para acompanhar o progresso</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
          barCategoryGap="20%"
        >
          <XAxis 
            dataKey="nome" 
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
            interval={0}
          />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="progresso" 
            radius={[4, 4, 0, 0]}
            fill="#3B82F6"
          >
            <LabelList 
              dataKey="progresso" 
              position="center" 
              fill="white" 
              fontSize={12}
              fontWeight="bold"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legenda */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>✅ Completa (100%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span>🔥 Quase lá (80%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>⚡ No caminho (50%+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>⏳ Iniciando (&lt;50%)</span>
        </div>
      </div>
    </div>
  )
}
