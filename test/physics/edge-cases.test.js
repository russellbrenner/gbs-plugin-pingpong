/**
 * Edge Case Tests
 *
 * Tests boundary conditions and extreme values to ensure
 * the physics system handles edge cases gracefully.
 */

const {
  intToFp,
  fpToInt,
  fpToIntRound,
  fpMul,
  fpDiv,
  fpSin,
  fpCos,
  calculateReflectionAngle,
  angleToVelocity,
  FP_ONE,
} = require("../../src/physics");

describe("Screen Boundary Conditions", () => {
  const screenWidth = 160;
  const screenHeight = 144;

  test("ball at left edge (x=0) has valid position", () => {
    const fpX = intToFp(0);
    expect(fpToInt(fpX)).toBe(0);
    expect(fpToIntRound(fpX)).toBe(0);
  });

  test("ball at right edge (x=159) has valid position", () => {
    const fpX = intToFp(screenWidth - 1);
    expect(fpToInt(fpX)).toBe(159);
  });

  test("ball at top edge (y=0) has valid position", () => {
    const fpY = intToFp(0);
    expect(fpToInt(fpY)).toBe(0);
  });

  test("ball at bottom edge (y=143) has valid position", () => {
    const fpY = intToFp(screenHeight - 1);
    expect(fpToInt(fpY)).toBe(143);
  });

  test("ball can wrap around screen edges", () => {
    // Simulating ball going off right edge and wrapping
    let fpX = intToFp(158);
    const velocity = intToFp(3); // 3 pixels per frame

    fpX += velocity;
    const screenX = fpToInt(fpX);

    // At 161, would need wrapping logic in game
    expect(screenX).toBe(161);
    expect(screenX % screenWidth).toBe(1); // Wrapped position
  });
});

describe("High Speed Ball Physics", () => {
  test("maximum speed (8) produces valid velocity", () => {
    const maxSpeed = 8;
    const { velX, velY } = angleToVelocity(45, maxSpeed);

    // Should be within reasonable bounds
    expect(Math.abs(fpToInt(velX))).toBeLessThanOrEqual(maxSpeed);
    expect(Math.abs(fpToInt(velY))).toBeLessThanOrEqual(maxSpeed);
  });

  test("high speed diagonal movement is stable", () => {
    const speed = 8;
    const { velX, velY } = angleToVelocity(45, speed);

    // Apply velocity multiple times
    let x = intToFp(80);
    let y = intToFp(72);

    for (let i = 0; i < 60; i++) {
      // 1 second at 60fps
      x += velX;
      y += velY;
    }

    // Should still produce valid integers
    expect(Number.isFinite(fpToInt(x))).toBe(true);
    expect(Number.isFinite(fpToInt(y))).toBe(true);
  });

  test("speed 1 produces sub-pixel movement", () => {
    const { velX, velY } = angleToVelocity(90, 1);

    // At 90 degrees, only Y velocity
    expect(fpToInt(velX)).toBe(0);

    // Y should be -1 (upward, 1 pixel per frame)
    expect(fpToInt(velY)).toBe(-1);
  });
});

describe("Paddle Edge Cases", () => {
  const paddleWidth = 24;
  const maxAngle = 60;

  test("ball exactly at paddle centre", () => {
    const angle = calculateReflectionAngle(80, 80, paddleWidth, maxAngle);
    expect(angle).toBe(90);
  });

  test("ball 1 pixel left of centre", () => {
    const angle = calculateReflectionAngle(79, 80, paddleWidth, maxAngle);
    expect(angle).toBeLessThan(90);
    expect(angle).toBeGreaterThan(30);
  });

  test("ball 1 pixel right of centre", () => {
    const angle = calculateReflectionAngle(81, 80, paddleWidth, maxAngle);
    expect(angle).toBeGreaterThan(90);
    expect(angle).toBeLessThan(150);
  });

  test("ball far outside paddle left still clamps", () => {
    const angle = calculateReflectionAngle(0, 80, paddleWidth, maxAngle);
    expect(angle).toBe(30); // Clamped minimum
  });

  test("ball far outside paddle right still clamps", () => {
    const angle = calculateReflectionAngle(160, 80, paddleWidth, maxAngle);
    expect(angle).toBe(150); // Clamped maximum
  });

  test("very narrow paddle (8px) has steeper angles", () => {
    const narrowWidth = 8;
    const leftAngle = calculateReflectionAngle(76, 80, narrowWidth, maxAngle);
    const rightAngle = calculateReflectionAngle(84, 80, narrowWidth, maxAngle);

    // Full range should still be achieved
    expect(leftAngle).toBe(30);
    expect(rightAngle).toBe(150);
  });

  test("very wide paddle (48px) has gentler angle gradient", () => {
    const wideWidth = 48;
    const halfLeft = calculateReflectionAngle(68, 80, wideWidth, maxAngle);

    // Halfway to edge should be 60 degrees (90 - 30)
    expect(halfLeft).toBe(60);
  });

  test("reduced max angle (30) limits reflection range", () => {
    const reducedMax = 30;
    const leftEdge = calculateReflectionAngle(68, 80, paddleWidth, reducedMax);
    const rightEdge = calculateReflectionAngle(92, 80, paddleWidth, reducedMax);

    expect(leftEdge).toBe(60); // 90 - 30
    expect(rightEdge).toBe(120); // 90 + 30
  });
});

