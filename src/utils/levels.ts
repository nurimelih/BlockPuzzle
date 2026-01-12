import {
  CORNER_PIECE,
  I_PIECE,
  LevelDefinition,
  SHORT_I_PIECE,
  DOUBLE_DOT_PIECE,
  T_PIECE,
  S_PIECE, DOT_PIECE,
} from '../types/types.ts';

export const board1: number[][] = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
];

export const board2: number[][] = [
  [1, 1, 1],
  [0, 1, 0],
  [1, 1, 1],
];

export const board3: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1],
];

export const board4: number[][] = [
  [0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
];

export const Level1: LevelDefinition = {
  board: board1,
  pieces: [CORNER_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE],
};

export const Level2: LevelDefinition = {
  board: board2,
  pieces: [T_PIECE, SHORT_I_PIECE],
};

export const Level3: LevelDefinition = {
  board: board3,
  pieces: [I_PIECE, I_PIECE, I_PIECE, I_PIECE, S_PIECE],
};

export const Level4: LevelDefinition = {
  board: board4,
  pieces: [SHORT_I_PIECE, T_PIECE],
};
