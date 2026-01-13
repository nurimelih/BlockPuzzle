import {
  CORNER_PIECE,
  I_PIECE,
  LevelDefinition,
  SHORT_I_PIECE,
  DOUBLE_DOT_PIECE,
  T_PIECE,
  Z_PIECE,
  L_PIECE,
  J_PIECE,
  S_PIECE,
  O_PIECE,
} from '../types/types.ts';
import { Cell } from '../types/types.ts';

const sentence1 = 'yel değirmenleri dev sanıp saldıran şövalye';
const sentence2 = 'dulcinea için mızrak kuşanıp yola çıkan kahraman';
const sentence3 = 'sancho panza efendisine sadakatle hizmet eder';
const sentence4 = 'çorak ovada hayal gören yaşlı soylu';
const sentence5 = 'berberde traş olurken macera arayan adam';
const sentence6 = 'kırık miğferle düşman karşısında duran cesur';
const sentence7 = 'kitaplarda okuduğu hikayeleri gerçek sanan delikanlı';
const sentence8 = 'rosinante adlı ata binip ufka doğru giden yolcu';
const sentence9 = 'hayal ile gerçeği ayırt edemeyen romantik ruh';
const sentence10 = 'şeref ve cesaret uğruna savaşan yaşlı şövalye';

const sentences = [
  sentence1,
  sentence2,
  sentence3,
  sentence4,
  sentence5,
  sentence6,
  sentence7,
  sentence8,
  sentence9,
  sentence10,
];

const board1 = [
  [1, 0, 1, 1, 0, 1, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 1, 1, 0, 1],
  [0, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0],
  [1, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const board2 = [
  [1, 0, 1, 1, 0, 1, 0],
  [0, 0, 1, 0, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const board3 = [
  [1, 0, 1, 1, 1, 0, 1],
  [0, 1, 1, 0, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const board4 = [
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 1],
  [0, 1, 0, 1, 1, 0, 1, 1],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

const board5 = textToBoard(sentence5);
const board6 = textToBoard(sentence6);
const board7 = textToBoard(sentence7);
const board8 = textToBoard(sentence8);
const board9 = textToBoard(sentence9);
const board10 = textToBoard(sentence10);

export const Level1: LevelDefinition = {
  board: board1,
  pieces: [
    I_PIECE, // 4 cells
    J_PIECE,
    L_PIECE, // 4 cells
    T_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    CORNER_PIECE, // 3 cells
    O_PIECE, // 4 cells,
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level2: LevelDefinition = {
  board: board2,
  pieces: [
    I_PIECE, // 4 cells
    T_PIECE, // 4 cells
    Z_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    J_PIECE,
    L_PIECE, // 4 cells
    CORNER_PIECE, // 3 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level3: LevelDefinition = {
  board: board3,
  pieces: [
    J_PIECE,
    L_PIECE, // 4 cells
    I_PIECE, // 4 cells
    O_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    T_PIECE, // 4 cells
    CORNER_PIECE, // 3 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level4: LevelDefinition = {
  board: board4,
  pieces: [
    I_PIECE, // 4 cells
    T_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    J_PIECE,
    L_PIECE, // 4 cells
    CORNER_PIECE, // 3 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~18 cells
};

export const Level5: LevelDefinition = {
  board: board5,
  pieces: [
    I_PIECE, // 4 cells
    Z_PIECE, // 4 cells
    T_PIECE, // 4 cells
    O_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    CORNER_PIECE, // 3 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level6: LevelDefinition = {
  board: board6,
  pieces: [
    J_PIECE,
    L_PIECE, // 4 cells
    I_PIECE, // 4 cells
    T_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    Z_PIECE, // 4 cells
    CORNER_PIECE, // 3 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level7: LevelDefinition = {
  board: board7,
  pieces: [
    I_PIECE, // 4 cells
    J_PIECE,
    L_PIECE, // 4 cells
    T_PIECE, // 4 cells
    O_PIECE, // 4 cells
    Z_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    CORNER_PIECE, // 3 cells
    DOUBLE_DOT_PIECE, // 2 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~28 cells
};

export const Level8: LevelDefinition = {
  board: board8,
  pieces: [
    I_PIECE, // 4 cells
    T_PIECE, // 4 cells
    J_PIECE,
    L_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    O_PIECE, // 4 cells
    CORNER_PIECE, // 3 cells
    DOUBLE_DOT_PIECE, // 2 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level9: LevelDefinition = {
  board: board9,
  pieces: [
    I_PIECE, // 4 cells
    Z_PIECE, // 4 cells
    T_PIECE, // 4 cells
    J_PIECE,
    L_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    CORNER_PIECE, // 3 cells
    DOUBLE_DOT_PIECE, // 2 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

export const Level10: LevelDefinition = {
  board: board10,
  pieces: [
    I_PIECE, // 4 cells
    J_PIECE,
    L_PIECE, // 4 cells
    T_PIECE, // 4 cells
    O_PIECE, // 4 cells
    SHORT_I_PIECE, // 3 cells
    CORNER_PIECE, // 3 cells
    DOUBLE_DOT_PIECE, // 2 cells
    S_PIECE,
    Z_PIECE,
  ], // Total: ~22 cells
};

/**
 * Converts a text string into a board pattern
 * Vowels (a,e,i,o,u,ı,ü,ö) -> Cell.INVALID (0)
 * Consonants -> Cell.AVAILABLE (1)
 * Creates nearest perfect square grid
 */
export function textToBoard(text: string): number[][] {
  // Remove spaces and convert to lowercase
  const cleanText = text.toLowerCase().replace(/\s+/g, '');

  // Find nearest perfect square
  const charCount = cleanText.length;
  const gridSize = Math.ceil(Math.sqrt(Math.min(charCount, 64)));

  // Turkish + English vowels
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'ı', 'ü', 'ö']);

  // Convert text to cell values
  const cells: number[] = [];
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    // Only process letters
    if (/[a-zçğışüö]/.test(char)) {
      cells.push(vowels.has(char) ? Cell.INVALID : Cell.AVAILABLE);
    }
  }

  // Pad with AVAILABLE cells if needed to fill the square
  while (cells.length < gridSize * gridSize) {
    cells.push(Cell.AVAILABLE);
  }

  // Convert flat array to 2D grid
  const board: number[][] = [];
  for (let row = 0; row < gridSize; row++) {
    const rowCells: number[] = [];
    for (let col = 0; col < gridSize; col++) {
      rowCells.push(cells[row * gridSize + col]);
    }
    board.push(rowCells);
  }

  return board;
}
