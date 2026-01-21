import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  Pressable,
  PressableProps,
  TextProps,
  ViewStyle,
} from 'react-native';

type Props = TextProps & {
  pressableProps?: PressableProps;
};

export const LabelButton: React.FC<Props> = ({
  pressableProps,
  style,
  children,
  ...textProps
}) => {
  const styles = StyleSheet.create({
    default: {
      fontFamily: 'Just Me Again Down Here',
    },
  });

  return (
    <Pressable
      {...pressableProps}
      style={({ pressed }) => [
        pressableProps?.style as ViewStyle,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <RNText style={[styles.default, style]} {...textProps}>
        {children}
      </RNText>
    </Pressable>
  );
};
