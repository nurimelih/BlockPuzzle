// 0: invalid (engel / dış)
// 1: empty (yerleşebilir)
// 2: occupied (parça konmuş)
export enum Cell {
  'INVALID' = 0,
  'AVAILABLE' = 1,
  'OCCUPIED' = 2,
}

export type Board = Cell[][];

export type PieceMatrix = number[][]; // 0 / 1

export type Piece = {
  id: string;
  matrix: PieceMatrix;
  rotation: 0 | 90 | 180 | 270;
};

// examples

export const I_PIECE: PieceMatrix = [[1, 1, 1, 1]];

export const O_PIECE: PieceMatrix = [
  [1, 1],
  [1, 1],
];

export const T_PIECE: PieceMatrix = [
  [1, 1, 1],
  [0, 1, 0],
];

export const L_PIECE: PieceMatrix = [
  [1, 0],
  [1, 0],
  [1, 1],
];

export const J_PIECE: PieceMatrix = [
  [0, 1],
  [0, 1],
  [1, 1],
];

export const S_PIECE: PieceMatrix = [
  [0, 1, 1],
  [1, 1, 0],
];

export const Z_PIECE: PieceMatrix = [
  [1, 1, 0],
  [0, 1, 1],
];
