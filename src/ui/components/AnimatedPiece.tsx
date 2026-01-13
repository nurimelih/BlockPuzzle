import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GamePiece, PieceMatrix } from '../../types/types.ts';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  gamePiece: GamePiece;
  matrix: PieceMatrix;
  uiPos: { left: number; top: number };
  panHandlers: any;
  onTouchStart: () => void;
  onPressRotate: () => void;
  cellWidth: number;
  cellHeight: number;
  styles: any;
  hasBorders?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

export const AnimatedPiece: React.FC<Props> = ({
  gamePiece,
  matrix,
  uiPos,
  panHandlers,
  onTouchStart,
  onPressRotate,
  cellWidth,
  cellHeight,
}) => {
  // ref
  const rotateAnim = useSharedValue(0);
  const isRotatingRef = useRef(false);

  const width = matrix[0].length * cellWidth;
  const height = matrix.length * cellHeight;

  const BORDER_WIDTH = 0.5;

  // styles
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: uiPos?.left,
      top: uiPos?.top,
      width,
      height,
    },
    pieceRow: {
      flexDirection: 'row',
    },
    cell: {
      width: cellWidth,
      height: cellHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    piece: {
      backgroundColor: '#B1F1CE',
      borderRadius: 4,
    },
    fit: {
      backgroundColor: '#DCEDC2',
    },
    empty: {
      opacity: 0,
    },
  });

  const rotateStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${rotateAnim.value}deg` }] };
  });

  const endRotation = () => {
    isRotatingRef.current = false;
  };

  const handleRotate = () => {
    if (isRotatingRef.current) return;

    isRotatingRef.current = true;
    // TODO: animations are still naive. will polish later.
    rotateAnim.value = withTiming(90, { duration: 250 }, () => {
      runOnJS(onPressRotate)();
      rotateAnim.value = 0;
      runOnJS(endRotation)();
    });
  };

  return (
    <Animated.View
      {...panHandlers}
      onTouchStart={onTouchStart}
      style={[styles.container, rotateStyle]}
    >
      <Pressable onPress={handleRotate}>
        {matrix.map((row, rowIndex) => {
          return (
            <View style={styles.pieceRow} key={`row-${rowIndex}`}>
              {row.map((cell, colIndex) => {
                const hasTop =
                  rowIndex > 0 && matrix[rowIndex - 1]?.[colIndex] === 1;
                const hasBottom =
                  rowIndex < matrix.length - 1 &&
                  matrix[rowIndex + 1]?.[colIndex] === 1;
                const hasLeft = colIndex > 0 && row[colIndex - 1] === 1;
                const hasRight =
                  colIndex < row.length - 1 && row[colIndex + 1] === 1;

                if (cell === 0) {
                  return (
                    <View
                      key={`cell-${rowIndex}-${colIndex}`}
                      style={[
                        styles.cell,
                        styles.empty,
                        {
                          borderRightWidth: hasRight ? BORDER_WIDTH : 0,
                          borderBottomWidth: hasBottom ? BORDER_WIDTH : 0,
                          borderLeftWidth: hasLeft ? BORDER_WIDTH : 0,
                          borderTopWidth: hasTop ? BORDER_WIDTH : 0,
                          borderTopLeftRadius: hasTop && hasLeft ? 4 : 0,
                          borderTopRightRadius: hasTop && hasRight ? 4 : 0,
                          borderBottomLeftRadius: hasBottom && hasLeft ? 4 : 0,
                          borderBottomRightRadius:
                            hasBottom && hasRight ? 4 : 0,
                          borderColor: '#A8E6CE',
                        },
                      ]}
                    />
                  );
                }

                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      styles.piece,
                      gamePiece.placed && styles.fit,
                      {
                        borderLeftWidth: hasLeft ? 0 : BORDER_WIDTH,
                        borderRightWidth: hasRight ? 0 : BORDER_WIDTH,
                        borderTopWidth: hasTop ? 0 : BORDER_WIDTH,
                        borderBottomWidth: hasBottom ? 0 : BORDER_WIDTH,
                        borderTopLeftRadius: !hasTop && !hasLeft ? 4 : 0,
                        borderTopRightRadius: !hasTop && !hasRight ? 4 : 0,
                        borderBottomLeftRadius: !hasBottom && !hasLeft ? 4 : 0,
                        borderBottomRightRadius:
                          !hasBottom && !hasRight ? 4 : 0,
                        borderColor: '#A8E6CE',
                      },
                    ]}
                  />
                );
              })}
            </View>
          );
        })}
      </Pressable>
    </Animated.View>
  );
};
