/**
 * Ball: Wall Reflect
 *
 * Reflects the ball off a wall (horizontal or vertical surface).
 * Use this when the ball hits the edges of the screen.
 */

const id = "PP_EVENT_WALL_REFLECT";
const name = "Ball: Wall Reflect";
const groups = ["PingPong Physics", "EVENT_GROUP_ACTOR"];

const fields = [
  {
    key: "direction",
    label: "Wall Type",
    description: "Type of wall the ball hit",
    type: "select",
    options: [
      ["horizontal", "Horizontal (Top/Bottom)"],
      ["vertical", "Vertical (Left/Right)"],
    ],
    defaultValue: "horizontal",
  },
];

const compile = (input, helpers) => {
  const { _callNative, _addComment } = helpers;

  if (input.direction === "horizontal") {
    _addComment("Reflect off horizontal surface");
    _callNative("pingpong_reflect_horizontal");
  } else {
    _addComment("Reflect off vertical surface");
    _callNative("pingpong_reflect_vertical");
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
