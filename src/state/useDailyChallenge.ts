import { useState, useCallback, useEffect } from 'react';
import { GameStorage } from '../services/GameStorage.ts';
import { fetchDailyChallenge } from '../services/supabase.ts';
import { LevelDefinition } from '../types/types.ts';

export type DailyChallengeState = {
  level: LevelDefinition | null;
  streak: number;
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

const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
};

export const useDailyChallenge = (): DailyChallengeState => {
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const today = todayStr();

    // Streak hesapla
    const lastDate = await GameStorage.getDailyLastDate();
    const savedStreak = await GameStorage.getDailyStreak();
    const done = await GameStorage.getDailyCompleted();

    if (lastDate === today) {
      setStreak(savedStreak);
      setCompletedToday(done);
    } else if (lastDate === yesterdayStr()) {
      // Dün oynadı, streak devam ediyor
      setStreak(savedStreak);
      setCompletedToday(false);
    } else if (lastDate) {
      // 1 günden fazla ara — streak sıfırla
      await GameStorage.setDailyStreak(0);
      setStreak(0);
      setCompletedToday(false);
    } else {
      setStreak(0);
      setCompletedToday(false);
    }

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
    setCompletedToday(true);
  }, []);

  return {
    level,
    streak,
    completedToday,
    isLoading,
    reload: load,
    markCompleted,
  };
};
