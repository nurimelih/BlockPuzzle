// game logic, not react hook
import {
  Board,
  Cell,
  I_PIECE,
  J_PIECE,
  L_PIECE,
  O_PIECE,
  OccupiedCell,
  PieceMatrix,
  S_PIECE,
  T_PIECE,
  Z_PIECE,
} from '../types/types.ts';

export const PIECES = [
  I_PIECE,
  O_PIECE,
  T_PIECE,
  L_PIECE,
  J_PIECE,
  S_PIECE,
  Z_PIECE,
];


// Re-anchors placement to the first filled cell
export const getAdjustedPlacement = (
  matrix: PieceMatrix,
  gridX: number,
  gridY: number,
) => {
  let offsetX = Infinity;
  let offsetY = Infinity;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1) {
        offsetX = Math.min(offsetX, j);
        offsetY = Math.min(offsetY, i);
      }
    }
  }

  return {
    matrix,
    x: gridX - offsetX,
    y: gridY - offsetY,
  };
};

// Note: PieceMatrix uses 0/1 to represent piece cells, while Board uses the Cell enum.
export const canPlace = (
  board: Board,
  piece: {
    matrix: PieceMatrix;
    x: number;
    y: number;
  },
  occupiedCells: OccupiedCell[],
): boolean => {
  for (let i = 0; i < piece.matrix.length; i++) {
    for (let j = 0; j < piece.matrix[i].length; j++) {
      if (piece.matrix[i][j] === 1) {
        const boardY = piece.y + i;
        const boardX = piece.x + j;

        // board'u aşıyor mu
        // false = evet aşıyor
        if (
          boardY < 0 ||
          boardX < 0 ||
          boardY >= board.length ||
          boardX >= board[0].length
        ) {
          return false;
        }

        // board'da pasif yerlere denk geliyor mu
        if (board[boardY][boardX] !== Cell.AVAILABLE) {
          return false;
        }

        // herhangi bir hücre başkasının herhangi bir hücresiyle çakışıyor mu
        if (occupiedCells?.length > 0) {
          for (const cell of occupiedCells) {
            {
              if (cell.x === boardX && cell.y === boardY) return false;
            }
          }
        }
      }
    }
  }
  return true;
};

export const getRandomPiece = () =>
  PIECES[Math.floor(Math.random() * PIECES.length)];
