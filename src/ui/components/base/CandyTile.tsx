import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { CandyColor } from '../../../theme';

// Oranlar boyuta göre ölçeklenir ki aynı bileşen logo, arka plan ve tahtada kullanılabilsin
const RADIUS_RATIO = 0.24;
const DEPTH_RATIO = 0.12;
const GLOSS_INSET_RATIO = 0.12;
const GLOSS_HEIGHT_RATIO = 0.3;

type Props = {
  size: number;
  color: CandyColor;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const CandyTile: React.FC<Props> = ({ size, color, style, children }) => {
  const radius = size * RADIUS_RATIO;
  const inset = size * GLOSS_INSET_RATIO;

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color.base,
          borderBottomWidth: size * DEPTH_RATIO,
          borderBottomColor: color.shadow,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.gloss,
          {
            top: inset * 0.6,
            left: inset,
            right: inset,
            height: size * GLOSS_HEIGHT_RATIO,
            borderRadius: radius * 0.6,
            backgroundColor: color.highlight,
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    opacity: 0.45,
  },
});
