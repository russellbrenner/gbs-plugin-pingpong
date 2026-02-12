/**
 * Angle Calculation Tests
 *
 * Tests the paddle reflection angle calculations and
 * trigonometry functions.
 */

const {
  fpSin,
  fpCos,
  calculateReflectionAngle,
  angleToVelocity,
  intToFp,
  fpToInt,
} = require("../../src/physics");

describe("Trigonometry Lookup Tables", () => {
  test("fpSin returns 0 at 0 degrees", () => {
    expect(fpSin(0)).toBe(0);
  });

  test("fpSin returns ~256 (1.0) at 90 degrees", () => {
    expect(fpSin(90)).toBe(256);
  });

  test("fpSin returns 0 at 180 degrees", () => {
    expect(fpSin(180)).toBe(0);
  });

  test("fpSin returns negative at 270 degrees", () => {
    expect(fpSin(270)).toBe(-256);
  });

  test("fpCos returns ~256 (1.0) at 0 degrees", () => {
    expect(fpCos(0)).toBe(256);
  });

  test("fpCos returns 0 at 90 degrees", () => {
    expect(fpCos(90)).toBe(0);
  });

  test("fpCos returns ~-256 (-1.0) at 180 degrees", () => {
    expect(fpCos(180)).toBe(-256);
  });

  test("fpSin handles angles > 360", () => {
    expect(fpSin(450)).toBe(fpSin(90)); // 450 = 90
    expect(fpSin(720)).toBe(fpSin(0)); // 720 = 0
  });
});

describe("Paddle Reflection Angle", () => {
  const paddleWidth = 24;
  const maxAngle = 60;

  test("centre hit returns 90 degrees (straight up)", () => {
    const ballX = 80;
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBe(90);
  });

  test("left edge hit returns ~30 degrees (max left)", () => {
    const ballX = 68; // paddleX - halfWidth = 80 - 12 = 68
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBe(30); // 90 - 60 = 30
  });

  test("right edge hit returns ~150 degrees (max right)", () => {
    const ballX = 92; // paddleX + halfWidth = 80 + 12 = 92
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBe(150); // 90 + 60 = 150
  });

  test("halfway left returns ~60 degrees", () => {
    const ballX = 74; // Half way to left edge
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBe(60); // 90 - 30 = 60
  });

  test("halfway right returns ~120 degrees", () => {
    const ballX = 86; // Half way to right edge
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBe(120); // 90 + 30 = 120
  });

  test("angle is clamped to minimum 30 degrees", () => {
    const ballX = 50; // Far past left edge
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBeGreaterThanOrEqual(30);
  });

  test("angle is clamped to maximum 150 degrees", () => {
    const ballX = 110; // Far past right edge
    const paddleX = 80;
    const angle = calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle);
    expect(angle).toBeLessThanOrEqual(150);
  });
});

describe("Angle to Velocity Conversion", () => {
  const speed = 2;

  test("90 degrees gives upward velocity only", () => {
    const { velX, velY } = angleToVelocity(90, speed);
    expect(fpToInt(velX)).toBe(0); // No horizontal movement
    expect(velY).toBeLessThan(0); // Upward (negative Y)
  });

  test("0 degrees gives rightward velocity only", () => {
    const { velX, velY } = angleToVelocity(0, speed);
    expect(velX).toBeGreaterThan(0); // Rightward
    expect(fpToInt(velY)).toBe(0); // No vertical movement
  });

  test("45 degrees gives diagonal velocity", () => {
    const { velX, velY } = angleToVelocity(45, speed);
    expect(velX).toBeGreaterThan(0); // Some rightward
    expect(velY).toBeLessThan(0); // Some upward
    // At 45 degrees, X and Y magnitudes should be approximately equal
    // Allow for ±1 difference due to lookup table precision and integer truncation
    const xMag = Math.abs(fpToInt(velX));
    const yMag = Math.abs(fpToInt(velY));
    expect(Math.abs(xMag - yMag)).toBeLessThanOrEqual(1);
  });

  test("velocity magnitude matches speed", () => {
    const { velX, velY } = angleToVelocity(45, speed);
    // Calculate magnitude: sqrt(velX^2 + velY^2)
    const magnitude = Math.sqrt(velX * velX + velY * velY);
    // Should be approximately speed * FP_ONE
    expect(magnitude).toBeGreaterThan(intToFp(speed) * 0.9);
    expect(magnitude).toBeLessThan(intToFp(speed) * 1.1);
  });
});
