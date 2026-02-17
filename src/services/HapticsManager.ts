import * as Haptics from 'expo-haptics';

let isEnabled = true;

export const HapticsManager = {
  impactLight: (): void => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  impactMedium: (): void => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  notificationSuccess: (): void => {
    if (!isEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  setEnabled: (enabled: boolean): void => {
    isEnabled = enabled;
  },

  isHapticsEnabled: (): boolean => {
    return isEnabled;
  },
};
