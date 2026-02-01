import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GamePiece, PieceMatrix } from '../../types/types.ts';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

type Props = {
  gamePiece: GamePiece;
  matrix: PieceMatrix;
  uiPos: { left: number; top: number };
  panHandlers: any;
  onTouchStart: () => void;
  onPressRotate: () => void;
  cellWidth: number;
  cellHeight: number;
  isActive: boolean;
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
  isActive,
}) => {
  const rotateAnim = useSharedValue(0);
  const isRotatingRef = useRef(false);

  const width = matrix[0].length * cellWidth;
  const height = matrix.length * cellHeight;

  const pieceColors = gamePiece.placed ? colors.piecePlaced : colors.piece;

  const rotateStyle = useAnimatedStyle(() => {
    return { transform: [{ rotate: `${rotateAnim.value}deg` }] };
  });

  const endRotation = () => {
    isRotatingRef.current = false;
  };

  const handleRotate = () => {
    if (isRotatingRef.current) return;

    isRotatingRef.current = true;
    rotateAnim.value = withTiming(90, { duration: 250 }, () => {
      runOnJS(onPressRotate)();
      rotateAnim.value = 0;
      runOnJS(endRotation)();
    });
  };

  const containerStyle = {
    position: 'absolute' as const,
    left: uiPos?.left,
    top: uiPos?.top,
    width,
    height,
    zIndex: isActive ? 100 : gamePiece.placed ? 1 : 50,
  };

  const activeStyle = {
    transform: [{ scale: isActive ? 1.1 : 1 }],
  };

  return (
    <Animated.View
      {...panHandlers}
      onTouchStart={onTouchStart}
      style={[containerStyle, rotateStyle]}
    >
      <Pressable
        onPress={handleRotate}
        style={activeStyle}
      >
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
                      pointerEvents="none"
                      style={[
                        styles.cell,
                        styles.empty,
                        { width: cellWidth, height: cellHeight },
                      ]}
                    />
                  );
                }

                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        width: cellWidth,
                        height: cellHeight,
                        backgroundColor: pieceColors.base,
                        borderTopLeftRadius:
                          !hasTop && !hasLeft ? spacing.borderRadius.md : 0,
                        borderTopRightRadius:
                          !hasTop && !hasRight ? spacing.borderRadius.md : 0,
                        borderBottomLeftRadius:
                          !hasBottom && !hasLeft ? spacing.borderRadius.md : 0,
                        borderBottomRightRadius:
                          !hasBottom && !hasRight ? spacing.borderRadius.md : 0,
                        borderTopWidth: hasTop ? 0 : 2,
                        borderTopColor: pieceColors.highlight,
                        borderBottomWidth: hasBottom ? 0 : 2,
                        borderBottomColor: pieceColors.shadow,
                        borderLeftWidth: hasLeft ? 0 : 2,
                        borderLeftColor: pieceColors.highlight,
                        borderRightWidth: hasRight ? 0 : 2,
                        borderRightColor: pieceColors.shadow,
                        shadowColor: colors.black,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: gamePiece.placed ? .5 : 0.3,
                        shadowRadius: gamePiece.placed ? 2 : 4,
                        elevation: gamePiece.placed ? 2 : 5,
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

const styles = StyleSheet.create({
  pieceRow: {
    flexDirection: 'row',
  },
  cell: {
    zIndex: 99,
  },
  empty: {
    opacity: 1,
    zIndex: -1,
  },
});
