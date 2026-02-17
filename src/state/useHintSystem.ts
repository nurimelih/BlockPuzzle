import { useState, useCallback, useEffect, useRef } from 'react';
import { solvePartial, LevelSolution } from '../core/solver.ts';
import { showRewardedAd, isRewardedAdReady } from '../services/AdManager.ts';
import { Analytics } from '../services/Analytics.ts';
import { GameStorage } from '../services/GameStorage.ts';
import { useAppStore } from './useAppStore.ts';
import type { LevelDefinition, GamePiece } from '../types/types.ts';

/**
 * Generate a hash key from the current board state (placed pieces).
 * Used for caching solver results - same placed pieces = same solution.
 */
function getBoardStateHash(pieces: GamePiece[]): string {
  const placedState = pieces
    .filter(p => p.placed)
    .map(p => `${p.id}:${p.boardX},${p.boardY}:${p.rotation}`)
    .sort()
    .join('|');
  return placedState;
}

export const useHintSystem = (
  currentLevel: LevelDefinition,
  pieces: GamePiece[],
  currentLevelNumber: number,
) => {
  const [hintCells, setHintCells] = useState<{ x: number; y: number }[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [freeHints, setFreeHints] = useState(0);

  // Cache: key = board state hash, value = solver result
  const solverCache = useRef<Map<string, LevelSolution | null>>(new Map());

  const isRewardedAdsActive = useAppStore(
    state => state.appSettings,
  ).rewardedAdsActive;

  const forceToShowHints = useAppStore(
    state => state.appSettings,
  ).forceToShowHints;

  // Load free hints on mount
  useEffect(() => {
    GameStorage.getFreeHintCount().then(setFreeHints);
  }, []);

  // Clear cache when level changes
  useEffect(() => {
    solverCache.current.clear();
  }, [currentLevelNumber]);

  const solveCached = useCallback((): LevelSolution | null => {
    const hash = getBoardStateHash(pieces);
    const cached = solverCache.current.get(hash);

    if (cached !== undefined) {
      Analytics.logHintSolveTime(currentLevelNumber, 0, true);
      return cached;
    }

    const start = performance.now();
    const solution = solvePartial(currentLevel, pieces);
    const elapsed = Math.round(performance.now() - start);

    solverCache.current.set(hash, solution);
    Analytics.logHintSolveTime(currentLevelNumber, elapsed, false);

    return solution;
  }, [currentLevel, pieces, currentLevelNumber]);

  const showHintCells = useCallback((solution: LevelSolution | null) => {
    if (!solution || solution.length === 0) return;

    const hint = solution[0];
    const cells: { x: number; y: number }[] = [];
    for (let i = 0; i < hint.matrix.length; i++) {
      for (let j = 0; j < hint.matrix[i].length; j++) {
        if (hint.matrix[i][j] === 1) {
          cells.push({ x: hint.x + j, y: hint.y + i });
        }
      }
    }

    setHintCells(cells);
    setTimeout(() => {
      setHintCells([]);
    }, 3000);
  }, []);

  const applyHint = useCallback((adWatched: boolean) => {
    const solution = solveCached();
    if (!solution || solution.length === 0) return;

    setHintCount(c => c + 1);
    Analytics.logHintUsed(currentLevelNumber, adWatched);
    showHintCells(solution);
  }, [solveCached, currentLevelNumber, showHintCells]);

  const handleFreeHint = useCallback(async () => {
    const used = await GameStorage.useFreeHint();
    if (!used) return;
    setFreeHints(c => c - 1);
    applyHint(false);
  }, [applyHint]);

  const handleHint = useCallback(() => {
    applyHint(false);
  }, [applyHint]);

  const handleHintWithAd = useCallback(async () => {
    const solution = solveCached();
    if (!solution || solution.length === 0) return;

    const rewarded = await showRewardedAd();
    if (rewarded) {
      applyHint(true);
    }
  }, [solveCached, applyHint]);

  const resetHints = useCallback(() => {
    setHintCells([]);
    setHintCount(0);
    solverCache.current.clear();
  }, []);

  const refreshFreeHints = useCallback(async () => {
    const count = await GameStorage.checkAndAwardFreeHint();
    setFreeHints(count);
  }, []);

  const hasFreeHints = freeHints > 0;
  const isAdHintAvailable = isRewardedAdReady() && isRewardedAdsActive;
  const shouldShowHintButton = hasFreeHints || isAdHintAvailable || !!forceToShowHints;

  // Priority: force > free > ad
  const onHintPress = forceToShowHints
    ? handleHint
    : hasFreeHints
      ? handleFreeHint
      : handleHintWithAd;

  return {
    hintCells,
    hintCount,
    freeHints,
    handleHint,
    handleHintWithAd,
    handleFreeHint,
    resetHints,
    refreshFreeHints,
    shouldShowHintButton,
    onHintPress,
    hasFreeHints,
  };
};
