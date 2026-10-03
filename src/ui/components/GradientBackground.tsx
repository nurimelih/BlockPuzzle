import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme';

/** Kartpostal resmi yüklenene kadar (ya da yüklenemezse) görünen sıcak gün batımı zemini. */
export const GradientBackground: React.FC = () => (
  <View style={styles.container} pointerEvents="none">
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.bg.top} />
          <Stop offset="0.55" stopColor={colors.bg.middle} />
          <Stop offset="1" stopColor={colors.bg.bottom} />
        </LinearGradient>
        <RadialGradient id="glow" cx="30%" cy="25%" r="60%">
          <Stop offset="0" stopColor={colors.bg.glow} stopOpacity={0.6} />
          <Stop offset="1" stopColor={colors.bg.glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
      <Rect width="100%" height="100%" fill="url(#glow)" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.bottom,
  },
});
