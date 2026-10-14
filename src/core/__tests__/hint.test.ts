import { GamePiece, LevelDefinition } from '../../types/types.ts';
import { LEVELS } from '../levels.ts';
import { computeHintPlacement } from '../hint.ts';
import { getRotatedMatrix } from '../transformHelpers.ts';
import { canPlace } from '../gameCore.ts';

const toPieces = (level: LevelDefinition): GamePiece[] =>
  level.pieces.map((m, i) => ({
    id: `piece-${i}`,
    baseMatrix: m,
    rotation: 0,
    placed: false,
  }));

// 1x4 strip filled by two dominoes
const strip: LevelDefinition = {
  board: [[1, 1, 1, 1]],
  pieces: [[[1, 1]], [[1, 1]]],
};

describe('computeHintPlacement', () => {
  it('continues from a solvable position', () => {
    const pieces = toPieces(strip);
    pieces[0] = { ...pieces[0], placed: true, boardX: 0, boardY: 0 };

    expect(computeHintPlacement(strip, pieces)).toEqual({
      pieceIndex: 1,
      rotation: 0,
      x: 2,
      y: 0,
      unplaceIndices: [],
    });
  });

  it('removes pieces that make the level unsolvable', () => {
    const pieces = toPieces(strip);
    // Domino in the middle splits the strip into two single cells
    pieces[0] = { ...pieces[0], placed: true, boardX: 1, boardY: 0 };

    const hint = computeHintPlacement(strip, pieces)!;
    expect(hint.unplaceIndices).toEqual([0]);
    expect(hint.x).toBe(0);
  });

  it('keeps correctly placed pieces even if they swapped with an identical shape', () => {
    const pieces = toPieces(strip);
    pieces[1] = { ...pieces[1], placed: true, boardX: 0, boardY: 0 };

    const hint = computeHintPlacement(strip, pieces)!;
    expect(hint.unplaceIndices).toEqual([]);
    expect(hint.pieceIndex).toBe(0);
    expect(hint.x).toBe(2);
  });

  it('produces a legal placement for every local level from scratch', () => {
    for (const level of LEVELS) {
      const hint = computeHintPlacement(level, toPieces(level));
      expect(hint).not.toBeNull();
      const matrix = getRotatedMatrix(
        level.pieces[hint!.pieceIndex],
        hint!.rotation,
      );
      expect(
        canPlace(level.board, { matrix, x: hint!.x, y: hint!.y }, []),
      ).toBe(true);
    }
  });

  it('returns null once the level is complete', () => {
    const pieces = toPieces(strip).map((p, i) => ({
      ...p,
      placed: true,
      boardX: i * 2,
      boardY: 0,
    }));
    expect(computeHintPlacement(strip, pieces)).toBeNull();
  });
});
