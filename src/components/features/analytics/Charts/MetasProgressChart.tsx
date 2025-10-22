import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

type Meta = {
  id: string
  nome: string
  valor: number
}
type Transaction = {
  metaId: string
  type: 'income' | 'expense'
  amount: number
}

type Props = {
  metas: Meta[]
  transactions: Transaction[]
}

export function MetasProgressChart({ metas, transactions }: Props) {
  const data = metas.map(meta => {
    const valorAcumulado = transactions
      .filter(t => t.metaId === meta.id)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    return {
      nome: meta.nome,
      progresso: Math.min(100, Math.round((valorAcumulado / meta.valor) * 100)),
      valorAcumulado,
      valor: meta.valor,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="nome" />
        <YAxis unit="%" />
        <Tooltip formatter={(value: number, name: string) =>
          name === 'progresso'
            ? `${value}%`
            : `R$ ${value.toFixed(2)}`
        } />
        <Bar dataKey="progresso" fill="#3b82f6">
          <LabelList
            dataKey="progresso"
            position="top"
            formatter={(label: React.ReactNode) =>
              typeof label === 'number' ? `${label}%` : label
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}