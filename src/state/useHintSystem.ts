import { useState, useCallback, useEffect, useRef } from 'react';
import { computeHintPlacement, HintPlacement } from '../core/hint.ts';
import { getRotatedMatrix } from '../core/transformHelpers.ts';
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

const HINT_HIGHLIGHT_MS = 1500;

type Options = {
  // Timed levels only accept ad hints: free hints would undercut the retry economy
  isTimedLevel: boolean;
  // Puts the hinted piece on the board (state + visuals)
  onApplyHint: (placement: HintPlacement) => void;
};

export const useHintSystem = (
  currentLevel: LevelDefinition,
  pieces: GamePiece[],
  currentLevelNumber: number,
  { isTimedLevel, onApplyHint }: Options,
) => {
  const [hintCells, setHintCells] = useState<{ x: number; y: number }[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [freeHints, setFreeHints] = useState(0);

  // Cache: key = board state hash, value = hint for that state
  const hintCache = useRef<Map<string, HintPlacement | null>>(new Map());
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    hintCache.current.clear();
  }, [currentLevelNumber]);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const computeCached = useCallback((): HintPlacement | null => {
    const hash = getBoardStateHash(pieces);
    const cached = hintCache.current.get(hash);

    if (cached !== undefined) {
      Analytics.logHintSolveTime(currentLevelNumber, 0, true);
      return cached;
    }

    const start = performance.now();
    const placement = computeHintPlacement(currentLevel, pieces);
    const elapsed = Math.round(performance.now() - start);

    hintCache.current.set(hash, placement);
    Analytics.logHintSolveTime(currentLevelNumber, elapsed, false);

    return placement;
  }, [currentLevel, pieces, currentLevelNumber]);

  const highlight = useCallback(
    (placement: HintPlacement) => {
      const matrix = getRotatedMatrix(
        currentLevel.pieces[placement.pieceIndex],
        placement.rotation,
      );
      const cells: { x: number; y: number }[] = [];
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] === 1) {
            cells.push({ x: placement.x + j, y: placement.y + i });
          }
        }
      }
      setHintCells(cells);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHintCells([]), HINT_HIGHLIGHT_MS);
    },
    [currentLevel],
  );

  const applyHint = useCallback(
    (placement: HintPlacement, adWatched: boolean) => {
      setHintCount(c => c + 1);
      Analytics.logHintUsed(currentLevelNumber, adWatched);
      onApplyHint(placement);
      highlight(placement);
    },
    [currentLevelNumber, onApplyHint, highlight],
  );

  const handleFreeHint = useCallback(async () => {
    const placement = computeCached();
    if (!placement) return;
    const used = await GameStorage.useFreeHint();
    if (!used) return;
    setFreeHints(c => c - 1);
    applyHint(placement, false);
  }, [computeCached, applyHint]);

  const handleHint = useCallback(() => {
    const placement = computeCached();
    if (placement) applyHint(placement, false);
  }, [computeCached, applyHint]);

  const handleHintWithAd = useCallback(async () => {
    // Never charge an ad for a hint we can't deliver
    const placement = computeCached();
    if (!placement) return;

    const rewarded = await showRewardedAd();
    if (rewarded) applyHint(placement, true);
  }, [computeCached, applyHint]);

  const resetHints = useCallback(() => {
    setHintCells([]);
    setHintCount(0);
    hintCache.current.clear();
  }, []);

  const refreshFreeHints = useCallback(async () => {
    const count = await GameStorage.checkAndAwardFreeHint();
    setFreeHints(count);
  }, []);

  const hasFreeHints = freeHints > 0 && !isTimedLevel;
  const isAdHintAvailable = isRewardedAdReady() && !!isRewardedAdsActive;
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
    setHintCount,
    freeHints: isTimedLevel ? 0 : freeHints,
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
