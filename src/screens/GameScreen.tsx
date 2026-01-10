import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Board, Cell, PieceMatrix } from '../types/types.ts';
import { canPlace, getRandomPiece } from '../hooks/useGamePlayManager.ts';

type Props = {
  level: Board;
};
export const GameScreen: React.FC<Props> = ({ level }) => {
  const CELL_WIDTH = 50;
  const CELL_HEIGHT = 50;

  // Board is positioned at top:0, left:0 within the container
  // So these are the reference points for coordinate calculation
  const boardTop = 0;
  const boardLeft = 0;
  const boardRef = useRef<View>(null);

  // local states
  const [piece, setPiece] = useState<PieceMatrix>(getRandomPiece());

  // Initial position - will be updated once board is measured
  const [piecePosition, _setPiecePosition] = useState({
    top: 0,
    left: 0,
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
      display: 'none',
      borderWidth: 0,
    },
  });

  // functions
  /*  const testPlay = () => {
      setPiecePosition(curr => {
        const maxTop = boardTop + (level.length - piece.length) * CELL_HEIGHT;
        const maxLeft =
          boardLeft + (level[0].length - piece[0].length) * CELL_WIDTH;

        if (curr.left <= maxLeft) {
          if (curr.top <= maxTop) {
            return { top: curr.top + CELL_HEIGHT, left: curr.left };
          } else {
            return { top: boardTop, left: curr.left + CELL_WIDTH };
          }
        }
        return { top: boardTop, left: boardLeft };
      });
    };*/

  // Calculate board coordinates
  const boardX = Math.floor((piecePosition.left - boardLeft) / CELL_WIDTH);
  const boardY = Math.floor((piecePosition.top - boardTop) / CELL_HEIGHT);
  const fit = canPlace(level, piece, boardX, boardY);

  const handleGetRandomPiece = useCallback(() => {
    const pi = getRandomPiece();
    console.log('handleGetRandomPiece', pi);
    setPiece(pi);
  }, []);

  // hooks
  /*  useEffect(() => {
      const interval = setInterval(() => {
        testPlay();
      }, 500);
      return () => clearInterval(interval);
    }, []);*/

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
                    <Text
                      style={{
                        fontSize: 10,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      {cellBoardX},{cellBoardY}X
                    </Text>
                  )}
                  <Text>{cell}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    ); /**/
  }, [piece, piecePosition, fit, boardX, boardY, styles]);

  const renderLevel = useCallback(() => {
    return (
      <View style={[styles.level]} ref={boardRef}>
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
  }, [level, styles]);

  return (
    <View style={[styles.container]}>
      {/* Debug display */}
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          left: 20,
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: 10,
          zIndex: 100,
          borderWidth: 1,
        }}
      >
        <Pressable style={[styles.button]} onPress={handleGetRandomPiece}>
          <Text>New Piece</Text>
        </Pressable>
        <Text style={{ fontWeight: 'bold' }}>Debug Info:</Text>
        <Text>
          Piece visual: top={piecePosition.top}, left={piecePosition.left}
        </Text>
        <Text>
          Board coords: x={boardX}, y={boardY}
        </Text>
        <Text>Fit: {fit ? 'YES' : 'NO'}</Text>
        <Text>---</Text>
        <Text>boardTop={boardTop}</Text>
        <Text>boardLeft={boardLeft}</Text>
        <Text>---</Text>
        <Text>
          Board is {level.length} rows x {level[0].length} cols
        </Text>
        <Text>Board height: {level.length * CELL_HEIGHT}px</Text>
      </View>
      {renderLevel()}
      {renderPiece()}
    </View>
  );
};
