import { Platform } from 'react-native';

// iOS: shadowColor/Offset/Opacity/Radius
// Android: elevation
// İkisi bir arada yazılabilir, her platform kendi desteklediğini kullanır.

export const shadows = {
  // Modal/card gölgesi — WinScreen, TutorialOverlay, NicknameModal
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Küçük kart gölgesi — LevelSelectScreen levelCard
  cardSmall: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // Menü/drawer gölgesi — MenuOverlay (yukarı açılan)
  menu: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  // İkon gölgesi — GameHud ikonları (View üzerinde)
  // Android'de View gölgesi için elevation gerekir ama ikonu etkiler; iOS'ta çalışır.
  icon: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3,
  },

  // Text gölgesi — sadece text component'lerde kullanılır (textShadow* iOS+Android)
  text: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  // Parça gölgesi — AnimatedPiece (placed durumuna göre)
  // Platform.select undefined dönmemesi için fallback eklendi.
  piece: (placed: boolean) => ({
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: placed ? 0.5 : 0.3,
        shadowRadius: placed ? 2 : 4,
      },
    }),
    elevation: placed ? 1 : 2,
  }),

  // Board gölgesi — GameBoard
  board: {
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
    }),
    elevation: 3,
  },
};
