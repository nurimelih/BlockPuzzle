# BlockPuzzle - Project Reference

## Overview
Block puzzle game built with React Native (0.81.5) + Expo (54) + TypeScript. Players place shaped pieces onto a grid board to complete levels. Published on iOS App Store and Google Play.

## Tech Stack
- **Runtime:** React Native 0.81.5 (New Architecture enabled), Expo SDK 54
- **Language:** TypeScript 5.8.3, React 19.1
- **State:** Zustand 5.x (global), custom hooks (local game state)
- **Navigation:** React Navigation 7.x (native-stack)
- **Animations:** react-native-reanimated 4.2.1
- **Audio:** expo-av (background music playlist + sound effects)
- **Ads:** react-native-google-mobile-ads 16.x (rewarded + interstitial)
- **Analytics:** PostHog (primary, session replay enabled) + Firebase Analytics (optional, toggle via FIREBASE_ENABLED env)
- **Backend:** Supabase (remote levels, app settings, background images)
- **Storage:** @react-native-async-storage/async-storage
- **UI:** @rneui/themed, react-native-vector-icons (Ionicons), react-native-svg

## Project Structure
```
src/
├── core/                    # Pure game logic (NO React dependencies)
│   ├── gameCore.ts          # Board operations: canPlace, placePiece, getAdjustedPlacement
│   ├── transformHelpers.ts  # Piece rotation (matrix transpose+reverse), rotation variants
│   ├── solver.ts            # Backtracking solver for level validation
│   ├── levels.ts            # Built-in level definitions
│   ├── levels_auto_generated.ts  # Auto-generated levels
│   ├── levelGenerator.ts    # Level generation logic
│   └── utils.ts             # Shared utilities
│   └── __tests__/           # Jest tests for core logic
├── services/                # External integrations (singleton pattern)
│   ├── AdManager.ts         # Google Mobile Ads lifecycle (load/show/preload)
│   ├── Analytics.ts         # Dual tracking: PostHog + Firebase
│   ├── GameStorage.ts       # AsyncStorage wrapper (levels, scores, settings)
│   ├── SoundManager.ts      # Audio singleton (music playlist, SFX cache, volume)
│   └── supabase.ts          # Supabase REST client (levels, settings)
├── state/
│   ├── useAppStore.ts       # Zustand global store
│   └── useGameState.ts      # Complex custom hook: board state, pieces, timer, game logic
├── theme/                   # Design tokens
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── types/
│   ├── types.ts             # GamePiece, Cell enum, LevelDefinition, etc.
│   └── navigation.ts        # RootStackParamList type-safe navigation
└── ui/
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── GameScreen.tsx       # Main gameplay (PanResponder for drag)
    │   ├── LevelSelectScreen.tsx
    │   └── SettingsScreen.tsx
    └── components/
        ├── AnimatedPiece.tsx    # Reanimated shared values + animated styles
        ├── Background.tsx
        ├── BackgroundImage.tsx
        ├── Bird.tsx
        ├── MenuOverlay.tsx      # In-game pause menu
        └── base/
            ├── LabelButton.tsx  # Platform-aware button (iOS/Android font diffs)
            └── Text.tsx         # Base text component
```

## Key Commands
```bash
yarn ios              # Run iOS dev build (BlockPuzzle-Dev scheme)
yarn ios:prod         # Run iOS production build
yarn ios:sim          # Run on iPhone 17 Pro simulator
yarn android          # Run Android
yarn test             # Jest tests
yarn pod-install      # Install CocoaPods (static frameworks, new arch)
yarn reset            # Clean rebuild (node_modules, Pods, builds)
yarn reset-hard       # Nuclear clean (+ DerivedData, cache clean)
yarn icon-make        # Generate Android icons from iOS 1024.png
```

## Key Patterns
- **Service Layer:** All external integrations are singleton services in `src/services/`
- **Pure Core Logic:** `src/core/` has zero React dependencies - pure algorithms, fully testable
- **Feature Toggles:** `FIREBASE_ENABLED` env var controls Firebase inclusion
- **Ad Frequency:** Interstitial ads throttled by LEVELS_BETWEEN_ADS constant
- **DEV Mode:** Fake reward granting in dev, console logs gated by __DEV__
- **Platform Checks:** `Platform.OS` used in UI components for iOS/Android differences

## Data Model
- **Board:** 2D number array, `Cell` enum values (EMPTY, FILLED, PIECE_*)
- **Pieces:** 2D boolean/number arrays with rotation (0°/90°/180°/270°)
- **Levels:** { board: 2D array, pieces: GamePiece[] } - from built-in or Supabase
- **Storage Keys:** Defined as constants in GameStorage (completed levels, high scores, sound settings)

## Testing
- Tests in `src/core/__tests__/` covering: canPlace, getAdjustedPlacement, transformHelpers, solver
- Run: `yarn test`

## Known Considerations
- Supabase keys are in client code (public anon key, acceptable for RLS-protected tables)
- New Architecture (Fabric) is enabled
- iOS uses multiple schemes: BlockPuzzle-Dev, BlockPuzzle-Prod
- CocoaPods requires `USE_FRAMEWORKS=static` flag
