'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getAllPendingTransactions, deletePendingTransaction } from '@/lib/indexedDB';
import { useToast } from '@/hooks/useToast';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';

// Este tipo deve ser consistente com o definido em indexedDB.ts
type PendingTransaction = {
  id?: number; // ID do IndexedDB
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string;
  metaId?: string;
  installments?: number;
  recurrence?: string;
  timestamp: Date;
};

export function SyncManager() {
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPendingCount = useCallback(async () => {
    try {
      const pending = await getAllPendingTransactions();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Erro ao buscar transações pendentes:', error);
    }
  }, []);

  const syncPendingTransactions = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    const pending: PendingTransaction[] = await getAllPendingTransactions();
    if (pending.length === 0) {
      setPendingCount(0);
      return;
    }

    setIsSyncing(true);
    showToast(`Sincronizando ${pending.length} transação(ões)...`, 'success');

    let successCount = 0;
    for (const tx of pending) {
      try {
        // O corpo da requisição não deve incluir o ID do IndexedDB nem o timestamp
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, timestamp, ...txData } = tx;
        console.log('Syncing transaction:', txData);

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(txData),
        });

        if (response.ok) {
          // Se a API confirmar, remove do IndexedDB
          if (id) {
            await deletePendingTransaction(id);
          }
          successCount++;
        } else {
          // Se a API falhar, mantém no IndexedDB para tentar depois
          console.error(
            'Falha ao sincronizar transação:',
            await response.json()
          );
        }
      } catch (error) {
        console.error('Erro de rede ao sincronizar:', error);
        // Para o processo se houver erro de rede
        break;
      }
    }

    if (successCount > 0) {
      showToast(
        `${successCount} transação(ões) sincronizadas com sucesso!`,
        'success'
      );
    }

    // Atualiza a contagem e o estado
    await fetchPendingCount();
    setIsSyncing(false);

    // Dispara um evento para que outras partes da UI possam recarregar os dados
    window.dispatchEvent(new CustomEvent('transactions-synced'));
  }, [isSyncing, isOnline, showToast, fetchPendingCount]);

  // Efeito para buscar a contagem inicial e monitorar mudanças
  useEffect(() => {
    fetchPendingCount();
    // Adiciona um listener para quando uma transação é adicionada offline
    const handleLocalTransaction = () => fetchPendingCount();
    window.addEventListener('local-transaction-added', handleLocalTransaction);
    return () =>
      window.removeEventListener(
        'local-transaction-added',
        handleLocalTransaction
      );
  }, [fetchPendingCount]);

  // Efeito para iniciar a sincronização quando ficar online
  useEffect(() => {
    if (isOnline) {
      syncPendingTransactions();
    }
  }, [isOnline, syncPendingTransactions]);

  // Não renderiza nada se não houver transações pendentes
  if (pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-white shadow-lg">
        {isSyncing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Sincronizando...</span>
          </>
        ) : isOnline ? (
          <>
            <Cloud className="h-5 w-5 text-green-400" />
            <span>{pendingCount} pendente(s)</span>
          </>
        ) : (
          <>
            <CloudOff className="h-5 w-5 text-red-400" />
            <span>{pendingCount} offline</span>
          </>
        )}
      </div>
    </div>
  );
}
