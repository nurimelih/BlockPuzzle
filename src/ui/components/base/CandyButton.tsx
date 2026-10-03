import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { CandyColor } from '../../../theme';
import { HapticsManager } from '../../../services/HapticsManager.ts';

const DEFAULT_DEPTH = 6;
const DEFAULT_RADIUS = 20;
const PRESS_IN_MS = 60;
// Basılıyken yüz tamamen dibe inmesin; biraz kalınlık kalınca daha "fiziksel" hissettiriyor
const PRESSED_DEPTH_RATIO = 0.25;

type Props = {
  onPress: () => void;
  color: CandyColor;
  depth?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children: React.ReactNode;
};

export const CandyButton: React.FC<Props> = ({
  onPress,
  color,
  depth = DEFAULT_DEPTH,
  radius = DEFAULT_RADIUS,
  style,
  contentStyle,
  accessibilityLabel,
  children,
}) => {
  const pressed = useSharedValue(0);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pressed.value, [0, 1], [-depth, -depth * PRESSED_DEPTH_RATIO]),
      },
    ],
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: PRESS_IN_MS });
    HapticsManager.impactLight();
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 12, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ marginTop: depth }, style]}
    >
      <View style={[styles.base, { borderRadius: radius, backgroundColor: color.shadow }]}>
        <Animated.View
          style={[
            styles.face,
            { borderRadius: radius, backgroundColor: color.base },
            faceStyle,
            contentStyle,
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.gloss,
              { borderRadius: radius - 4, backgroundColor: color.highlight },
            ]}
          />
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: '40%',
    opacity: 0.35,
  },
});
