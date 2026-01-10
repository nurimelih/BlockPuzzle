import { useState, useCallback } from 'react';
import {
  Board,
  PieceMatrix,
  LevelDefinition,
  GamePiece, PieceDirection,
} from '../types/types.ts';
import { rotate90CW } from '../utils/transformHelpers.ts';

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

  const rotatePiece = useCallback((id: string) => {
    setPieces(prev =>
      prev.map(piece => {
        if (piece.id !== id) return piece;

        return {
          ...piece,
          rotation:  (piece.rotation + 90) % 360 as PieceDirection,
          placed: false,
        };
      }),
    );
  }, []);

  return {
    board,
    pieces,
    rotatePiece,
  };
};
