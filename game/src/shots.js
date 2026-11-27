// Gobble Run — the screenshot scenes behind ?shot=start|play|end.
//
// Each scene plays the real rules forward from a fresh world,
// steered by a simple autopilot: it watches the nearest hazard,
// jumps the low ones, ducks the banner, and (for the end
// scene) gets careless late, as a tired turkey does — so the
// frame is what a real run looks like, and the same seed
// always gives the same frame.

import { FIELD, TURKEY, STEP } from "./config.js";
import { EVENT_OVER, KIND_BANNER } from "./world.js";
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from "./render.js";

const START_SECONDS = 1.2;
const PLAY_SECONDS = 16;
const END_LIMIT_SECONDS = 300;

/** The autopilot's input for this state: react to whatever is coming. */
function autopilot(state, careless) {
  const input = { jump: false, duck: false };
  const t = state.turkey;
  let nearest = null;
  let banner = null;
  for (const item of state.items) {
    if (item.hit || item.gone || item.kind === "corn") continue;
    const dist = item.x - (TURKEY.x + TURKEY.width / 2);
    if (item.kind === KIND_BANNER) {
      // A banner matters from sight until its far pole has passed.
      if (dist > -(item.w + 60) && dist < 170) banner = { item, dist };
      continue;
    }
    if (dist > -20 && (nearest === null || dist < nearest.dist)) nearest = { item, dist };
  }
  // Ducking wins: never jump while a banner is overhead or close.
  if (banner) {
    if (t.onGround) input.duck = true;
    return input;
  }
  if (!nearest || !t.onGround) return input;
  // Jump timing is an arc problem: she is airborne for ~0.74 s
  // and must still be high at the obstacle's far edge, so the
  // trigger distance grows with speed — and a careless turkey
  // leaves it late and clips things.
  let reach = Math.max(28, state.speed * 0.36 - 52);
  if (careless) reach *= 0.45;
  if (nearest.dist < reach && nearest.dist > -6) input.jump = true;
  return input;
}

/**
 * Set `world` to the named scene (start, play or end; any other
 * name is start) and return the screen to draw over it.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== "play" && name !== "end") {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, { jump: false, duck: false });
    return { screen: SCREEN_TITLE };
  }
  const careless = name === "end";
  const limit = careless ? END_LIMIT_SECONDS : PLAY_SECONDS;
  for (let i = 0; i < limit / STEP; i += 1) {
    if (world.step(STEP, autopilot(world.state, careless)) & EVENT_OVER) break;
    if (!careless && world.state.over) break;
  }
  if (careless) return { screen: SCREEN_OVER };
  return { screen: world.state.over ? SCREEN_OVER : SCREEN_PLAY };
}

export { FIELD };
