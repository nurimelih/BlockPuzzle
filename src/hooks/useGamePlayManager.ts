// Domain logic for gameplay management (not a React hook)
import {
  Board,
  Cell,
  I_PIECE,
  J_PIECE,
  L_PIECE,
  O_PIECE,
  PieceMatrix,
  S_PIECE,
  T_PIECE,
  Z_PIECE,
} from '../types/types.ts';

export const useGamePlayManager = () => {
  const PIECES = [
    I_PIECE,
    O_PIECE,
    T_PIECE,
    L_PIECE,
    J_PIECE,
    S_PIECE,
    Z_PIECE,
  ];

  // Note: PieceMatrix uses 0/1 to represent piece cells, while Board uses the Cell enum.
  const canPlace = (
    board: Board,
    piece: PieceMatrix,
    x: number,
    y: number,
  ): boolean => {
    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1) {
          const by = y + i;
          const bx = x + j;

          // Check bounds first
          if (by < 0 || bx < 0 || by >= board.length || bx >= board[0].length) {
            return false;
          }

          // Then check if the cell is available (not INVALID or OCCUPIED)
          if (board[by][bx] !== Cell.AVAILABLE) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (
    board: Board,
    piece: PieceMatrix,
    x: number,
    y: number,
  ): Board => {
    const next = board.map(row => [...row]);

    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1) {
          next[y + i][x + j] = Cell.OCCUPIED;
        }
      }
    }

    return next;
  };

  const getRandomPiece = () =>
    PIECES[Math.floor(Math.random() * PIECES.length)];

  const isSolved = (board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== Cell.AVAILABLE));
  };

  return {
    canPlace,
    placePiece,
    getRandomPiece,
    isSolved,
    PIECES,
  };
};
