/**
 * Fixed-Point Math Tests
 *
 * Tests the 8.8 fixed-point math operations to ensure
 * they work correctly before using in physics calculations.
 */

const {
  FP_SHIFT,
  FP_ONE,
  intToFp,
  fpToInt,
  fpToIntRound,
  fpMul,
  fpDiv,
} = require("../../src/physics");

describe("Fixed-Point Conversions", () => {
  test("intToFp converts integers correctly", () => {
    expect(intToFp(0)).toBe(0);
    expect(intToFp(1)).toBe(256);
    expect(intToFp(2)).toBe(512);
    expect(intToFp(-1)).toBe(-256);
    expect(intToFp(127)).toBe(32512); // Max positive value
  });

  test("fpToInt truncates correctly", () => {
    expect(fpToInt(0)).toBe(0);
    expect(fpToInt(256)).toBe(1);
    expect(fpToInt(512)).toBe(2);
    expect(fpToInt(255)).toBe(0); // Just under 1.0
    expect(fpToInt(257)).toBe(1); // Just over 1.0
    expect(fpToInt(-256)).toBe(-1);
  });

  test("fpToIntRound rounds correctly", () => {
    expect(fpToIntRound(0)).toBe(0);
    expect(fpToIntRound(256)).toBe(1);
    expect(fpToIntRound(128)).toBe(1); // 0.5 rounds up
    expect(fpToIntRound(127)).toBe(0); // Just under 0.5 rounds down
    expect(fpToIntRound(384)).toBe(2); // 1.5 rounds up
  });

  test("FP_ONE equals 256", () => {
    expect(FP_ONE).toBe(256);
  });

  test("FP_SHIFT equals 8", () => {
    expect(FP_SHIFT).toBe(8);
  });
});

describe("Fixed-Point Arithmetic", () => {
  test("fpMul multiplies correctly", () => {
    // 1.0 * 1.0 = 1.0
    expect(fpMul(256, 256)).toBe(256);

    // 2.0 * 2.0 = 4.0
    expect(fpMul(512, 512)).toBe(1024);

    // 0.5 * 2.0 = 1.0
    expect(fpMul(128, 512)).toBe(256);

    // 1.5 * 2.0 = 3.0
    expect(fpMul(384, 512)).toBe(768);
  });

  test("fpMul handles negative values", () => {
    // -1.0 * 1.0 = -1.0
    expect(fpMul(-256, 256)).toBe(-256);

    // -1.0 * -1.0 = 1.0
    expect(fpMul(-256, -256)).toBe(256);
  });

  test("fpDiv divides correctly", () => {
    // 1.0 / 1.0 = 1.0
    expect(fpDiv(256, 256)).toBe(256);

    // 2.0 / 1.0 = 2.0
    expect(fpDiv(512, 256)).toBe(512);

    // 1.0 / 2.0 = 0.5
    expect(fpDiv(256, 512)).toBe(128);
  });

  test("fpDiv handles negative values", () => {
    // -1.0 / 1.0 = -1.0
    expect(fpDiv(-256, 256)).toBe(-256);

    // 1.0 / -1.0 = -1.0
    expect(fpDiv(256, -256)).toBe(-256);
  });
});

describe("Edge Cases", () => {
  test("handles zero correctly", () => {
    expect(fpMul(0, 256)).toBe(0);
    expect(fpMul(256, 0)).toBe(0);
    expect(intToFp(0)).toBe(0);
    expect(fpToInt(0)).toBe(0);
  });

  test("handles maximum values without overflow", () => {
    // 127 * 2 = 254 (within range)
    const result = fpMul(intToFp(127), intToFp(2));
    expect(fpToInt(result)).toBe(254);
  });

  test("small values maintain precision", () => {
    // 0.25 * 4 = 1.0
    expect(fpMul(64, 1024)).toBe(256);
  });
});
