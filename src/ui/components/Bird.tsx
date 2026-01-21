import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  startY: number;
  size: number;
  duration: number;
  delay: number;
  flapSpeed: number;
};

export const Bird: React.FC<Props> = ({ startY, size, duration, delay, flapSpeed }) => {
  const posX = useSharedValue(SCREEN_WIDTH + 50);
  const wingAngle = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      posX.value = withRepeat(
        withSequence(
          withTiming(-50, { duration, easing: Easing.linear }),
          withTiming(SCREEN_WIDTH + 50, { duration: 0 }),
        ),
        -1,
        false,
      );

      wingAngle.value = withRepeat(
        withSequence(
          withTiming(1, { duration: flapSpeed, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: flapSpeed, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: posX.value }],
  }));

  const animatedProps = useAnimatedProps(() => {
    const wingY = size - wingAngle.value * size * 1.5;
    return {
      d: `M0 ${wingY} L${size} ${size} L${size * 2} ${wingY}`,
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top: startY }, animatedStyle]}>
      <Svg width={size * 2} height={size * 2}>
        <AnimatedPath
          animatedProps={animatedProps}
          stroke="#442211"
          strokeWidth={1.5}
          fill="none"
          opacity={0.4}
        />
      </Svg>
    </Animated.View>
  );
};
