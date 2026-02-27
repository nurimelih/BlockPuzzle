[TR Readme](https://github.com/nurimelih/BlockPuzzle/blob/main/README.tr.md)


# Block Puzzle — Engine / Game
Inspired by Block Puzzle Ancient-style, free placement puzzle games.
This project started as an architecture showcase, and grew into a fully shipped mobile game.

[![Google Play](https://img.shields.io/badge/Google_Play-Download-green?logo=google-play)](https://play.google.com/store/apps/details?id=com.nurimelih.blockpuzzle)

- Design a game core (engine) completely independent from UI
- Separate game rules, state and render layers with strict boundaries
- Rather than a simple game, build a design where each layer does its own job and be able to justify its necessity.
---


<img width="282" height="633"  src="https://github.com/user-attachments/assets/2f08e5b9-482d-4dd4-b13a-3a10d04a0b6d" />
<img width="282" height="633"  src="https://github.com/user-attachments/assets/f5521fe3-2558-424a-bdce-39d30d41d3c5"  />
<img width="282" height="633"  src="https://github.com/user-attachments/assets/830be66f-6804-4990-96db-409172b68394" />
<img width="282" height="633"  src="https://github.com/user-attachments/assets/1297298c-da16-4646-b23b-5b80fdf235b2" />
<img width="282" height="633"  src="https://github.com/user-attachments/assets/c6340510-90f9-4ba9-a97b-5e677aa27709" />
<img width="282" height="633"  src="https://github.com/user-attachments/assets/35216af4-f056-40c5-9732-e48f699931e1" />



---
# Architecture
## 1. Core (Engine / Domain Logic)
- Doesn't know React / React Native
- Doesn't know UI
- Doesn't know State
- Contains only rules and math

**Responsibilities:**
- Can a piece be placed `canPlace`
- Placement adjustment `getAdjustedPlacement`
- Rotation and matrix transformations
- Board boundary and collision checks
- Level validation via backtracking solver
Core is completely platform independent.
Can run in web, RN, desktop or Node environment.

**Note:**
- Board doesn't hold occupancy state, it's a dummy space.
- Collision detection is done through `occupiedCells` provided from outside.
- Core doesn't impose a single "absolute truth"; it's parametric.
I thought of it like this; board is the land, puzzle pieces are people settling on that land.
When a new piece wants to settle, it doesn't ask the board, it asks each person individually
"where are you".
The reason is that board isn't just for this type of block-puzzle,
it can be used for other types of games too.
---

## 2. State Layer
- Game's memory is kept here
- Single entry point between UI and Core

**Purpose and responsibilities of this layer:**
- Puzzle piece information and management
- Information like `baseMatrix`, rotation, position
- `tryPlacePiece` is the only entry to core
- `occupiedCells` generation and matrix normalization
- Prevent UI from accessing Core directly
UI never calls rules like `canPlace` directly.
Instead it uses entry points like `tryPlacePiece` through this state.
---

## 3. UI Layer (React Native)
- Render
- Gesture (drag & drop via PanResponder)
- Animation (Reanimated 4)

Knows nothing else.
- Doesn't know board logic
- Doesn't calculate collisions
- Doesn't make decisions about rules
Only passes data and renders elements according to incoming data.

UI only communicates intent:
- position
- rotation
- interaction
Decision is made by State + Core.
---

# Deliberate Design Decisions
- Anchor point is always `matrix[0][0]`
- Coordinates from UI are normalized before passing to Core
- No gravity, line clear, classic Tetris rules.
  This isn't a Tetris game anyway, it's a puzzle game using Tetris pieces.
This engine is designed for free placement puzzle rules.
---

# Features
- Levels + remote levels via Supabase
- Daily puzzle with streak tracking
- Leaderboard
- Background music playlist + sound effects
- Rewarded & interstitial ads (Google Mobile Ads)
- Analytics (PostHog with session replay)
- i18n: English / Turkish
- OTA updates via Expo
---

# Tech Stack
| Layer | Technology |
|---|---|
| Runtime | React Native 0.81 + Expo 54 |
| Language | TypeScript 5.8 |
| State | Zustand + custom hooks |
| Animations | react-native-reanimated 4 |
| Backend | Supabase (levels, settings) |
| Analytics | PostHog |
| Ads | Google Mobile Ads |
| Audio | expo-av |
---

# Project Status
- Shipped on iOS App Store and Google Play
- Architecture is stable, core has no React dependencies
- Levels delivered remotely via Supabase; new levels can be added without an app update
---

# Why did I think of making such a project?
This repo exists to show:
- How layered architecture is built
- How engine is isolated from UI
- Why state should be a "single gate"
- How a small problem domain can be transformed into clean design
Not for playing the game, but for reading the code and examining the architecture.
Initially I wanted to mimic a simple game I liked,
but then turned it into a layered example and eventually shipped it.

