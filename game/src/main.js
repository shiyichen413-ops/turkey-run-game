// Gobble Run — boot, the fixed-step loop, and the screens.
//
// One canvas, three screens (title, play, over), a world from
// world.js and a picture from render.js. ?shot=start|play|end
// &seed=1 stages the screenshot scenes instead of playing.

import { FIELD, STEP } from "./config.js";
import { createWorld, EVENT_CORN, EVENT_OVER, EVENT_STUMBLE } from "./world.js";
import { draw, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from "./render.js";
import { createInput } from "./input.js";
import { stageShot } from "./shots.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");
const params = new URLSearchParams(location.search);
const seed = Number(params.get("seed") ?? 1) || 1;
const shot = params.get("shot");

const world = createWorld(seed);
const input = createInput(canvas);

let screen = SCREEN_TITLE;
let best = 0;
let shotMode = false;

if (shot) {
  shotMode = true;
  screen = stageShot(shot, world).screen;
  best = world.state.score;
}

/* ---------- sizing: fit the logical stage into the window ---------- */

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}
window.addEventListener("resize", resize);
resize();

function drawFrame() {
  const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
  const ox = (canvas.width - FIELD.width * scale) / 2;
  const oy = (canvas.height - FIELD.height * scale) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#f7c873";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  draw(ctx, world.state, screen, best);
}

/* ---------- the loop ---------- */

let last = performance.now();
let acc = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;

  if (!shotMode) {
    const read = input.read();
    if (screen !== SCREEN_PLAY && read.start) {
      world.reset();
      screen = SCREEN_PLAY;
      status.textContent = "The run begins. Jump with Space, duck with the down arrow.";
    } else if (screen === SCREEN_PLAY) {
      acc += dt;
      while (acc >= STEP) {
        const events = world.step(STEP, read);
        acc -= STEP;
        if (events & EVENT_STUMBLE) status.textContent = "Stumble! The farmer is gaining.";
        if (events & EVENT_CORN) status.textContent = "Corn! A little more daylight behind you.";
        if (events & EVENT_OVER) {
          screen = SCREEN_OVER;
          best = Math.max(best, world.state.score);
          status.textContent =
            world.state.over === "escaped"
              ? `Escaped! Score ${world.state.score}.`
              : `Caught. Score ${world.state.score}. Press Enter to run again.`;
          break;
        }
      }
    }
  }

  drawFrame();
}
requestAnimationFrame(frame);
