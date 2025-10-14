'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FinanceChart } from './FinanceChart'
import { FinanceLineChart } from './FinanceLineChart'
import { FinancePieChart } from './FinancePieChart'
import { Transaction } from '@/types/transaction'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils'

type Props = {
  transactions: Transaction[]
  filterType: 'all' | 'income' | 'expense'
}

export function FinanceCharts({ transactions, filterType }: Props) {
  const handleExport = () => {
    exportToCSV(transactions, 'transacoes.csv')
  }

  return (
    <div>
      <div className="flex items-center ml-4 mb-2 gap-2">
        <Button variant="outline" onClick={handleExport}>
          Exportar CSV
        </Button>
      </div>
      <Tabs defaultValue="bar" className="space-y-4">
        <div className="flex items-center ml-4">
          <TabsList>
            <TabsTrigger value="bar">📊 Barras</TabsTrigger>
            <TabsTrigger value="line">📈 Linha</TabsTrigger>
            <TabsTrigger value="pie">🥧 Pizza</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bar">
          <FinanceChart transactions={transactions} filterType={filterType} />
        </TabsContent>

        <TabsContent value="line">
          <FinanceLineChart transactions={transactions} filterType={filterType} />
        </TabsContent>

        <TabsContent value="pie">
          <FinancePieChart transactions={transactions} filterType={filterType} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
