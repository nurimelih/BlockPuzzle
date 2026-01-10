import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Board, Cell, PieceMatrix } from '../types/types.ts';
import { canPlace, getRandomPiece } from '../hooks/useGamePlayManager.ts';

type Props = {
  level: Board;
};
export const GameScreen: React.FC<Props> = ({ level }) => {
  const CELL_WIDTH = 50;
  const CELL_HEIGHT = 50;

  const BOARD_LEFT = 50;
  const BOARD_BOTTOM = 150;

  // We'll measure the board's actual top position using onLayout
  const [boardTop, setBoardTop] = useState<number | null>(null);
  const [boardLeft, setBoardLeft] = useState<number | null>(null);
  const boardRef = useRef<View>(null);
  const containerRef = useRef<View>(null);

  // local states
  const [piece, setPiece] = useState<PieceMatrix>(getRandomPiece());

  // Initial position - will be updated once board is measured
  const [piecePosition, setPiecePosition] = useState({
    top: 0,
    left: BOARD_LEFT,
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
      bottom: BOARD_BOTTOM,
      left: BOARD_LEFT,
    },
    button: {
      position: 'absolute',
      top: 10,
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
    pieceContainer: {
      position: 'absolute',
      zIndex: 2,
    },
    pieceRow: {
      flexDirection: 'row',
    },
    piece: {
      backgroundColor: 'orange',
      borderWidth: 1,
    },
    empty: {
      display: 'none',
      borderWidth: 0,
    },
  });

  // Handler to measure the board's actual position
  const handleBoardLayout = useCallback((event: LayoutChangeEvent) => {
    // Get the board view's position relative to its parent (the container)
    const { x, y } = event.nativeEvent.layout;
    console.log('Board layout - position:', { x, y });
    setBoardTop(y);
    setBoardLeft(x);
    // Set initial piece position to match board top-left
    setPiecePosition({ top: y, left: x });
  }, []);

  // hooks
  useEffect(() => {
    // Only start the test play interval once we have measured the board
    if (boardTop === null) return;

    const interval = setInterval(() => {
      testPlay();
    }, 500);
    return () => clearInterval(interval);
  }, [boardTop]);

  // functions
  const testPlay = () => {
    if (boardTop === null) return;

    setPiecePosition(curr => {
      const maxTop = boardTop + (level.length - 1) * CELL_HEIGHT;
      const maxLeft = BOARD_LEFT + (level[0].length - 1) * CELL_WIDTH;

      if (curr.left <= maxLeft) {
        if (curr.top < maxTop) {
          return { top: curr.top + CELL_HEIGHT, left: curr.left };
        } else {
          return { top: boardTop, left: curr.left + CELL_WIDTH };
        }
      }
      return { top: boardTop, left: BOARD_LEFT };
    });
  };

  // Calculate board coordinates - only valid if board position is measured
  const boardX = boardLeft !== null
    ? Math.floor((piecePosition.left - boardLeft) / CELL_WIDTH)
    : 0;
  const boardY = boardTop !== null
    ? Math.floor((piecePosition.top - boardTop) / CELL_HEIGHT)
    : 0;
  const fit = canPlace(level, piece, boardX, boardY);

  const handleGetRandomPiece = useCallback(() => {
    const pi = getRandomPiece();
    console.log('handleGetRandomPiece', pi);
    setPiece(pi);
  }, []);

  const renderPiece = useCallback(() => {
    return (
      <View
        style={[
          styles.pieceContainer,
          {
            top: piecePosition.top,
            left: piecePosition.left,
          },
        ]}
      >
        {piece.map((row, rowIndex) => (
          <View style={styles.pieceRow} key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => {
              // Calculate what board coordinate this piece cell thinks it's at
              const cellBoardX = boardX + colIndex;
              const cellBoardY = boardY + rowIndex;
              return (
                <View
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    cell === 1 ? styles.piece : styles.empty,
                    {
                      backgroundColor: fit ? 'green' : 'orange',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  {cell === 1 && (
                    <Text style={{fontSize: 10, color: 'white', fontWeight: 'bold'}}>
                      {cellBoardX},{cellBoardY}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [piece, piecePosition, fit, boardX, boardY]);

  const renderLevel = useCallback(() => {
    return (
      <View style={[styles.level]} onLayout={handleBoardLayout} ref={boardRef}>
        {level.map((row: Cell[], rowIndex: number) => {
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
                      {justifyContent: 'center', alignItems: 'center'},
                    ]}
                  >
                    <Text style={{fontSize: 8, color: 'black'}}>
                      {colIndex},{rowIndex}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }, [level, piece, handleBoardLayout]);

  return (
    <View style={[styles.container]}>
      <Pressable style={[styles.button]} onPress={handleGetRandomPiece}>
        <Text> New Piece</Text>
      </Pressable>
      {/* Debug display */}
      <View style={{position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, zIndex: 100, borderWidth: 1}}>
        <Text style={{fontWeight: 'bold'}}>Debug Info:</Text>
        <Text>Piece visual: top={piecePosition.top}, left={piecePosition.left}</Text>
        <Text>Board coords: x={boardX}, y={boardY}</Text>
        <Text>Fit: {fit ? 'YES' : 'NO'}</Text>
        <Text>---</Text>
        <Text>boardTop (measured)={boardTop}</Text>
        <Text>boardLeft (measured)={boardLeft}</Text>
        <Text>BOARD_BOTTOM={BOARD_BOTTOM}</Text>
        <Text>---</Text>
        <Text>Board is {level.length} rows x {level[0].length} cols</Text>
        <Text>Board height: {level.length * CELL_HEIGHT}px</Text>
      </View>
      {renderLevel()}
      {renderPiece()}
    </View>
  );
};
