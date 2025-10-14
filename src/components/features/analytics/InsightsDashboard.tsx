// src/components/InsightsDashboard.tsx
// src/components/features/analytics/InsightsDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Insight } from "@/lib/financialInsights";
import { motion, AnimatePresence } from "framer-motion";

const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => {
  const colors = {
    success: "border-green-500 bg-green-50 dark:bg-green-900/20",
    warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border-l-4 ${colors[insight.type]}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <span className="text-2xl">{insight.icon}</span>
          <CardTitle className="text-base font-semibold">{insight.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{insight.message}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
);

export function InsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const response = await fetch("/api/insights");
        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        }
      } catch (error) {
        console.error("Erro ao buscar insights:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          Insights da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : insights.length > 0 ? (
            insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p>Nenhum insight novo para você esta semana.</p>
              <p className="text-xs">Continue usando o app para gerarmos novas análises!</p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
