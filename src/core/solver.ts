import {Board, Cell, GamePiece, LevelDefinition, OccupiedCell, PieceMatrix} from '../types/types.ts';
import {canPlace, getAdjustedPlacement} from './gameCore.ts';
import {rotate90CW, getRotatedMatrix} from './transformHelpers.ts';
import type {PieceDirection} from '../types/types.ts';

export type PieceSolution = {
  pieceIndex: number;
  matrix: PieceMatrix;
  rotation: PieceDirection;
  x: number;
  y: number;
};

export type LevelSolution = PieceSolution[];

/**
 * Get all 4 rotation variants of a piece matrix.
 * Deduplicates identical rotations (e.g., O_PIECE is same in all rotations).
 */
function getRotationVariants(
  base: PieceMatrix,
): {matrix: PieceMatrix; rotation: PieceDirection}[] {
  const variants: {matrix: PieceMatrix; rotation: PieceDirection}[] = [];
  const seen = new Set<string>();

  let current = base;
  const rotations: PieceDirection[] = [0, 90, 180, 270];

  for (const rotation of rotations) {
    const key = JSON.stringify(current);
    if (!seen.has(key)) {
      seen.add(key);
      variants.push({matrix: current, rotation});
    }
    current = rotate90CW(current);
  }

  return variants;
}

/**
 * Get all AVAILABLE cells on the board.
 */
function getAvailableCells(board: Board): {x: number; y: number}[] {
  const cells: {x: number; y: number}[] = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x] === Cell.AVAILABLE) {
        cells.push({x, y});
      }
    }
  }
  return cells;
}

/**
 * Get the occupied cells if a piece were placed at (x, y).
 */
function getOccupiedCellsForPiece(
  matrix: PieceMatrix,
  x: number,
  y: number,
): OccupiedCell[] {
  const cells: OccupiedCell[] = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1) {
        cells.push({x: x + j, y: y + i});
      }
    }
  }
  return cells;
}

/**
 * Solve a level using backtracking.
 * Tries placing each piece in every valid position and rotation.
 */
export function solveLevel(level: LevelDefinition): LevelSolution | null {
  const {board, pieces} = level;
  const solution: LevelSolution = [];
  const occupiedCells: OccupiedCell[] = [];
  const usedPieces = new Set<number>();

  const rows = board.length;
  const cols = board[0].length;

  function backtrack(): boolean {
    // All pieces placed -> solved
    if (solution.length === pieces.length) {
      return true;
    }

    // Try each unused piece
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      if (usedPieces.has(pieceIndex)) continue;

      const base = pieces[pieceIndex];
      const variants = getRotationVariants(base);

      for (const {matrix, rotation} of variants) {
        // Try every position on the board
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const adjusted = getAdjustedPlacement(matrix, x, y);

            if (canPlace(board, adjusted, occupiedCells)) {
              // Place piece
              const newCells = getOccupiedCellsForPiece(
                adjusted.matrix,
                adjusted.x,
                adjusted.y,
              );
              occupiedCells.push(...newCells);
              usedPieces.add(pieceIndex);
              solution.push({
                pieceIndex,
                matrix: adjusted.matrix,
                rotation,
                x: adjusted.x,
                y: adjusted.y,
              });

              if (backtrack()) {
                return true;
              }

              // Undo placement
              solution.pop();
              usedPieces.delete(pieceIndex);
              occupiedCells.splice(
                occupiedCells.length - newCells.length,
                newCells.length,
              );
            }
          }
        }
      }
    }

    return false;
  }

  const solved = backtrack();
  return solved ? solution : null;
}

/**
 * Solve from current game state.
 * Takes already-placed pieces into account and only solves for remaining pieces.
 * Returns solution for unplaced pieces only.
 */
export function solvePartial(
  level: LevelDefinition,
  gamePieces: GamePiece[],
): LevelSolution | null {
  const {board, pieces} = level;

  // Build occupied cells from already placed pieces
  const occupiedCells: OccupiedCell[] = [];
  const usedPieces = new Set<number>();

  for (const gp of gamePieces) {
    if (!gp.placed || gp.boardX === undefined || gp.boardY === undefined) {
      continue;
    }

    const pieceIndex = parseInt(gp.id.split('-')[1], 10);
    usedPieces.add(pieceIndex);

    const matrix = getRotatedMatrix(gp.baseMatrix, gp.rotation);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 1) {
          occupiedCells.push({x: gp.boardX + j, y: gp.boardY + i});
        }
      }
    }
  }

  const remainingCount = pieces.length - usedPieces.size;
  if (remainingCount === 0) return [];

  const solution: LevelSolution = [];
  const rows = board.length;
  const cols = board[0].length;

  function backtrack(): boolean {
    if (solution.length === remainingCount) {
      return true;
    }

    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      if (usedPieces.has(pieceIndex)) continue;

      const base = pieces[pieceIndex];
      const variants = getRotationVariants(base);

      for (const {matrix, rotation} of variants) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const adjusted = getAdjustedPlacement(matrix, x, y);

            if (canPlace(board, adjusted, occupiedCells)) {
              const newCells = getOccupiedCellsForPiece(
                adjusted.matrix,
                adjusted.x,
                adjusted.y,
              );
              occupiedCells.push(...newCells);
              usedPieces.add(pieceIndex);
              solution.push({
                pieceIndex,
                matrix: adjusted.matrix,
                rotation,
                x: adjusted.x,
                y: adjusted.y,
              });

              if (backtrack()) {
                return true;
              }

              solution.pop();
              usedPieces.delete(pieceIndex);
              occupiedCells.splice(
                occupiedCells.length - newCells.length,
                newCells.length,
              );
            }
          }
        }
      }
    }

    return false;
  }

  const solved = backtrack();
  return solved ? solution : null;
}
