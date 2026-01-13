import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text, TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Cell, LevelDefinition } from '../../types/types.ts';
import { useGameState } from '../../state/useGameState.ts';
import { AnimatedPiece } from '../components/AnimatedPiece.tsx';

type Props = {
  level: LevelDefinition;
};

export const GameScreen: React.FC<Props> = ({ level }) => {
  // ÖNEMLİ
  // TODO: boardX, boardY şuan için pixel based, grid-based olacak

  const CELL_WIDTH = 40;
  const CELL_HEIGHT = 40;

  const screenWidth = Dimensions.get('screen').width;

  const PAGE_PADDING = (screenWidth - CELL_WIDTH * level.board[0].length) / 2;
  const BOARD_TOP_POS = PAGE_PADDING;
  const BOARD_LEFT_POS = PAGE_PADDING;

  const PIECE_CONTAINER_TOP_PADDING = 10;

  const BOARD_HEIGHT = level.board.length * CELL_HEIGHT;

  const startPos = useRef({ left: 0, top: 0 });
  const pieceRef = useRef<View>(null);

  // manager;
  const {
    board,
    pieces,
    rotatePiece,
    getPieceMatrix,
    releaseAndTryLockPiece,
    tryPlacePiece,
    getPieceRotation,
    isOver,
    restart,
  } = useGameState({
    level,
  });

  // local states
  const [activePieceId, setActivePieceId] = useState<string>();
  const [uiPositions, setUiPositions] = useState<
    Record<string, { top: number; left: number }>
  >(() => {
    const initial: Record<string, { left: number; top: number }> = {};
    level.pieces.forEach((_, index) => {
      initial[`piece-${index}`] = {
        left: 0,
        top: BOARD_HEIGHT + CELL_WIDTH * index,
      };
    });
    return initial;
  });

  const uiPositionsRef = useRef(uiPositions);
  const activePieceIdRef = useRef(activePieceId);
  const piecesRef = useRef(pieces);
  const boardStateRef = useRef(board);
  const getPieceMatrixRef = useRef(getPieceMatrix);
  const isRotatingRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isRotatingRef.current,
      onPanResponderGrant: () => {
        if (!activePieceIdRef.current) return;
        startPos.current = uiPositionsRef.current[activePieceIdRef.current];
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        if (!activePieceIdRef.current) return;

        setUiPositions(prev => ({
          ...prev,
          [activePieceIdRef.current as string]: {
            left: startPos.current.left + dx,
            top: startPos.current.top + dy,
          },
        }));
      },
      onPanResponderRelease: (_, _gestureState) => {
        const id = activePieceIdRef.current as string;
        const { left, top } = uiPositionsRef.current[id];
        const gridX = Math.round(left / CELL_WIDTH);
        const gridY = Math.round(top / CELL_HEIGHT);

        const gamePiece = piecesRef.current.find(
          piece => piece.id === (activePieceIdRef.current as string),
        );

        if (!gamePiece) return;
        const matrix = getPieceMatrixRef.current(gamePiece.id);

        if (!matrix) return;

        const canPlaceResult = tryPlacePiece(gamePiece.id!, gridX, gridY);

        const snapLeft = gridX * CELL_WIDTH;
        const snapTop = gridY * CELL_HEIGHT - PIECE_CONTAINER_TOP_PADDING;

        if (canPlaceResult) {
          setUiPositions(prev => ({
            ...prev,
            [id]: {
              left: snapLeft,
              top: snapTop,
            },
          }));
        }
        releaseAndTryLockPiece(id, gridX, gridY, canPlaceResult);

        if (!canPlaceResult) console.log('Not snapping');
      },
    }),
  ).current;


  // themes
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    level: {
      position: 'absolute',
      top: PAGE_PADDING,
      left: PAGE_PADDING,
    },

    row: {
      flexDirection: 'row',
      borderLeftWidth: 0,
    },
    topBorder: { borderTopWidth: 0 },
    cell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      borderWidth: 0.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
    },
    available: {
      backgroundColor: 'pink',
    },
    notAvailable: {
      backgroundColor: '#FF8C94',
    },
    piecesContainer: {
      position: 'absolute',
      top: BOARD_TOP_POS,
      left: BOARD_LEFT_POS,
      zIndex: 1,
      width: 160,
      height: 240,
      borderWidth: 0,
    },

    pieceRow: {
      flexDirection: 'row',
    },
    piece: {
      backgroundColor: '#A8E6CE',
      borderWidth: 1,
      borderRadius: 4,
    },
    fit: {
      backgroundColor: '#DCEDC2',
    },
    empty: {
      opacity: 0,
      borderWidth: 0,
    },

    debug: {
      position: 'absolute',
      left: PAGE_PADDING,
      top: PAGE_PADDING + level.board[0].length * CELL_WIDTH + 10,
    },
    button: {
      borderWidth: 1,
      backgroundColor: 'gray',
      borderRadius: 4,
      padding: 2,
    }
  });

  // hooks
  useEffect(() => {
    uiPositionsRef.current = uiPositions;
  }, [uiPositions]);

  useEffect(() => {
    activePieceIdRef.current = activePieceId;
  }, [activePieceId]);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  useEffect(() => {
    getPieceMatrixRef.current = getPieceMatrix;
  }, [getPieceMatrix]);

  // functions

  const resetUiPositions = () => {
    const initial: Record<string, { left: number; top: number }> = {};
    pieces.forEach((_, index) => {
      initial[`piece-${index}`] = {
        left: 0,
        top: BOARD_HEIGHT + CELL_WIDTH * index,
      };
    });
    setUiPositions(initial);
  };

  const handleRestart = () => {
    restart();
    resetUiPositions();
  }

  const renderLevel = useCallback(() => {
    return (
      <View style={[styles.level]}>
        {board.map((row: Cell[], rowIndex: number) => {
          return (
            <View
              style={[styles.row, rowIndex === 0 && styles.topBorder]}
              key={`row-${rowIndex}`}
            >
              {row.map((cell, colIndex) => {
                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      cell === Cell.AVAILABLE
                        ? styles.available
                        : styles.notAvailable,
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }, [styles, board]);

  const renderPieces = () => {
    return (
      <View style={[styles.piecesContainer]}>
        {pieces.map(gamePiece => {
          const matrix = getPieceMatrix(gamePiece.id);
          const uiPos = uiPositions[gamePiece.id];
          if (!matrix) return;

          return (
            <AnimatedPiece
              key={gamePiece.id}
              gamePiece={gamePiece}
              matrix={matrix}
              uiPos={uiPos}
              panHandlers={panResponder.panHandlers}
              onTouchStart={() => setActivePieceId(gamePiece.id)}
              onPressRotate={() => rotatePiece(gamePiece.id)}
              onTouchEnd={() => {}}
              cellWidth={CELL_WIDTH}
              cellHeight={CELL_HEIGHT}
              styles={styles}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      {renderLevel()}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: PIECE_CONTAINER_TOP_PADDING,
        }}
      >
        <TouchableOpacity style={[styles.button]}  onPress={() => handleRestart()}>
          <Text>isOver: {isOver()}</Text>
        </TouchableOpacity>
        {renderPieces()}
      </View>
    </View>
  );
};
