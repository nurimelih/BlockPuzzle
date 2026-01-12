// 0: invalid (engel / dış)
// 1: empty (yerleşebilir)
// 2: occupied (parça konmuş)
export enum Cell {
  'INVALID' = 0,
  'AVAILABLE' = 1,
  'OCCUPIED' = 2,
}

export type Board = Cell[][];

export type OccupiedMask = boolean[][]

export type PieceMatrix = number[][]; // 0 / 1

export type LevelDefinition = {
  board: Board;
  pieces: PieceMatrix[];
};

// examples

export const DOT_PIECE: PieceMatrix = [[1]];
export const DOUBLE_DOT_PIECE: PieceMatrix = [[1, 1]];
export const CORNER_PIECE: PieceMatrix = [
  [1, 0],
  [1, 1],
];

export type PieceDirection = 0 | 90 | 180 | 270;

export type GamePiece = {
  id: string;
  baseMatrix: PieceMatrix; // base'i update etme, bu matris hep kalacak. rotate edilse bile bu değişmeyecek
  rotation: PieceDirection;
  placed?: boolean;
  boardX?: number;
  boardY?: number;
};

export const SHORT_I_PIECE: PieceMatrix = [[1, 1, 1]];

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
