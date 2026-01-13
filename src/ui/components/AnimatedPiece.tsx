import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
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
  onTouchEnd: () => void;
  cellWidth: number;
  cellHeight: number;
  styles: any;
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
  styles,
}) => {
  // ref
  const rotateAnim = useSharedValue(0);
  const isRotatingRef = useRef(false);

  const width = matrix[0].length * cellWidth;
  const height = matrix.length * cellHeight;

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
    rotateAnim.value = withTiming(90, { duration: 150 }, () => {
      runOnJS(onPressRotate)();
      rotateAnim.value = 0;
      runOnJS(endRotation)();
    });
  };

  return (
    <Animated.View
      {...panHandlers}
      onTouchStart={onTouchStart}
      style={[
        {
          position: 'absolute',
          left: uiPos?.left,
          top: uiPos?.top,
          width,
          height,
          borderWidth: 0
        },
        rotateStyle,
      ]}
    >
      <Pressable onPress={handleRotate}>
        {matrix.map((row, rowIndex) => (
          <View style={styles.pieceRow} key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  cell === 1 ? styles.piece : styles.empty,
                  gamePiece.placed ? styles.fit : styles.piece,
                ]}
              />
            ))}
          </View>
        ))}
      </Pressable>
    </Animated.View>
  );
};
