# Implementation Plan: PingPong Physics Plugin

## Overview

Build a GB Studio 4.x plugin that provides Crackout/Breakout-style ball physics with angle-based paddle reflection. The plugin will be distributed as a drop-in folder for GB Studio projects.

## Architecture Decision: Engine Plugin + Script Events

After analysing GB Studio's plugin system, the best approach is a **hybrid plugin**:

1. **Engine Plugin** (`engine/` folder): Core physics in C for performance
2. **Script Events** (`events/` folder): JavaScript events for GB Studio UI integration

This allows:
- Fast physics calculations in compiled C
- Easy integration via drag-and-drop script events
- Configurable parameters through GB Studio's settings panel

## Phase 1: Project Setup

### 1.1 Repository Structure
- [x] Initialise git repository
- [x] Create CLAUDE.md with project context
- [x] Create README.md

### 1.2 Development Environment
- [ ] Create package.json with dependencies (Jest, ESLint, Prettier)
- [ ] Create .gitignore
- [ ] Create .eslintrc.json and .prettierrc
- [ ] Set up npm scripts for testing and building

### 1.3 GitHub Repository
- [ ] Create public GitHub repo: `russellbrenner/gbs-plugin-pingpong`
- [ ] Push initial commit
- [ ] Set up branch protection for main

## Phase 2: Physics Core (C Engine Plugin)

### 2.1 Fixed-Point Math Library
- [ ] Create `engine/src/core/fixed_point.h` with 8.8 fixed-point macros
- [ ] Create sin/cos lookup tables (32 entries, 0-90 degrees)
- [ ] Unit test the math in JavaScript (same algorithm)

### 2.2 Ball Physics Implementation
- [ ] Create `engine/src/states/pingpong.c`:
  - `pingpong_ball_t` struct: x, y, vel_x, vel_y (all 8.8 fixed-point)
  - `pingpong_init()`: Initialise ball state
  - `pingpong_update()`: Move ball by velocity each frame
  - `pingpong_paddle_reflect()`: Calculate angle-based reflection

### 2.3 Engine Configuration
- [ ] Create `engine/engine.json` with:
  - Version: "4.0.0-e0" (GB Studio 4.x compatible)
  - Custom fields: ball_speed, max_angle, paddle_width

## Phase 3: Script Events (JavaScript)

### 3.1 Ball Initialise Event
- [ ] Create `events/eventBallInit.js`:
  - Inputs: ball actor, initial velocity X/Y
  - GBVM: Call `pingpong_init()` with parameters

### 3.2 Ball Update Event
- [ ] Create `events/eventBallUpdate.js`:
  - Inputs: ball actor reference
  - GBVM: Call `pingpong_update()`, apply new position to actor

### 3.3 Paddle Collision Event
- [ ] Create `events/eventPaddleCollide.js`:
  - Inputs: ball actor, paddle actor
  - Logic: Check overlap, calculate hit offset, call `pingpong_paddle_reflect()`
  - GBVM: Update ball velocity based on reflection

## Phase 4: Testing Infrastructure

### 4.1 Unit Tests (Jest)
- [ ] Create `test/physics/fixed-point.test.js`: Test 8.8 fixed-point operations
- [ ] Create `test/physics/angle.test.js`: Test paddle reflection calculations
- [ ] Create `test/physics/ball.test.js`: Test ball movement

### 4.2 Emulator Testing
- [ ] Install mGBA via Homebrew: `brew install mgba`
- [ ] Create `scripts/run-emulator.sh` to launch ROM in mGBA
- [ ] Research mGBA headless mode for CI testing

### 4.3 Demo Project
- [ ] Create minimal GB Studio project in `demo/`
- [ ] Single scene: paddle, ball, walls
- [ ] Use all three script events
- [ ] Can be built via GB Studio CLI

## Phase 5: CI/CD Pipeline

### 5.1 GitHub Actions Workflow
- [ ] Create `.github/workflows/ci.yaml`:
  ```yaml
  jobs:
    lint:
      # ESLint + Prettier for JS
      # clang-format for C (optional)

    test:
      # Jest unit tests

    build:
      # Install GB Studio CLI (if available)
      # Or: validate plugin structure only

    emulate:
      # Build demo ROM
      # Run in mGBA headless (if feasible)
  ```

