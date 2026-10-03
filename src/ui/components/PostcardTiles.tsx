import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { PIECE_COLORS, colors, typography } from '../../theme';
import { QUADRANTS } from '../../core/journey.ts';
import { Text } from './base/Text.tsx';
import { HapticsManager } from '../../services/HapticsManager.ts';
import type { Postcard } from '../../types/types.ts';

// Kapakların arasındaki ince boşluk resmin "parçalara bölünmüş" olduğunu hissettirir
const COVER_GAP = 2;
const COVER_COLOR_INDICES = [1, 4, 5, 3];
const REVEAL_POP_SCALE = 1.12;
const REVEAL_FLASH_OPACITY = 0.8;

type CoverProps = {
  index: number;
  width: number;
  height: number;
  revealing: boolean;
  revealDelayMs: number;
  showMark: boolean;
};

const Cover: React.FC<CoverProps> = ({ index, width, height, revealing, revealDelayMs, showMark }) => {
  const { col, row } = QUADRANTS[index];
  const color = PIECE_COLORS[COVER_COLOR_INDICES[index]];
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!revealing) return;
    progress.value = withDelay(
      revealDelayMs,
      withSequence(
        withSpring(0.3, { damping: 6, stiffness: 260 }),
        withTiming(1, { duration: 320 }, finished => {
          if (finished) scheduleOnRN(HapticsManager.impactMedium);
        }),
      ),
    );
  }, [revealing, revealDelayMs, progress]);

  // 0 → 0.3: kapak şişer (gerilim), 0.3 → 1: dönerek küçülüp kaybolur
  const animatedStyle = useAnimatedStyle(() => {
    const popPhase = Math.min(progress.value / 0.3, 1);
    const vanishPhase = Math.max((progress.value - 0.3) / 0.7, 0);
    return {
      opacity: 1 - vanishPhase,
      transform: [
        { scale: (1 + popPhase * (REVEAL_POP_SCALE - 1)) * (1 - vanishPhase) },
        { rotate: `${vanishPhase * 25}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.cover,
        {
          left: col * width + COVER_GAP,
          top: row * height + COVER_GAP,
          width: width - COVER_GAP * 2,
          height: height - COVER_GAP * 2,
          backgroundColor: color.base,
          borderBottomColor: color.shadow,
          borderRadius: Math.min(width, height) * 0.16,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.coverGloss, { backgroundColor: color.highlight }]} />
      {showMark && <Text style={[styles.coverMark, { fontSize: Math.min(width, height) * 0.42 }]}>?</Text>}
    </Animated.View>
  );
};

const Flash: React.FC<{ index: number; width: number; height: number; delayMs: number }> = ({
  index,
  width,
  height,
  delayMs,
}) => {
  const { col, row } = QUADRANTS[index];
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withSequence(withTiming(REVEAL_FLASH_OPACITY, { duration: 120 }), withTiming(0, { duration: 600 })),
    );
  }, [delayMs, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.flash, { left: col * width, top: row * height, width, height }, animatedStyle]}
    />
  );
};

type Props = {
  postcard: Postcard;
  width: number;
  height: number;
  /** Açık parça sayısı; QUADRANTS sırasıyla ilk N parça açıktır. */
  revealedCount: number;
  /** Verilirse bu parçanın kapağı animasyonla kalkar (revealedCount buna dahil olmalı). */
  animateQuadrantIndex?: number | null;
  revealDelayMs?: number;
  showMarks?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PostcardTiles: React.FC<Props> = ({
  postcard,
  width,
  height,
  revealedCount,
  animateQuadrantIndex = null,
  revealDelayMs = 0,
  showMarks = true,
  style,
}) => {
  const quadrantWidth = width / 2;
  const quadrantHeight = height / 2;

  return (
    <View style={[styles.frame, { width, height, borderRadius: Math.min(width, height) * 0.08 }, style]}>
      <Image source={postcard.source} style={StyleSheet.absoluteFill} contentFit="cover" />
      {QUADRANTS.map((_, index) => {
        const isAnimating = index === animateQuadrantIndex;
        const isCovered = index >= revealedCount || isAnimating;
        if (!isCovered) return null;
        return (
          <Cover
            key={index}
            index={index}
            width={quadrantWidth}
            height={quadrantHeight}
            revealing={isAnimating}
            revealDelayMs={revealDelayMs}
            showMark={showMarks}
          />
        );
      })}
      {animateQuadrantIndex !== null && (
        <Flash
          index={animateQuadrantIndex}
          width={quadrantWidth}
          height={quadrantHeight}
          delayMs={revealDelayMs + 450}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surface.sheet,
    borderWidth: 3,
    borderColor: colors.textOnDark.primary,
  },
  cover: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 4,
  },
  coverGloss: {
    position: 'absolute',
    top: 4,
    left: 6,
    right: 6,
    height: '22%',
    borderRadius: 6,
    opacity: 0.4,
  },
  coverMark: {
    fontFamily: typography.fontFamily.bold,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  flash: {
    position: 'absolute',
    backgroundColor: colors.white,
  },
});
