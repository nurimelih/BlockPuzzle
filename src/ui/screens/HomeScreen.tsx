import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, PIECE_COLORS, spacing, typography } from '../../theme';
import type { CandyColor } from '../../theme';
import { Text } from '../components/base/Text.tsx';
import { CandyTile } from '../components/base/CandyTile.tsx';
import { CandyButton } from '../components/base/CandyButton.tsx';
import DeviceInfo from 'react-native-device-info';
import { useAppStore } from '../../state/useAppStore.ts';
import { fetchAdSettings } from '../../services/supabase.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import { HapticsManager } from '../../services/HapticsManager.ts';
import { PostcardTiles } from '../components/PostcardTiles.tsx';
import { useStopPostcard } from '../../state/useStopPostcard.ts';
import { LEVELS_PER_STOP, getRevealedCount, getStopIndex } from '../../core/journey.ts';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useDailyChallenge } from '../../state/useDailyChallenge.ts';
import Animated, {
  BounceIn,
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

const LOGO_TILE_SIZE = 54;
// Harflerin hafif eğik durması logoya "elle dizilmiş blok" hissi veriyor
const LOGO_TILE_ROTATIONS = [-6, 4, -3, 5, -4, 3, -5, 4];
const LOGO_TILE_COLOR_ORDER = [0, 3, 2, 1, 4, 6, 5];
const LOGO_STAGGER_MS = 80;

// Ana butonun hafif nefes alması oyuncunun gözünü doğrudan oraya çeker
const PULSE_SCALE = 1.035;
const PULSE_DURATION_MS = 1100;

const GLASS_BUTTON_SIZE = 44;
const JOURNEY_THUMB_WIDTH = 27;
const JOURNEY_THUMB_HEIGHT = 36;

const Logo: React.FC<{ title: string }> = ({ title }) => {
  // İlk kelime bloklarla, kalanı düz yazıyla — tek kelimeyse tamamı blok olur
  const [blockWord, ...rest] = title.toUpperCase().split(' ');
  const subtitle = rest.join(' ');

  return (
    <View style={styles.logo}>
      <View style={styles.logoTiles}>
        {blockWord.split('').map((letter, i) => (
          // entering animasyonu transform'u ezdiği için eğim iç view'da
          <Animated.View key={`${letter}-${i}`} entering={BounceIn.delay(i * LOGO_STAGGER_MS)}>
            <View style={{ transform: [{ rotate: `${LOGO_TILE_ROTATIONS[i % LOGO_TILE_ROTATIONS.length]}deg` }] }}>
              <CandyTile
                size={LOGO_TILE_SIZE}
                color={PIECE_COLORS[LOGO_TILE_COLOR_ORDER[i % LOGO_TILE_COLOR_ORDER.length]]}
              >
                <Text style={styles.logoLetter}>{letter}</Text>
              </CandyTile>
            </View>
          </Animated.View>
        ))}
      </View>
      {subtitle.length > 0 && (
        <Animated.View entering={FadeInDown.delay(blockWord.length * LOGO_STAGGER_MS + 100)}>
          <Text style={styles.logoSubtitle}>{subtitle}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const PulsingView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(PULSE_SCALE, { duration: PULSE_DURATION_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

type JourneyCardProps = {
  highestLevel: number;
  lastLevelIndex: number;
  onPress: () => void;
};

const JourneyCard: React.FC<JourneyCardProps> = ({ highestLevel, lastLevelIndex, onPress }) => {
  const { t } = useTranslation();
  // Tüm level'lar bitmişse son durakta kal
  const stopIndex = getStopIndex(Math.min(highestLevel, lastLevelIndex));
  const revealedCount = getRevealedCount(highestLevel, stopIndex);
  const { postcard, title } = useStopPostcard(stopIndex);
  const remaining = LEVELS_PER_STOP - revealedCount;

  // Küçük hap: yolculuk hatırlatıcısı olarak logonun altında durur, ana aksiyonlarla yarışmaz
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.journeyPill, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={t('journey.album')}
    >
      <PostcardTiles
        postcard={postcard}
        width={JOURNEY_THUMB_WIDTH}
        height={JOURNEY_THUMB_HEIGHT}
        revealedCount={revealedCount}
        showMarks={false}
        style={styles.journeyThumb}
      />
      <Text style={styles.journeyPillText} numberOfLines={1}>
        <Text style={styles.journeyPillKicker}>{t('journey.stop', { number: stopIndex + 1 })}</Text>
        {'  ·  '}
        {remaining > 0 ? t('journey.levelsLeft', { count: remaining }) : title}
      </Text>
      <Icon name="chevron-forward" size={16} color={colors.textOnDark.secondary} />
    </Pressable>
  );
};

type GlassIconButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

// Az kullanılan aksiyonlar: renksiz ve küçük, ana butonlarla dikkat yarışına girmesin
const GlassIconButton: React.FC<GlassIconButtonProps> = ({ icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    onPressIn={HapticsManager.impactLight}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={8}
    style={({ pressed }) => [styles.glassButton, pressed && styles.glassButtonPressed]}
  >
    <Icon name={icon} size={22} color={colors.textOnDark.primary} />
  </Pressable>
);

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const setCurrentScreen = useAppStore(state => state.setCurrentScreen);
  const setCurrentLevel = useAppStore(state => state.setCurrentLevel);
  const setAppSettings = useAppStore(state => state.setAppSettings);
  const levels = useAppStore(state => state.levels);
  const [highestLevel, setHighestLevel] = useState(0);
  const { level: dailyLevel, streak, completedToday, reload: reloadDaily } = useDailyChallenge();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('home');
      fetchAdSettings().then(response => {
        setAppSettings(response);
      });

      const loadProgress = async () => {
        const level = await GameStorage.getHighestUnlockedLevel();
        setHighestLevel(level);
        // Arka plan, oyuncunun şu an açmaya çalıştığı durağın resmini göstersin
        setCurrentLevel(Math.min(level, useAppStore.getState().levels.length - 1));
      };
      loadProgress();
      reloadDaily();

      if (__DEV__) {
        GameStorage.getAllSettings()
          .then(settings => console.log('All Settings', JSON.stringify(settings, null, 2)))
          .catch(e => console.log('error getting settings', e));
      }
    }, [setCurrentScreen, setCurrentLevel, setAppSettings, reloadDaily]),
  );

  const allLevelsCompleted = highestLevel >= levels.length;
  const hasProgress = highestLevel > 0;

  const handlePrimary = () => {
    if (allLevelsCompleted) {
      navigation.navigate('LevelSelect');
      return;
    }
    navigation.navigate('GameScreen', { levelNumber: highestLevel });
  };

  const handleDailyChallenge = () => {
    if (!dailyLevel) return;
    navigation.navigate('GameScreen', { levelNumber: 0, dailyChallenge: dailyLevel, mode: 'daily' });
  };

  const primaryLabel = allLevelsCompleted
    ? t('common.newGame')
    : hasProgress
      ? t('common.continue')
      : t('common.play');

  const dailySubtitle = completedToday
    ? t('home.dailyDone')
    : streak > 0
      ? t('home.streak', { count: streak })
      : t('home.dailyReady');

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(700)} style={styles.topBar}>
        <GlassIconButton
          icon="grid"
          label={t('home.levels')}
          onPress={() => navigation.navigate('LevelSelect')}
        />
        <View style={styles.topBarRight}>
          <GlassIconButton
            icon="trophy"
            label={t('leaderboard.title')}
            onPress={() => navigation.navigate('Leaderboard')}
          />
          <GlassIconButton
            icon="settings-sharp"
            label={t('common.settings')}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </Animated.View>

      <View style={styles.header}>
        <Logo title={t('home.title')} />
        <Animated.View entering={FadeInDown.delay(650)}>
          <JourneyCard
            highestLevel={highestLevel}
            lastLevelIndex={levels.length - 1}
            onPress={() => navigation.navigate('Album')}
          />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.actions}>
        <PulsingView>
          <CandyButton
            onPress={handlePrimary}
            color={colors.accent.cream}
            depth={5}
            radius={22}
            accessibilityLabel={primaryLabel}
            contentStyle={styles.primaryFace}
          >
            <View style={styles.primaryRow}>
              <Icon name="play" size={22} color={colors.text.primary} />
              <Text style={styles.primaryText}>{primaryLabel}</Text>
              {hasProgress && !allLevelsCompleted && (
                <Text style={styles.primaryLevel}>
                  {t('home.level', { number: highestLevel + 1 })}
                </Text>
              )}
            </View>
          </CandyButton>
        </PulsingView>

        <Pressable
          onPress={handleDailyChallenge}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('home.dailyChallenge')}
        >
          <Icon name="flame" size={26} color={colors.accent.flame} />
          <View style={styles.cardTexts}>
            <Text style={styles.cardTitle}>{t('home.dailyChallenge')}</Text>
            <Text style={[styles.cardSubtitle, streak > 0 && !completedToday && styles.dailyStreak]}>
              {dailySubtitle}
            </Text>
          </View>
          <Icon
            name={completedToday ? 'checkmark-circle' : 'chevron-forward'}
            size={26}
            color={completedToday ? colors.accent.green.base : colors.textOnDark.secondary}
          />
        </Pressable>
      </Animated.View>

      <Pressable
        style={styles.versionContainer}
        disabled={!__DEV__}
        onPress={() => {
          GameStorage.savePlayerNickname('').then(() => GameStorage.savePlayerId(''));
        }}
      >
        <Text style={styles.versionText}>
          v {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  logo: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoTiles: {
    flexDirection: 'row',
    gap: 6,
  },
  logoLetter: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    color: colors.textOnDark.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  logoSubtitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 46,
    letterSpacing: 8,
    color: colors.textOnDark.primary,
    // Büyük radius'lu glow iOS'ta animasyonlu view içinde kutu gibi render ediliyor; düz offset gölge kullan
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  actions: {
    gap: spacing.lg,
  },
  primaryFace: {
    paddingVertical: spacing.md,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  primaryLevel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    opacity: 0.75,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.xl,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardTexts: {
    flex: 1,
  },
  journeyThumb: {
    borderWidth: 1.5,
  },
  journeyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingLeft: spacing.xs + 2,
    paddingRight: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
  },
  journeyPillText: {
    fontSize: typography.fontSize.sm,
    color: colors.textOnDark.primary,
  },
  journeyPillKicker: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.accent.yellow.base,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.textOnDark.primary,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textOnDark.secondary,
  },
  dailyStreak: {
    color: colors.accent.flame,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  glassButton: {
    width: GLASS_BUTTON_SIZE,
    height: GLASS_BUTTON_SIZE,
    borderRadius: GLASS_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.cardBorder,
  },
  glassButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textOnDark.muted,
  },
});
