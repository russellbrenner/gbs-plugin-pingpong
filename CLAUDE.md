# gbs-plugin-pingpong

GB Studio plugin providing Crackout/Breakout-style ball physics with angle-based paddle reflection.

## Project Overview

A GB Studio 4.x engine plugin that implements:
- Ball physics with velocity vectors
- Angle-based reflection off paddle (hit position determines outgoing angle)
- Configurable parameters via GB Studio settings UI
- Fixed-point math optimised for Game Boy hardware

**Target:** GB Studio 4.1.3+ (engine version 4.0.0-e0)

## Repository Structure

```
gbs-plugin-pingpong/
├── plugins/
│   └── PingPong Physics/
│       ├── engine/
│       │   ├── engine.json          # Engine version + custom settings fields
│       │   └── src/
│       │       └── states/
│       │           └── pingpong.c   # Core physics implementation
│       └── events/
│           ├── eventBallInit.js     # Initialise ball position/velocity
│           ├── eventBallUpdate.js   # Per-frame physics update
│           └── eventPaddleCollide.js # Angle-based reflection
├── test/
│   ├── physics/                     # Unit tests for physics calculations
│   └── integration/                 # Full ROM tests with mGBA
├── demo/                            # Sample GB Studio project using plugin
├── .github/
│   └── workflows/
│       └── ci.yaml                  # Build + test pipeline
└── docs/
    ├── PHYSICS.md                   # Ball physics algorithm documentation
    └── USAGE.md                     # Installation and usage guide
```

## Development Workflow

### Local Testing
```bash
# Install dependencies
npm install

# Run unit tests (physics calculations)
npm test

# Build demo ROM
npm run build:demo

# Run in emulator (mGBA required)
npm run emulate
```

### CI/CD
GitHub Actions workflow runs:
1. **lint** - ESLint + Prettier for JS, clang-format for C
2. **test:unit** - Jest tests for physics math
3. **build** - Compile demo project via GB Studio CLI
4. **test:rom** - Run ROM in mGBA headless mode

## Physics Algorithm

### Paddle Reflection (Crackout-style)
```
hitOffset = (ballX - paddleX) / paddleWidth  // -0.5 to +0.5
angleOffset = hitOffset * MAX_ANGLE_DEGREES  // e.g., hitOffset * 60 = -30 to +30
newAngle = 90 + angleOffset                  // 60 to 120 degrees (upward arc)
```

### Fixed-Point Math
Game Boy has no FPU. Use 8.8 fixed-point:
- Upper 8 bits = integer part
- Lower 8 bits = fractional part
- Multiply: `(a * b) >> 8`
- Divide: `(a << 8) / b`

### Lookup Tables
Pre-computed sin/cos tables (32 entries for 0-90 degrees, mirror for full circle) to avoid runtime trig.

## Key Files

| File | Purpose |
|------|---------|
| `plugins/PingPong Physics/engine/engine.json` | Plugin metadata, GB Studio version, custom fields |
| `plugins/PingPong Physics/engine/src/states/pingpong.c` | Core C physics code |
| `plugins/PingPong Physics/events/*.js` | Script events for GB Studio UI |
| `test/physics/physics.test.js` | Unit tests for angle calculations |

## GB Studio Plugin Conventions

- Event JS files MUST start with `event` prefix
- Engine C files must be in `engine/src/` matching ejected engine structure
- `engine.json` requires `version` field matching GB Studio engine version
- Scene types need `SCENETYPE_init()` and `SCENETYPE_update()` functions

## Testing Strategy

1. **Unit tests (Jest)**: Test fixed-point math and angle calculations in isolation
2. **Integration tests (mGBA)**: Build ROM, run headless, check for crashes
3. **Visual tests**: Manual testing in SameBoy for gameplay feel

## Dependencies

- Node.js 18+ (for GB Studio CLI and tests)
- mGBA (for headless ROM testing)
- GB Studio 4.1.3+ (for building demo project)
