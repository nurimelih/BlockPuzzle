import {
  GamePiece,
  LevelDefinition,
  PieceDirection,
  PieceMatrix,
} from '../types/types.ts';
import { solveLevel, solvePartial } from './solver.ts';
import { getRotatedMatrix } from './transformHelpers.ts';

export type HintPlacement = {
  pieceIndex: number;
  rotation: PieceDirection;
  x: number;
  y: number;
  // Placed pieces that block every solution and must be taken off the board
  unplaceIndices: number[];
};

const ROTATIONS: PieceDirection[] = [0, 90, 180, 270];

export const getPieceIndex = (piece: GamePiece) =>
  parseInt(piece.id.split('-')[1], 10);

const cellKeys = (matrix: PieceMatrix, x: number, y: number) => {
  const keys: string[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1) keys.push(`${x + j},${y + i}`);
    }
  }
  return keys.sort().join('|');
};

const findRotation = (
  base: PieceMatrix,
  target: PieceMatrix,
): PieceDirection | undefined => {
  const targetKey = JSON.stringify(target);
  return ROTATIONS.find(
    r => JSON.stringify(getRotatedMatrix(base, r)) === targetKey,
  );
};

/**
 * Next piece to place for a hint. Prefers continuing from the player's current
 * placements; if those make the level unsolvable, falls back to a full solution
 * and reports which placed pieces have to be removed.
 */
export const computeHintPlacement = (
  level: LevelDefinition,
  pieces: GamePiece[],
): HintPlacement | null => {
  const partial = solvePartial(level, pieces);
  if (partial && partial.length > 0) {
    const next = partial[0];
    return {
      pieceIndex: next.pieceIndex,
      rotation: next.rotation,
      x: next.x,
      y: next.y,
      unplaceIndices: [],
    };
  }
  if (partial) return null; // already solved

  const full = solveLevel(level);
  if (!full) return null;

  const entryKeys = full.map(entry => cellKeys(entry.matrix, entry.x, entry.y));
  const coveredEntries = new Set<number>();
  const unplaceIndices: number[] = [];

  for (const piece of pieces) {
    if (
      !piece.placed ||
      piece.boardX === undefined ||
      piece.boardY === undefined
    )
      continue;
    const key = cellKeys(
      getRotatedMatrix(piece.baseMatrix, piece.rotation),
      piece.boardX,
      piece.boardY,
    );
    const match = entryKeys.findIndex(
      (k, i) => k === key && !coveredEntries.has(i),
    );
    if (match >= 0) {
      coveredEntries.add(match);
    } else {
      unplaceIndices.push(getPieceIndex(piece));
    }
  }

  const freePieces = pieces.filter(
    p => !p.placed || unplaceIndices.includes(getPieceIndex(p)),
  );

  // Identical shapes are interchangeable, so match free pieces to open slots by shape
  for (let i = 0; i < full.length; i++) {
    if (coveredEntries.has(i)) continue;
    const entry = full[i];
    for (const piece of freePieces) {
      const rotation = findRotation(piece.baseMatrix, entry.matrix);
      if (rotation !== undefined) {
        return {
          pieceIndex: getPieceIndex(piece),
          rotation,
          x: entry.x,
          y: entry.y,
          unplaceIndices,
        };
      }
    }
  }
  return null;
};