describe("Trigonometry Edge Cases", () => {
  test("all cardinal directions produce correct velocities", () => {
    const speed = 2;

    // Right (0°)
    const right = angleToVelocity(0, speed);
    expect(fpToInt(right.velX)).toBeGreaterThan(0);
    expect(fpToInt(right.velY)).toBe(0);

    // Up (90°)
    const up = angleToVelocity(90, speed);
    expect(fpToInt(up.velX)).toBe(0);
    expect(fpToInt(up.velY)).toBeLessThan(0);

    // Left (180°)
    const left = angleToVelocity(180, speed);
    expect(fpToInt(left.velX)).toBeLessThan(0);
    expect(fpToInt(left.velY)).toBe(0);

    // Down (270°)
    const down = angleToVelocity(270, speed);
    expect(fpToInt(down.velX)).toBe(0);
    expect(fpToInt(down.velY)).toBeGreaterThan(0);
  });

  test("negative angles wrap correctly", () => {
    // -90 should equal 270
    expect(fpSin(-90)).toBe(fpSin(270));
    expect(fpCos(-90)).toBe(fpCos(270));
  });

  test("angles greater than 360 wrap correctly", () => {
    expect(fpSin(450)).toBe(fpSin(90));
    expect(fpCos(450)).toBe(fpCos(90));
    expect(fpSin(720)).toBe(fpSin(0));
  });

  test("boundary angles (89, 91) are close to 90", () => {
    const sin89 = fpSin(89);
    const sin90 = fpSin(90);
    const sin91 = fpSin(91);

    // All should be close to 256 (1.0)
    expect(sin89).toBeGreaterThan(250);
    expect(sin90).toBe(256);
    expect(sin91).toBeGreaterThan(250);
  });
});

describe("Fixed-Point Precision", () => {
  test("sub-pixel accumulation works correctly", () => {
    // Simulating 0.5 pixel per frame movement
    const halfPixel = FP_ONE >> 1; // 128 = 0.5 in 8.8
    let position = 0;

    // After 2 frames, should have moved 1 pixel
    position += halfPixel;
    expect(fpToInt(position)).toBe(0); // Still 0 (truncated)

    position += halfPixel;
    expect(fpToInt(position)).toBe(1); // Now 1
  });

  test("rounding vs truncation difference", () => {
    const almostOne = FP_ONE - 1; // 255 = 0.996

    expect(fpToInt(almostOne)).toBe(0); // Truncated
    expect(fpToIntRound(almostOne)).toBe(1); // Rounded
  });

  test("multiplication precision is maintained", () => {
    // 1.5 * 1.5 = 2.25
    const onePointFive = FP_ONE + (FP_ONE >> 1); // 384
    const result = fpMul(onePointFive, onePointFive);

    // 2.25 in 8.8 = 576
    expect(result).toBe(576);
    expect(fpToInt(result)).toBe(2);
  });

  test("division precision is maintained", () => {
    // 3.0 / 2.0 = 1.5
    const three = intToFp(3);
    const two = intToFp(2);
    const result = fpDiv(three, two);

    // 1.5 in 8.8 = 384
    expect(result).toBe(384);
  });
});

describe("Velocity Direction Consistency", () => {
  test("angles in first quadrant (0-90) go up-right", () => {
    // Test representative angles avoiding exact table boundaries
    const angles = [15, 30, 45, 60, 75];
    for (const angle of angles) {
      const { velX, velY } = angleToVelocity(angle, 2);
      expect(velX).toBeGreaterThan(0); // Right
      expect(velY).toBeLessThan(0); // Up (screen Y is inverted)
    }
  });

  test("angles in second quadrant (91-180) go up-left", () => {
    // Test representative angles avoiding exact table boundaries
    const angles = [105, 120, 135, 150, 165];
    for (const angle of angles) {
      const { velX, velY } = angleToVelocity(angle, 2);
      expect(velX).toBeLessThan(0); // Left
      expect(velY).toBeLessThan(0); // Up
    }
  });

  test("paddle reflection angles stay in upper half", () => {
    const paddleWidth = 24;
    const maxAngle = 60;

    for (let offset = -12; offset <= 12; offset += 2) {
      const ballX = 80 + offset;
      const angle = calculateReflectionAngle(ballX, 80, paddleWidth, maxAngle);

      // All paddle reflections should go upward (angles 30-150)
      expect(angle).toBeGreaterThanOrEqual(30);
      expect(angle).toBeLessThanOrEqual(150);

      // Verify velocity is upward
      const { velY } = angleToVelocity(angle, 2);
      expect(velY).toBeLessThan(0); // Upward
    }
  });
});
