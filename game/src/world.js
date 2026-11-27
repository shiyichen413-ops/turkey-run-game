// Gobble Run — the simulation: one turkey, one farmer, and a
// farm's worth of Thanksgiving hazards scrolling past.
//
// The turkey runs on the spot; the world moves. The farmer's
// gap is the real health bar — every stumble hands him a bite
// of it, corn buys a little back, and if it closes, the run
// (and very nearly the turkey) is over. Reach the forest at
// ESCAPE_AT metres and the turkey is free.

import { FIELD, TURKEY, RUN, FARMER, SCORE } from "./config.js";
import { rng } from "./random.js";

export const EVENT_STUMBLE = 1;
export const EVENT_CORN = 2;
export const EVENT_OVER = 4;

export const KIND_OVEN = "oven";
export const KIND_KNIFE = "knife";
export const KIND_HAY = "hay";
export const KIND_FENCE = "fence";
export const KIND_BANNER = "banner";
export const KIND_CORN = "corn";

// Collision/drawing sizes per kind (the banner's height is the
// clearance under it: duck, don't jump).
export const SIZES = {
  oven: { w: 66, h: 78 },
  knife: { w: 58, h: 50 },
  hay: { w: 62, h: 54 },
  fence: { w: 76, h: 42 },
  banner: { w: 150, h: 52 }, // h = the gap under the banner
  corn: { w: 26, h: 30 },
};

const OBSTACLE_KINDS = [KIND_OVEN, KIND_KNIFE, KIND_HAY, KIND_FENCE, KIND_BANNER];

export function createWorld(seed) {
  const rand = rng(seed);
  const state = {
    time: 0,
    speed: RUN.startSpeed,
    distancePx: 0,
    corn: 0,
    stumbles: 0,
    farmerGap: FARMER.startGap,
    slowTimer: 0,
    turkey: { lift: 0, vy: 0, ducking: false, onGround: true, runPhase: 0, flash: 0 },
    items: [],
    nextSpawnIn: 340,
    over: null, // 'caught' | 'escaped'
    score: 0,
  };

  function reset() {
    const fresh = createWorld(seed).state;
    Object.assign(state, fresh);
  }

  function spawn() {
    const kind = rand.chance(0.24) ? KIND_CORN : OBSTACLE_KINDS[Math.floor(rand.next() * OBSTACLE_KINDS.length)];
    const size = SIZES[kind];
    const item = { kind, x: FIELD.width + 40, w: size.w, h: size.h, hit: false, gone: false };
    if (kind === KIND_CORN) {
      item.y = rand.chance(0.5) ? FIELD.groundY - 26 : FIELD.groundY - 108; // ground corn, or jump-for-it corn
    }
    state.items.push(item);
    // Room to react: wider gaps at speed, and a breather after a banner.
    const base = kind === KIND_BANNER ? 430 : 300;
    state.nextSpawnIn = base + rand.range(0, 220) + state.speed * 0.35;
  }

  function turkeyBox() {
    const t = state.turkey;
    const h = t.ducking && t.onGround ? TURKEY.duckHeight : TURKEY.height;
    const feet = FIELD.groundY - t.lift;
    return { left: TURKEY.x - TURKEY.width / 2 + 9, right: TURKEY.x + TURKEY.width / 2 - 6, top: feet - h, bottom: feet - 4 };
  }

  function step(dt, input) {
    if (state.over) return 0;
    let events = 0;
    const t = state.turkey;
    state.time += dt;

    // --- the turkey ---
    t.ducking = Boolean(input.duck);
    if (input.jump && t.onGround) {
      t.vy = -TURKEY.jumpVelocity;
      t.onGround = false;
    }
    if (!t.onGround) {
      t.vy -= TURKEY.gravity * dt * (t.ducking ? 1 + TURKEY.fastFall / TURKEY.gravity : 1);
      t.lift += t.vy * dt;
      if (t.lift <= 0) {
        t.lift = 0;
        t.vy = 0;
        t.onGround = true;
      }
    }
    state.slowTimer = Math.max(0, state.slowTimer - dt);
    t.flash = Math.max(0, t.flash - dt);
    const speedNow = Math.min(RUN.topSpeed, RUN.startSpeed + RUN.accel * state.time) * (state.slowTimer > 0 ? 0.55 : 1);
    state.speed = speedNow;
    state.distancePx += speedNow * dt;
    t.runPhase += speedNow * dt * 0.055;

    // --- the farm scrolls, new hazards arrive ---
    state.nextSpawnIn -= speedNow * dt;
    if (state.nextSpawnIn <= 0) spawn();
    for (const item of state.items) item.x -= speedNow * dt;
    state.items = state.items.filter((item) => item.x + item.w > -80 && !item.gone);

    // --- meetings ---
    const box = turkeyBox();
    for (const item of state.items) {
      if (item.hit || item.gone) continue;
      const iLeft = item.x + 5;
      const iRight = item.x + item.w - 5;
      if (iRight < box.left || iLeft > box.right) continue;
      if (item.kind === KIND_CORN) {
        const cTop = item.y - 15;
        const cBottom = item.y + 15;
        if (cBottom > box.top && cTop < box.bottom) {
          item.gone = true;
          state.corn += 1;
          state.farmerGap = Math.min(250, state.farmerGap + FARMER.cornRelief);
          events |= EVENT_CORN;
        }
        continue;
      }
      let hit = false;
      if (item.kind === KIND_BANNER) {
        // The banner hangs with its hem at groundY - h: anything
        // taller than the gap — a standing or jumping turkey — clips it.
        const hem = FIELD.groundY - item.h;
        hit = box.top < hem;
      } else {
        const iTop = FIELD.groundY - item.h;
        hit = box.bottom > iTop + 6;
      }
      if (hit) {
        item.hit = true;
        state.stumbles += 1;
        state.farmerGap -= FARMER.stumbleCost;
        state.slowTimer = 0.55;
        t.flash = 0.4;
        events |= EVENT_STUMBLE;
      }
    }

    // --- the farmer ---
    state.farmerGap -= FARMER.drift * dt;
    const metres = state.distancePx / RUN.pxPerMetre;
    state.score = Math.floor(metres * SCORE.perMetre) + state.corn * SCORE.perCorn;
    if (state.farmerGap <= FARMER.catchGap || state.stumbles >= 3) {
      state.over = "caught";
      events |= EVENT_OVER;
    } else if (metres >= RUN.escapeAt) {
      state.over = "escaped";
      state.score += 250; // freedom bonus
      events |= EVENT_OVER;
    }
    return events;
  }

  return { state, reset, step };
}
