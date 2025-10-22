// src/types/chat.ts
// Tipos relacionados ao sistema de chat

import { Transaction } from "./transaction";
import { Meta } from "./meta";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  messages: ChatMessage[];
  transactions?: Transaction[];
  transactionData?: {
    transactions: Transaction[];
    metas: Meta[];
    saldo: number;
  };
}
