import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadows } from '../../theme';
import { Text } from '../components/base/Text.tsx';
import { CandyButton } from '../components/base/CandyButton.tsx';
import { PostcardTiles } from '../components/PostcardTiles.tsx';
import { formatTime } from '../../core/utils.ts';
import { calculateScore } from '../../core/scoring.ts';
import { LEVELS_PER_STOP } from '../../core/journey.ts';
import { useTranslation } from 'react-i18next';
import type { Postcard } from '../../types/types.ts';

export type WinJourney = {
  postcard: Postcard;
  title: string;
  revealedAfter: number;
  newQuadrantIndex: number | null;
};

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
  journey?: WinJourney;
  onNextLevel: () => void;
  onRestart: () => void;
  onHome: () => void;
  onLeaderboard: () => void;
};

type StarFill = 'full' | 'half' | 'empty';

const CARD_ENTER_OFFSET = 600;
const POSTCARD_WIDTH = 168;
const POSTCARD_HEIGHT = 224;
// Kart yerine oturduktan sonra parça açılsın ki oyuncu anı kaçırmasın
const POSTCARD_REVEAL_DELAY_MS = 650;

const AnimatedStar: React.FC<{
  filled: StarFill;
  size: number;
  delayMs: number;
  isCenter?: boolean;
}> = ({ filled, size, delayMs, isCenter }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 0;
    opacity.value = 0;
    if (filled !== 'empty') {
      scale.value = withDelay(
        delayMs,
        withSequence(
          withSpring(1.35, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 300 }),
        ),
      );
      opacity.value = withDelay(delayMs, withTiming(1, { duration: 150 }));
    } else {
      scale.value = withDelay(delayMs, withTiming(1, { duration: 200 }));
      opacity.value = withDelay(delayMs, withTiming(1, { duration: 200 }));
    }
  }, [filled, delayMs, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconName = filled === 'full' ? 'star' : filled === 'half' ? 'star-half' : 'star-outline';
  const iconColor = filled === 'empty' ? colors.textOnDark.muted : colors.accent.star;

  return (
    <Animated.View style={[starStyles.star, isCenter && starStyles.centerStar, animStyle]}>
      <Icon name={iconName} size={size} color={iconColor} />
    </Animated.View>
  );
};

const starStyles = StyleSheet.create({
  star: { marginHorizontal: 4 },
  centerStar: { marginBottom: 8 },
});

function getStarStates(stars: number): [StarFill, StarFill, StarFill] {
  const result: [StarFill, StarFill, StarFill] = ['empty', 'empty', 'empty'];
  for (let i = 0; i < 3; i++) {
    const remaining = stars - i;
    if (remaining >= 1) result[i] = 'full';
    else if (remaining >= 0.5) result[i] = 'half';
  }
  return result;
}

const GRADE_COLOR: Record<string, string> = {
  S: '#FF6B35',
  A: '#4CAF50',
  B: '#42A5F5',
  C: '#9E9E9E',
};

