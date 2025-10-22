// src/types/achievement.ts
// Tipos relacionados ao sistema de conquistas

import { Achievement } from "@prisma/client";

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  progress?: number;
}
