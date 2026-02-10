[TR Readme](https://github.com/nurimelih/BlockPuzzle/blob/main/README.tr.md)


# Block Puzzle Engine / Game
Inspired by Block Puzzle Ancient-style, free placement puzzle games.
This project is not a game demo, it's an engine + architecture showcase.
- Design a game core (engine) completely independent from UI
- Separate game rules, state and render layers with strict boundaries
- Rather than a simple game, build a design where each layer does its own job and be able to justify its necessity.
---


<img width="282" height="633" alt="IMG_0935" src="https://github.com/user-attachments/assets/04c52fc5-b4ff-4e2c-9f0b-4fb9f6c4e81d" />
<img width="282" height="633" alt="IMG_0938" src="https://github.com/user-attachments/assets/6fa16866-c9e4-43e0-904c-b2c45ee158fc" />

---
# Architecture
## 1. Core (Engine / Domain Logic)
- Doesn't know React / React Native
- Doesn't know UI
- Doesn't know State
- Contains only rules and math
  
**Responsibilities:**
- Can a piece be placed `canPlace`
- Matrix normalization `normalizePlacement`
- Rotation and matrix transformations
- Board boundary and collision checks
Core is completely platform independent.  
Can run in web, RN, desktop or Node environment.  
Planning to develop it further and turn it into a separate package.

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
- Gesture
- Animation
  
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

# Project Status
- Engine side is mostly complete
- Architecture is stable, there's a simple UI and it's playable for debug purposes
- UI development will continue  
  (drag, snap preview, animation, level, game-over, restart, undo, sounds, effects)
At the current state, I don't foresee adding new rules to core.
---

# Why did I think of making such a project?
This repo exists to show:
- How layered architecture is built
- How engine is isolated from UI
- Why state should be a "single gate"
- How a small problem domain can be transformed into clean design
Not for playing the game, but for reading the code and examining the architecture.
Initially I wanted to mimic a simple game I liked,  
but then turned it into a layered example.

