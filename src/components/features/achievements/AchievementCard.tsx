// src/components/features/achievements/AchievementCard.tsx
import { Achievement } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt: Date | null;
}

interface AchievementCardProps {
  achievement: AchievementWithStatus;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const { name, description, unlocked, unlockedAt } = achievement;

  return (
    <Card className={cn("transition-all", !unlocked && "bg-secondary/50 opacity-60")}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          {unlocked ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
        {unlocked && unlockedAt && (
          <p className="text-xs text-muted-foreground mt-4">
            Desbloqueado em: {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
