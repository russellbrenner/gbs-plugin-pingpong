/**
 * Physics Module (JavaScript Reference Implementation)
 *
 * This mirrors the C implementation for testing purposes.
 * The same algorithms are used in both for consistency.
 */

// Fixed-point constants (8.8 format)
const FP_SHIFT = 8;
const FP_ONE = 1 << FP_SHIFT; // 256
const FP_HALF = FP_ONE >> 1; // 128

/**
 * Convert integer to fixed-point
 */
function intToFp(x) {
  return x << FP_SHIFT;
}

/**
 * Convert fixed-point to integer (truncate)
 */
function fpToInt(x) {
  return x >> FP_SHIFT;
}

/**
 * Convert fixed-point to integer (round)
 */
function fpToIntRound(x) {
  return (x + FP_HALF) >> FP_SHIFT;
}

/**
 * Fixed-point multiplication
 */
function fpMul(a, b) {
  return (a * b) >> FP_SHIFT;
}

/**
 * Fixed-point division
 */
function fpDiv(a, b) {
  return (a << FP_SHIFT) / b;
}

/**
 * Sine lookup table (0-90 degrees, 32 entries)
 */
const SIN_TABLE = [
  0, 13, 25, 38, 50, 63, 75, 87, 100, 112, 124, 135, 147, 158, 169, 180, 190,
  200, 209, 218, 226, 234, 241, 247, 252, 254, 255, 256, 256, 256, 256, 256,
  256,
];

/**
 * Get sine value for angle in degrees (0-359)
 */
function fpSin(degrees) {
  degrees = degrees % 360;
  if (degrees < 0) degrees += 360;

  const tableSize = 32;
  let sign = 1;
  let lookupDegrees = degrees;

  if (degrees > 180) {
    sign = -1;
    lookupDegrees = degrees - 180;
  }

  if (lookupDegrees > 90) {
    lookupDegrees = 180 - lookupDegrees;
  }

  const index = Math.floor((lookupDegrees * tableSize) / 90);
  return sign * SIN_TABLE[Math.min(index, tableSize)];
}

/**
 * Get cosine value for angle in degrees (0-359)
 */
function fpCos(degrees) {
  return fpSin((degrees + 90) % 360);
}

/**
 * Calculate paddle reflection angle
 *
 * @param {number} ballX Ball X position (pixels)
 * @param {number} paddleX Paddle centre X position (pixels)
 * @param {number} paddleWidth Paddle width (pixels)
 * @param {number} maxAngle Maximum angle offset (degrees)
 * @returns {number} New angle in degrees (30-150, clamped)
 */
function calculateReflectionAngle(ballX, paddleX, paddleWidth, maxAngle = 60) {
  const halfWidth = paddleWidth / 2;

  // Calculate hit offset: -1.0 to +1.0
  let hitOffset = (ballX - paddleX) / halfWidth;

  // Clamp offset to valid range
  hitOffset = Math.max(-1, Math.min(1, hitOffset));

  // Calculate angle offset
  const angleOffset = hitOffset * maxAngle;

  // Base angle is 90 (straight up)
  let newAngle = 90 + angleOffset;

  // Clamp to prevent horizontal shots
  newAngle = Math.max(30, Math.min(150, newAngle));

  return Math.round(newAngle);
}

/**
 * Calculate velocity components from angle and speed
 *
 * @param {number} angle Angle in degrees
 * @param {number} speed Speed (fixed-point)
 * @returns {{velX: number, velY: number}} Velocity components
 */
function angleToVelocity(angle, speed) {
  const velX = fpMul(intToFp(speed), fpCos(angle));
  const velY = -fpMul(intToFp(speed), fpSin(angle)); // Negative for screen coords

  return { velX, velY };
}

module.exports = {
  // Fixed-point operations
  FP_SHIFT,
  FP_ONE,
  FP_HALF,
  intToFp,
  fpToInt,
  fpToIntRound,
  fpMul,
  fpDiv,

  // Trigonometry
  fpSin,
  fpCos,
  SIN_TABLE,

  // Physics
  calculateReflectionAngle,
  angleToVelocity,
};
