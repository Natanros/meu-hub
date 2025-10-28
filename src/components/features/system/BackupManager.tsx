/**
 * 💾 Backup and Settings Manager
 * Sistema avançado de backup, restauração e configurações
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/types/transaction';
import { Meta } from '@/types/meta';
import { getCurrentDateLocal } from '@/lib/dateUtils';

interface BackupData {
  timestamp: Date;
  version: string;
  transactions: Transaction[];
  metas: Meta[];
  settings: SystemSettings;
  metadata: {
    totalTransactions: number;
    totalMetas: number;
    dateRange: {
      start: string;
      end: string;
    };
    exportedBy: string;
  };
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US';
  notifications: {
    enabled: boolean;
    browser: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataCollection: boolean;
  };
  features: {
    voiceInput: boolean;
    expenseTracking: boolean;
  };
}

interface BackupManagerProps {
  transactions: Transaction[];
  metas: Meta[];
  onDataRestore?: (data: BackupData) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
  transactions, 
  metas, 
  onDataRestore 
}) => {
  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'auto',
    currency: 'BRL',
    language: 'pt-BR',
    notifications: {
      enabled: true,
      browser: true
    },
    privacy: {
      analytics: true,
      crashReports: true,
      dataCollection: false
    },
    features: {
      voiceInput: true,
      expenseTracking: true
    }
  });

  const [backupHistory, setBackupHistory] = useState<BackupData[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  /**
   * 💾 Criar backup completo
   */
  const createBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      const backupData: BackupData = {
        timestamp: new Date(),
        version: '2.0.0',
        transactions,
        metas,
        settings,
        metadata: {
          totalTransactions: transactions.length,
          totalMetas: metas.length,
          dateRange: {
            start: transactions.length > 0 
              ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime()))).toISOString()
              : new Date().toISOString(),
            end: transactions.length > 0 
              ? new Date(Math.max(...transactions.map(t => new Date(t.date).getTime()))).toISOString()
              : new Date().toISOString()
          },
          exportedBy: 'Meu Hub Pessoal'
        }
      };

      // Converter para string JSON formatada
      const backupJson = JSON.stringify(backupData, null, 2);
      
      // Criar arquivo de download
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-meu-hub-${getCurrentDateLocal()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Atualizar histórico
      setBackupHistory(prev => [backupData, ...prev].slice(0, 10)); // Manter últimos 10
      setLastBackup(new Date());
      
      // Salvar no localStorage também
      localStorage.setItem('meu-hub-backup-history', JSON.stringify([backupData, ...backupHistory].slice(0, 5)));
      
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup. Tente novamente.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  /**
   * 📂 Restaurar backup
   */
  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData: BackupData = JSON.parse(e.target?.result as string);
        
        if (!backupData.transactions || !backupData.metas) {
          throw new Error('Formato de backup inválido');
        }

        if (onDataRestore) {
          onDataRestore(backupData);
        }
        
        alert(`Backup restaurado com sucesso!\n${backupData.metadata.totalTransactions} transações\n${backupData.metadata.totalMetas} metas`);
        
      } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        alert('Erro ao restaurar backup. Verifique se o arquivo é válido.');
      }
    };
    
    reader.readAsText(file);
  };

  /**
   * ⚙️ Salvar configurações
   */
  const saveSettings = () => {
    localStorage.setItem('meu-hub-settings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  /**
   * 📊 Estatísticas do sistema
   */
  const getSystemStats = () => {
    const totalSize = JSON.stringify({ transactions, metas, settings }).length;
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    return {
      totalSize: sizeInKB,
      transactions: transactions.length,
      metas: metas.length,
      lastBackup: lastBackup?.toLocaleString() || 'Nunca'
    };
  };

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('meu-hub-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedBackupHistory = localStorage.getItem('meu-hub-backup-history');
    if (savedBackupHistory) {
      setBackupHistory(JSON.parse(savedBackupHistory));
    }
  }, []);

  const stats = getSystemStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            💾 Backup & Configurações
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gerencie backups e configure o sistema
          </p>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.transactions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Transações</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.metas}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Metas</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalSize} KB</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tamanho Total</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{backupHistory.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Backups</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção de Backup */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            💾 Gerenciamento de Backup
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Último Backup:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.lastBackup}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={createBackup}
                disabled={isCreatingBackup}
                className="w-full"
                size="lg"
              >
                {isCreatingBackup ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Criando Backup...
                  </>
                ) : (
                  <>💾 Criar Backup Completo</>
                )}
              </Button>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  📂 Restaurar Backup
                </label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={restoreBackup}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Seção de Configurações */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            ⚙️ Configurações do Sistema
          </h3>
          
          <div className="space-y-6">
            {/* Aparência */}
            <div>
              <h4 className="font-medium mb-3 text-gray-800 dark:text-white">
                🎨 Aparência
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Tema
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: e.target.value as 'light' | 'dark' | 'auto'
                    })}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Moeda
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      currency: e.target.value as 'BRL' | 'USD' | 'EUR'
                    })}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div>
              <h4 className="font-medium mb-3 text-gray-800 dark:text-white">
                🔔 Notificações
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enabled: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Habilitar notificações
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.browser}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, browser: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Notificações do navegador
                  </span>
                </label>
              </div>
            </div>

            {/* Funcionalidades */}
            <div>
              <h4 className="font-medium mb-3 text-gray-800 dark:text-white">
                ⚡ Funcionalidades
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.features.voiceInput}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, voiceInput: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Entrada por voz
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.features.expenseTracking}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, expenseTracking: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Rastreamento de despesas
                  </span>
                </label>
              </div>
            </div>

            <Button
              onClick={saveSettings}
              className="w-full"
            >
              💾 Salvar Configurações
            </Button>
          </div>
        </Card>
      </div>

      {/* Histórico de Backups */}
      {backupHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            📋 Histórico de Backups
          </h3>
          <div className="space-y-3">
            {backupHistory.slice(0, 5).map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {backup.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {backup.metadata.totalTransactions} transações • {backup.metadata.totalMetas} metas
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  v{backup.version}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BackupManager;
