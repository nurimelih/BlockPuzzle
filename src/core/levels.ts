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
  Z_PIECE,
  T_PIECE,
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
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 2, 2, 1],
  [1, 2, 2, 1],
];

const board5 = [
  [1, 2, 2, 1],
  [1, 2, 2, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];

const board6 = [
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 2, 2, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
];

const board7 = [
  [1, 1, 1, 2],
  [1, 1, 1, 2],
  [2, 1, 1, 2],
  [2, 1, 1, 1],
  [2, 1, 1, 1],
];

const board8 = [
  [2, 1, 1, 1],
  [2, 1, 1, 1],
  [1, 1, 1, 2],
  [1, 1, 1, 2],
];

const board9 = [
  [1, 1, 1, 1],
  [2, 1, 1, 2],
  [2, 1, 1, 2],
  [2, 1, 1, 2],
  [1, 1, 1, 1],
];

const board10 = [
  [1, 1, 1, 2, 2],
  [1, 1, 1, 1, 2],
  [1, 1, 1, 1, 1],
  [2, 1, 1, 1, 1],
  [2, 2, 1, 1, 1],
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
  pieces: [J_PIECE, L_PIECE, O_PIECE, S_PIECE],
};

const Level4: LevelDefinition = {
  board: board4,
  pieces: [O_PIECE, SHORT_I_PIECE, SHORT_I_PIECE, L_PIECE],
};

const Level5: LevelDefinition = {
  board: board5,
  pieces: [T_PIECE, CORNER_PIECE, SHORT_I_PIECE, I_PIECE],
};
const Level6: LevelDefinition = {
  board: board6,
  pieces: [T_PIECE, T_PIECE, CORNER_PIECE, O_PIECE, I_PIECE],
};
const Level7: LevelDefinition = {
  board: board7,
  pieces: [J_PIECE, I_PIECE, T_PIECE, CORNER_PIECE],
};
const Level8: LevelDefinition = {
  board: board8,
  pieces: [J_PIECE, L_PIECE, O_PIECE],
};
const Level9: LevelDefinition = {
  board: board9,
  pieces: [SHORT_I_PIECE, SHORT_I_PIECE, CORNER_PIECE, CORNER_PIECE, Z_PIECE],
};
const Level10: LevelDefinition = {
  board: board10,
  pieces: [O_PIECE, L_PIECE, I_PIECE, T_PIECE, O_PIECE],
};

export const LEVELS = [
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
  Level10,
];
