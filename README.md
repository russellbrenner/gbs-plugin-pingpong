# PingPong Physics Plugin for GB Studio

A GB Studio plugin that adds Crackout/Breakout-style ball physics with angle-based paddle reflection for pong and breakout-style games.

## Features

- **Angle-based reflection**: Ball bounces off paddle at different angles based on hit position
- **Fixed-point math**: Optimised for Game Boy's limited CPU
- **Configurable settings**: Adjust ball speed, max angle, and physics parameters in GB Studio
- **Script events**: Easy-to-use events for ball initialisation, updates, and collision

## Installation

1. Download the latest release from [Releases](https://github.com/russellbrenner/gbs-plugin-pingpong/releases)
2. Extract into your GB Studio project's `plugins/` folder:
   ```
   your-project/
   ├── .gbsproj
   └── plugins/
       └── PingPong Physics/   <-- extract here
   ```
3. Restart GB Studio
4. The new script events will appear under "PingPong Physics" category

## Usage

### Basic Pong Setup

1. Create a scene with your paddle and ball sprites
2. In your game loop script, add:
   - **Ball: Initialise** - Set starting position and velocity
   - **Ball: Update Physics** - Call each frame to move the ball
   - **Ball: Paddle Collision** - Check and handle paddle bounces

### Paddle Collision

The paddle collision event calculates the reflection angle based on where the ball hits:

```
Centre hit  → Ball bounces straight up (90°)
Left edge   → Ball bounces up-left (60°)
Right edge  → Ball bounces up-right (120°)
```

### Configurable Parameters

In GB Studio's Engine Settings, you can adjust:

| Setting | Default | Description |
|---------|---------|-------------|
| Ball Speed | 2.0 | Base velocity (pixels/frame) |
| Max Angle | 60 | Maximum reflection angle offset |
| Paddle Width | 24 | Collision detection width |

## Requirements

- GB Studio 4.1.3 or later
- Game Boy / Game Boy Color target

## Building from Source

```bash
git clone https://github.com/russellbrenner/gbs-plugin-pingpong.git
cd gbs-plugin-pingpong
npm install
npm test          # Run unit tests
npm run build     # Build demo ROM
```

## Testing

The project includes:
- Unit tests for physics calculations (Jest)
- Integration tests using mGBA headless mode
- Demo project for manual testing

## Inspiration

Physics inspired by [Crackout](https://en.wikipedia.org/wiki/Crackout) for NES and classic breakout games.

## Licence

MIT - See [LICENCE](LICENCE) for details.

## Credits

- Ball physics algorithm based on [Smiling Cat Entertainment's breakdown](https://www.smilingcatentertainment.com/physics-for-a-block-breaker-game/)
- GB Studio plugin structure from [GB Studio documentation](https://www.gbstudio.dev/docs/extending-gbstudio/plugins/)
