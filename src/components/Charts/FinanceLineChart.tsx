'use client'

import { Transaction } from '@/types/transaction'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Props = {
  transactions: Transaction[]
  filterType: 'all' | 'income' | 'expense'
}

export function FinanceLineChart({ transactions, filterType }: Props) {
  const filtered =
    filterType === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filterType)

  const dataMap: Record<string, { income: number; expense: number }> = {}

  filtered.forEach(({ type, date, amount }) => {
    const month = date.slice(0, 7)
    if (!dataMap[month]) {
      dataMap[month] = { income: 0, expense: 0 }
    }
    dataMap[month][type] += amount
  })

  const data = Object.entries(dataMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      Receitas: values.income,
      Despesas: values.expense,
      Saldo: values.income - values.expense,
    }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {filterType !== 'expense' && (
          <Line type="monotone" dataKey="Receitas" stroke="#22c55e" strokeWidth={2} />
        )}
        {filterType !== 'income' && (
          <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} />
        )}
        <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
