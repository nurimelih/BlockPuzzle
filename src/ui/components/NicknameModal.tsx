import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { LabelButton } from './base/LabelButton.tsx';
import { GameStorage } from '../../services/GameStorage.ts';
import { createPlayer } from '../../services/supabase.ts';
import { useTranslation } from 'react-i18next';
import DeviceInfo from 'react-native-device-info';

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export const NicknameModal: React.FC<Props> = ({ visible, onComplete }) => {
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
        await GameStorage.savePlayerNickname(trimmed);
      }
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={undefined}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centeredView}
        >
          <View style={styles.card}>
            <LabelButton style={styles.title}>
              {t('nickname.title')}
            </LabelButton>
            <LabelButton style={styles.subtitle}>
              {t('nickname.subtitle')}
            </LabelButton>

            <TextInput
              style={[
                styles.input,
                { fontFamily: typography.fontFamily.primary },
              ]}
              value={nickname}
              onChangeText={text => {
                setNickname(text);
                setError('');
              }}
              placeholder={t('nickname.placeholder')}
              placeholderTextColor="rgba(255,255,255,0.6)"
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
                style: [
                  styles.button,
                  (loading || nickname.trim().length < 2) &&
                    styles.buttonDisabled,
                ],
              }}
              style={styles.buttonText}
            >
              {loading ? t('common.loading') : t('common.confirm')}
            </LabelButton>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xxxxl,
    width: '85%',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.xl,
    color: colors.white,
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
