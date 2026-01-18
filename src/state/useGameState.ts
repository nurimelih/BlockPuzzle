import { useState, useCallback, useRef, useEffect } from 'react';
import { GamePiece, LevelDefinition, PieceDirection } from '../types/types.ts';
import { getRotatedMatrix } from '../core/transformHelpers.ts';
import { canPlace, normalizePlacement } from '../core/gameCore.ts';
import { LEVELS } from '../core/levels.ts';


export const useGameState = (initialLevel: number) => {
  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(LEVELS[initialLevel]);
  const [currentLevelNumber, setCurrentLevelNumber] = useState(initialLevel);
  const currentLevelRef = useRef(currentLevel);
  const [isOver, setIsOver] = useState(false);
  // const [hintCount, setHintCount] = useState(0);
  // const [score, setScore] = useState(0);

  const [pieces, setPieces] = useState<GamePiece[]>(() =>
    currentLevel.pieces.map((matrix, index) => ({
      id: `piece-${index}`,
      baseMatrix: matrix,
      rotation: 0,
      placed: false,
    })),
  );

  const piecesRef = useRef<GamePiece[]>(pieces);

  const releaseAndTryLockPiece = (
    id: string,
    x: number,
    y: number,
    lock: boolean = true,
  ) => {
    setPieces(prev => {
      return prev.map(piece => {
        if (piece.id !== id) return piece;

        return { ...piece, boardX: x, boardY: y, placed: lock };
      });
    });
  };

  const rotatePiece = useCallback((id: string) => {
    setMoveCount((prev: number) => prev + 1);
    setPieces(prev =>
      prev.map(piece => {
        if (piece.id !== id) return piece;

        return {
          ...piece,
          rotation: ((piece.rotation + 90) % 360) as PieceDirection,
          placed: false,
        };
      }),
    );
  }, []);

  const getPieceMatrix = useCallback(
    (id: string) => {
      const piece = pieces.find(p => p.id === id);
      if (!piece) {
        return undefined;
      }
      return getRotatedMatrix(piece.baseMatrix, piece.rotation);
    },
    [pieces],
  );

  const getPieceRotation = (id: string) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece) {
      return undefined;
    }
    return piece.rotation;
  };

  function getOccupiedCells(pieces: GamePiece[]) {
    const cells: { x: number; y: number }[] = [];

    for (const piece of pieces) {
      if (!piece.placed) continue;

      const matrix = getRotatedMatrix(piece.baseMatrix, piece.rotation);

      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] !== 1) continue;

          cells.push({
            x: piece.boardX! + j,
            y: piece.boardY! + i,
          });
        }
      }
    }

    return cells;
  }

  const tryPlacePiece = (id: string, x: number, y: number) => {
    const freshPieces = piecesRef.current;
    const piece = freshPieces.find(piece => piece.id === id);
    setMoveCount((prev: number) => prev + 1);

    if (!piece) return false;
    const matrix = getRotatedMatrix(piece.baseMatrix, piece.rotation);
    if (!matrix) return false;

    const occupiedCells = getOccupiedCells(
      freshPieces.filter(p => p.placed && p.id !== id),
    );

    const normalized = normalizePlacement(matrix, x, y);
    const result = canPlace(
      currentLevelRef.current.board,
      normalized,
      occupiedCells,
    );

    if (!result) return false;

    setPieces(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, boardX: normalized.x, boardY: normalized.y, placed: true }
          : p,
      ),
    );

    return true;
  };

  const checkIsOver = useCallback(() => {
    return pieces.every(p => p.placed);
  }, [pieces]);

  const restart = useCallback(() => {
    setMoveCount(0);

    setPieces(curr => {
      return curr.map(currPiece => ({
        ...currPiece,
        placed: false,
        boardX: undefined,
        boardY: undefined,
        rotation: 0,
      }));
    });
  }, []);

  const goLevel = useCallback((levelNumber: number) => {
    setCurrentLevelNumber(levelNumber);

  },[])

  const handleNextLevel = () => {
    setCurrentLevelNumber(curr => {
      const nextLevelIndex = curr + 1;
      return nextLevelIndex < LEVELS.length ? nextLevelIndex : curr;
    });
  };

  const handlePrevLevel = () => {
    setCurrentLevelNumber(curr => {
      return Math.max(0, curr - 1);
    });
  };

  // hooks
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  useEffect(() => {
    setIsOver(checkIsOver());
  }, [moveCount, checkIsOver]);

  useEffect(() => {
    const newLevel = LEVELS[currentLevelNumber];
    setCurrentLevel(newLevel);
    currentLevelRef.current = newLevel;

    setPieces(() => {
      return newLevel.pieces.map((matrix, index) => ({
        id: `piece-${index}`,
        baseMatrix: matrix,
        rotation: 0,
        placed: false,
      }));
    });

    setMoveCount(0);
    setIsOver(false);
  }, [currentLevelNumber]);

  return {
    currentLevel,
    currentLevelNumber,
    board: currentLevel.board,
    pieces,
    setPieces,
    rotatePiece,
    releaseAndTryLockPiece,
    getPieceMatrix,
    tryPlacePiece,
    getPieceRotation,
    restart,
    moveCount,
    startTime,
    isOver,
    handleNextLevel,
    handlePrevLevel,
    goLevel,
    //hintCount,
    //score,
  };
};
