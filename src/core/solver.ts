import {Board, Cell, GamePiece, LevelDefinition, PieceMatrix} from '../types/types.ts';
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

type CellOffset = {x: number; y: number};

type Variant = {
  matrix: PieceMatrix;
  rotation: PieceDirection;
  // Satır-öncelikli sırada; ilk eleman "çapa" hücresi
  cells: CellOffset[];
};

/** true = doldurulamaz (board dışı/void/invalid ya da dolu) */
type FilledGrid = boolean[][];

function getCells(matrix: PieceMatrix): CellOffset[] {
  const cells: CellOffset[] = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === 1) {
        cells.push({x, y});
      }
    }
  }
  return cells;
}

/**
 * Get all 4 rotation variants of a piece matrix.
 * Deduplicates identical rotations (e.g., O_PIECE is same in all rotations).
 */
function getRotationVariants(base: PieceMatrix): Variant[] {
  const variants: Variant[] = [];
  const seen = new Set<string>();

  let current = base;
  const rotations: PieceDirection[] = [0, 90, 180, 270];

  for (const rotation of rotations) {
    const key = JSON.stringify(current);
    if (!seen.has(key)) {
      seen.add(key);
      variants.push({matrix: current, rotation, cells: getCells(current)});
    }
    current = rotate90CW(current);
  }

  return variants;
}

function createFilledGrid(board: Board): FilledGrid {
  return board.map(row => row.map(cell => cell !== Cell.AVAILABLE));
}

function fits(filled: FilledGrid, cells: CellOffset[], originX: number, originY: number): boolean {
  for (const c of cells) {
    const x = originX + c.x;
    const y = originY + c.y;
    if (y < 0 || x < 0 || y >= filled.length || x >= filled[0].length || filled[y][x]) {
      return false;
    }
  }
  return true;
}

function setCells(
  filled: FilledGrid,
  cells: CellOffset[],
  originX: number,
  originY: number,
  value: boolean,
): void {
  for (const c of cells) {
    filled[originY + c.y][originX + c.x] = value;
  }
}

function findFirstEmpty(filled: FilledGrid): CellOffset | null {
  for (let y = 0; y < filled.length; y++) {
    for (let x = 0; x < filled[0].length; x++) {
      if (!filled[y][x]) {
        return {x, y};
      }
    }
  }
  return null;
}

function countEmpty(filled: FilledGrid): number {
  return filled.reduce((sum, row) => sum + row.filter(c => !c).length, 0);
}

/**
 * Kalan parçaları boş hücrelere yerleştirir.
 *
 * Parçalar boş alanı tam dolduruyorsa (normal level'lar) exact-cover araması yapılır:
 * satır-öncelikli ilk boş hücre mutlaka bir parçanın çapa hücresiyle kapanmalıdır, bu
 * yüzden yalnızca o yerleşimler denenir ve aynı şekilli parçalar bir kez denenir.
 * Saf "her parça her pozisyonda" aramasına göre kat kat hızlıdır; ipucu UI thread'inde
 * hesaplandığı için bu önemli. Alan uyuşmuyorsa (hatalı/uzak level) kapsamlı aramaya düşer.
 */
function search(
  pieces: PieceMatrix[],
  filled: FilledGrid,
  usedPieces: Set<number>,
): LevelSolution | null {
  const variantsByPiece = pieces.map(getRotationVariants);
  const remaining = pieces.map((_, i) => i).filter(i => !usedPieces.has(i));
  const remainingArea = remaining.reduce((sum, i) => sum + variantsByPiece[i][0].cells.length, 0);
  const solution: LevelSolution = [];

  const place = (pieceIndex: number, variant: Variant, originX: number, originY: number) => {
    setCells(filled, variant.cells, originX, originY, true);
    usedPieces.add(pieceIndex);
    solution.push({pieceIndex, matrix: variant.matrix, rotation: variant.rotation, x: originX, y: originY});
  };

  const unplace = (pieceIndex: number, variant: Variant, originX: number, originY: number) => {
    solution.pop();
    usedPieces.delete(pieceIndex);
    setCells(filled, variant.cells, originX, originY, false);
  };

  function exactCover(): boolean {
    const target = findFirstEmpty(filled);
    if (!target) {
      return usedPieces.size === pieces.length;
    }

    const triedShapes = new Set<string>();
    for (const pieceIndex of remaining) {
      if (usedPieces.has(pieceIndex)) continue;
      const shapeKey = JSON.stringify(pieces[pieceIndex]);
      if (triedShapes.has(shapeKey)) continue;
      triedShapes.add(shapeKey);

      for (const variant of variantsByPiece[pieceIndex]) {
        const originX = target.x - variant.cells[0].x;
        const originY = target.y - variant.cells[0].y;
        if (!fits(filled, variant.cells, originX, originY)) continue;

        place(pieceIndex, variant, originX, originY);
        if (exactCover()) return true;
        unplace(pieceIndex, variant, originX, originY);
      }
    }
    return false;
  }

  function exhaustive(): boolean {
    if (usedPieces.size === pieces.length) {
      return true;
    }

    for (const pieceIndex of remaining) {
      if (usedPieces.has(pieceIndex)) continue;

      for (const variant of variantsByPiece[pieceIndex]) {
        for (let originY = 0; originY < filled.length; originY++) {
          for (let originX = 0; originX < filled[0].length; originX++) {
            if (!fits(filled, variant.cells, originX, originY)) continue;

            place(pieceIndex, variant, originX, originY);
            if (exhaustive()) return true;
            unplace(pieceIndex, variant, originX, originY);
          }
        }
      }
    }
    return false;
  }

  const solved = remainingArea === countEmpty(filled) ? exactCover() : exhaustive();
  return solved ? solution : null;
}

/**
 * Solve a level using backtracking.
 */
export function solveLevel(level: LevelDefinition): LevelSolution | null {
  return search(level.pieces, createFilledGrid(level.board), new Set<number>());
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
  const filled = createFilledGrid(level.board);
  const usedPieces = new Set<number>();

  for (const gp of gamePieces) {
    if (!gp.placed || gp.boardX === undefined || gp.boardY === undefined) {
      continue;
    }

    const pieceIndex = parseInt(gp.id.split('-')[1], 10);
    usedPieces.add(pieceIndex);

    const matrix = getRotatedMatrix(gp.baseMatrix, gp.rotation);
    for (const c of getCells(matrix)) {
      const x = gp.boardX + c.x;
      const y = gp.boardY + c.y;
      if (y >= 0 && x >= 0 && y < filled.length && x < filled[0].length) {
        filled[y][x] = true;
      }
    }
  }

  if (usedPieces.size === level.pieces.length) return [];

  return search(level.pieces, filled, usedPieces);
}
