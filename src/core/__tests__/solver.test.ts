import {Cell, GamePiece, LevelDefinition} from '../../types/types.ts';
import {LEVELS} from '../levels.ts';
import {solveLevel, solvePartial} from '../solver.ts';

describe('solveLevel', () => {
  it('should solve Level 1', () => {
    const solution = solveLevel(LEVELS[0]);
    expect(solution).not.toBeNull();
    expect(solution!.length).toBe(LEVELS[0].pieces.length);
  });

  it('should solve Level 2', () => {
    const solution = solveLevel(LEVELS[1]);
    expect(solution).not.toBeNull();
    expect(solution!.length).toBe(LEVELS[1].pieces.length);
  });

  it('should solve Level 3', () => {
    const solution = solveLevel(LEVELS[2]);
    expect(solution).not.toBeNull();
    expect(solution!.length).toBe(LEVELS[2].pieces.length);
  });

  it('should solve all 10 local levels', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      const solution = solveLevel(LEVELS[i]);
      expect(solution).not.toBeNull();
      if (solution) {
        expect(solution.length).toBe(LEVELS[i].pieces.length);
      }
    }
  });

  it('solution should cover all available cells', () => {
    const level = LEVELS[0];
    const solution = solveLevel(level)!;
    expect(solution).not.toBeNull();

    // Count available cells on board
    let availableCells = 0;
    for (const row of level.board) {
      for (const cell of row) {
        if (cell === Cell.AVAILABLE) {
          availableCells++;
        }
      }
    }

    // Count cells covered by solution pieces
    let coveredCells = 0;
    for (const piece of solution) {
      for (const row of piece.matrix) {
        for (const cell of row) {
          if (cell === 1) {
            coveredCells++;
          }
        }
      }
    }

    expect(coveredCells).toBe(availableCells);
  });

  it('should return null for unsolvable level', () => {
    const unsolvable: LevelDefinition = {
      board: [
        [Cell.AVAILABLE, Cell.AVAILABLE, Cell.AVAILABLE],
      ],
      pieces: [
        // O_PIECE is 2x2, can't fit on a 1x3 board
        [[1, 1], [1, 1]],
      ],
    };

    const solution = solveLevel(unsolvable);
    expect(solution).toBeNull();
  });
});

describe('solvePartial', () => {
  it('should solve remaining pieces when some are already placed', () => {
    const level = LEVELS[0];
    const fullSolution = solveLevel(level)!;
    expect(fullSolution).not.toBeNull();

    const firstPieceSol = fullSolution[0];

    const gamePieces: GamePiece[] = level.pieces.map((matrix, i) => ({
      id: `piece-${i}`,
      baseMatrix: matrix,
      rotation: 0,
      placed: false,
    }));

    gamePieces[firstPieceSol.pieceIndex] = {
      ...gamePieces[firstPieceSol.pieceIndex],
      placed: true,
      rotation: firstPieceSol.rotation,
      boardX: firstPieceSol.x,
      boardY: firstPieceSol.y,
    };

    const partial = solvePartial(level, gamePieces);
    expect(partial).not.toBeNull();
    expect(partial!.length).toBe(level.pieces.length - 1);
  });

  it('should return empty array when all pieces are placed', () => {
    const level = LEVELS[0];
    const fullSolution = solveLevel(level)!;

    const gamePieces: GamePiece[] = level.pieces.map((matrix, i) => {
      const sol = fullSolution.find(s => s.pieceIndex === i)!;
      return {
        id: `piece-${i}`,
        baseMatrix: matrix,
        rotation: sol.rotation,
        placed: true,
        boardX: sol.x,
        boardY: sol.y,
      };
    });

    const partial = solvePartial(level, gamePieces);
    expect(partial).not.toBeNull();
    expect(partial!.length).toBe(0);
  });

  it('should solve correctly with piece placed at specific position', () => {
    const level: LevelDefinition = {
      board: [
        [Cell.AVAILABLE, Cell.AVAILABLE],
        [Cell.AVAILABLE, Cell.AVAILABLE],
      ],
      pieces: [[[1, 1]], [[1, 1]]],
    };

    // piece-0 placed at row 0
    const gamePieces: GamePiece[] = [
      {
        id: 'piece-0',
        baseMatrix: [[1, 1]],
        rotation: 0,
        placed: true,
        boardX: 0,
        boardY: 0,
      },
      {
        id: 'piece-1',
        baseMatrix: [[1, 1]],
        rotation: 0,
        placed: false,
      },
    ];

    const partial = solvePartial(level, gamePieces);
    expect(partial).not.toBeNull();
    expect(partial!.length).toBe(1);
    expect(partial![0].y).toBe(1); // must go to row 1
  });
});
