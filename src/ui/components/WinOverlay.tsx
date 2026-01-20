import React, { useEffect } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './AppText.tsx';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  currentLevelNumber: number;
  isLastLevel: boolean;
  onDismiss: () => void;
};

export const WinOverlay: React.FC<Props> = ({
  visible,
  onNextLevel,
  onRestart,
  currentLevelNumber,
  isLastLevel,
  onDismiss,
}) => {
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(500, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <Pressable style={styles.container} onPress={onDismiss}>
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, animatedStyle]}>
          <Text style={styles.title}>
            Level {currentLevelNumber + 1} Complete!
          </Text>

          <View style={styles.buttonContainer}>
            {!isLastLevel ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNextLevel}
              >
                <Text style={styles.primaryButtonText}>Next Level</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.completionText}>All levels completed!</Text>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRestart}
            >
              <Text style={styles.secondaryButtonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: colors.background.overlay,
    zIndex: 9,
  },
  overlay: {
    backgroundColor: colors.background.cream,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    shadowColor: colors.brown.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text.light,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.piece.base,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  completionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
