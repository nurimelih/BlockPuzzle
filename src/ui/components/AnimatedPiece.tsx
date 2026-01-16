import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GamePiece, PieceMatrix } from '../../types/types.ts';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// TODO: theme's taşı
const PIECE_COLORS = {
  base: '#FFE082',
  highlight: '#FFF3C4',
  shadow: '#D4A84B',
  placedBase: '#E0E0E0',
  placedHighlight: '#F5F5F5',
  placedShadow: '#BDBDBD',
};

type Props = {
  gamePiece: GamePiece;
  matrix: PieceMatrix;
  uiPos: { left: number; top: number };
  panHandlers: any;
  onTouchStart: () => void;
  onPressRotate: () => void;
  cellWidth: number;
  cellHeight: number;
  styles?: any;
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

  // TODO: bu değerler theme gibi bir yapıdan gelsin
  const BORDER_RADIUS = 6;
  const colors = gamePiece.placed
    ? {
        base: PIECE_COLORS.placedBase,
        highlight: PIECE_COLORS.placedHighlight,
        shadow: PIECE_COLORS.placedShadow,
      }
    : {
        base: PIECE_COLORS.base,
        highlight: PIECE_COLORS.highlight,
        shadow: PIECE_COLORS.shadow,
      };

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
      zIndex: 99,
    },
    empty: {
      opacity: 1,
      zIndex: -1
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
                      pointerEvents="none"
                      style={[styles.cell, styles.empty]}
                    />
                  );
                }

                // TODO: style'ları taşı buradan, tepeye koy ya da başka bir sayfaya taşı, parametre alan bir func haline getir.
                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: colors.base,
                        borderTopLeftRadius:
                          !hasTop && !hasLeft ? BORDER_RADIUS : 0,
                        borderTopRightRadius:
                          !hasTop && !hasRight ? BORDER_RADIUS : 0,
                        borderBottomLeftRadius:
                          !hasBottom && !hasLeft ? BORDER_RADIUS : 0,
                        borderBottomRightRadius:
                          !hasBottom && !hasRight ? BORDER_RADIUS : 0,

                        borderTopWidth: hasTop ? 0 : 2,
                        borderTopColor: colors.highlight,
                        borderBottomWidth: hasBottom ? 0 : 2,
                        borderBottomColor: colors.shadow,
                        borderLeftWidth: hasLeft ? 0 : 2,
                        borderLeftColor: colors.highlight,
                        borderRightWidth: hasRight ? 0 : 2,
                        borderRightColor: colors.shadow,

                        shadowColor: '#000',
                        shadowOffset: { width: 1, height: 2 },
                        shadowOpacity: gamePiece.placed ? 0.15 : 0.3,
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
