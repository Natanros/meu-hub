'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Transaction } from '@/types/transaction'

type Props = {
  transactions: Transaction[]
  onFilter: (filtered: Transaction[]) => void
  onTypeChange: (type: 'all' | 'income' | 'expense') => void
}

export function FinanceFilters({ transactions, onFilter, onTypeChange }: Props) {
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all')
  const [category, setCategory] = useState<string | undefined>()
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth())
  const [dateTo, setDateTo] = useState(getLastDayOfMonth())

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  const handleFilter = () => {
    const filtered = transactions.filter((t) => {
      const matchType = type === 'all' || t.type === type
      const matchCategory = !category || t.category === category
      const matchDateFrom = !dateFrom || t.date >= dateFrom
      const matchDateTo = !dateTo || t.date <= dateTo
      return matchType && matchCategory && matchDateFrom && matchDateTo
    })

    onFilter(filtered)
    onTypeChange(type)
  }

  const handleReset = () => {
    setType('all')
    setCategory(undefined)
    setDateFrom(getFirstDayOfMonth())
    setDateTo(getLastDayOfMonth())
    onFilter(transactions)
    onTypeChange('all')
  }

  function getFirstDayOfMonth() {
    const now = new Date()
    return now.toISOString().slice(0, 10).replace(/-\d{2}$/, '-01')
  }

  function getLastDayOfMonth() {
    const now = new Date()
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return last.toISOString().slice(0, 10)
  }

  return (
    <div className="flex flex-wrap gap-4 ml-4">
      <Select value={type} onValueChange={(v) => setType(v as 'all' | 'income' | 'expense')}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="income">Receita</SelectItem>
          <SelectItem value="expense">Despesa</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="w-[150px]"
      />

      <Input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="w-[150px]"
      />

      <Button onClick={handleFilter}>Filtrar</Button>
      <Button variant="outline" onClick={handleReset}>
        Resetar
      </Button>
    </div>
  )
}
