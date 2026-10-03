import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { Text } from './base/Text.tsx';
import { CandyButton } from './base/CandyButton.tsx';
import { PostcardTiles } from './PostcardTiles.tsx';
import { Confetti } from './Confetti.tsx';
import { HapticsManager } from '../../services/HapticsManager.ts';
import { LEVELS_PER_STOP } from '../../core/journey.ts';
import type { Postcard } from '../../types/types.ts';

// Sahne sırası: kart gelir → son parça kırılır → konfeti + başlık → buton
const LAST_PIECE_DELAY_MS = 700;
const CELEBRATE_DELAY_MS = 1250;
const BUTTON_DELAY_MS = 1900;

const CARD_ASPECT = 3 / 4;
const CARD_MAX_HEIGHT_RATIO = 0.55;
const SCREEN_GUTTER = 48;

type Props = {
  visible: boolean;
  postcard: Postcard;
  title: string;
  caption?: string;
  stopNumber: number;
  onContinue: () => void;
};

export const PostcardReveal: React.FC<Props> = ({
  visible,
  postcard,
  title,
  caption,
  stopNumber,
  onContinue,
}) => {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCelebrating(false);
      return;
    }
    const timer = setTimeout(() => {
      setCelebrating(true);
      HapticsManager.notificationSuccess();
    }, CELEBRATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const cardWidth = Math.min(
    screenWidth - SCREEN_GUTTER * 2,
    screenHeight * CARD_MAX_HEIGHT_RATIO * CARD_ASPECT,
  );
  const cardHeight = cardWidth / CARD_ASPECT;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.container}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.kicker}>{t('journey.stop', { number: stopNumber })}</Text>
      </Animated.View>

      <Animated.View entering={ZoomIn.springify().damping(14)}>
        <View style={styles.cardShadow}>
          <PostcardTiles
            postcard={postcard}
            width={cardWidth}
            height={cardHeight}
            revealedCount={LEVELS_PER_STOP}
            animateQuadrantIndex={LEVELS_PER_STOP - 1}
            revealDelayMs={LAST_PIECE_DELAY_MS}
          />
        </View>
      </Animated.View>

      <View style={styles.textBlock}>
        {celebrating && (
          <>
            <Animated.View entering={FadeInDown.springify()}>
              <Text style={styles.title}>{title}</Text>
            </Animated.View>
            {caption && (
              <Animated.View entering={FadeInDown.delay(120).springify()}>
                <Text style={styles.caption}>{caption}</Text>
              </Animated.View>
            )}
            <Animated.View entering={ZoomIn.delay(260).springify()} style={styles.albumChip}>
              <Icon name="images" size={16} color={colors.text.primary} />
              <Text style={styles.albumChipText}>{t('journey.addedToAlbum')}</Text>
            </Animated.View>
          </>
        )}
      </View>

      <Animated.View entering={FadeInDown.delay(BUTTON_DELAY_MS).springify()} style={styles.buttonWrap}>
        <CandyButton
          onPress={onContinue}
          color={colors.accent.yellow}
          radius={24}
          contentStyle={styles.buttonFace}
          accessibilityLabel={t('common.continue')}
        >
          <Text style={styles.buttonText}>{t('common.continue')}</Text>
        </CandyButton>
      </Animated.View>

      {celebrating && <Confetti />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface.scrimStrong,
  },
  kicker: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent.yellow.base,
  },
  cardShadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    transform: [{ rotate: '-2deg' }],
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 120,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    color: colors.textOnDark.primary,
    textAlign: 'center',
  },
  caption: {
    fontSize: typography.fontSize.lg,
    color: colors.textOnDark.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  albumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.accent.yellow.base,
  },
  albumChipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  buttonWrap: {
    alignSelf: 'stretch',
  },
  buttonFace: {
    paddingVertical: spacing.md,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
  },
});
