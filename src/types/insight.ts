// src/types/insight.ts
// Tipos relacionados a insights e análises financeiras

export interface Insight {
  type: "info" | "warning" | "success" | "danger";
  title: string;
  message: string;
  icon: string;
  value?: string;
}

export interface AIInsight {
  type: "tip" | "warning" | "opportunity" | "achievement" | "success" | "info";
  title: string;
  description?: string;
  message?: string;
  icon?: string;
  impact?: "low" | "medium" | "high";
  actionable?: boolean;
  action?: string;
}
