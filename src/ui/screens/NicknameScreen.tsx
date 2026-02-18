import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.ts';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from '../components/base/LabelButton.tsx';
import { GameStorage } from '../../services/GameStorage.ts';
import { createPlayer } from '../../services/supabase.ts';
import { useTranslation } from 'react-i18next';
import DeviceInfo from 'react-native-device-info';

type Props = NativeStackScreenProps<RootStackParamList, 'Nickname'>;

export const NicknameScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError(t('nickname.tooShort'));
      return;
    }
    if (trimmed.length > 16) {
      setError(t('nickname.tooLong'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const player = await createPlayer(deviceId, trimmed);
      if (player) {
        await GameStorage.savePlayerId(player.id);
        await GameStorage.savePlayerNickname(trimmed);
      } else {
        // Offline / hata — sadece lokal kaydet, sonra tekrar denenebilir
        await GameStorage.savePlayerNickname(trimmed);
      }
      navigation.replace('HomeScreen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <LabelButton style={styles.title}>{t('nickname.title')}</LabelButton>
        <LabelButton style={styles.subtitle}>{t('nickname.subtitle')}</LabelButton>

        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={text => { setNickname(text); setError(''); }}
          placeholder={t('nickname.placeholder')}
          placeholderTextColor={colors.brown.light}
          maxLength={16}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />

        {error !== '' && (
          <LabelButton style={styles.error}>{error}</LabelButton>
        )}

        <LabelButton
          pressableProps={{
            onPress: handleConfirm,
            disabled: loading || nickname.trim().length < 2,
            style: [styles.button, (loading || nickname.trim().length < 2) && styles.buttonDisabled],
          }}
          style={styles.buttonText}
        >
          {loading ? t('common.loading') : t('common.confirm')}
        </LabelButton>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.cream,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xxxxl,
    width: '85%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: '#E53935',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxxl,
    borderRadius: spacing.borderRadius.lg,
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
});
