import { useState, useCallback, useEffect } from 'react';
import { GameStorage } from '../services/GameStorage.ts';
import { fetchDailyChallenge } from '../services/supabase.ts';
import { Analytics } from '../services/Analytics.ts';
import { resolveDailyStreak } from '../core/progression.ts';
import { LevelDefinition } from '../types/types.ts';

export type DailyChallengeState = {
  level: LevelDefinition | null;
  streak: number;
  // Streak freezes: each one bridges a single missed day
  freezes: number;
  completedToday: boolean;
  isLoading: boolean;
  reload: () => Promise<void>;
  markCompleted: () => Promise<void>;
};

const localDateStr = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = () => localDateStr();


export const useDailyChallenge = (): DailyChallengeState => {
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const [streak, setStreak] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const today = todayStr();

    // Streak hesapla — tek günlük boşluğu seri koruyucu kapatır
    const lastDate = await GameStorage.getDailyLastDate();
    const savedStreak = await GameStorage.getDailyStreak();
    const savedFreezes = await GameStorage.getStreakFreezes();
    const done = await GameStorage.getDailyCompleted();

    const resolved = resolveDailyStreak(
      { lastDate, streak: savedStreak, freezes: savedFreezes },
      today,
    );
    if (resolved.usedFreeze && resolved.lastDate) {
      await GameStorage.setDailyLastDate(resolved.lastDate);
      await GameStorage.setStreakFreezes(resolved.freezes);
      Analytics.logStreakFreezeUsed(resolved.streak);
    } else if (resolved.streak !== savedStreak) {
      await GameStorage.setDailyStreak(resolved.streak);
    }

    setStreak(resolved.streak);
    setFreezes(resolved.freezes);
    setCompletedToday(lastDate === today && done);

    // Günün levelını çek
    const fetched = await fetchDailyChallenge(today);
    setLevel(fetched);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markCompleted = useCallback(async () => {
    await GameStorage.markDailyCompleted();
    const newStreak = await GameStorage.getDailyStreak();
    setStreak(newStreak);
    setFreezes(await GameStorage.getStreakFreezes());
    setCompletedToday(true);
  }, []);

  return {
    level,
    streak,
    freezes,
    completedToday,
    isLoading,
    reload: load,
    markCompleted,
  };
};
