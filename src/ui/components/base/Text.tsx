import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { typography } from '../../../theme';

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.default, style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: typography.fontFamily.primary,
  },
});
