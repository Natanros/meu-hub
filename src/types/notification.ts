// src/types/notification.ts
// Tipos relacionados ao sistema de notificações

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: Date;
  timestamp?: Date;
  actionUrl?: string;
  icon?: string;
  category?: "finance" | "goals" | "budget" | "insights" | "alerts" | string;
  priority?: "low" | "medium" | "high" | "critical";
  actionable?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  type:
    | "budget_limit"
    | "unusual_spending"
    | "goal_progress"
    | "bill_reminder"
    | "custom"
    | "budget"
    | "goal"
    | "spending"
    | "pattern"
    | "income";
  enabled?: boolean;
  isActive?: boolean;
  conditions?: {
    category?: string;
    threshold?: number;
    comparison?: "greater" | "less" | "equal";
    timeframe?: "daily" | "weekly" | "monthly";
  };
  condition?: {
    field: string;
    operator: "gt" | "lt" | "eq" | "gte" | "lte" | "contains";
    value: number | string;
  };
  actions?: {
    notify: boolean;
    email?: boolean;
    sound?: boolean;
  };
  action?: {
    type: "notification" | "email" | "webhook";
    message: string;
    severity: "low" | "medium" | "high" | "critical";
  };
  frequency?: "immediate" | "daily" | "weekly" | "monthly";
  createdAt?: Date;
  lastTriggered?: Date;
}

export interface SmartAlert {
  id: string;
  type: "warning" | "info" | "success" | "critical" | "error";
  title: string;
  message: string;
  category?: string | "budget" | "goal" | "pattern" | "insight" | "prediction";
  amount?: number;
  recommendation?: string;
  actionable: boolean;
  actionLabel?: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high" | "critical";
  severity?: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  timestamp?: Date;
  read: boolean;
  isRead?: boolean;
  dismissed: boolean;
  suggestedActions?: string[];
  relatedData?: {
    transactionId?: number;
    metaId?: string;
    category?: string;
    amount?: number;
  };
}
