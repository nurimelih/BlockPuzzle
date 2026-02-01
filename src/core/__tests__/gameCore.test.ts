import { Cell, PieceMatrix } from '../../types/types.ts';
import { canPlace, getAdjustedPlacement } from '../gamecore.ts';

// canPlace
/*
 *
 * canPlace -> piece'in yerleşmek istediği yerde başka bir parça var
 * canPlace -> piece sınır dışında -> false
 * canPlace -> piece'in bir kısmı sınır dışında -> false
 * canPlace -> board'da geçersiz yerde -> false
 * canPlace -> piece board içinde ve tüm hücreler müsait -> true
 *
 * */
describe('canPlace', () => {
  const availableBoard = [
    [Cell.AVAILABLE, Cell.AVAILABLE],
    [Cell.AVAILABLE, Cell.AVAILABLE],
  ];

  const voidBoard = [[Cell.VOID]];

  const two_cell_piece = [[1, 1]];
  const single_cell_piece = [[1]];
  const L_piece = [
    [1, 0],
    [1, 0],
    [1, 1],
  ];

  it('should return false when piece overlaps occupied cell', () => {
    const piece = {
      matrix: two_cell_piece,
      x: 1,
      y: 1,
    };

    const result = canPlace(availableBoard, piece, [{ x: 1, y: 1 }]);
    expect(result).toBe(false);
  });
  it('should return false when piece is totally outside of board', () => {
    const piece = {
      matrix: two_cell_piece,
      x: 2,
      y: 2,
    };

    const result = canPlace(availableBoard, piece, []);
    expect(result).toBe(false);
  });

  it("should return false when some part of piece's outside of board", () => {
    const piece = {
      matrix: L_piece,
      x: 1,
      y: 1,
    };

    const result = canPlace(availableBoard, piece, []);
    expect(result).toBe(false);
  });

  it('should return false when piece is on void', () => {
    const piece = {
      matrix: single_cell_piece,
      x: 0,
      y: 0,
    };

    const result = canPlace(voidBoard, piece, []);
    expect(result).toBe(false);
  });

  it('should return true when all cells are available', () => {
    const piece = {
      matrix: two_cell_piece,
      x: 0,
      y: 1,
    };

    const result = canPlace(availableBoard, piece, []);
    expect(result).toBe(true);
  });
});


describe('getAdjustedPlacement', () => {
  // reverse T shape
  const t_shape: PieceMatrix = [
    [0, 1, 0],
    [1, 1, 1],
  ];

  const vertical_z_shape: PieceMatrix = [
    [0, 1],
    [1, 1],
    [1, 0],
  ];

  it('should adjust coordinates when first cell has offset', () => {
    /*
    0 [0] [1] [0] -> 0 index'li satırda var -> y:0
    1 [1] [1] [1] -> 0 index'li sütunda var -> x:0
    * */
    // offset yok

    const result = getAdjustedPlacement(t_shape, 1, 1);
    expect(result.x).toBe(1);
    expect(result.y).toBe(1);
  });




  it('should adjust coordinates when first cell has offset', () => {
    /*
    0 [0] [1] -> 0 index'li satırda var -> y:0
    1 [1] [1] -> 0 index'li sütunda var -> x:0
    2 [1] [0] -> 
    * */
    // offset yok

    const result = getAdjustedPlacement(vertical_z_shape, 2, 2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(2);
  });




});
