/**
 * Ball: Update Physics
 *
 * Updates ball position based on velocity.
 * Call this every frame in your game loop.
 * The ball actor will be moved to the new position.
 */

const id = "PP_EVENT_BALL_UPDATE";
const name = "Ball: Update Physics";
const groups = ["PingPong Physics", "EVENT_GROUP_ACTOR"];

const fields = [
  {
    key: "actorId",
    label: "Ball Actor",
    description: "The actor representing the ball",
    type: "actor",
    defaultValue: "$self$",
  },
];

const compile = (input, helpers) => {
  const { _callNative, _addComment, _declareLocal, _localRef, actorSetById, getActorIndex } =
    helpers;

  _addComment("Update ball physics");

  // Declare local variables for position output
  const posXRef = _declareLocal("ball_x", 1, true);
  const posYRef = _declareLocal("ball_y", 1, true);

  // Call native function to update physics
  _callNative("pingpong_update", [_localRef(posXRef), _localRef(posYRef)]);

  // Move actor to new position
  // Note: This uses GBVM operations to set actor position
  const actorIndex = getActorIndex(input.actorId);
  actorSetById(actorIndex, posXRef, posYRef);
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  allowedBeforeInitFade: false,
};
