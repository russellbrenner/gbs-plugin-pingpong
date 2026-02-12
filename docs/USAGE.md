# Usage Guide

## Installation

1. Download the latest release from [GitHub Releases](https://github.com/russellbrenner/gbs-plugin-pingpong/releases)

2. Extract the `PingPong Physics` folder into your GB Studio project's `plugins` directory:
   ```
   your-project/
   ├── .gbsproj
   ├── assets/
   └── plugins/
       └── PingPong Physics/    <-- extract here
   ```

3. Restart GB Studio (or close and reopen your project)

4. The plugin events will appear under "PingPong Physics" in the script editor

## Quick Start

### Basic Pong Setup

1. **Create your scene** with:
   - Background (playing field)
   - Ball sprite (actor)
   - Paddle sprite (actor)

2. **On Scene Init**, add these events:
   ```
   Ball: Initialise
   - X Position: 80 (centre of screen)
   - Y Position: 72 (centre of screen)
   - Launch Angle: 270 (downward)
   ```

3. **On Update (every frame)**, add:
   ```
   Ball: Update Physics
   - Ball Actor: [select your ball]
   ```

4. **For paddle collision**, add a check in your update script:
   ```
   Ball: Paddle Collision
   - Paddle Actor: [select your paddle]
   ```

5. **For wall bounces**, add collision checks at screen edges:
   ```
   If Actor: At Position
   - Ball Y > 140:
       Ball: Wall Reflect
       - Wall Type: Horizontal
   ```

## Script Events

### Ball: Initialise

Sets the ball's starting position and launch angle.

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| X Position | Number | 0-160 | 80 | Starting X coordinate |
| Y Position | Number | 0-144 | 72 | Starting Y coordinate |
| Launch Angle | Number | 0-359 | 270 | Launch direction (90=up, 270=down) |

### Ball: Update Physics

Moves the ball according to its current velocity. Call this every frame.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Ball Actor | Actor | $self$ | The actor to move |

### Ball: Paddle Collision

Checks if the ball collides with a paddle and reflects it at an angle based on where it hit.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Paddle Actor | Actor | $self$ | The paddle to check |
| On Miss | Events | (none) | Script to run if ball missed |

### Ball: Wall Reflect

Reflects the ball off a wall surface.

| Parameter | Type | Options | Default | Description |
|-----------|------|---------|---------|-------------|
| Wall Type | Select | Horizontal, Vertical | Horizontal | Type of surface hit |

## Engine Settings

In GB Studio's Engine Settings (accessible when you have a PingPong scene type), you can adjust:

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Ball Speed | 1-8 | 2 | Base velocity in pixels/frame |
| Max Reflection Angle | 30-80 | 60 | Maximum angle offset from paddle edges |
| Paddle Width | 8-48 | 24 | Collision detection width in pixels |

## Scene Type

The plugin adds a "PingPong Game" scene type. Using this scene type enables the engine settings above.

## Tips

### Paddle Movement

The plugin doesn't handle paddle movement - use GB Studio's built-in actor movement or custom scripts:

```
If Joypad Input: Left pressed
    Actor: Move Relative
    - X: -2
    - Y: 0
If Joypad Input: Right pressed
    Actor: Move Relative
    - X: +2
    - Y: 0
```

### Ball Reset

When the ball goes off-screen, reset it:

```
If Actor: At Position
- Ball Y > 150 (below screen):
    Ball: Initialise
    - X: 80
    - Y: 72
    - Angle: 270
```

### Speed Increase

To increase difficulty over time, consider:
1. Adjusting the Ball Speed engine setting
2. Using a variable to track score and conditionally speed up

### Sound Effects

Add sound effects for collisions:
```
Ball: Paddle Collision
- Paddle Actor: Paddle
- [Event]: Sound: Play Effect - ping.wav

Ball: Wall Reflect
- [Event]: Sound: Play Effect - wall.wav
```

## Troubleshooting

### Ball not moving
- Ensure you're calling "Ball: Update Physics" every frame
- Check that the ball actor is visible and on-screen
- Verify the launch angle isn't pointing off-screen immediately

### Ball passes through paddle
- The paddle collision check runs once per frame
- At high speeds, the ball may skip past the paddle
- Try reducing Ball Speed or increasing Paddle Width

### Plugin events not appearing
- Ensure the plugin is in `plugins/PingPong Physics/`
- Check that `engine/engine.json` exists and is valid JSON
- Restart GB Studio after adding the plugin
