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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Backdrop
    zIndex: 9,
  },
  overlay: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  completionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
});
