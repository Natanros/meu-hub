/**
 * 📄 PDF Reports Component
 * Interface para geração de relatórios PDF avançados
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/types/transaction';
import { Meta } from '@/types/meta';
import { PDFReportGenerator, ReportConfig } from '@/lib/pdfReportGenerator';
import { formatDateLocal } from '@/lib/dateUtils';

interface ReportsManagerProps {
  transactions: Transaction[];
  metas: Meta[];
}

const ReportsManager: React.FC<ReportsManagerProps> = ({ transactions, metas }) => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'mensal',
    periodo: {
      inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      fim: new Date()
    },
    incluirGraficos: true,
    incluirMetas: true,
    incluirInsights: false,
    incluirProjecoes: false,
    formato: 'executivo'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastReportUrl, setLastReportUrl] = useState<string | null>(null);

  /**
   * 📅 Atualiza período baseado no tipo
   */
  useEffect(() => {
    const hoje = new Date();

    switch (config.type) {
      case 'mensal':
        setConfig(prev => ({
          ...prev,
          periodo: {
            inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
            fim: hoje
          }
        }));
        break;
      case 'anual':
        setConfig(prev => ({
          ...prev,
          periodo: {
            inicio: new Date(hoje.getFullYear(), 0, 1),
            fim: hoje
          }
        }));
        break;
      default:
        // Manter período personalizado
        break;
    }
  }, [config.type]);

  /**
   * 📄 Gera o relatório PDF
   */
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const generator = new PDFReportGenerator(config);
      const pdfBlob = await generator.generateReport(transactions, metas);
      
      // Criar URL para download
      const url = URL.createObjectURL(pdfBlob);
      setLastReportUrl(url);
      
      // Fazer download automaticamente
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-financeiro-${config.type}-${new Date().getTime()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 🎨 Aplica template pré-definido
   */
  const applyTemplate = (templateName: string) => {
    const templates = PDFReportGenerator.getTemplates();
    const template = templates[templateName];
    
    if (template) {
      setConfig({ ...config, ...template });
    }
  };

  /**
   * 📊 Estatísticas do período selecionado
   */
  const getStats = () => {
    const inicioMs = config.periodo.inicio.getTime();
    const fimMs = config.periodo.fim.getTime();
    
    const transacoesFiltradas = transactions.filter(t => {
      const dataTs = new Date(t.date).getTime();
      return dataTs >= inicioMs && dataTs <= fimMs;
    });

    const receitas = transacoesFiltradas
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const despesas = transacoesFiltradas
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transacoes: transacoesFiltradas.length,
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            📄 Relatórios Profissionais
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gere relatórios PDF detalhados com análises e insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              ⚙️ Configurações do Relatório
            </h3>
            
            {/* Templates Rápidos */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                🎨 Templates Rápidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('executivoMensal')}
                  className="text-xs"
                >
                  📊 Executivo Mensal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('resumoSemanal')}
                  className="text-xs"
                >
                  📝 Resumo Semanal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('relatorioAnual')}
                  className="text-xs"
                >
                  📅 Relatório Anual
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  📋 Tipo de Relatório
                </label>
                <select
                  value={config.type}
                  onChange={(e) => setConfig({ ...config, type: e.target.value as 'mensal' | 'anual' | 'personalizado' })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="mensal">📅 Mensal</option>
                  <option value="anual">🗓️ Anual</option>
                  <option value="personalizado">🎯 Personalizado</option>
                </select>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  📑 Formato
                </label>
                <select
                  value={config.formato}
                  onChange={(e) => setConfig({ ...config, formato: e.target.value as 'executivo' | 'detalhado' | 'resumido' })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="executivo">👔 Executivo</option>
                  <option value="detalhado">📋 Detalhado</option>
                  <option value="resumido">📝 Resumido</option>
                </select>
              </div>
            </div>

            {/* Período Personalizado */}
            {config.type === 'personalizado' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    📅 Data Início
                  </label>
                  <Input
                    type="date"
                    value={formatDateLocal(config.periodo.inicio)}
                    onChange={(e) => setConfig({
                      ...config,
                      periodo: {
                        ...config.periodo,
                        inicio: new Date(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    📅 Data Fim
                  </label>
                  <Input
                    type="date"
                    value={formatDateLocal(config.periodo.fim)}
                    onChange={(e) => setConfig({
                      ...config,
                      periodo: {
                        ...config.periodo,
                        fim: new Date(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Opções de Conteúdo */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                📄 Conteúdo do Relatório
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.incluirGraficos}
                    onChange={(e) => setConfig({ ...config, incluirGraficos: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">📊 Gráficos</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.incluirMetas}
                    onChange={(e) => setConfig({ ...config, incluirMetas: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🎯 Metas</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 O relatório incluirá estatísticas detalhadas das transações e categorias
              </p>
            </div>

            {/* Botão Gerar */}
            <div className="mt-6">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Gerando Relatório...
                  </>
                ) : (
                  <>📄 Gerar Relatório PDF</>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Preview e Estatísticas */}
        <div className="space-y-4">
          {/* Estatísticas do Período */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              📊 Dados do Período
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transações:</span>
                <span className="font-medium text-gray-800 dark:text-white">{stats.transacoes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Receitas:</span>
                <span className="font-medium text-green-600">R$ {stats.receitas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Despesas:</span>
                <span className="font-medium text-red-600">R$ {stats.despesas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saldo:</span>
                <span className={`font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {stats.saldo.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Período Selecionado */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              📅 Período Selecionado
            </h3>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">De</div>
              <div className="font-medium text-gray-800 dark:text-white mb-3">
                {config.periodo.inicio.toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Até</div>
              <div className="font-medium text-gray-800 dark:text-white">
                {config.periodo.fim.toLocaleDateString()}
              </div>
            </div>
          </Card>

          {/* Último Relatório */}
          {lastReportUrl && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                📄 Último Relatório
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(lastReportUrl)}
                className="w-full"
              >
                📖 Visualizar Relatório
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
