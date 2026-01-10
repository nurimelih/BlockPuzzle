import { PieceMatrix } from '../types/types.ts';

export const transpose = (arr: PieceMatrix) =>
  arr[0].map((_, i) => arr.map(row => row[i]));

export const rotate90CW = (arr: PieceMatrix) =>
  transpose(arr).map(row => row.reverse());

export const rotate90CCW = (arr: PieceMatrix) => transpose(arr).reverse();
