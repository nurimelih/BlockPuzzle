// Bu dosya scripts/generate-levels.js tarafından üretilir — elle düzenleme.
import {
  LevelDefinition,
  CORNER_PIECE,
  DOT_PIECE,
  DOUBLE_DOT_PIECE,
  I_PIECE,
  J_PIECE,
  L_PIECE,
  O_PIECE,
  SHORT_I_PIECE,
  S_PIECE,
  T_PIECE,
  Z_PIECE,
} from '../types/types.ts';

export const GENERATED_LEVELS: LevelDefinition[] = [
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, I_PIECE, SHORT_I_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [2, 1, 2, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, SHORT_I_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [2, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, I_PIECE, CORNER_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, I_PIECE, I_PIECE, SHORT_I_PIECE, I_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, SHORT_I_PIECE, I_PIECE, I_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 2, 1, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, I_PIECE, DOUBLE_DOT_PIECE, I_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1],
    ],
    pieces: [CORNER_PIECE, I_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 2, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 2],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, I_PIECE, CORNER_PIECE, I_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, I_PIECE, I_PIECE, SHORT_I_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, CORNER_PIECE, I_PIECE, I_PIECE, DOT_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    ],
    pieces: [I_PIECE, CORNER_PIECE, I_PIECE, I_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1],
    [1, 1, 1, 2],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, CORNER_PIECE, CORNER_PIECE, I_PIECE, I_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, SHORT_I_PIECE, I_PIECE, I_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, SHORT_I_PIECE, SHORT_I_PIECE, I_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 2, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, I_PIECE, CORNER_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, I_PIECE, SHORT_I_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    ],
    pieces: [I_PIECE, I_PIECE, CORNER_PIECE, CORNER_PIECE, I_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE, I_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [Z_PIECE, DOT_PIECE, T_PIECE, T_PIECE, I_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 2],
    [2, 2, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, DOT_PIECE, DOT_PIECE, I_PIECE, O_PIECE, Z_PIECE, I_PIECE, S_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, DOT_PIECE, J_PIECE, J_PIECE, S_PIECE, J_PIECE],
  },
  {
    board: [
    [1, 1, 2, 1, 2],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 2, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, SHORT_I_PIECE, I_PIECE, DOT_PIECE, SHORT_I_PIECE, J_PIECE, Z_PIECE, S_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [Z_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE, Z_PIECE, L_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, T_PIECE, CORNER_PIECE, DOT_PIECE, DOT_PIECE, O_PIECE, O_PIECE],
  },
  {
    board: [
    [1, 1, 2, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    ],
    pieces: [I_PIECE, T_PIECE, S_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE, S_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, DOUBLE_DOT_PIECE, I_PIECE, L_PIECE, L_PIECE, DOUBLE_DOT_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, SHORT_I_PIECE, CORNER_PIECE, I_PIECE, O_PIECE, SHORT_I_PIECE, J_PIECE],
  },
  {
    board: [
    [1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 2, 2, 2],
    ],
    pieces: [S_PIECE, I_PIECE, DOT_PIECE, T_PIECE, SHORT_I_PIECE, L_PIECE, SHORT_I_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [L_PIECE, O_PIECE, J_PIECE, DOT_PIECE, I_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [S_PIECE, CORNER_PIECE, S_PIECE, CORNER_PIECE, O_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [L_PIECE, SHORT_I_PIECE, T_PIECE, DOT_PIECE, SHORT_I_PIECE, L_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [L_PIECE, Z_PIECE, Z_PIECE, DOT_PIECE, SHORT_I_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, DOUBLE_DOT_PIECE, O_PIECE, J_PIECE, I_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, S_PIECE, O_PIECE, L_PIECE, J_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, SHORT_I_PIECE, L_PIECE, L_PIECE, J_PIECE, S_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, O_PIECE, S_PIECE, J_PIECE, DOUBLE_DOT_PIECE, O_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [2, 1, 1, 1, 2],
    ],
    pieces: [S_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, O_PIECE, Z_PIECE, J_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, L_PIECE, DOT_PIECE, L_PIECE, CORNER_PIECE, SHORT_I_PIECE, L_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, SHORT_I_PIECE, L_PIECE, CORNER_PIECE, O_PIECE, DOT_PIECE, I_PIECE],
  },
  {
    board: [
    [2, 1, 2, 2, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 2, 1],
    ],
    pieces: [T_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, Z_PIECE, I_PIECE, CORNER_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE, O_PIECE, I_PIECE, O_PIECE, I_PIECE],
  },
  {
    board: [
    [2, 2, 2, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    ],
    pieces: [T_PIECE, DOT_PIECE, O_PIECE, J_PIECE, T_PIECE, DOT_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, S_PIECE, J_PIECE, J_PIECE, S_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 2, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, I_PIECE, Z_PIECE, J_PIECE, S_PIECE, S_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 2, 1],
    ],
    pieces: [I_PIECE, DOT_PIECE, O_PIECE, DOT_PIECE, Z_PIECE, CORNER_PIECE, Z_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE, S_PIECE, T_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [O_PIECE, I_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE, O_PIECE],
  },
  {
    board: [
    [2, 2, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, T_PIECE, CORNER_PIECE, O_PIECE, DOT_PIECE, DOT_PIECE, SHORT_I_PIECE, J_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, T_PIECE, L_PIECE, I_PIECE, SHORT_I_PIECE, T_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, O_PIECE, L_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, L_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, J_PIECE, DOT_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, CORNER_PIECE, DOT_PIECE, DOT_PIECE, J_PIECE, T_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [S_PIECE, SHORT_I_PIECE, SHORT_I_PIECE, S_PIECE, CORNER_PIECE, S_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 2, 2, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 2, 1],
    ],
    pieces: [T_PIECE, O_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, S_PIECE, O_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [T_PIECE, DOT_PIECE, Z_PIECE, CORNER_PIECE, O_PIECE, I_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, L_PIECE, DOT_PIECE, SHORT_I_PIECE, CORNER_PIECE, L_PIECE, T_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 2, 2, 1],
    ],
    pieces: [S_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, I_PIECE, J_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [O_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, SHORT_I_PIECE, S_PIECE, S_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [Z_PIECE, I_PIECE, I_PIECE, CORNER_PIECE, T_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 2, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 1, 1],
    ],
    pieces: [DOT_PIECE, SHORT_I_PIECE, T_PIECE, J_PIECE, L_PIECE, DOUBLE_DOT_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [L_PIECE, CORNER_PIECE, Z_PIECE, O_PIECE, I_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, O_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, CORNER_PIECE, S_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 2, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 2, 2, 1],
    ],
    pieces: [T_PIECE, SHORT_I_PIECE, Z_PIECE, I_PIECE, DOUBLE_DOT_PIECE, O_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [I_PIECE, O_PIECE, J_PIECE, DOT_PIECE, O_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [L_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, T_PIECE, DOT_PIECE, Z_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 2],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 2, 1, 2],
    ],
    pieces: [CORNER_PIECE, DOT_PIECE, J_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, J_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [Z_PIECE, SHORT_I_PIECE, DOUBLE_DOT_PIECE, S_PIECE, J_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [2, 1, 2, 1, 1],
    ],
    pieces: [O_PIECE, Z_PIECE, O_PIECE, DOT_PIECE, DOT_PIECE, DOT_PIECE, T_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, SHORT_I_PIECE, DOT_PIECE, O_PIECE, DOT_PIECE, SHORT_I_PIECE, J_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, DOT_PIECE, T_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, T_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, SHORT_I_PIECE, T_PIECE, I_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE, DOT_PIECE, Z_PIECE],
  },
  {
    board: [
    [2, 1, 2, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 2, 1, 1],
    ],
    pieces: [T_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, L_PIECE, DOT_PIECE, I_PIECE, DOT_PIECE, S_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, DOUBLE_DOT_PIECE, T_PIECE, DOUBLE_DOT_PIECE, CORNER_PIECE, DOUBLE_DOT_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    ],
    pieces: [I_PIECE, L_PIECE, O_PIECE, I_PIECE, L_PIECE, DOT_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [L_PIECE, I_PIECE, I_PIECE, DOUBLE_DOT_PIECE, I_PIECE, DOT_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [J_PIECE, CORNER_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, Z_PIECE, SHORT_I_PIECE, O_PIECE],
  },
  {
    board: [
    [1, 2, 1, 2, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 2, 1, 1],
    ],
    pieces: [T_PIECE, DOT_PIECE, S_PIECE, DOUBLE_DOT_PIECE, J_PIECE, DOT_PIECE, CORNER_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [SHORT_I_PIECE, I_PIECE, Z_PIECE, DOT_PIECE, O_PIECE, CORNER_PIECE, I_PIECE],
  },
  {
    board: [
    [2, 1, 2, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 2, 1, 1, 1],
    ],
    pieces: [L_PIECE, Z_PIECE, L_PIECE, DOT_PIECE, L_PIECE, S_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, Z_PIECE, J_PIECE, SHORT_I_PIECE, DOT_PIECE, DOT_PIECE, I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [O_PIECE, DOT_PIECE, DOT_PIECE, S_PIECE, DOT_PIECE, T_PIECE, DOUBLE_DOT_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 2, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [2, 1, 1, 1, 2],
    ],
    pieces: [I_PIECE, DOUBLE_DOT_PIECE, J_PIECE, DOT_PIECE, SHORT_I_PIECE, SHORT_I_PIECE, CORNER_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, Z_PIECE, L_PIECE, Z_PIECE, DOUBLE_DOT_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, CORNER_PIECE, SHORT_I_PIECE, I_PIECE, Z_PIECE, T_PIECE, SHORT_I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 2, 1, 2, 1],
    ],
    pieces: [SHORT_I_PIECE, Z_PIECE, T_PIECE, L_PIECE, I_PIECE, O_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, I_PIECE, S_PIECE, T_PIECE, I_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [O_PIECE, L_PIECE, I_PIECE, CORNER_PIECE, T_PIECE, DOT_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, L_PIECE, J_PIECE, I_PIECE, DOT_PIECE, T_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [T_PIECE, Z_PIECE, DOUBLE_DOT_PIECE, SHORT_I_PIECE, J_PIECE, CORNER_PIECE, DOT_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [DOT_PIECE, DOT_PIECE, SHORT_I_PIECE, L_PIECE, T_PIECE, J_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE],
  },
  {
    board: [
    [2, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    ],
    pieces: [DOUBLE_DOT_PIECE, DOT_PIECE, DOT_PIECE, S_PIECE, Z_PIECE, CORNER_PIECE, CORNER_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [L_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, DOUBLE_DOT_PIECE, L_PIECE, DOT_PIECE, Z_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [I_PIECE, O_PIECE, I_PIECE, DOT_PIECE, T_PIECE, SHORT_I_PIECE, CORNER_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 2],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 2, 1, 2],
    ],
    pieces: [T_PIECE, I_PIECE, O_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, L_PIECE, I_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    ],
    pieces: [J_PIECE, I_PIECE, Z_PIECE, I_PIECE, SHORT_I_PIECE, L_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [CORNER_PIECE, O_PIECE, T_PIECE, DOT_PIECE, I_PIECE, J_PIECE, DOT_PIECE],
  },
  {
    board: [
    [2, 2, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [2, 1, 1, 2, 1],
    ],
    pieces: [SHORT_I_PIECE, SHORT_I_PIECE, DOT_PIECE, L_PIECE, S_PIECE, O_PIECE, T_PIECE],
  },
  {
    board: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    ],
    pieces: [S_PIECE, L_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE, O_PIECE, DOUBLE_DOT_PIECE, DOT_PIECE, DOUBLE_DOT_PIECE],
  },
];
