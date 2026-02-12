/**
 * Fixed-Point Math Library for Game Boy
 *
 * Uses 8.8 format: 8 bits integer, 8 bits fractional
 * Range: -128.0 to +127.996 with 1/256 precision
 */

#ifndef FIXED_POINT_H
#define FIXED_POINT_H

#include <stdint.h>

// Type definition for 8.8 fixed-point number
typedef int16_t fixed_t;

// Conversion macros
#define FP_SHIFT 8
#define FP_ONE (1 << FP_SHIFT)           // 1.0 = 256
#define FP_HALF (FP_ONE >> 1)            // 0.5 = 128

// Integer to fixed-point
#define INT_TO_FP(x) ((fixed_t)((x) << FP_SHIFT))

// Fixed-point to integer (truncate)
#define FP_TO_INT(x) ((int8_t)((x) >> FP_SHIFT))

// Fixed-point to integer (round)
#define FP_TO_INT_ROUND(x) ((int8_t)(((x) + FP_HALF) >> FP_SHIFT))

// Fixed-point multiplication: (a * b) >> 8
#define FP_MUL(a, b) ((fixed_t)(((int32_t)(a) * (int32_t)(b)) >> FP_SHIFT))

// Fixed-point division: (a << 8) / b
#define FP_DIV(a, b) ((fixed_t)(((int32_t)(a) << FP_SHIFT) / (int32_t)(b)))

// Absolute value
#define FP_ABS(x) ((x) < 0 ? -(x) : (x))

// Sign
#define FP_SIGN(x) ((x) < 0 ? -1 : ((x) > 0 ? 1 : 0))

// Clamp value between min and max
#define FP_CLAMP(x, min, max) ((x) < (min) ? (min) : ((x) > (max) ? (max) : (x)))

// Common constants
#define FP_PI INT_TO_FP(3)               // Approximate PI as 3 (close enough for GB)
#define FP_TWO INT_TO_FP(2)
#define FP_MINUS_ONE (-FP_ONE)

#endif // FIXED_POINT_H
