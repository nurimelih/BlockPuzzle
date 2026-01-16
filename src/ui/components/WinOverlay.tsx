import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = {
  visible: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  currentLevelNumber: number;
  isLastLevel: boolean;
  onDismiss: () => void;
};

export const WinOverlay: React.FC<Props> = ({
  visible,
  onNextLevel,
  onRestart,
  currentLevelNumber,
  isLastLevel,
  onDismiss,
}) => {
  const translateY = useSharedValue(500); // Ekran dışından başla

  useEffect(() => {
    if (visible) {
      // Aşağıdan yukarı slide
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Yukarıdan aşağı slide (gizle)
      translateY.value = withTiming(500, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <Pressable style={styles.container} onPress={onDismiss}>
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, animatedStyle]}>
          <Text style={styles.title}>
            Level {currentLevelNumber + 1} Complete!
          </Text>

          <View style={styles.buttonContainer}>
            {!isLastLevel ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNextLevel}
              >
                <Text style={styles.primaryButtonText}>Next Level</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.completionText}>All levels completed!</Text>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRestart}
            >
              <Text style={styles.secondaryButtonText}>Restart</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(93, 64, 55, 0.6)', // Kahverengi backdrop
    zIndex: 9,
  },
  overlay: {
    backgroundColor: '#FFF8E1', // Krem
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#5D4037', // Koyu kahve
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ee5522', // Turuncu (arka plan rengi)
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF8E1',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFE082', // Altın sarısı (piece rengi)
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#5D4037',
    fontSize: 16,
    fontWeight: '600',
  },
  completionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ee5522',
    marginBottom: 16,
    textAlign: 'center',
  },
});
