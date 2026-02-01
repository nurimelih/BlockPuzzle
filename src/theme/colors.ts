export const colors = {
  // Primary palette
  primary: '#ee5522',
  primaryLight: '#ff7744',
  primaryDark: '#cc4400',

  // Piece colors
  piece: {
    base: '#FFE082',
    highlight: '#FFF3C4',
    shadow: '#D4A84B',
  },

  // Placed piece colors
  piecePlaced: {
    base: '#FFCC80',
    highlight: '#D7CCC8',
    shadow: '#8D6E63',
  },

  // Brown palette
  brown: {
    dark: '#5D4037',
    medium: '#8D6E63',
    light: '#A1887F',
  },

  // Background colors
  background: {
    cream: '#FFF8E1',
    brownWithOpacity: 'rgba(109, 76, 65, .4)',
    overlay: 'rgba(93, 64, 55, 0.4)',
    transparent: 'transparent',
  },

  // Board colors
  board: {
    cellAvailable: 'rgba(109, 76, 65, 0.7)',
    cellInvalid: 'rgba(0, 0, 0, 0.2)',
    cellBorder: 'rgba(255, 255, 255, 0.3)',
    cellBorderInvalid: 'rgba(0, 0, 0, 0.1)',
  },

  // Text colors
  text: {
    primary: '#5D4037',
    secondary: '#8D6E63',
    light: '#FFF8E1',
    white: '#FFFFFF',
  },

  // Utility colors
  black: '#000000',
  white: '#FFFFFF',
} as const;
