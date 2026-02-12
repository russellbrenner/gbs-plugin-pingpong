# Ball Physics Documentation

This document explains the physics algorithms used in the PingPong Physics plugin.

## Fixed-Point Math

The Game Boy has no floating-point unit (FPU), so we use fixed-point arithmetic for all physics calculations.

### 8.8 Format

We use an 8.8 fixed-point format:
- 8 bits for the integer part (signed: -128 to +127)
- 8 bits for the fractional part (1/256 precision)

```
  Integer Part (8 bits)    Fractional Part (8 bits)
  [S][I][I][I][I][I][I][I].[F][F][F][F][F][F][F][F]
```

### Conversion

```c
// Integer to fixed-point (multiply by 256)
fixed_t value = x << 8;

// Fixed-point to integer (divide by 256)
int8_t pixel = value >> 8;

// With rounding
int8_t pixel = (value + 128) >> 8;
```

### Operations

```c
// Addition/subtraction work normally
c = a + b;
c = a - b;

// Multiplication requires adjustment
c = (a * b) >> 8;

// Division requires adjustment
c = (a << 8) / b;
```

## Trigonometry

### Lookup Tables

Computing sine/cosine at runtime is expensive. We pre-compute a lookup table for the first quadrant (0-90 degrees) with 32 entries.

```
Entry[i] = sin(i * 90 / 32) * 256
```

Other quadrants use symmetry:
- sin(90+x) = cos(x)
- sin(180+x) = -sin(x)
- sin(270+x) = -cos(x)

### Accuracy

With 32 entries, we have ~2.8 degree resolution. This is sufficient for pong/breakout games where precise angles aren't critical.

## Paddle Reflection Algorithm

### Crackout-Style Physics

In Crackout (and most breakout games), the reflection angle depends on where the ball hits the paddle:

```
   Ball hits left edge     Ball hits centre     Ball hits right edge
          \                      |                      /
           \                     |                     /
            \                    |                    /
   =====[paddle]=====    =====[paddle]=====    =====[paddle]=====
```

### Calculation

1. **Calculate hit offset** (where on paddle the ball hit):
   ```
   offset = (ballX - paddleCentreX) / halfPaddleWidth
   ```
   This gives a value from -1.0 (left edge) to +1.0 (right edge).

2. **Calculate angle offset**:
   ```
   angleOffset = offset * MAX_ANGLE
   ```
   Where MAX_ANGLE is configurable (default: 60 degrees).

3. **Calculate final angle**:
   ```
   newAngle = 90 + angleOffset
   ```
   90 degrees is straight up; adding offset biases left or right.

4. **Clamp to safe range**:
   ```
   if (newAngle < 30) newAngle = 30
   if (newAngle > 150) newAngle = 150
   ```
   This prevents nearly-horizontal shots that would be frustrating.

### Velocity from Angle

```c
velX = speed * cos(angle)
velY = speed * sin(angle) * -1  // Negative for upward motion
```

## Screen Coordinates

The Game Boy screen uses top-left origin:
- X increases rightward (0-160)
- Y increases downward (0-144)

For physics:
- Positive X velocity = moving right
- Negative Y velocity = moving up (toward top of screen)

## Wall Reflection

Simple wall reflections just invert the appropriate velocity component:

```c
// Horizontal wall (top/bottom)
velY = -velY;

// Vertical wall (left/right)
velX = -velX;
```

## Performance Considerations

### Avoid Division

Division is slow on the Game Boy. Where possible:
- Use bit shifts for powers of 2
- Pre-compute divisors as multiplications with inverses
- Use lookup tables

### Keep Values Small

8.8 fixed-point gives us a range of -128 to +127. For a 160x144 screen, this is sufficient for positions but care is needed with velocities and intermediate calculations.

### Bank Switching

Functions marked `BANKED` are placed in switchable ROM banks. This allows the physics code to coexist with other plugin code without using up precious bank 0 space.
