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

export type SolverStepType = 'try' | 'place' | 'undo' | 'solved';

export type SolverStep = {
  type: SolverStepType;
  cells: {x: number; y: number}[];
};

/**
 * Solve a level and record every backtracking step for visualization.
 * Returns all steps taken during the solve.
 */
function getComponentSizes(
  board: Board,
  occupiedCells: OccupiedCell[],
): number[] {
  const rows = board.length;
  const cols = board[0].length;
  const occupiedSet = new Set(occupiedCells.map(c => `${c.x},${c.y}`));
  const visited = new Set<string>();
  const sizes: number[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      if (board[y][x] !== Cell.AVAILABLE || occupiedSet.has(key) || visited.has(key)) {
        continue;
      }
      // BFS
      let size = 0;
      const queue: {x: number; y: number}[] = [{x, y}];
      visited.add(key);
      while (queue.length > 0) {
        const {x: cx, y: cy} = queue.shift()!;
        size++;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nkey = `${nx},${ny}`;
          if (
            nx >= 0 && nx < cols &&
            ny >= 0 && ny < rows &&
            board[ny][nx] === Cell.AVAILABLE &&
            !occupiedSet.has(nkey) &&
            !visited.has(nkey)
          ) {
            visited.add(nkey);
            queue.push({x: nx, y: ny});
          }
        }
      }
      sizes.push(size);
    }
  }

  return sizes;
}

export function solveWithSteps(level: LevelDefinition): SolverStep[] {
  const {board, pieces} = level;
  const steps: SolverStep[] = [];
  const occupiedCells: OccupiedCell[] = [];
  const usedPieces = new Set<number>();
  const rows = board.length;
  const cols = board[0].length;

  function backtrack(): boolean {
    if (usedPieces.size === pieces.length) {
      return true;
    }

    const isLastPiece = usedPieces.size === pieces.length - 1;

    // Connectivity pruning: son parça denenecekse, kalan available hücrelerin
    // component boyutlarını kontrol et. Son parçanın hücre sayısı hiçbir
    // component'a sığmıyorsa bu dal çözümsüz.
    if (isLastPiece) {
      const lastPieceIndex = pieces.findIndex((_, i) => !usedPieces.has(i));
      const lastPieceSize = pieces[lastPieceIndex].flat().filter(v => v === 1).length;
      const componentSizes = getComponentSizes(board, occupiedCells);
      if (!componentSizes.some(s => s >= lastPieceSize)) {
        return false;
      }
    }

    const triedPositions = new Set<string>();

    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      if (usedPieces.has(pieceIndex)) continue;

      const base = pieces[pieceIndex];
      const variants = getRotationVariants(base);

      for (const {matrix, rotation} of variants) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const adjusted = getAdjustedPlacement(matrix, x, y);
            const posKey = `${pieceIndex},${rotation},${adjusted.x},${adjusted.y}`;
            if (triedPositions.has(posKey)) continue;
            triedPositions.add(posKey);

            const newCells = getOccupiedCellsForPiece(
              adjusted.matrix,
              adjusted.x,
              adjusted.y,
            );

            steps.push({type: 'try', cells: newCells});

            if (canPlace(board, adjusted, occupiedCells)) {
              occupiedCells.push(...newCells);
              usedPieces.add(pieceIndex);

              steps.push({type: 'place', cells: newCells});

              if (backtrack()) {
                steps.push({type: 'solved', cells: [...occupiedCells]});
                return true;
              }

              steps.push({type: 'undo', cells: newCells});

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

  backtrack();
  return steps;
}

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
