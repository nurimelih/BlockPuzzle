import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';

type Props = {
  visible: boolean;
  isWin: boolean;
  onNextLevel: () => void;
  onPreviousLevel: () => void;
  onRestart: () => void;
  onHome: () => void;
  onSettings: () => void;
  currentLevelNumber: number;
  isLastLevel: boolean;
  onDismiss: () => void;
};

export const MenuOverlay: React.FC<Props> = ({
  visible,
  isWin,
  onNextLevel,
  onPreviousLevel,
  onRestart,
  onHome,
  onSettings,
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
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <Animated.View style={[styles.overlay, animatedStyle]}>
          {isWin ? (
            <LabelButton style={styles.title}>
              Level {currentLevelNumber + 1} Complete!
            </LabelButton>
          ) : (
            <LabelButton style={styles.title}>Paused</LabelButton>
          )}

          <View style={styles.buttonContainer}>
            {isWin && !isLastLevel && (
              <LabelButton
                pressableProps={{
                  onPress: onNextLevel,
                  style: [styles.primaryButton],
                }}
                style={styles.primaryButtonText}
              >
                Next Level
              </LabelButton>
            )}

            {isWin && isLastLevel && (
              <LabelButton style={styles.completionText}>
                All levels completed!
              </LabelButton>
            )}

            {!isWin && (
              <LabelButton
                pressableProps={{
                  onPress: onDismiss,
                  style: [styles.primaryButton],
                }}
                style={styles.primaryButtonText}
              >
                Resume
              </LabelButton>
            )}

            <LabelButton
              pressableProps={{
                onPress: onRestart,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              Restart Level
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onPreviousLevel,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              Previous Level
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onSettings,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              Settings
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onHome,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              Home
            </LabelButton>
          </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 9,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text.light,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  secondaryButton: {
    backgroundColor: colors.piece.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  completionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