### 5.2 GB Studio CLI Investigation
- [ ] Research if GB Studio has CLI build capability
- [ ] Alternative: Docker container with GB Studio
- [ ] Alternative: Skip ROM build in CI, test locally

## Phase 6: Documentation

### 6.1 Physics Documentation
- [ ] Create `docs/PHYSICS.md` explaining:
  - Fixed-point math rationale
  - Angle calculation algorithm
  - Lookup table generation

### 6.2 Usage Guide
- [ ] Create `docs/USAGE.md` with:
  - Step-by-step installation
  - Example scripts
  - Troubleshooting

## Phase 7: Polish & Release

### 7.1 Plugin Packaging
- [ ] Create release script to zip plugin folder
- [ ] Version tagging strategy (semver)
- [ ] GitHub Release with built assets

### 7.2 Community
- [ ] Submit to GB Studio plugin collections (itch.io, GitHub topic)
- [ ] Create demo GIF for README

---

## Technical Decisions

### Fixed-Point Format: 8.8
- 8 bits integer, 8 bits fractional
- Range: -128 to +127 with 1/256 precision
- Sufficient for pixel-based physics
- Efficient on Z80-like Game Boy CPU

### Angle Representation
- Store as degrees (0-359) in single byte
- Lookup table for sin/cos values
- Avoid runtime division/multiplication where possible

### Paddle Reflection Algorithm
```
hitOffset = (ballX - paddleCentreX) / halfPaddleWidth  // -1.0 to +1.0
angleOffset = hitOffset * MAX_ANGLE  // e.g., ±60 degrees
baseAngle = 90  // straight up
newAngle = baseAngle + angleOffset

// Clamp to prevent horizontal shots
if (newAngle < 30) newAngle = 30
if (newAngle > 150) newAngle = 150

// Convert to velocity using lookup tables
velX = speed * cos_table[newAngle]
velY = speed * sin_table[newAngle]  // negative for upward
```

### Testing Without Full GB Studio
Since GB Studio CLI doesn't exist for headless builds:
1. Test physics math in JavaScript (same algorithm)
2. Validate plugin structure (file naming, JSON schema)
3. Manual testing with mGBA/SameBoy for actual gameplay

---

## Subagent Definitions

The following custom agents would accelerate development:

### 1. `gb-physics-tester`
**Purpose:** Validate fixed-point math and physics calculations
**Tools:** Bash, Read, Write
**Invocation:** After writing physics code
**Actions:**
- Run Jest tests
- Compare JS and C implementations
- Generate test coverage report

### 2. `gbs-plugin-validator`
**Purpose:** Validate GB Studio plugin structure
**Tools:** Read, Glob, Bash
**Invocation:** Before commits
**Actions:**
- Check event files start with `event` prefix
- Validate engine.json schema
- Verify required exports in JS files

### 3. `mgba-rom-tester`
**Purpose:** Build and test ROMs in mGBA
**Tools:** Bash, Read
**Invocation:** After demo project changes
**Actions:**
- Build demo ROM (requires GB Studio)
- Launch mGBA in headless mode
- Check for errors/crashes

---

## Open Questions

1. **GB Studio CLI**: Does GB Studio 4.x have command-line build?
   - Fallback: Manual testing only

2. **mGBA Headless**: Can we run automated tests?
   - Research `mgba-rom-test` utility
   - May require custom test ROM with exit conditions

3. **k8s Infrastructure**: Is it needed?
   - Likely overkill for this project
   - Homebrew tools (mGBA, SameBoy) sufficient for local testing

---

## Recommended Execution Order

1. **Today**: Complete Phase 1 + 2.1 (setup + fixed-point math)
2. **Next**: Phase 2.2-2.3 (engine plugin skeleton)
3. **Then**: Phase 3 (script events)
4. **Then**: Phase 4 (testing)
5. **Finally**: Phase 5-7 (CI, docs, release)

## Estimated Complexity

| Phase | Complexity | Notes |
|-------|------------|-------|
| 1. Setup | Low | Standard project scaffolding |
| 2. Physics | Medium | Fixed-point math needs care |
| 3. Events | Medium | GBVM output generation |
| 4. Testing | Medium | mGBA integration may be tricky |
| 5. CI/CD | High | GB Studio CLI limitations |
| 6. Docs | Low | Straightforward |
| 7. Release | Low | Standard GitHub release |
