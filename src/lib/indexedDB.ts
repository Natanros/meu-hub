import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Transaction } from "@/types/transaction";

const DB_NAME = "MeuHubDB";
const DB_VERSION = 1;
const STORE_NAME = "pending-transactions";

// Define o tipo para a transação pendente, que pode não ter um ID do backend ainda
type PendingTransaction = Omit<Transaction, "id"> & {
  // O ID do IndexedDB é numérico e autoincrementado
  id?: number;
  timestamp: Date;
};

interface MeuHubDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: PendingTransaction;
    indexes: { "by-date": Date };
  };
}

let dbPromise: Promise<IDBPDatabase<MeuHubDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<MeuHubDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<MeuHubDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("by-date", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

export async function addPendingTransaction(
  transaction: Omit<Transaction, "id">
) {
  const db = await getDb();
  // Adiciona um timestamp para ordenação e referência
  const pendingTx: PendingTransaction = {
    ...transaction,
    timestamp: new Date(),
  };
  await db.add(STORE_NAME, pendingTx);
}

export async function getAllPendingTransactions(): Promise<
  PendingTransaction[]
> {
  const db = await getDb();
  return await db.getAll(STORE_NAME);
}

export async function deletePendingTransaction(id: number) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function clearAllPendingTransactions() {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
