import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../types/navigation.ts';
import type { Postcard } from '../../types/types.ts';
import { colors, spacing, typography } from '../../theme';
import { Text } from '../components/base/Text.tsx';
import { CandyButton } from '../components/base/CandyButton.tsx';
import { PostcardTiles } from '../components/PostcardTiles.tsx';
import { GameStorage } from '../../services/GameStorage.ts';
import { useAppStore } from '../../state/useAppStore.ts';
import { localize } from '../../state/postcards.ts';
import {
  LEVELS_PER_STOP,
  getCompletedStopCount,
  getRevealedCount,
} from '../../core/journey.ts';

type Props = NativeStackScreenProps<RootStackParamList, 'Album'>;

const COLUMNS = 2;
const CARD_ASPECT = 3 / 4;
const LOCKED_OPACITY = 0.45;
const ENTER_STAGGER_MS = 60;

type AlbumItem = {
  index: number;
  postcard: Postcard;
  revealedCount: number;
};

export const AlbumScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const postcards = useAppStore(state => state.postcards);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [viewing, setViewing] = useState<Postcard | null>(null);

  useFocusEffect(
    useCallback(() => {
      GameStorage.getHighestUnlockedLevel().then(setHighestUnlocked);
    }, []),
  );

  // Kartpostal i, ilk kez i. durakta kullanılır; o durağın ilerlemesi kartı belirler
  const items: AlbumItem[] = postcards.map((postcard, index) => ({
    index,
    postcard,
    revealedCount: getRevealedCount(highestUnlocked, index),
  }));
  const collectedCount = Math.min(getCompletedStopCount(highestUnlocked), postcards.length);

  const cardWidth = (screenWidth - spacing.xxl * 2 - spacing.lg * (COLUMNS - 1)) / COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT;

  const renderItem = ({ item }: { item: AlbumItem }) => {
    const isComplete = item.revealedCount === LEVELS_PER_STOP;
    const isLocked = item.revealedCount === 0;
    const title = isComplete
      ? localize(item.postcard.title, i18n.language) ?? t('journey.stop', { number: item.index + 1 })
      : t('journey.stop', { number: item.index + 1 });
    const subtitle = isComplete
      ? undefined
      : isLocked
        ? t('journey.unlockHint', { number: item.index + 1 })
        : t('journey.levelsLeft', { count: LEVELS_PER_STOP - item.revealedCount });

    return (
      <Animated.View
        entering={FadeInDown.delay(item.index * ENTER_STAGGER_MS).springify()}
        style={[styles.cell, { width: cardWidth }]}
      >
        <Pressable
          disabled={!isComplete}
          onPress={() => setViewing(item.postcard)}
          style={({ pressed }) => [pressed && styles.pressed, isLocked && { opacity: LOCKED_OPACITY }]}
          accessibilityRole={isComplete ? 'button' : undefined}
          accessibilityLabel={title}
        >
          <PostcardTiles
            postcard={item.postcard}
            width={cardWidth}
            height={cardHeight}
            revealedCount={item.revealedCount}
          />
        </Pressable>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CandyButton
          onPress={() => navigation.goBack()}
          color={colors.accent.brown}
          radius={16}
          depth={4}
          contentStyle={styles.backFace}
          accessibilityLabel={t('common.home')}
        >
          <Icon name="arrow-back" size={24} color={colors.textOnDark.primary} />
        </CandyButton>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>{t('journey.album')}</Text>
          <Text style={styles.subtitle}>
            {t('journey.collected', { count: collectedCount, total: postcards.length })}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => String(item.index)}
        numColumns={COLUMNS}
        renderItem={renderItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={viewing !== null} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <Pressable style={styles.viewer} onPress={() => setViewing(null)}>
          {viewing && (
            <>
              <Image source={viewing.source} style={styles.viewerImage} contentFit="contain" />
              <View style={styles.viewerTexts}>
                <Text style={styles.viewerTitle}>{localize(viewing.title, i18n.language)}</Text>
                {viewing.caption && (
                  <Text style={styles.viewerCaption}>{localize(viewing.caption, i18n.language)}</Text>
                )}
              </View>
            </>
          )}
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backFace: {
    width: 48,
    height: 48,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxxl,
    color: colors.textOnDark.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textOnDark.secondary,
  },
  list: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
  },
  row: {
    gap: spacing.lg,
  },
  cell: {
    gap: spacing.xs,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.textOnDark.primary,
    marginTop: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textOnDark.secondary,
  },
  viewer: {
    flex: 1,
    backgroundColor: colors.surface.scrimStrong,
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  viewerImage: {
    width: '100%',
    height: '70%',
    borderRadius: spacing.borderRadius.xl,
  },
  viewerTexts: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 30,
    color: colors.textOnDark.primary,
    textAlign: 'center',
  },
  viewerCaption: {
    fontSize: typography.fontSize.lg,
    color: colors.textOnDark.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