const JourneyProgress: React.FC<{ journey: WinJourney }> = ({ journey }) => {
  const { t } = useTranslation();
  const remaining = LEVELS_PER_STOP - journey.revealedAfter;

  return (
    <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.journey}>
      <View style={styles.postcardTilt}>
        <PostcardTiles
          postcard={journey.postcard}
          width={POSTCARD_WIDTH}
          height={POSTCARD_HEIGHT}
          revealedCount={journey.revealedAfter}
          animateQuadrantIndex={journey.newQuadrantIndex}
          revealDelayMs={POSTCARD_REVEAL_DELAY_MS}
        />
      </View>
      <Text style={styles.journeyTitle}>{journey.title}</Text>
      <View style={styles.journeyDots}>
        {Array.from({ length: LEVELS_PER_STOP }, (_, i) => (
          <View key={i} style={[styles.dot, i < journey.revealedAfter && styles.dotFilled]} />
        ))}
      </View>
      {remaining > 0 && (
        <Text style={styles.journeyHint}>{t('journey.levelsLeft', { count: remaining })}</Text>
      )}
    </Animated.View>
  );
};

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
  journey,
  onNextLevel,
  onRestart,
  onHome,
  onLeaderboard,
}) => {
  const { t } = useTranslation();

  const cardY = useSharedValue(CARD_ENTER_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const scoreAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardY.value = CARD_ENTER_OFFSET;
      backdropOpacity.value = 0;
      scoreAnim.value = 0;

      backdropOpacity.value = withTiming(1, { duration: 300 });
      cardY.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.back(1.4)) });
      scoreAnim.value = withDelay(500, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    } else {
      cardY.value = CARD_ENTER_OFFSET;
      backdropOpacity.value = 0;
    }
  }, [visible, cardY, backdropOpacity, scoreAnim]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
  }));
  const scoreStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scoreAnim.value, [0, 0.3], [0, 1]),
    transform: [{ scale: interpolate(scoreAnim.value, [0, 0.5, 1], [0.7, 1.05, 1]) }],
  }));

  if (!visible) return null;

  const { stars, score, grade } = calculateScore({ moves, time, hintCount, pieceCount, boardSize });
  const [star1, star2, star3] = getStarStates(stars);
  const gradeColor = GRADE_COLOR[grade] ?? colors.primary;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => {}} />
      </Animated.View>

      <View style={styles.journeyArea} pointerEvents="none">
        {journey && <JourneyProgress journey={journey} />}
      </View>

      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.header}>
          <Text style={styles.levelLabel}>
            {isDaily ? t('daily.winTitle') : t('win.levelComplete', { number: levelNumber + 1 })}
          </Text>
        </View>

        <View style={styles.starsSection}>
          <Animated.View style={[styles.gradeBadge, { backgroundColor: gradeColor }, scoreStyle]}>
            <Text style={styles.gradeText}>{grade}</Text>
          </Animated.View>

          <View style={styles.starsTriangle}>
            <View style={styles.starsTopRow}>
              <AnimatedStar filled={star2} size={56} delayMs={200} isCenter />
            </View>
            <View style={styles.starsBottomRow}>
              <AnimatedStar filled={star1} size={40} delayMs={100} />
              <AnimatedStar filled={star3} size={40} delayMs={300} />
            </View>
          </View>

          <Animated.View style={[styles.scoreBadge, scoreStyle]}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>{t('win.score')}</Text>
          </Animated.View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="footsteps-outline" size={18} color={colors.textOnDark.secondary} />
            <Text style={styles.statValue}>{moves}</Text>
            <Text style={styles.statLabel}>{t('win.moves')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="time-outline" size={18} color={colors.textOnDark.secondary} />
            <Text style={styles.statValue}>{formatTime(time)}</Text>
            <Text style={styles.statLabel}>{t('win.time')}</Text>
          </View>
          {hintCount > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="bulb-outline" size={18} color={colors.textOnDark.secondary} />
                <Text style={styles.statValue}>{hintCount}</Text>
                <Text style={styles.statLabel}>{t('win.hints')}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actions}>
          {isDaily ? (
            <CandyButton onPress={onHome} color={colors.accent.yellow} contentStyle={styles.primaryFace}>
              <Text style={styles.primaryBtnText}>{t('common.home')}</Text>
            </CandyButton>
          ) : !isLastLevel ? (
            <CandyButton onPress={onNextLevel} color={colors.accent.yellow} contentStyle={styles.primaryFace}>
              <View style={styles.primaryRow}>
                <Text style={styles.primaryBtnText}>{t('common.nextLevel')}</Text>
                <Icon name="arrow-forward" size={22} color={colors.text.primary} />
              </View>
            </CandyButton>
          ) : (
            <View style={styles.completedBanner}>
              <Icon name="checkmark-circle" size={22} color={colors.textOnDark.primary} />
              <Text style={styles.completedText}>{t('win.allCompleted')}</Text>
            </View>
          )}

          <View style={styles.secondaryRow}>
            <Pressable style={styles.iconBtn} onPress={onRestart}>
              <Icon name="refresh" size={22} color={colors.textOnDark.secondary} />
              <Text style={styles.iconBtnLabel}>{t('common.retry')}</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onHome}>
              <Icon name="home-outline" size={22} color={colors.textOnDark.secondary} />
              <Text style={styles.iconBtnLabel}>{t('common.home')}</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onLeaderboard}>
              <Icon name="podium-outline" size={22} color={colors.textOnDark.secondary} />
              <Text style={styles.iconBtnLabel}>{t('leaderboard.title')}</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: spacing.xxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface.scrim,
  },

  // Journey
  journeyArea: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journey: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  postcardTilt: {
    transform: [{ rotate: '-3deg' }],
    ...shadows.card,
  },
  journeyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textOnDark.primary,
    marginTop: spacing.xs,
  },
  journeyDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface.cardBorder,
  },
  dotFilled: {
    backgroundColor: colors.accent.yellow.base,
  },
  journeyHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textOnDark.secondary,
  },

  // Card
  card: {
    backgroundColor: colors.surface.sheet,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xxl,
    width: '94%',
    ...shadows.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.textOnDark.primary,
  },

  starsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  starsTriangle: {
    alignItems: 'center',
    flex: 1,
  },
  starsTopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -6,
  },
  starsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gradeBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.textOnDark.primary,
  },
  scoreBadge: {
    width: 64,
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    color: colors.textOnDark.primary,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textOnDark.secondary,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.textOnDark.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textOnDark.secondary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.surface.cardBorder,
    alignSelf: 'center',
  },

  actions: {
    gap: spacing.sm,
  },
  primaryFace: {
    paddingVertical: spacing.md,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.accent.green.base,
  },
  completedText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.textOnDark.primary,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
  },
  iconBtnLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textOnDark.secondary,
  },
});
