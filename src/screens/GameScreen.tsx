import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Cell, LevelDefinition } from '../types/types.ts';
import { useGamePlayManager } from '../hooks/useGamePlayManager.ts';
import { useGameState } from '../hooks/useGameState.ts';

type Props = {
  level: LevelDefinition;
};

export const GameScreen: React.FC<Props> = ({ level }) => {
  // ÖNEMLİ
  // TODO: boardX, boardY şuan için pixel based, grid-based olacak

  const CELL_WIDTH = 50;
  const CELL_HEIGHT = 50;

  const BOARD_HEIGHT = level.board.length * CELL_HEIGHT;

  const startPos = useRef({ left: 0, top: 0 });
  const pieceRef = useRef<View>(null);

  // manager
  const { canPlace } = useGamePlayManager();
  const { board, pieces, rotatePiece, getPieceMatrix } = useGameState({
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
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

        const canPlaceResult = canPlace(
          boardStateRef.current,
          matrix,
          gridX,
          gridY,
        );

        if (canPlaceResult) {
          const snapLeft = gridX * CELL_WIDTH;
          const snapTop = gridY * CELL_HEIGHT;

          setUiPositions(prev => ({
            ...prev,
            [id]: {
              left: snapLeft,
              top: snapTop,
            },
          }));
        } else {
          console.log('not snapping');
        }
      },
    }),
  ).current;

  // themes
  const styles = StyleSheet.create({
    container: {
      margin: 20,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    level: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    button: {
      borderWidth: 1,
      borderRadius: 4,
      backgroundColor: 'rgba(12,12,12,.3)',
      width: 90,
      padding: 4,
    },
    row: {
      flexDirection: 'row',
      borderLeftWidth: 1,
    },
    topBorder: { borderTopWidth: 1 },
    cell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      borderBottomWidth: 1,
      borderRightWidth: 1,
    },
    available: {
      backgroundColor: 'pink',
    },
    occupied: {
      backgroundColor: 'red',
    },
    piecesContainer: {
      borderWidth: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 2,
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 350, // should be dynmic
      gap: 10,
    },

    pieceRow: {
      flexDirection: 'row',
    },
    piece: {
      backgroundColor: 'orange',
      borderWidth: 1,
    },
    empty: {
      opacity: 0,
      borderWidth: 0,
    },
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
                        : styles.occupied,
                      { justifyContent: 'center', alignItems: 'center' },
                    ]}
                  >
                    <Text style={{ fontSize: 12, color: 'black' }}>
                      {colIndex},{rowIndex}
                    </Text>
                    <Text>{cell}</Text>
                  </View>
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
          const gridX = Math.round(uiPos.left / CELL_WIDTH);
          const gridY = Math.round(uiPos.top / CELL_HEIGHT);

          if (!matrix) return;
          const fit = canPlace(board, matrix, gridX, gridY);

          return (
            <View
              key={gamePiece.id}
              ref={pieceRef}
              {...panResponder.panHandlers}
              style={[
                { left: uiPos?.left },
                { top: uiPos?.top },
                { position: 'absolute' },
              ]}
              onTouchStart={() => setActivePieceId(gamePiece.id)}
            >
              <Pressable onPress={() => rotatePiece(gamePiece.id)}>
                {matrix.map((row, rowIndex) => (
                  <View style={styles.pieceRow} key={`row-${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                      <View
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={[
                          styles.cell,
                          cell === 1 ? styles.piece : styles.empty,
                        ]}
                      >
                        <Text style={{ fontSize: 10 }}>
                          {fit ? 'FIT' : 'NON'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      {renderLevel()}
      {renderPieces()}
    </View>
  );
};
