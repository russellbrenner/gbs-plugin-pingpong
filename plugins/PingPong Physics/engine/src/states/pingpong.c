/**
 * PingPong Physics - Core Ball Physics Implementation
 *
 * Provides Crackout/Breakout-style ball physics with angle-based
 * paddle reflection for GB Studio games.
 */

#include <gbdk/platform.h>
#include <string.h>
#include "../core/fixed_point.h"
#include "../core/trig_tables.h"

// Engine settings (set via GB Studio UI)
extern UBYTE pingpong_ball_speed;
extern UBYTE pingpong_max_angle;
extern UBYTE pingpong_paddle_width;

// Ball state structure
typedef struct {
    fixed_t x;          // Position X (8.8 fixed-point)
    fixed_t y;          // Position Y (8.8 fixed-point)
    fixed_t vel_x;      // Velocity X (8.8 fixed-point)
    fixed_t vel_y;      // Velocity Y (8.8 fixed-point)
    uint16_t angle;     // Current angle in degrees (0-359)
    UBYTE active;       // Is ball in play?
} pingpong_ball_t;

// Global ball instance
static pingpong_ball_t ball;

/**
 * Initialise ball at position with given angle
 *
 * @param x Starting X position (pixels)
 * @param y Starting Y position (pixels)
 * @param angle_degrees Launch angle (0=right, 90=up, 180=left, 270=down)
 */
void pingpong_init(UBYTE x, UBYTE y, uint16_t angle_degrees) BANKED {
    ball.x = INT_TO_FP(x);
    ball.y = INT_TO_FP(y);
    ball.angle = angle_degrees % 360;
    ball.active = 1;

    // Calculate velocity from angle and speed
    fixed_t speed = INT_TO_FP(pingpong_ball_speed);
    ball.vel_x = FP_MUL(speed, fp_cos(ball.angle));
    ball.vel_y = FP_MUL(speed, fp_sin(ball.angle));

    // Invert Y for screen coordinates (up = negative)
    ball.vel_y = -ball.vel_y;
}

/**
 * Update ball position for one frame
 * Call this in your game loop
 *
 * @param out_x Pointer to receive new X position (pixels)
 * @param out_y Pointer to receive new Y position (pixels)
 */
void pingpong_update(UBYTE* out_x, UBYTE* out_y) BANKED {
    if (!ball.active) {
        *out_x = 0;
        *out_y = 0;
        return;
    }

    // Apply velocity to position
    ball.x += ball.vel_x;
    ball.y += ball.vel_y;

    // Convert to screen pixels
    *out_x = FP_TO_INT_ROUND(ball.x);
    *out_y = FP_TO_INT_ROUND(ball.y);
}

/**
 * Reflect ball off a horizontal surface (floor/ceiling)
 * Simply inverts Y velocity
 */
void pingpong_reflect_horizontal(void) BANKED {
    ball.vel_y = -ball.vel_y;
}

/**
 * Reflect ball off a vertical surface (left/right walls)
 * Simply inverts X velocity
 */
void pingpong_reflect_vertical(void) BANKED {
    ball.vel_x = -ball.vel_x;
}

/**
 * Handle paddle collision with angle-based reflection
 *
 * The reflection angle depends on where the ball hits the paddle:
 * - Centre hit: Ball bounces straight up (90 degrees)
 * - Left edge: Ball bounces up-left (90 - max_angle)
 * - Right edge: Ball bounces up-right (90 + max_angle)
 *
 * @param paddle_x Centre X position of paddle (pixels)
 * @param paddle_y Y position of paddle top edge (pixels)
 * @return 1 if collision occurred, 0 otherwise
 */
UBYTE pingpong_paddle_reflect(UBYTE paddle_x, UBYTE paddle_y) BANKED {
    // Get ball position in pixels
    UBYTE ball_x = FP_TO_INT_ROUND(ball.x);
    UBYTE ball_y = FP_TO_INT_ROUND(ball.y);

    // Check if ball is near paddle Y level (with some tolerance)
    if (ball_y < paddle_y - 2 || ball_y > paddle_y + 4) {
        return 0;
    }

    // Check if ball overlaps paddle X range
    UBYTE half_width = pingpong_paddle_width >> 1;
    if (ball_x < paddle_x - half_width || ball_x > paddle_x + half_width) {
        return 0;
    }

    // Calculate hit offset: -128 to +128 representing -1.0 to +1.0
    // (ball_x - paddle_x) * 128 / half_width
    int16_t offset = ((int16_t)(ball_x - paddle_x) << 7) / half_width;

    // Calculate angle offset based on hit position
    // offset * max_angle / 128
    int16_t angle_offset = (offset * (int16_t)pingpong_max_angle) >> 7;

    // New angle: 90 degrees (straight up) + offset
    int16_t new_angle = 90 + angle_offset;

    // Clamp to prevent horizontal shots
    if (new_angle < 30) new_angle = 30;
    if (new_angle > 150) new_angle = 150;

    ball.angle = (uint16_t)new_angle;

    // Update velocity based on new angle
    fixed_t speed = INT_TO_FP(pingpong_ball_speed);
    ball.vel_x = FP_MUL(speed, fp_cos(ball.angle));
    ball.vel_y = -FP_MUL(speed, fp_sin(ball.angle));  // Negative = upward

    return 1;
}

/**
 * Set ball active state
 */
void pingpong_set_active(UBYTE active) BANKED {
    ball.active = active;
}

/**
 * Get ball active state
 */
UBYTE pingpong_is_active(void) BANKED {
    return ball.active;
}

/**
 * Scene type init function (required by GB Studio)
 */
void pingpong_init_scene(void) BANKED {
    // Reset ball state when entering a pingpong scene
    memset(&ball, 0, sizeof(ball));
}

/**
 * Scene type update function (required by GB Studio)
 * Called every frame by the engine
 */
void pingpong_update_scene(void) BANKED {
    // Scene update can be handled via script events
    // This is a no-op by default
}
