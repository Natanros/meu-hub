'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Transaction } from '@/types/transaction'

type Props = {
  transactions: Transaction[]
  filterType: 'all' | 'income' | 'expense'
}

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#ef4444'

export function FinancePieChart({ transactions, filterType }: Props) {
  const dataMap: Record<string, { income: number; expense: number }> = {}

  transactions.forEach(({ type, category, amount }) => {
    if (!dataMap[category]) dataMap[category] = { income: 0, expense: 0 }
    if (filterType === 'all' || type === filterType) {
      dataMap[category][type] += amount
    }
  })

  const data: { name: string; value: number; type: 'income' | 'expense' }[] = []
  Object.entries(dataMap).forEach(([category, values]) => {
    if (values.income > 0 && (filterType === 'all' || filterType === 'income')) {
      data.push({ name: `${category} (Receita)`, value: values.income, type: 'income' })
    }
    if (values.expense > 0 && (filterType === 'all' || filterType === 'expense')) {
      data.push({ name: `${category} (Despesa)`, value: values.expense, type: 'expense' })
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
