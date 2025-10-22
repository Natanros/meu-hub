'use client'

import { Transaction } from '@/types/transaction'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Props = {
  transactions: Transaction[]
}

export function SaldoPrevisaoChart({ transactions }: Props) {
  // Agrupa por mês e calcula saldo acumulado
  const meses = Array.from(
    new Set(transactions.map(t => t.date.slice(0, 7)))
  ).sort()

  let saldoAcumulado = 0
  const data = meses.map(mes => {
    const saldoMes = transactions
      .filter(t => t.date.slice(0, 7) === mes)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    saldoAcumulado += saldoMes
    return {
      mes,
      'Saldo acumulado': saldoAcumulado,
      'Saldo do mês': saldoMes,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Saldo acumulado" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="Saldo do mês" stroke="#22c55e" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}