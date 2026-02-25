import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography, shadows, buttons } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
              {t('game.level', { number: currentLevelNumber + 1 })} - {t('win.complete')}
            </LabelButton>
          ) : (
            <LabelButton style={styles.title}>{t('game.paused')}</LabelButton>
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
                {t('common.nextLevel')}
              </LabelButton>
            )}

            {isWin && isLastLevel && (
              <LabelButton style={styles.completionText}>
                {t('win.allCompleted')}
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
                {t('common.resume')}
              </LabelButton>
            )}

            <LabelButton
              pressableProps={{
                onPress: onRestart,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              {t('game.restartLevel')}
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onPreviousLevel,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              {t('game.previousLevel')}
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onSettings,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              {t('common.settings')}
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onHome,
                style: [styles.secondaryButton],
              }}
              style={styles.secondaryButtonText}
            >
              {t('common.home')}
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
    ...shadows.menu,
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
    ...buttons.primary,
    width: '100%',
  },
  primaryButtonText: {
    ...buttons.primaryText,
  },
  secondaryButton: {
    ...buttons.secondary,
    width: '100%',
  },
  secondaryButtonText: {
    ...buttons.secondaryText,
  },
  completionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
