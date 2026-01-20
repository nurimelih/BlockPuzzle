export const spacing = {
  // Base spacing scale
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,

  // Specific use cases
  padding: {
    screen: 20,
    card: 16,
    button: 16,
  },

  margin: {
    section: 24,
    element: 12,
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 12,
    xl: 24,
  },

  // Cell dimensions
  cell: {
    width: 40,
    height: 40,
  },
} as const;
