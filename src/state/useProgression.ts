import { useCallback, useEffect, useState } from 'react';
import {
  consumeLife,
  getStreakMultiplier,
  LIVES_MAX,
  LivesState,
  regenLives,
} from '../core/progression.ts';
import { GameStorage } from '../services/GameStorage.ts';

/**
 * Lives (spent to retry a timed level without losing the streak) and the win
 * streak (consecutive completed levels, drives the score multiplier).
 */
export const useProgression = () => {
  const [livesState, setLivesState] = useState<LivesState>({
    lives: LIVES_MAX,
    regenStartedAt: Date.now(),
  });
  const [winStreak, setWinStreak] = useState(0);

  const refresh = useCallback(async () => {
    const [storedLives, streak] = await Promise.all([
      GameStorage.getLivesState(),
      GameStorage.getWinStreak(),
    ]);
    const current = regenLives(storedLives, Date.now());
    if (current !== storedLives) await GameStorage.saveLivesState(current);
    setLivesState(current);
    setWinStreak(streak);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const spendLife = useCallback(async (): Promise<boolean> => {
    const next = consumeLife(await GameStorage.getLivesState(), Date.now());
    if (!next) return false;
    await GameStorage.saveLivesState(next);
    setLivesState(next);
    return true;
  }, []);

  const incrementStreak = useCallback(async (): Promise<number> => {
    const next = (await GameStorage.getWinStreak()) + 1;
    await GameStorage.setWinStreak(next);
    setWinStreak(next);
    return next;
  }, []);

  const resetStreak = useCallback(async () => {
    await GameStorage.setWinStreak(0);
    setWinStreak(0);
  }, []);

  return {
    livesState,
    lives: livesState.lives,
    winStreak,
    streakMultiplier: getStreakMultiplier(winStreak),
    refresh,
    spendLife,
    incrementStreak,
    resetStreak,
  };
};
