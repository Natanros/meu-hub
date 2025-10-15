// src/app/achievements/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Achievement } from "@prisma/client";
import AchievementCard from '@/components/features/achievements/AchievementCard';
import { useToast } from "@/hooks/useToast";
import { Progress } from "@/components/ui/progress";

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt: Date | null;
  isUnlocked?: boolean;
  progress?: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchAchievements() {
      try {
        setLoading(true);
        const response = await fetch("/api/achievements");
        if (!response.ok) {
          throw new Error("Falha ao buscar conquistas");
        }
        const data = await response.json();
        setAchievements(data);
      } catch (error) {
        console.error(error);
        showToast("Erro ao carregar conquistas.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [showToast]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Conquistas</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Conquistas</h1>
        <p className="text-muted-foreground">
          Você desbloqueou {unlockedCount} de {totalCount} conquistas. Continue assim!
        </p>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
