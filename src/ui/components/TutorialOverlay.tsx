import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';

type Props = {
  visible: boolean;
  onComplete: () => void;
};

const STEPS = [
  {
    icon: 'hand-left-outline' as const,
    title: 'Drag & Drop',
    description: 'Drag pieces onto the board to place them',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Tap to Rotate',
    description: 'Tap a piece to rotate it before placing',
  },
  {
    icon: 'star-outline' as const,
    title: 'Fill the Board!',
    description: 'Place all pieces to complete the level',
  },
];

export const TutorialOverlay: React.FC<Props> = ({ visible, onComplete }) => {
  const [step, setStep] = useState(0);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = 30;
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, step, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.iconCircle}>
          <Icon name={currentStep.icon} size={48} color={colors.primary} />
        </View>

        <LabelButton style={styles.title}>{currentStep.title}</LabelButton>
        <LabelButton style={styles.description}>
          {currentStep.description}
        </LabelButton>

        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        <LabelButton
          pressableProps={{
            onPress: handleNext,
            style: styles.button,
          }}
          style={styles.buttonText}
        >
          {isLastStep ? 'Got it!' : 'Next'}
        </LabelButton>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  card: {
    backgroundColor: colors.background.cream,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxxxl,
    alignItems: 'center',
    width: '80%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(238, 85, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brown.light,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xxxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: colors.text.light,
    fontSize: typography.fontSize.xl + 4,
    fontWeight: typography.fontWeight.bold,
  },
});
