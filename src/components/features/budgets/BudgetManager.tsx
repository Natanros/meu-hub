<<<<<<< HEAD
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Trash2, Edit, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Tipos
interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

interface Transaction {
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface BudgetManagerProps {
  transactions: Transaction[];
  categories: string[];
}

export function BudgetManager({ transactions, categories }: BudgetManagerProps) {
  const { showToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // Fetch budgets from API
  const fetchBudgets = useCallback(async (month: number, year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Falha ao buscar orçamentos');
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      showToast('Não foi possível carregar os orçamentos.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBudgets(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchBudgets]);

  const handleAddOrUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetAmount) {
      showToast('Preencha categoria e valor.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newBudgetCategory,
          amount: parseFloat(newBudgetAmount),
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar orçamento');
      }
      
      showToast(`Orçamento para ${newBudgetCategory} salvo.`, 'success');
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      fetchBudgets(currentMonth, currentYear); // Refresh list
    } catch (error) {
        if (error instanceof Error) {
            showToast(error.message, 'error');
        } else {
            showToast('Ocorreu um erro desconhecido.', 'error');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este orçamento?')) return;
    try {
      const response = await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao remover');
      showToast('Orçamento removido.', 'success');
      fetchBudgets(currentMonth, currentYear); // Refresh
    } catch (error) {
      showToast('Não foi possível remover o orçamento.', 'error');
      console.error(error);
    }
  };

  const spentByCategory = useMemo(() => {
    return budgets.reduce((acc, budget) => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      acc[budget.category] = spent;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions, budgets]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestão de Orçamentos</CardTitle>
          <Input
            type="month"
            value={`${currentYear}-${String(currentMonth).padStart(2, '0')}`}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de Adição */}
        <form onSubmit={handleAddOrUpdateBudget} className="mb-6 p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Adicionar/Atualizar Orçamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setNewBudgetCategory} value={newBudgetCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="Valor do Orçamento (Ex: 500.00)"
                    value={newBudgetAmount}
                    onChange={e => setNewBudgetAmount(e.target.value)}
                    min="0"
                    step="0.01"
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Salvar Orçamento
                </Button>
            </div>
        </form>

        {/* Lista de Orçamentos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : budgets.length > 0 ? (
            budgets.map(budget => {
              const spent = spentByCategory[budget.category] || 0;
              const progress = (spent / budget.amount) * 100;
              const isOverBudget = progress > 100;

              return (
                <div key={budget.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{budget.category}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setNewBudgetCategory(budget.category); setNewBudgetAmount(String(budget.amount)); }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                  </div>
                  <Progress value={progress} className={isOverBudget ? '[&>div]:bg-red-500' : ''} />
                  <div className="flex justify-between text-sm mt-1">
                    <span>Gasto: R$ {spent.toFixed(2)}</span>
                    <span className={isOverBudget ? 'text-red-500 font-bold' : ''}>
                      Orçamento: R$ {budget.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum orçamento definido para este mês.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
=======
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Trash2, Edit, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Budget, Transaction } from '@/types';

interface BudgetManagerProps {
  transactions: Transaction[];
  categories: string[];
}

export function BudgetManager({ transactions, categories }: BudgetManagerProps) {
  const { showToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // Fetch budgets from API
  const fetchBudgets = useCallback(async (month: number, year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
      if (!response.ok) throw new Error('Falha ao buscar orçamentos');
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      showToast('Não foi possível carregar os orçamentos.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBudgets(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchBudgets]);

  const handleAddOrUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetAmount) {
      showToast('Preencha categoria e valor.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newBudgetCategory,
          amount: parseFloat(newBudgetAmount),
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar orçamento');
      }
      
      showToast(`Orçamento para ${newBudgetCategory} salvo.`, 'success');
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      fetchBudgets(currentMonth, currentYear); // Refresh list
    } catch (error) {
        if (error instanceof Error) {
            showToast(error.message, 'error');
        } else {
            showToast('Ocorreu um erro desconhecido.', 'error');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este orçamento?')) return;
    try {
      const response = await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao remover');
      showToast('Orçamento removido.', 'success');
      fetchBudgets(currentMonth, currentYear); // Refresh
    } catch (error) {
      showToast('Não foi possível remover o orçamento.', 'error');
      console.error(error);
    }
  };

  const spentByCategory = useMemo(() => {
    return budgets.reduce((acc, budget) => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      acc[budget.category] = spent;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions, budgets]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split('-').map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestão de Orçamentos</CardTitle>
          <Input
            type="month"
            value={`${currentYear}-${String(currentMonth).padStart(2, '0')}`}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de Adição */}
        <form onSubmit={handleAddOrUpdateBudget} className="mb-6 p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Adicionar/Atualizar Orçamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setNewBudgetCategory} value={newBudgetCategory}>
                    <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="Valor do Orçamento (Ex: 500.00)"
                    value={newBudgetAmount}
                    onChange={e => setNewBudgetAmount(e.target.value)}
                    min="0"
                    step="0.01"
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Salvar Orçamento
                </Button>
            </div>
        </form>

        {/* Lista de Orçamentos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : budgets.length > 0 ? (
            budgets.map(budget => {
              const spent = spentByCategory[budget.category] || 0;
              const progress = (spent / budget.amount) * 100;
              const isOverBudget = progress > 100;

              return (
                <div key={budget.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{budget.category}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setNewBudgetCategory(budget.category); setNewBudgetAmount(String(budget.amount)); }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                  </div>
                  <Progress value={progress} className={isOverBudget ? '[&>div]:bg-red-500' : ''} />
                  <div className="flex justify-between text-sm mt-1">
                    <span>Gasto: R$ {spent.toFixed(2)}</span>
                    <span className={isOverBudget ? 'text-red-500 font-bold' : ''}>
                      Orçamento: R$ {budget.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum orçamento definido para este mês.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
>>>>>>> 0e0c660098934615f279dd59f7bb78e4b6549ea4
