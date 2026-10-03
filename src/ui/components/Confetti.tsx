import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { PIECE_COLORS } from '../../theme';

const PIECE_COUNT = 40;
const MAX_START_DELAY_MS = 600;
const MIN_FALL_MS = 1800;
const FALL_VARIANCE_MS = 1400;
const MAX_SWAY = 60;

type ConfettiPiece = {
  x: number;
  delay: number;
  duration: number;
  sway: number;
  spin: number;
  width: number;
  height: number;
  color: string;
};

const ConfettiPieceView: React.FC<{ piece: ConfettiPiece; fallDistance: number }> = ({
  piece,
  fallDistance,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: piece.duration, easing: Easing.in(Easing.quad) }),
    );
  }, [piece, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.9 ? 1 : (1 - progress.value) * 10,
    transform: [
      { translateY: progress.value * fallDistance },
      { translateX: Math.sin(progress.value * Math.PI * 3) * piece.sway },
      { rotate: `${progress.value * piece.spin}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        { left: piece.x, width: piece.width, height: piece.height, backgroundColor: piece.color },
        animatedStyle,
      ]}
    />
  );
};

/** Ekranın üstünden bir kez dökülen renkli blok konfetisi. Yeniden tetiklemek için key değiştir. */
export const Confetti: React.FC = () => {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * MAX_START_DELAY_MS,
        duration: MIN_FALL_MS + Math.random() * FALL_VARIANCE_MS,
        sway: (Math.random() - 0.5) * MAX_SWAY,
        spin: (Math.random() - 0.5) * 720,
        width: 8 + Math.random() * 6,
        height: 10 + Math.random() * 8,
        color: PIECE_COLORS[i % PIECE_COLORS.length].base,
      })),
    [width],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPieceView key={i} piece={piece} fallDistance={height + 40} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: -20,
    borderRadius: 3,
  },
});
