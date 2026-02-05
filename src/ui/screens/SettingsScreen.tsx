import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { SoundManager } from '../../services/SoundManager.ts';
import { GameStorage } from '../../services/GameStorage.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { LabelButton } from '../components/base/LabelButton.tsx';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [musicEnabled, setMusicEnabled] = useState(
    !SoundManager.isMusicMutedState(),
  );
  const [effectsEnabled, setEffectsEnabled] = useState(
    !SoundManager.isEffectsMutedState(),
  );
  const [musicVolume, setMusicVolume] = useState(
    SoundManager.getBackgroundVolume(),
  );

  const saveSettings = (overrides: Partial<{
    music: boolean;
    effects: boolean;
    volume: number;
  }>) => {
    GameStorage.saveSoundSettings({
      musicEnabled: overrides.music ?? musicEnabled,
      effectsEnabled: overrides.effects ?? effectsEnabled,
      musicVolume: overrides.volume ?? musicVolume,
      effectsVolume: SoundManager.getEffectsVolume(),
    });
  };

  const handleMusicToggle = (value: boolean) => {
    setMusicEnabled(value);
    SoundManager.setMusicMuted(!value);
    saveSettings({ music: value });
  };

  const handleEffectsToggle = (value: boolean) => {
    setEffectsEnabled(value);
    SoundManager.setEffectsMuted(!value);
    saveSettings({ effects: value });
  };

  const handleVolumeChange = (volume: number) => {
    setMusicVolume(volume);
    SoundManager.setBackgroundVolume(volume);
    saveSettings({ volume });
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
        <LabelButton style={styles.title}>Settings</LabelButton>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>Music</LabelButton>
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
                musicVolume === 0.25 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(0.25)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 0.25 && styles.volumeButtonTextActive,
                ]}
              >
                Low
              </LabelButton>
            </Pressable>
            <Pressable
              style={[
                styles.volumeButton,
                musicVolume === 0.5 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(0.5)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 0.5 && styles.volumeButtonTextActive,
                ]}
              >
                Mid
              </LabelButton>
            </Pressable>
            <Pressable
              style={[
                styles.volumeButton,
                musicVolume === 1.0 && styles.volumeButtonActive,
              ]}
              onPress={() => handleVolumeChange(1.0)}
            >
              <LabelButton
                style={[
                  styles.volumeButtonText,
                  musicVolume === 1.0 && styles.volumeButtonTextActive,
                ]}
              >
                High
              </LabelButton>
            </Pressable>
          </View>
        )}

        <View style={styles.settingRow}>
          <LabelButton style={styles.settingLabel}>Sound Effects</LabelButton>
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
});
