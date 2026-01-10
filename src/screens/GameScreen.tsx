import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Cell, LevelDefinition } from '../types/types.ts';
import { useGamePlayManager } from '../hooks/useGamePlayManager.ts';
import { useGameState } from '../hooks/useGameState.ts';
import { getRotatedMatrix } from '../utils/transformHelpers.ts';

type Props = {
  level: LevelDefinition;
};

export const GameScreen: React.FC<Props> = ({ level }) => {
  const CELL_WIDTH = 50;
  const CELL_HEIGHT = 50;

  // Board is positioned at top:0, left:0 within the container
  // So these are the reference points
  const boardTop = 0;
  const boardLeft = 0;
  const boardRef = useRef<View>(null);

  // manager
  const { canPlace } = useGamePlayManager();
  const { board, pieces, rotatePiece } = useGameState({ level });

  // local states
  const [uiPositions, setUiPositions] = React.useState<Record<string, { x: number; y: number }>>(() => {
    const initial: Record<string, { x: number; y: number }> = {};
    level.pieces.forEach((_, index) => {
      initial[`piece-${index}`] = { x: 0, y: 0 };
    });
    return initial;
  });

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
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 2,
      flexDirection: 'row',
      flexWrap: 'wrap',
      maxWidth: 350, // should be dynmic
      gap: 10,
    },
    pieceContainer: {
      position: 'absolute',
      zIndex: 3,
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
    debug: {
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: 10,
      zIndex: 100,
      borderWidth: 1,
      bottom: 0,
      left: 0,
      opacity: 0.2,

      display: 'none',
    },
  });

  // functions
  const renderLevel = useCallback(() => {
    return (
      <View style={[styles.level]} ref={boardRef}>
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

  const renderPieces = useCallback(() => {
    const PIECES_START_TOP = board.length * CELL_HEIGHT + 20; // Below the board

    return (
      <View style={[styles.piecesContainer, { top: PIECES_START_TOP }]}>
        {pieces.map((gamePiece, index) => {
          // Each piece renders as a relative positioned item in the flex container

          const matrix = getRotatedMatrix(
            gamePiece.baseMatrix,
            gamePiece.rotation,
          );

          const uiPos = uiPositions[gamePiece.id];
          const boardX = uiPos.x;
          const boardY = uiPos.y;

          const fit = canPlace(board, matrix, boardX, boardY);

          return (
            <View key={index}>
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
  }, [pieces, board, styles, rotatePiece, canPlace, uiPositions]);

  return (
    <View style={[styles.container]}>
      {renderPieces()}
      {renderLevel()}
    </View>
  );
};
