/**
 * Ball: Paddle Collision
 *
 * Checks if the ball collides with a paddle and reflects it.
 * The reflection angle depends on where the ball hits the paddle:
 * - Centre: Ball bounces straight up
 * - Edges: Ball bounces at an angle
 *
 * Inspired by Crackout for NES.
 */

const id = "PP_EVENT_PADDLE_COLLIDE";
const name = "Ball: Paddle Collision";
const groups = ["PingPong Physics", "EVENT_GROUP_ACTOR"];

const fields = [
  {
    key: "paddleActorId",
    label: "Paddle Actor",
    description: "The actor representing the paddle",
    type: "actor",
    defaultValue: "$self$",
  },
  {
    type: "group",
    fields: [
      {
        key: "__collapseElse",
        label: "On Miss",
        type: "collapsable",
        defaultValue: false,
        conditions: [
          {
            key: "true",
            eq: "true",
          },
        ],
      },
      {
        key: "onMiss",
        label: "On Miss",
        description: "Script to run if ball misses paddle",
        type: "events",
        conditions: [
          {
            key: "__collapseElse",
            eq: true,
          },
        ],
      },
    ],
  },
];

const compile = (input, helpers) => {
  const { _callNative, _addComment, _ifConst, _declareLocal, _localRef, getActorById } = helpers;

  _addComment("Check paddle collision");

  // Get paddle actor position
  const paddle = getActorById(input.paddleActorId);

  // Declare result variable
  const hitRef = _declareLocal("paddle_hit", 1, true);

  // Call native collision function
  // Returns 1 if hit, 0 if miss
  _callNative("pingpong_paddle_reflect", [
    paddle.x, // Paddle centre X
    paddle.y, // Paddle top Y
    _localRef(hitRef),
  ]);

  // If miss, run the onMiss script
  if (input.onMiss && input.onMiss.length > 0) {
    _ifConst(".EQ", hitRef, 0, () => {
      // Compile onMiss events
      helpers.compileEvents(input.onMiss);
    });
  }
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: false,
};
