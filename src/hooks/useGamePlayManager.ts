// Domain logic for gameplay management (not a React hook)
import {
  Board,
  Cell,
  GamePiece,
  I_PIECE,
  J_PIECE,
  L_PIECE,
  O_PIECE,
  Piece,
  PieceMatrix,
  S_PIECE,
  T_PIECE,
  Z_PIECE,
} from '../types/types.ts';
import { getRotatedMatrix } from '../utils/transformHelpers.ts';

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
    pieces: GamePiece[],
  ): boolean => {
    const placedPieces = pieces.filter(i => i.placed === true);

    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1) {
          const by = y + i;
          const bx = x + j;

          // board'u aşıyor mu
          if (by < 0 || bx < 0 || by >= board.length || bx >= board[0].length) {
            return false;
          }

          // board'da pasif yerlere denk geliyor mu
          if (board[by][bx] !== Cell.AVAILABLE) {
            return false;
          }

          // her parçayı gez
          // her parçanın ekrandaki görünen halini al (getRotatedMatrix)
          // rotatedMatrix'te her satırı gez
          // her satırda her sütunu gez
          // her noktada 1 değerini bulana kadar devam et.
          // döngüdeki curr placed piece'in boardX'ine kaçıncı satırdaysan onu ekle
          // döngüdeki curr placed piece'in boardY'sine kaçıncı sütundaysan onu ekle

          // herhangi bir hücre başkasının herhangi bir hücresiyle çakışıyor mu

          for (let placedPiece of placedPieces) {
            const rotatedMatrix = getRotatedMatrix(
              placedPiece.baseMatrix,
              placedPiece.rotation,
            );

            for (let row = 0; row < rotatedMatrix.length; row++) {
              for (let col = 0; col < rotatedMatrix[row].length; col++) {
                if (rotatedMatrix[row][col] !== 1) continue;
                if (
                  placedPiece.boardX == null ||
                  placedPiece.boardY == null
                ) continue;


                const ox = placedPiece.boardX + col;
                const oy = placedPiece.boardY + row;

                console.log(placedPiece.boardX , col, placedPiece.boardY , row,)


                if (ox === bx && oy === by) {
                  return false;
                }
              }
            }
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
