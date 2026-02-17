import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';

type HeaderProps = {
  currentLevelNumber: number;
  moveCount: number;
  gameTime: string;
  onLevelPress: () => void;
  onMenuPress: () => void;
  onBackPress: () => void;
};

export const GameHeader: React.FC<HeaderProps> = React.memo(({
  currentLevelNumber,
  moveCount,
  gameTime,
  onLevelPress,
  onMenuPress,
  onBackPress,
}) => {
  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.iconShadow}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </View>
        </Pressable>
        <LabelButton style={styles.levelText} onPress={onLevelPress}>
          Level {currentLevelNumber + 1}
        </LabelButton>
        <LabelButton style={styles.movesText}>Moves {moveCount}</LabelButton>
      </View>

      <View style={styles.timerRow}>
        <LabelButton style={styles.timerText}>{gameTime}</LabelButton>
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
  onMenuPress: () => void;
  onHintPress: () => void;
  onMusicToggle: () => void;
};

export const GameFooter: React.FC<FooterProps> = React.memo(({
  isOver,
  isMusicMuted,
  shouldShowHintButton,
  freeHints = 0,
  onMenuPress,
  onHintPress,
  onMusicToggle,
}) => {
  return (
    <View style={styles.footerIcons}>
      <Pressable onPress={onMenuPress} style={styles.footerIcon}>
        <View style={styles.iconShadow}>
          <Icon name="settings-outline" size={22} color={colors.white} />
        </View>
      </Pressable>
      {!isOver && shouldShowHintButton && (
        <Pressable onPress={onHintPress} style={styles.footerIcon}>
          <View style={styles.iconShadow}>
            <Icon name="bulb-outline" size={22} color={colors.white} />
          </View>
          {freeHints > 0 && (
            <View style={styles.hintBadge}>
              <Text style={styles.hintBadgeText}>{freeHints}</Text>
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  movesText: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
    shadowColor: 'rgba(0, 0, 0, 0.75)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
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
