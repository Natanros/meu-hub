/**
 * 🔔 Sistema de Alertas e Análises
 * Análises básicas de padrões financeiros e notificações
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { Meta } from '@/types/meta';

export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'budget' | 'goal' | 'pattern' | 'insight' | 'prediction';
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  suggestedActions?: string[];
  relatedData?: {
    transactionId?: number;
    metaId?: string;
    category?: string;
    amount?: number;
  };
}

interface AlertsManagerProps {
  transactions: Transaction[];
  metas: Meta[];
}

const AlertsManager: React.FC<AlertsManagerProps> = ({ transactions, metas }) => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  /**
   * 🧠 Analisador de padrões financeiros
   */
  const analyzePatterns = () => {
    const newAlerts: SmartAlert[] = [];
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Transações dos últimos 30 dias
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= last30Days
    );

    const lastWeekTransactions = transactions.filter(t => 
      new Date(t.date) >= last7Days
    );

    // 1. Análise de gastos por categoria
    const categoriesLast30 = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoriesLast7 = lastWeekTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Detectar categorias com aumento significativo
    Object.entries(categoriesLast7).forEach(([category, weekAmount]) => {
      const monthAmount = categoriesLast30[category] || 0;
      const weeklyAverage = monthAmount / 4; // Média semanal do mês
      
      if (weekAmount > weeklyAverage * 1.5 && weekAmount > 500) {
        newAlerts.push({
          id: `pattern-increase-${category}-${now.getTime()}`,
          title: `📈 Aumento significativo em ${category}`,
          message: `Gastos em ${category} esta semana (R$ ${weekAmount.toFixed(2)}) estão 50% acima da média mensal`,
          type: 'warning',
          severity: 'medium',
          category: 'pattern',
          timestamp: now,
          isRead: false,
          actionable: true,
          suggestedActions: [
            `Revisar gastos recentes em ${category}`,
            'Estabelecer limite mensal para categoria',
            'Buscar alternativas mais econômicas'
          ],
          relatedData: { category, amount: weekAmount }
        });
      }
    });

    // 2. Análise de gastos únicos elevados
    const highExpenses = lastWeekTransactions
      .filter(t => t.type === 'expense' && t.amount > 1000)
      .sort((a, b) => b.amount - a.amount);

    highExpenses.slice(0, 3).forEach(expense => {
      newAlerts.push({
        id: `high-expense-${expense.id}-${now.getTime()}`,
        title: '💸 Gasto elevado detectado',
        message: `Transação de R$ ${expense.amount.toFixed(2)} em ${expense.category} ${expense.description ? `- ${expense.description}` : ''}`,
        type: 'warning',
        severity: 'high',
        category: 'budget',
        timestamp: now,
        isRead: false,
        actionable: true,
        suggestedActions: [
          'Verificar se o gasto é necessário',
          'Considerar parcelamento para próximas compras',
          'Ajustar orçamento da categoria'
        ],
        relatedData: { 
          transactionId: expense.id, 
          category: expense.category, 
          amount: expense.amount 
        }
      });
    });

    // 3. Análise de frequência de transações
    const dailyTransactions = lastWeekTransactions.length / 7;
    if (dailyTransactions > 5) {
      newAlerts.push({
        id: `high-frequency-${now.getTime()}`,
        title: '📊 Alta frequência de transações',
        message: `Média de ${dailyTransactions.toFixed(1)} transações por dia na última semana`,
        type: 'info',
        severity: 'low',
        category: 'pattern',
        timestamp: now,
        isRead: false,
        actionable: true,
        suggestedActions: [
          'Consolidar compras pequenas',
          'Planejar compras semanais',
          'Usar lista de compras'
        ]
      });
    }

    // 4. Análise de metas próximas do vencimento
    // Nota: Como Meta só tem {id, nome, valor}, vamos simular análise básica
    if (metas.length > 0) {
      metas.forEach(meta => {
        newAlerts.push({
          id: `meta-reminder-${meta.id}-${now.getTime()}`,
          title: `🎯 Lembrete de Meta: ${meta.nome}`,
          message: `Meta ${meta.nome} (R$ ${meta.valor.toFixed(2)}) precisa de acompanhamento`,
          type: 'info',
          severity: 'low',
          category: 'goal',
          timestamp: now,
          isRead: false,
          actionable: true,
          suggestedActions: [
            'Verificar progresso da meta',
            'Ajustar estratégia se necessário',
            'Definir prazo para atingimento'
          ],
          relatedData: { metaId: meta.id, amount: meta.valor }
        });
      });
    }

    // 5. Insights de receitas
    const totalIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    if (savingsRate < 10 && savingsRate >= 0) {
      newAlerts.push({
        id: `low-savings-${now.getTime()}`,
        title: '💰 Taxa de poupança baixa',
        message: `Taxa de poupança de ${savingsRate.toFixed(1)}% está abaixo do recomendado (20%)`,
        type: 'warning',
        severity: 'medium',
        category: 'insight',
        timestamp: now,
        isRead: false,
        actionable: true,
        suggestedActions: [
          'Revisar gastos desnecessários',
          'Estabelecer meta de economia mensal',
          'Considerar fontes de renda extra'
        ]
      });
    } else if (savingsRate > 30) {
      newAlerts.push({
        id: `high-savings-${now.getTime()}`,
        title: '🎉 Excelente controle financeiro!',
        message: `Taxa de poupança de ${savingsRate.toFixed(1)}% está acima da média`,
        type: 'success',
        severity: 'low',
        category: 'insight',
        timestamp: now,
        isRead: false,
        actionable: true,
        suggestedActions: [
          'Considerar investimentos',
          'Aumentar meta de reserva de emergência',
          'Avaliar oportunidades de investimento'
        ]
      });
    }

    // 6. Projeções e previsões
    const avgMonthlyExpenses = totalExpenses;
    const projectedYearExpenses = avgMonthlyExpenses * 12;
    
    if (projectedYearExpenses > totalIncome * 12) {
      newAlerts.push({
        id: `projection-warning-${now.getTime()}`,
        title: '⚠️ Projeção de déficit anual',
        message: `Baseado no padrão atual, gastos anuais podem exceder receitas em R$ ${(projectedYearExpenses - totalIncome * 12).toFixed(2)}`,
        type: 'error',
        severity: 'critical',
        category: 'prediction',
        timestamp: now,
        isRead: false,
        actionable: true,
        suggestedActions: [
          'Revisar orçamento imediatamente',
          'Identificar gastos para cortar',
          'Buscar aumentar receitas'
        ]
      });
    }

    return newAlerts;
  };

  /**
   * 🔄 Executa análise automática
   */
  useEffect(() => {
    const runAnalysis = () => {
      const newAlerts = analyzePatterns();
      setAlerts(prev => {
        // Evitar duplicatas baseado no ID
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNewAlerts].slice(-50); // Manter últimos 50
      });
    };

    const interval = setInterval(runAnalysis, 30000); // Executar a cada 30 segundos

    // Executar imediatamente
    runAnalysis();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, metas]);

  /**
   * 📖 Marcar alerta como lido
   */
  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  /**
   * 🗑️ Remover alerta
   */
  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            🔔 Sistema de Alertas e Análises
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitoramento de padrões financeiros
          </p>
        </div>
        {unreadAlerts.length > 0 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {unreadAlerts.length} novo{unreadAlerts.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">{alerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">🚨</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Críticos</p>
              <p className="text-lg font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">📬</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Não Lidos</p>
              <p className="text-lg font-bold text-yellow-600">{unreadAlerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          📋 Alertas Recentes
        </h3>
        
        {alerts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Nenhum alerta no momento
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seu sistema financeiro está funcionando bem!
            </p>
          </Card>
        ) : (
          alerts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map(alert => (
              <Card key={alert.id} className={`p-4 ${!alert.isRead ? 'ring-2 ring-blue-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.type === 'success' ? 'bg-green-100 text-green-800' :
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        alert.type === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {alert.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {alert.message}
                    </p>
                    {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          💡 Ações sugeridas:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {alert.suggestedActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!alert.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        ✓
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAlert(alert.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default AlertsManager;
