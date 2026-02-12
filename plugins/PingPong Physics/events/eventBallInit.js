/**
 * Ball: Initialise
 *
 * Initialises the ball at a specific position with a launch angle.
 * Call this at the start of your game to set up the ball.
 */

const id = "PP_EVENT_BALL_INIT";
const name = "Ball: Initialise";
const groups = ["PingPong Physics", "EVENT_GROUP_ACTOR"];

const fields = [
  {
    key: "x",
    label: "X Position",
    description: "Starting X position in pixels",
    type: "number",
    min: 0,
    max: 160,
    defaultValue: 80,
  },
  {
    key: "y",
    label: "Y Position",
    description: "Starting Y position in pixels",
    type: "number",
    min: 0,
    max: 144,
    defaultValue: 72,
  },
  {
    key: "angle",
    label: "Launch Angle",
    description: "Initial angle in degrees (90 = up, 270 = down)",
    type: "number",
    min: 0,
    max: 359,
    defaultValue: 270,
  },
];

const compile = (input, helpers) => {
  const { _callNative, _addComment } = helpers;

  _addComment("Initialise ball physics");
  _callNative("pingpong_init", [input.x, input.y, input.angle]);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: true,
};
