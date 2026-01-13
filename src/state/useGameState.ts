import { useState, useCallback, useRef, useEffect } from 'react';
import { LevelDefinition, GamePiece, PieceDirection } from '../types/types.ts';
import { getRotatedMatrix } from '../core/transformHelpers.ts';
import { canPlace, normalizePlacement } from '../core/gameCore.ts';

type UseGameStateProps = {
  level: LevelDefinition;
};

export const useGameState = ({ level }: UseGameStateProps) => {
  const [pieces, setPieces] = useState<GamePiece[]>(() =>
    level.pieces.map((matrix, index) => ({
      id: `piece-${index}`,
      baseMatrix: matrix,
      rotation: 0,
      placed: false,
    })),
  );

  const piecesRef = useRef<GamePiece[]>(pieces);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  const board = level.board;

  const lockPiece = useCallback((id: string, lock: boolean = true) => {
    setPieces(prev => {
      return prev.map(piece => {
        if (piece.id !== id) return piece;

        return { ...piece, placed: lock };
      });
    });
  }, []);

  const releaseAndTryLockPiece = useCallback(
    (id: string, x: number, y: number, lock: boolean = true) => {
      setPieces(prev => {
        return prev.map(piece => {
          if (piece.id !== id) return piece;

          return { ...piece, boardX: x, boardY: y, placed: lock };
        });
      });
    },
    [],
  );

  const rotatePiece = useCallback((id: string) => {
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
    console.log('piece.rotation', piece.rotation);
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

    if (!piece) return false;
    const matrix = getRotatedMatrix(piece.baseMatrix, piece.rotation);
    if (!matrix) return false;

    const occupiedCells = getOccupiedCells(
      freshPieces.filter(p => p.placed && p.id !== id),
    );

    const normalized = normalizePlacement(matrix, x, y);

    const result = canPlace(board, normalized, occupiedCells);

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

  const isOver = () => {
    return pieces.every(p => p.placed) ? 'tre' : 'fls';
  };

  const restart = () => {
    setPieces((curr) => {
      return curr.map(currPiece => ({
        ...currPiece,
        placed: false,
        boardX: undefined,
        boardY: undefined,
        rotation: 0,
      }));
    });
  };

  return {
    board,
    pieces,
    setPieces,
    rotatePiece,
    releaseAndTryLockPiece,
    getPieceMatrix,
    tryPlacePiece,
    getPieceRotation,
    isOver,
    restart,
  };
};
