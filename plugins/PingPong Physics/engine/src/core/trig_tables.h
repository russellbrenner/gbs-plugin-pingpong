/**
 * Pre-computed Trigonometry Lookup Tables
 *
 * Tables for sin and cos values in 8.8 fixed-point format.
 * 32 entries covering 0-90 degrees (can mirror for full circle).
 *
 * Entry i = sin(i * 90 / 32) or cos(i * 90 / 32)
 * Each value is scaled by 256 (FP_ONE)
 */

#ifndef TRIG_TABLES_H
#define TRIG_TABLES_H

#include "fixed_point.h"

// Number of entries in quarter-circle table
#define TRIG_TABLE_SIZE 32
#define DEGREES_PER_ENTRY (90 / TRIG_TABLE_SIZE)

/**
 * Sine table for 0-90 degrees in 2.8 degree increments
 * Values are 8.8 fixed-point (multiply by 256)
 *
 * sin(0) = 0, sin(90) = 256 (1.0)
 */
static const fixed_t SIN_TABLE[TRIG_TABLE_SIZE + 1] = {
    0,      // 0°
    13,     // 2.8°
    25,     // 5.6°
    38,     // 8.4°
    50,     // 11.25°
    63,     // 14.0°
    75,     // 16.8°
    87,     // 19.7°
    100,    // 22.5°
    112,    // 25.3°
    124,    // 28.1°
    135,    // 30.9°
    147,    // 33.75°
    158,    // 36.5°
    169,    // 39.4°
    180,    // 42.2°
    190,    // 45.0°
    200,    // 47.8°
    209,    // 50.6°
    218,    // 53.4°
    226,    // 56.25°
    234,    // 59.0°
    241,    // 61.9°
    247,    // 64.7°
    252,    // 67.5°
    254,    // 70.3°
    255,    // 73.1°
    256,    // 75.9°
    256,    // 78.75°
    256,    // 81.5°
    256,    // 84.4°
    256,    // 87.2°
    256     // 90°
};

/**
 * Cosine table for 0-90 degrees
 * cos(x) = sin(90 - x), so we can derive from sin table
 * but for speed, include explicit values
 */
static const fixed_t COS_TABLE[TRIG_TABLE_SIZE + 1] = {
    256,    // 0°
    256,    // 2.8°
    256,    // 5.6°
    256,    // 8.4°
    254,    // 11.25°
    252,    // 14.0°
    247,    // 16.8°
    241,    // 19.7°
    234,    // 22.5°
    226,    // 25.3°
    218,    // 28.1°
    209,    // 30.9°
    200,    // 33.75°
    190,    // 36.5°
    180,    // 39.4°
    169,    // 42.2°
    158,    // 45.0°
    147,    // 47.8°
    135,    // 50.6°
    124,    // 53.4°
    112,    // 56.25°
    100,    // 59.0°
    87,     // 61.9°
    75,     // 64.7°
    63,     // 67.5°
    50,     // 70.3°
    38,     // 73.1°
    25,     // 75.9°
    13,     // 78.75°
    0,      // 81.5° (approximate)
    0,      // 84.4°
    0,      // 87.2°
    0       // 90°
};

/**
 * Get sine value for angle in degrees (0-359)
 * Uses symmetry: sin(180+x) = -sin(x), sin(90+x) = cos(x)
 */
inline fixed_t fp_sin(uint16_t degrees) BANKED {
    degrees = degrees % 360;

    if (degrees <= 90) {
        uint8_t index = (degrees * TRIG_TABLE_SIZE) / 90;
        return SIN_TABLE[index];
    } else if (degrees <= 180) {
        uint8_t index = ((180 - degrees) * TRIG_TABLE_SIZE) / 90;
        return SIN_TABLE[index];
    } else if (degrees <= 270) {
        uint8_t index = ((degrees - 180) * TRIG_TABLE_SIZE) / 90;
        return -SIN_TABLE[index];
    } else {
        uint8_t index = ((360 - degrees) * TRIG_TABLE_SIZE) / 90;
        return -SIN_TABLE[index];
    }
}

/**
 * Get cosine value for angle in degrees (0-359)
 * cos(x) = sin(x + 90)
 */
inline fixed_t fp_cos(uint16_t degrees) BANKED {
    return fp_sin((degrees + 90) % 360);
}

#endif // TRIG_TABLES_H
