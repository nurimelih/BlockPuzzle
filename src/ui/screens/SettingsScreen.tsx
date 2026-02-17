import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { SoundManager } from '../../services/SoundManager.ts';
import { HapticsManager } from '../../services/HapticsManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { useMusicMuted } from '../../state/useMusicMuted.ts';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isMusicMuted, setMusicMuted } = useMusicMuted();
  const musicEnabled = !isMusicMuted;

  const [effectsEnabled, setEffectsEnabled] = useState(
    !SoundManager.isEffectsMutedState(),
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    HapticsManager.isHapticsEnabled(),
  );
  const [musicVolume, setMusicVolume] = useState(
    SoundManager.getBackgroundVolume(),
  );

  const saveSettings = (overrides: Partial<{
    effects: boolean;
    volume: number;
  }>) => {
    GameStorage.saveSoundSettings({
      musicEnabled,
      effectsEnabled: overrides.effects ?? effectsEnabled,
      musicVolume: overrides.volume ?? musicVolume,
      effectsVolume: SoundManager.getEffectsVolume(),
    });
  };

  const handleMusicToggle = (value: boolean) => {
    setMusicMuted(!value);
  };

  const handleEffectsToggle = (value: boolean) => {
    setEffectsEnabled(value);
    SoundManager.setEffectsMuted(!value);
    saveSettings({ effects: value });
  };

  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    HapticsManager.setEnabled(value);
    GameStorage.getSoundSettings().then(current => {
      GameStorage.saveSoundSettings({ ...current, hapticsEnabled: value });
    });
  };

  const handleVolumeChange = (volume: number) => {
    setMusicVolume(volume);
    SoundManager.setBackgroundVolume(volume);
    saveSettings({ volume });
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    GameStorage.saveLanguage(lang);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color={colors.text.light} />
        </Pressable>
        <LabelButton style={styles.title}>{t('common.settings')}</LabelButton>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>{t('settings.music')}</LabelButton>
          <Switch
            value={musicEnabled}
            onValueChange={handleMusicToggle}
            trackColor={{
              false: colors.brown.medium,
              true: colors.primary,
            }}
            thumbColor={colors.text.light}
          />
        </View>

        {musicEnabled && (
          <View style={styles.volumeRow}>
            <Pressable
              style={[
                styles.volumeButton,
                musicVolume === 0.05 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(0.05)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 0.05 && styles.volumeButtonTextActive,
                ]}
              >
                {t('settings.low')}
              </LabelButton>
            </Pressable>
            <Pressable
              style={[
                styles.volumeButton,
                musicVolume === 0.15 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(0.15)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 0.15 && styles.volumeButtonTextActive,
                ]}
              >
                {t('settings.mid')}
              </LabelButton>
            </Pressable>
            <Pressable
              style={[
                styles.volumeButton,
                musicVolume === 0.35 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(0.35)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 0.35 && styles.volumeButtonTextActive,
                ]}
              >
                {t('settings.high')}
              </LabelButton>
            </Pressable>
          </View>
        )}

        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>{t('settings.soundEffects')}</LabelButton>
          <Switch
            value={effectsEnabled}
            onValueChange={handleEffectsToggle}
            trackColor={{
              false: colors.brown.medium,
              true: colors.primary,
            }}
            thumbColor={colors.text.light}
          />
        </View>

        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>{t('settings.vibration')}</LabelButton>
          <Switch
            value={hapticsEnabled}
            onValueChange={handleHapticsToggle}
            trackColor={{
              false: colors.brown.medium,
              true: colors.primary,
            }}
            thumbColor={colors.text.light}
          />
        </View>

        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>{t('settings.language')}</LabelButton>
          <View style={styles.languageButtons}>
            <Pressable
              style={[
                styles.languageButton,
                i18n.language === 'tr' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('tr')}
            >
              <LabelButton
                style={[
                  styles.languageButtonText,
                  i18n.language === 'tr' && styles.languageButtonTextActive,
                ]}
              >
                Türkçe
              </LabelButton>
            </Pressable>
            <Pressable
              style={[
                styles.languageButton,
                i18n.language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <LabelButton
                style={[
                  styles.languageButtonText,
                  i18n.language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                English
              </LabelButton>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    color: colors.text.light,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown.medium,
  },
  settingLabel: {
    fontSize: typography.fontSize.xl,
    color: colors.text.light,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  volumeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.brown.medium,
    alignItems: 'center',
  },
  volumeButtonActive: {
    backgroundColor: colors.primary,
  },
  volumeButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.light,
  },
  volumeButtonTextActive: {
    color: colors.text.light,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.brown.medium,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
  },
  languageButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.light,
  },
  languageButtonTextActive: {
    color: colors.text.light,
  },
});
