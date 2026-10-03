export const PIECE_COLORS = [
  { base: '#EF5350', highlight: '#FFCDD2', shadow: '#B71C1C' }, // kırmızı
  { base: '#42A5F5', highlight: '#BBDEFB', shadow: '#1565C0' }, // mavi
  { base: '#66BB6A', highlight: '#C8E6C9', shadow: '#1B5E20' }, // yeşil
  { base: '#FFA726', highlight: '#FFE0B2', shadow: '#E65100' }, // turuncu
  { base: '#AB47BC', highlight: '#E1BEE7', shadow: '#6A1B9A' }, // mor
  { base: '#26C6DA', highlight: '#B2EBF2', shadow: '#006064' }, // cyan
  { base: '#EC407A', highlight: '#FCE4EC', shadow: '#880E4F' }, // pembe
  { base: '#8D6E63', highlight: '#D7CCC8', shadow: '#3E2723' }, // kahve
] as const;

export type CandyColor = { base: string; highlight: string; shadow: string };

export const colors = {
  // Gün batımı paleti — kartpostal illüstrasyonlarının sıcak tonlarıyla uyumlu.
  // Resim yüklenemezse görünen yedek gradient de bu.
  bg: {
    top: '#FFB347',
    middle: '#EE5522',
    bottom: '#8C3A1E',
    glow: '#FFD27A',
  },

  // Koyu kahve cam: resmin üstünde okunurluğu korurken sıcaklığı bozmaz
  surface: {
    card: 'rgba(62, 39, 35, 0.55)',
    cardBorder: 'rgba(255, 236, 214, 0.22)',
    sheet: '#4A2E25',
    scrim: 'rgba(40, 22, 14, 0.6)',
    scrimStrong: 'rgba(40, 22, 14, 0.92)',
  },

  accent: {
    yellow: { base: '#FFC93C', highlight: '#FFE9A3', shadow: '#D98A00' },
    green: { base: '#4CD964', highlight: '#B8F5C3', shadow: '#1E9E3A' },
    brown: { base: '#6D4C41', highlight: '#A1887F', shadow: '#3E2723' },
    // Renkli kartpostal zemininde ana buton: öne çıkar ama zeminle renk yarışına girmez
    cream: { base: '#FFF3DC', highlight: '#FFFFFF', shadow: '#C9A27E' },
    flame: '#FF7A2F',
    star: '#FFD54A',
  },

  textOnDark: {
    primary: '#FFF8E1',
    secondary: 'rgba(255, 248, 225, 0.78)',
    muted: 'rgba(255, 248, 225, 0.5)',
  },

  // Primary palette
  primary: '#ee5522',
  primaryLight: '#ff7744',
  primaryDark: '#cc4400',

  // Piece colors (fallback — artık PIECE_COLORS kullanılıyor)
  piece: {
    base: '#FFE082',
    highlight: '#FFF3C4',
    shadow: '#D4A84B',
  },

  // Placed piece colors (fallback)
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
