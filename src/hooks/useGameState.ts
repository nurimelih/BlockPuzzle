import { useState, useCallback } from 'react';
import {
  Board,
  PieceMatrix,
  LevelDefinition,
  GamePiece,
  PieceDirection,
} from '../types/types.ts';
import { getRotatedMatrix, rotate90CW } from '../utils/transformHelpers.ts';

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

  const [board, setBoard] = useState<Board>(level.board);

  const lockPiece = useCallback((id: string, lock: boolean = true) => {
    setPieces(prev => {
      return prev.map(piece => {
        if (piece.id !== id) return piece;

        return { ...piece, placed: lock };
      });
    });
  }, []);

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

  return {
    board,
    pieces,
    rotatePiece,
    lockPiece,
    getPieceMatrix,
  };
};
