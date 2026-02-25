import { colors } from './colors';
import { spacing } from './spacing';

export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xxxl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center' as const,
  },

  secondary: {
    backgroundColor: colors.piece.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center' as const,
  },

  primaryText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '700' as const,
  },

  secondaryText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
} as const;
