import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { formatTime } from '../../core/utils.ts';
import { calculateScore } from '../../core/scoring.ts';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  levelNumber: number;
  moves: number;
  time: number;
  pieceCount: number;
  boardSize: number;
  hintCount: number;
  isLastLevel: boolean;
  isDaily?: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onHome: () => void;
};


type StarProps = {
  filled: 'full' | 'half' | 'empty';
  size: number;
};

// TODO: yıldızların içinin dolması animasyonlu olacak. soldan ve sağdan dolarak ortada buluşacak tam puansa
// tam puan değilse ortası açık kalacak puana göre. 2 puansa mesela sadece sağda ve soldaki yıldız dolacak.
// DÜŞÜN: alternatif olarak ortadaki büyük yıldızı yukarı doğru yükseltebiliriz pozisyon olarak
// boş yıldızları doldurma işi aşağıdan başlar. yıldızlar üçgen gibi konumlanır  bu şekilde => .*.
const Star: React.FC<StarProps> = ({ filled, size }) => {
  const iconName =
    filled === 'full'
      ? 'star'
      : filled === 'half'
        ? 'star-half'
        : 'star-outline';

  const iconColor =
    filled === 'empty' ? colors.brown.light : '#FFD700';

  return (
    <View style={starStyles.container}>
      <Icon name={iconName} size={size} color={iconColor} />
    </View>
  );
};

const starStyles = StyleSheet.create({
  container: {
    marginHorizontal: 2,
  },
});

function getStarStates(stars: number): [StarProps['filled'], StarProps['filled'], StarProps['filled']] {
  const result: [StarProps['filled'], StarProps['filled'], StarProps['filled']] = ['empty', 'empty', 'empty'];
  for (let i = 0; i < 3; i++) {
    const remaining = stars - i;
    if (remaining >= 1) {
      result[i] = 'full';
    } else if (remaining >= 0.5) {
      result[i] = 'half';
    }
  }
  return result;
}

export const WinScreen: React.FC<Props> = ({
  visible,
  levelNumber,
  moves,
  time,
  pieceCount,
  boardSize,
  hintCount,
  isLastLevel,
  isDaily,
  onNextLevel,
  onRestart,
  onHome,
}) => {
  const { t } = useTranslation();
  const translateY = useSharedValue(visible ? 0 : 800);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = 800;
    }
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const scoreResult = calculateScore({ moves, time, hintCount, pieceCount, boardSize });
  const { stars, score, grade } = scoreResult;
  const [star1, star2, star3] = getStarStates(stars);

  return (
    <View style={styles.container}>
      <View style={styles.backdrop} />
      <Animated.View style={[styles.card, animatedStyle]}>
        <LabelButton style={styles.title}>
          {isDaily ? t('daily.winTitle') : t('win.levelComplete', { number: levelNumber + 1 })}
        </LabelButton>
        <LabelButton style={styles.subtitle}>{t('win.complete')}</LabelButton>

        {/* Stars */}
        <View style={styles.starsRow}>
          <Star filled={star1} size={48} />
          <Star filled={star2} size={64} />
          <Star filled={star3} size={48} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="footsteps-outline" size={20} color={colors.brown.medium} />
            <LabelButton style={styles.statValue}>{moves}</LabelButton>
            <LabelButton style={styles.statLabel}>{t('win.moves')}</LabelButton>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Icon name="time-outline" size={20} color={colors.brown.medium} />
            <LabelButton style={styles.statValue}>{formatTime(time)}</LabelButton>
            <LabelButton style={styles.statLabel}>{t('win.time')}</LabelButton>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Icon name="trophy-outline" size={20} color={colors.brown.medium} />
            <LabelButton style={styles.statValue}>{score}</LabelButton>
            <LabelButton style={styles.statLabel}>{t('win.score')}</LabelButton>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {isDaily ? (
            <LabelButton
              pressableProps={{
                onPress: onHome,
                style: styles.primaryButton,
              }}
              style={styles.primaryButtonText}
            >
              {t('common.home')}
            </LabelButton>
          ) : !isLastLevel ? (
            <LabelButton
              pressableProps={{
                onPress: onNextLevel,
                style: styles.primaryButton,
              }}
              style={styles.primaryButtonText}
            >
              {t('common.nextLevel')}
            </LabelButton>
          ) : (
            <LabelButton style={styles.completionText}>
              {t('win.allCompleted')}
            </LabelButton>
          )}

          <View style={styles.secondaryRow}>
            <LabelButton
              pressableProps={{
                onPress: onRestart,
                style: styles.secondaryButton,
              }}
              style={styles.secondaryButtonText}
            >
              {t('common.retry')}
            </LabelButton>

            <LabelButton
              pressableProps={{
                onPress: onHome,
                style: styles.secondaryButton,
              }}
              style={styles.secondaryButtonText}
            >
              {t('common.home')}
            </LabelButton>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: colors.background.cream,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxxxl,
    alignItems: 'center',
    width: '85%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: typography.fontSize.xxxl + 8,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93, 64, 55, 0.08)',
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.brown.light,
    opacity: 0.3,
    marginHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text.light,
    fontSize: typography.fontSize.xl + 4,
    fontWeight: typography.fontWeight.bold,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
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
    textAlign: 'center',
  },
});
