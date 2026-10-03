import {Cell, LevelDefinition} from '../../types/types.ts';
import {GENERATED_LEVELS} from '../levels_auto_generated.ts';
import {solveLevel} from '../solver.ts';

const countAvailable = (level: LevelDefinition) =>
  level.board.flat().filter(c => c === Cell.AVAILABLE).length;

const countPieceCells = (level: LevelDefinition) =>
  level.pieces.reduce((sum, m) => sum + m.flat().filter(c => c === 1).length, 0);

// Generator'ın parça tanımları oyundakilerden kayarsa board'lar dolmaz hale geliyordu;
// bu test üretilen her level'ı oyunun kendi solver'ıyla doğrular.
describe('GENERATED_LEVELS', () => {
  it('has levels', () => {
    expect(GENERATED_LEVELS.length).toBeGreaterThan(0);
  });

  it('uses only valid cell values', () => {
    const valid = new Set<number>([Cell.AVAILABLE, Cell.VOID]);
    GENERATED_LEVELS.forEach(level => {
      expect(level.board.flat().every(c => valid.has(c))).toBe(true);
    });
  });

  it.each(GENERATED_LEVELS.map((level, i) => [i, level] as const))(
    'level %i: pieces exactly cover the board and are solvable',
    (_, level) => {
      expect(countPieceCells(level)).toBe(countAvailable(level));
      expect(solveLevel(level)).not.toBeNull();
    },
  );
});
