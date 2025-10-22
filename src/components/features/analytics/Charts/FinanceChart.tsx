'use client'

import { Transaction } from '@/types/transaction'
import {
  BarChart,
  Bar,
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

export function FinanceChart({ transactions, filterType }: Props) {
  const dataMap: Record<string, { income: number; expense: number }> = {}

  transactions.forEach(({ type, category, amount }) => {
    if (!dataMap[category]) dataMap[category] = { income: 0, expense: 0 }
    dataMap[category][type] += amount
  })

  const data = Object.entries(dataMap).map(([category, values]) => ({
    category,
    Receita: values.income,
    Despesa: values.expense,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        {filterType !== 'expense' && (
          <Bar dataKey="Receita" fill="#22c55e" />
        )}
        {filterType !== 'income' && (
          <Bar dataKey="Despesa" fill="#ef4444" />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
