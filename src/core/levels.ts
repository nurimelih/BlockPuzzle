import {
  CORNER_PIECE,
  I_PIECE,
  LevelDefinition,
  L_PIECE,
  J_PIECE,
  S_PIECE,
  O_PIECE,
  DOUBLE_DOT_PIECE,
  SHORT_I_PIECE,
} from '../types/types.ts';

const board1 = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];

const board2 = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [2, 1, 1, 2],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];

const board3 = [
  [2, 1, 1, 2],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [2, 1, 1, 2],
];

const board4 = [
  [1, 2, 2, 1],
  [2, 1, 1, 2],
  [1, 1, 1, 1],
  [2, 1, 1, 2],
  [1, 1, 1, 1],
  [2, 1, 1, 2],
  [1, 2, 2, 1],
];

const Level1: LevelDefinition = {
  board: board1,
  pieces: [CORNER_PIECE, L_PIECE, DOUBLE_DOT_PIECE, O_PIECE, I_PIECE],
};

const Level2: LevelDefinition = {
  board: board2,
  pieces: [SHORT_I_PIECE, O_PIECE, O_PIECE, O_PIECE, S_PIECE],
};

const Level3: LevelDefinition = {
  board: board3,
  pieces: [
    J_PIECE,
    L_PIECE,
    O_PIECE,
    S_PIECE,
  ],
};

const Level4: LevelDefinition = {
  board: board4,
  pieces: [J_PIECE, L_PIECE, O_PIECE, S_PIECE],
};

export const LEVELS = [Level1, Level2, Level3, Level4];