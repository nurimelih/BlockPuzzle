import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadows } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  currentLevelNumber: number;
  moveCount: number;
  gameTime: string;
  // Countdown is about to run out
  isTimeCritical?: boolean;
  winStreak?: number;
  title?: string;
  onLevelPress?: () => void;
  onMenuPress: () => void;
  onBackPress: () => void;
};

export const GameHeader: React.FC<HeaderProps> = React.memo(({
  currentLevelNumber,
  moveCount,
  gameTime,
  isTimeCritical = false,
  winStreak = 0,
  title,
  onLevelPress,
  onMenuPress,
  onBackPress,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.iconShadow}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </View>
        </Pressable>
        <LabelButton style={styles.levelText} onPress={onLevelPress}>
          {title ?? t('game.level', { number: currentLevelNumber + 1 })}
        </LabelButton>
        <LabelButton style={styles.movesText}>{t('game.moves', { count: moveCount })}</LabelButton>
      </View>

      <View style={styles.timerRow}>
        <LabelButton style={[styles.timerText, isTimeCritical && styles.timerCritical]}>
          {gameTime}
        </LabelButton>
        {winStreak > 0 && (
          <View style={styles.streakBadge}>
            <View style={styles.iconShadow}>
              <Icon name="flame" size={18} color="#FF6B35" />
            </View>
            <LabelButton style={styles.streakText}>{winStreak}</LabelButton>
          </View>
        )}
      </View>

      <Pressable onPress={onMenuPress} />
    </View>
  );
});

type FooterProps = {
  isOver: boolean;
  isMusicMuted: boolean;
  shouldShowHintButton: boolean;
  freeHints?: number;
  // Nudge the player towards the hint when a timed level is running out
  showHintNudge?: boolean;
  onMenuPress: () => void;
  onHintPress: () => void;
  onMusicToggle: () => void;
};

export const GameFooter: React.FC<FooterProps> = React.memo(({
  isOver,
  isMusicMuted,
  shouldShowHintButton,
  freeHints = 0,
  showHintNudge = false,
  onMenuPress,
  onHintPress,
  onMusicToggle,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.footerIcons}>
      <Pressable onPress={onMenuPress} style={styles.footerIcon}>
        <View style={styles.iconShadow}>
          <Icon name="settings-outline" size={22} color={colors.white} />
        </View>
      </Pressable>
      {!isOver && shouldShowHintButton && (
        <Pressable onPress={onHintPress} style={styles.footerIcon} testID="hint-button">
          <View style={styles.iconShadow}>
            <Icon name="bulb-outline" size={22} color={colors.white} />
          </View>
          {freeHints > 0 && (
            <View style={styles.hintBadge}>
              <Text style={styles.hintBadgeText}>{freeHints}</Text>
            </View>
          )}
          {showHintNudge && (
            <View style={styles.hintNudge} pointerEvents="none">
              <LabelButton style={styles.hintNudgeText}>{t('game.hintNudge')}</LabelButton>
            </View>
          )}
        </Pressable>
      )}
      <Pressable onPress={onMusicToggle} style={styles.footerIcon}>
        <View style={styles.iconShadow}>
          <Icon
            name={isMusicMuted ? 'volume-mute' : 'musical-notes'}
            size={22}
            color={colors.white}
          />
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  headerRow: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  levelText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    ...shadows.text,
  },
  movesText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    ...shadows.text,
  },
  timerRow: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timerText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    ...shadows.text,
  },
  timerCritical: {
    color: '#FF5252',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
    gap: 2,
  },
  streakText: {
    fontSize: typography.fontSize.xl,
    color: '#FF6B35',
    ...shadows.text,
  },
  // Below the bulb: above it would cover the countdown
  hintNudge: {
    position: 'absolute',
    top: '100%',
    alignSelf: 'center',
    backgroundColor: colors.background.cream,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    width: 110,
    alignItems: 'center',
  },
  hintNudgeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  footerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerIcon: {
    padding: spacing.sm,
  },
  iconShadow: {
    ...shadows.icon,
  },
  hintBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  hintBadgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#333',
  },
});
