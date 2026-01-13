import { PieceDirection, PieceMatrix } from '../types/types.ts';

export const transpose = (arr: PieceMatrix) =>
  arr[0].map((_, i) => arr.map(row => row[i]));

export const rotate90CW = (arr: PieceMatrix) =>
  transpose(arr).map(row => row.reverse());

export const getRotatedMatrix = (
  base: PieceMatrix,
  rotation: PieceDirection,
): PieceMatrix => {
  let result = base;
  const times = (rotation / 90) % 4;
  for (let i = 0; i < times; i++) {
    result = rotate90CW(result);
  }

  return result;
};
