import React, { useEffect, useImperativeHandle } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GamePiece, PieceMatrix } from '../../types/types.ts';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, spacing } from '../../theme';

export type AnimatedPieceHandle = {
  setPosition: (left: number, top: number) => void;
  getPosition: () => { left: number; top: number };
};

type Props = {
  gamePiece: GamePiece;
  matrix: PieceMatrix;
  rotation: number;
  initialLeft: number;
  initialTop: number;
  resetKey: number;
  cellWidth: number;
  cellHeight: number;
  isActive: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, finalLeft: number, finalTop: number) => void;
  onTapRotate: (id: string) => void;
};

export const AnimatedPiece = React.forwardRef<AnimatedPieceHandle, Props>(
  (
    {
      gamePiece,
      matrix,
      rotation,
      initialLeft,
      initialTop,
      resetKey,
      cellWidth,
      cellHeight,
      isActive,
      onDragStart,
      onDragEnd,
      onTapRotate,
    },
    ref,
  ) => {
    const translateX = useSharedValue(initialLeft);
    const translateY = useSharedValue(initialTop);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const rotateAnim = useSharedValue(rotation);

    useImperativeHandle(ref, () => ({
      setPosition: (left: number, top: number) => {
        translateX.value = left;
        translateY.value = top;
      },
      getPosition: () => ({
        left: translateX.value,
        top: translateY.value,
      }),
    }));

    // Reset on level change / restart
    useEffect(() => {
      translateX.value = initialLeft;
      translateY.value = initialTop;
    }, [resetKey, initialLeft, initialTop, translateX, translateY]);

    useEffect(() => {
      rotateAnim.value = withTiming(rotation, { duration: 200 });
    }, [rotation, rotateAnim]);

    // baseMatrix boyutları (sabit, matrix hiç değişmiyor)
    const baseW = matrix[0].length * cellWidth;
    const baseH = matrix.length * cellHeight;

    // Container'ı kare yap (max boyut) - rotate sırasında taşma/kırpılma olmasın
    const containerSize = Math.max(baseW, baseH);

    // İçeriği container merkezine oturt
    const offsetX = (containerSize - baseW) / 2;
    const offsetY = (containerSize - baseH) / 2;

    const pieceColors = gamePiece.placed ? colors.piecePlaced : colors.piece;

    const panGesture = Gesture.Pan()
      .minDistance(8)
      .onStart(() => {
        'worklet';
        isDragging.value = true;
        startX.value = translateX.value;
        startY.value = translateY.value;
        runOnJS(onDragStart)(gamePiece.id);
      })
      .onUpdate(e => {
        'worklet';
        translateX.value = startX.value + e.translationX;
        translateY.value = startY.value + e.translationY;
      })
      .onEnd(() => {
        'worklet';
        if (!isDragging.value) return;
        isDragging.value = false;
        runOnJS(onDragEnd)(
          gamePiece.id,
          translateX.value,
          translateY.value,
        );
      })
      .onFinalize(() => {
        'worklet';
        isDragging.value = false;
      });

    const tapGesture = Gesture.Tap().onEnd(() => {
      'worklet';
      runOnJS(onTapRotate)(gamePiece.id);
    });

    const composed = Gesture.Exclusive(panGesture, tapGesture);

    // Tek animated style: position + rotate birlikte (ayrı olursa transform override olur)
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value - offsetX },
        { translateY: translateY.value - offsetY },
        { rotate: `${rotateAnim.value}deg` },
      ],
    }));

    const containerStyle = {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      width: containerSize,
      height: containerSize,
      zIndex: isActive ? 100 : gamePiece.placed ? 1 : 50,
    };

    const activeStyle = {
      transform: [{ scale: isActive ? 1.1 : 1 }],
    };

    return (
      <GestureDetector gesture={composed}>
        <Animated.View style={[containerStyle, animatedStyle]}>
          <View
            style={[activeStyle, { marginLeft: offsetX, marginTop: offsetY }]}
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
                              !hasTop && !hasRight
                                ? spacing.borderRadius.md
                                : 0,
                            borderBottomLeftRadius:
                              !hasBottom && !hasLeft
                                ? spacing.borderRadius.md
                                : 0,
                            borderBottomRightRadius:
                              !hasBottom && !hasRight
                                ? spacing.borderRadius.md
                                : 0,
                            borderTopWidth: hasTop ? 0 : 2,
                            borderTopColor: pieceColors.highlight,
                            borderBottomWidth: hasBottom ? 0 : 2,
                            borderBottomColor: pieceColors.shadow,
                            borderLeftWidth: hasLeft ? 0 : 2,
                            borderLeftColor: pieceColors.highlight,
                            borderRightWidth: hasRight ? 0 : 2,
                            borderRightColor: pieceColors.shadow,
                            ...Platform.select({
                              ios: {
                                shadowColor: colors.black,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: gamePiece.placed ? 0.5 : 0.3,
                                shadowRadius: gamePiece.placed ? 2 : 4,
                              },
                              android: {
                                elevation: gamePiece.placed ? 1 : 2,
                              },
                            }),
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

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
