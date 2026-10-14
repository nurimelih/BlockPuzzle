import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { GameStorage, LevelProgressSnapshot } from '../services/GameStorage.ts';
import type { GamePiece, LevelDefinition } from '../types/types.ts';

// djb2 — only needs to tell level definitions apart, not be secure
const hashString = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

type Params = {
  // Unique per playable level, e.g. "level-14" or "daily-2026-10-14"
  levelKey: string;
  level: LevelDefinition;
  pieces: GamePiece[];
  moveCount: number;
  hintCount: number;
  isOver: boolean;
  getElapsedTime: () => number;
  onRestore: (snapshot: LevelProgressSnapshot) => void;
};

const hasProgress = (pieces: GamePiece[], moveCount: number) =>
  moveCount > 0 || pieces.some(p => p.placed);

/**
 * Persists the board of an unfinished level so a session interrupted by the
 * metro stop or an app kill resumes where it left off — timer included, so
 * leaving a timed level is never a way around the clock.
 */
export const useLevelProgress = ({
  levelKey,
  level,
  pieces,
  moveCount,
  hintCount,
  isOver,
  getElapsedTime,
  onRestore,
}: Params) => {
  const signature = useMemo(
    () => hashString(JSON.stringify({ b: level.board, p: level.pieces })),
    [level],
  );

  // Updated after each commit, so cleanups below still see the previous level
  const latest = useRef({
    levelKey,
    signature,
    pieces,
    moveCount,
    hintCount,
    isOver,
  });
  useEffect(() => {
    latest.current = {
      levelKey,
      signature,
      pieces,
      moveCount,
      hintCount,
      isOver,
    };
  });

  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const save = useCallback(() => {
    const s = latest.current;
    if (s.isOver || !hasProgress(s.pieces, s.moveCount)) return;
    GameStorage.saveLevelProgress(s.levelKey, {
      signature: s.signature,
      pieces: s.pieces.map(({ id, rotation, placed, boardX, boardY }) => ({
        id,
        rotation,
        placed,
        boardX,
        boardY,
      })),
      moveCount: s.moveCount,
      hintCount: s.hintCount,
      elapsed: getElapsedTime(),
      savedAt: Date.now(),
    });
  }, [getElapsedTime]);

  const clear = useCallback(() => {
    GameStorage.clearLevelProgress(latest.current.levelKey);
  }, []);

  // Restore on level entry; save the outgoing level on switch/unmount
  useEffect(() => {
    let cancelled = false;
    GameStorage.getLevelProgress(levelKey).then(snapshot => {
      const s = latest.current;
      if (
        cancelled ||
        !snapshot ||
        snapshot.signature !== signature ||
        s.levelKey !== levelKey ||
        hasProgress(s.pieces, s.moveCount) // player already moved meanwhile
      ) {
        return;
      }
      onRestoreRef.current(snapshot);
    });
    return () => {
      cancelled = true;
      save();
    };
  }, [levelKey, signature, level, save]);

  useEffect(() => {
    if (hasProgress(pieces, moveCount)) save();
  }, [pieces, moveCount, hintCount, save]);

  useEffect(() => {
    if (isOver) clear();
  }, [isOver, clear]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') save();
    });
    return () => sub.remove();
  }, [save]);

  return { clearProgress: clear };
};
