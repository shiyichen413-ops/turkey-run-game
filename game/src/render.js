// Gobble Run — everything the player sees, drawn on one canvas.
//
// Flat shapes and warm colours: a farm at golden hour, parallax
// hills and a barn behind, the hazards ahead, and two runners
// built from ellipses and lines — a turkey with a proper tail
// fan, and a farmer who means business. The title and end
// screens are drawn here too, over the frozen scene.

import { FIELD, TURKEY, RUN, FARMER } from "./config.js";
import { KIND_OVEN, KIND_KNIFE, KIND_HAY, KIND_FENCE, KIND_BANNER, KIND_CORN } from "./world.js";

export const SCREEN_TITLE = "title";
export const SCREEN_PLAY = "play";
export const SCREEN_OVER = "over";

const INK = "#33241a";
const PAPER = "#fff7e8";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ---------- the farm ---------- */

function drawSky(ctx, state) {
  const grad = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  grad.addColorStop(0, "#8ec9e8");
  grad.addColorStop(0.55, "#f7d98b");
  grad.addColorStop(1, "#f7c873");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  // Sun, low and golden.
  ctx.fillStyle = "#ffdf7e";
  ctx.beginPath();
  ctx.arc(828, 92, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 223, 126, 0.35)";
  ctx.beginPath();
  ctx.arc(828, 92, 58, 0, Math.PI * 2);
  ctx.fill();

  // Clouds drift slowest of all.
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const off = (state.distancePx * 0.08) % 480;
  for (const [cx, cy, s] of [[140, 70, 1], [520, 44, 0.7], [760, 120, 0.85], [330, 108, 0.6]]) {
    const x = ((cx - off + 480) % 480) * 2 - 60;
    ctx.beginPath();
    ctx.ellipse(x, cy, 44 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 30 * s, cy + 3 * s, 30 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHillsAndBarn(ctx, state) {
  const off = (state.distancePx * 0.25) % 640;
  ctx.fillStyle = "#a8bf6a";
  ctx.beginPath();
  ctx.moveTo(0, FIELD.groundY);
  for (let x = -640; x <= FIELD.width + 640; x += 80) {
    const wx = x + off - 640;
    ctx.lineTo(x, FIELD.groundY - 120 - Math.sin((wx) * 0.008) * 42);
  }
  ctx.lineTo(FIELD.width, FIELD.groundY);
  ctx.closePath();
  ctx.fill();

  // The barn the turkey is running FROM, sliding away behind.
  const barnX = 60 - state.distancePx * 0.25;
  if (barnX > -240) {
    ctx.fillStyle = "#b3402e";
    ctx.fillRect(barnX, FIELD.groundY - 150, 150, 150);
    ctx.fillStyle = "#8c2f21";
    ctx.beginPath();
    ctx.moveTo(barnX - 12, FIELD.groundY - 150);
    ctx.lineTo(barnX + 75, FIELD.groundY - 208);
    ctx.lineTo(barnX + 162, FIELD.groundY - 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5e2015";
    ctx.fillRect(barnX + 48, FIELD.groundY - 92, 54, 92);
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 4;
    ctx.strokeRect(barnX + 48, FIELD.groundY - 92, 54, 92);
  }
}

function drawGround(ctx, state) {
  ctx.fillStyle = "#8a5a33";
  ctx.fillRect(0, FIELD.groundY, FIELD.width, FIELD.height - FIELD.groundY);
  ctx.fillStyle = "#6f9e4a";
  ctx.fillRect(0, FIELD.groundY, FIELD.width, 14);
  // Scrolling tufts and pebbles sell the speed.
  ctx.strokeStyle = "#5d8a3e";
  ctx.lineWidth = 2.5;
  const off = state.distancePx % 46;
  for (let x = -off; x < FIELD.width; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, FIELD.groundY + 4);
    ctx.lineTo(x + 4, FIELD.groundY - 5);
    ctx.moveTo(x + 8, FIELD.groundY + 4);
    ctx.lineTo(x + 13, FIELD.groundY - 4);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  const off2 = (state.distancePx * 1) % 130;
  for (let x = -off2 + 30; x < FIELD.width; x += 130) {
    ctx.beginPath();
    ctx.ellipse(x, FIELD.groundY + 44, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------- the hazards and the corn ---------- */

function drawOven(ctx, item) {
  const { x } = item;
  const top = FIELD.groundY - item.h;
  ctx.fillStyle = "#5b6470";
  roundRect(ctx, x, top, item.w, item.h, 7);
  ctx.fill();
  ctx.fillStyle = "#2c3138";
  roundRect(ctx, x + 9, top + 22, item.w - 18, item.h - 34, 5);
  ctx.fill();
  ctx.fillStyle = "#ff9d3c";
  ctx.fillRect(x + 14, top + 30, item.w - 28, 12); // the fire inside
  ctx.fillStyle = "#39404850";
  ctx.fillRect(x, top, item.w, 12);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = "#d7dde3";
    ctx.beginPath();
    ctx.arc(x + 14 + i * 20, top + 6, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e8b23a";
  ctx.font = "800 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HOT!", x + item.w / 2, top + 18);
}

function drawKnife(ctx, item) {
  const { x } = item;
  const top = FIELD.groundY - item.h;
  // The chopping block…
  ctx.fillStyle = "#a4713d";
  roundRect(ctx, x + 6, top + 16, item.w - 12, item.h - 16, 5);
  ctx.fill();
  ctx.fillStyle = "#8a5a2d";
  ctx.fillRect(x + 6, top + 24, item.w - 12, 4);
  // …and the carving knife standing in it, blade up.
  ctx.fillStyle = "#dfe6ec";
  ctx.beginPath();
  ctx.moveTo(x + 20, top + 18);
  ctx.lineTo(x + 26, top - 16);
  ctx.lineTo(x + 38, top - 18);
  ctx.lineTo(x + 36, top + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5e3a1c";
  roundRect(ctx, x + 24, top + 14, 9, 12, 3);
  ctx.fill();
}

function drawHay(ctx, item) {
  const { x } = item;
  const top = FIELD.groundY - item.h;
  ctx.fillStyle = "#e3b341";
  roundRect(ctx, x, top, item.w, item.h, 12);
  ctx.fill();
  ctx.strokeStyle = "#c1912a";
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x + item.w / 2, top + item.h / 2, 8 + i * 8, 0.4, Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.strokeStyle = "#a87c22";
  ctx.beginPath();
  ctx.moveTo(x + 6, top + 4);
  ctx.lineTo(x + 6, top + item.h - 4);
  ctx.moveTo(x + item.w - 6, top + 4);
  ctx.lineTo(x + item.w - 6, top + item.h - 4);
  ctx.stroke();
}

function drawFence(ctx, item) {
  const { x } = item;
  const top = FIELD.groundY - item.h;
  ctx.fillStyle = "#9b7443";
  ctx.fillRect(x + 4, top, 9, item.h);
  ctx.fillRect(x + item.w - 13, top, 9, item.h);
  ctx.fillStyle = "#b0824c";
  ctx.fillRect(x, top + 8, item.w, 9);
  ctx.fillRect(x, top + 24, item.w, 9);
}

function drawBanner(ctx, item) {
  const { x } = item;
  const hem = FIELD.groundY - item.h;
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(x + 2, hem - 78, 7, 78 + 6);
  ctx.fillRect(x + item.w - 9, hem - 78, 7, 78 + 6);
  // The banner sags between its poles.
  ctx.fillStyle = "#c8402a";
  ctx.beginPath();
  ctx.moveTo(x + 5, hem - 74);
  ctx.quadraticCurveTo(x + item.w / 2, hem - 58, x + item.w - 5, hem - 74);
  ctx.lineTo(x + item.w - 5, hem - 34);
  ctx.quadraticCurveTo(x + item.w / 2, hem - 20, x + 5, hem - 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = "800 15px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("THANKSGIVING!", x + item.w / 2, hem - 38);
}

function drawCorn(ctx, item) {
  const { x, y } = item;
  ctx.save();
  ctx.translate(x + 13, y);
  ctx.rotate(0.5);
  ctx.fillStyle = "#f2c230";
  roundRect(ctx, -7, -14, 14, 28, 7);
  ctx.fill();
  ctx.strokeStyle = "#d9a41c";
  ctx.lineWidth = 1.4;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 4.5, -13);
    ctx.lineTo(i * 4.5, 13);
    ctx.stroke();
  }
  ctx.fillStyle = "#5d8a3e";
  ctx.beginPath();
  ctx.ellipse(-8, 12, 5, 10, 0.5, 0, Math.PI * 2);
  ctx.ellipse(8, 12, 5, 10, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const ITEM_DRAW = {
  [KIND_OVEN]: drawOven,
  [KIND_KNIFE]: drawKnife,
  [KIND_HAY]: drawHay,
  [KIND_FENCE]: drawFence,
  [KIND_BANNER]: drawBanner,
  [KIND_CORN]: drawCorn,
};

/* ---------- the runners ---------- */

function drawTurkey(ctx, state) {
  const t = state.turkey;
  const feetY = FIELD.groundY - t.lift;
  const duck = t.ducking && t.onGround;
  const bodyY = feetY - (duck ? 30 : 40);
  const phase = t.runPhase;

  ctx.save();
  ctx.translate(TURKEY.x, 0);
  if (t.flash > 0 && Math.floor(t.flash * 18) % 2 === 0) ctx.globalAlpha = 0.45;

  // Legs, scissoring with the run.
  ctx.strokeStyle = "#e8862d";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  const stride = t.onGround ? Math.sin(phase) * 15 : 8;
  for (const [sign, lift] of [[1, Math.max(0, Math.sin(phase)) * 6], [-1, Math.max(0, -Math.sin(phase)) * 6]]) {
    ctx.beginPath();
    ctx.moveTo(sign * 4, bodyY + 16);
    ctx.lineTo(sign * stride, feetY - lift);
    ctx.stroke();
  }

  // Tail fan: five feathers fanned out behind.
  const fanTilt = duck ? -0.25 : 0;
  for (let i = 0; i < 5; i += 1) {
    const a = -0.9 + i * 0.38 + fanTilt;
    ctx.save();
    ctx.translate(-26, bodyY - 2);
    ctx.rotate(a);
    ctx.fillStyle = i % 2 ? "#8a5a33" : "#a4713d";
    ctx.beginPath();
    ctx.ellipse(-17, 0, 19, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8dcc8";
    ctx.beginPath();
    ctx.ellipse(-32, 0, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body.
  ctx.fillStyle = "#7c4f2a";
  ctx.beginPath();
  ctx.ellipse(0, bodyY, duck ? 40 : 36, duck ? 21 : 25, duck ? -0.06 : 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing, flapping a little as she runs.
  ctx.fillStyle = "#96683c";
  ctx.beginPath();
  ctx.ellipse(-2, bodyY + 2, 20, 12, Math.sin(phase * 0.5) * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head, stretched forward when ducking.
  const headX = duck ? 40 : 30;
  const headY = bodyY - (duck ? 8 : 22);
  ctx.strokeStyle = "#7c4f2a";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(18, bodyY - 6);
  ctx.lineTo(headX, headY + 4);
  ctx.stroke();
  ctx.fillStyle = "#8a5a33";
  ctx.beginPath();
  ctx.arc(headX, headY, 11.5, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle, and one very determined eye.
  ctx.fillStyle = "#f2a52d";
  ctx.beginPath();
  ctx.moveTo(headX + 9, headY - 2);
  ctx.lineTo(headX + 21, headY + 2);
  ctx.lineTo(headX + 9, headY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d0342c";
  ctx.beginPath();
  ctx.ellipse(headX + 7, headY + 8, 3.6, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(headX + 3, headY - 3, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(headX + 4.4, headY - 3, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFarmer(ctx, state) {
  const gap = state.farmerGap;
  const x = TURKEY.x - gap - 26;
  if (x < -70) return;
  const feetY = FIELD.groundY;
  const phase = state.turkey.runPhase * 1.12;
  const bob = Math.abs(Math.sin(phase)) * 3.5;

  ctx.save();
  ctx.translate(x, feetY - bob);
  // Legs in overalls, pumping.
  ctx.strokeStyle = "#33549e";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const sign of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.lineTo(sign * Math.sin(phase) * 16, 0);
    ctx.stroke();
  }
  // Boots.
  ctx.fillStyle = "#4a3220";
  for (const sign of [1, -1]) {
    ctx.fillRect(sign * Math.sin(phase) * 16 - 4, -5, 13, 5);
  }
  // Body: plaid-red shirt, overall bib.
  ctx.fillStyle = "#c23b2a";
  roundRect(ctx, -15, -84, 30, 44, 8);
  ctx.fill();
  ctx.fillStyle = "#33549e";
  ctx.fillRect(-11, -66, 22, 26);
  // Arms: the back one pumps, the front one holds the fork out.
  ctx.strokeStyle = "#c23b2a";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-10, -78);
  ctx.lineTo(-20, -56 + Math.sin(phase) * 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(11, -78);
  ctx.lineTo(26, -64);
  ctx.stroke();
  // The fork, aimed at dinner.
  ctx.strokeStyle = "#c8ccd2";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(26, -64);
  ctx.lineTo(44, -70);
  ctx.moveTo(44, -70);
  ctx.lineTo(50, -75);
  ctx.moveTo(44, -70);
  ctx.lineTo(51, -69);
  ctx.moveTo(44, -70);
  ctx.lineTo(50, -64);
  ctx.stroke();
  // Head and straw hat.
  ctx.fillStyle = "#eebd93";
  ctx.beginPath();
  ctx.arc(1, -94, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(5, -95, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8c35a";
  ctx.fillRect(-13, -104, 28, 5);
  ctx.fillRect(-8, -112, 18, 9);
  ctx.restore();
}

/* ---------- HUD and screens ---------- */

function drawHud(ctx, state) {
  const metres = Math.floor(state.distancePx / RUN.pxPerMetre);
  ctx.textAlign = "left";
  // Distance panel.
  ctx.fillStyle = "rgba(51, 36, 26, 0.72)";
  roundRect(ctx, 16, 14, 252, 64, 12);
  ctx.fill();
  ctx.fillStyle = "#ffd97a";
  ctx.font = "800 25px system-ui, sans-serif";
  const metresText = `${metres} m`;
  ctx.fillText(metresText, 30, 48);
  const metresWidth = ctx.measureText(metresText).width;
  ctx.fillStyle = PAPER;
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillText(`of ${RUN.escapeAt} m to the forest`, 30 + metresWidth + 12, 48);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  roundRect(ctx, 30, 58, 224, 8, 4);
  ctx.fill();
  ctx.fillStyle = "#7ec850";
  roundRect(ctx, 30, 58, 224 * Math.min(1, metres / RUN.escapeAt), 8, 4);
  ctx.fill();

  // Score panel.
  ctx.fillStyle = "rgba(51, 36, 26, 0.72)";
  roundRect(ctx, FIELD.width - 216, 14, 200, 64, 12);
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.fillText("SCORE", FIELD.width - 200, 36);
  ctx.fillStyle = "#ffd97a";
  ctx.font = "800 25px system-ui, sans-serif";
  ctx.fillText(`${state.score}`, FIELD.width - 200, 66);
  ctx.fillStyle = PAPER;
  ctx.font = "700 15px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`🌽 × ${state.corn}`, FIELD.width - 30, 66);
  ctx.textAlign = "left";

  // Stumble hearts.
  for (let i = 0; i < 3; i += 1) {
    ctx.font = "24px system-ui, sans-serif";
    ctx.globalAlpha = i < 3 - state.stumbles ? 1 : 0.25;
    ctx.fillText("❤️", 20 + i * 32, FIELD.height - 18);
  }
  ctx.globalAlpha = 1;

  // Farmer proximity: the closer he gets, the redder the bar.
  const danger = 1 - Math.min(1, Math.max(0, (state.farmerGap - FARMER.catchGap) / (FARMER.startGap - FARMER.catchGap)));
  ctx.fillStyle = "rgba(51, 36, 26, 0.72)";
  roundRect(ctx, FIELD.width / 2 - 130, FIELD.height - 46, 260, 32, 10);
  ctx.fill();
  ctx.fillStyle = danger > 0.66 ? "#ff5a3c" : danger > 0.33 ? "#ffb52e" : "#7ec850";
  roundRect(ctx, FIELD.width / 2 - 118, FIELD.height - 30, 236 * (1 - danger), 9, 4.5);
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = "700 11.5px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(danger > 0.66 ? "HE'S RIGHT BEHIND YOU!" : "FARMER", FIELD.width / 2, FIELD.height - 36);
  ctx.textAlign = "left";
}

function panel(ctx, w, h) {
  ctx.fillStyle = "rgba(43, 28, 18, 0.88)";
  roundRect(ctx, (FIELD.width - w) / 2, (FIELD.height - h) / 2, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 217, 122, 0.5)";
  ctx.lineWidth = 2;
  roundRect(ctx, (FIELD.width - w) / 2, (FIELD.height - h) / 2, w, h, 20);
  ctx.stroke();
}

function drawTitle(ctx, state) {
  drawScene(ctx, state);
  ctx.fillStyle = "rgba(64, 36, 16, 0.30)";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx, 620, 356);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd97a";
  ctx.font = "900 72px 'Avenir Next', system-ui, sans-serif";
  ctx.fillText("GOBBLE RUN", FIELD.width / 2, 196);
  ctx.fillStyle = PAPER;
  ctx.font = "700 21px system-ui, sans-serif";
  ctx.fillText("The Great Thanksgiving Escape", FIELD.width / 2, 232);
  ctx.font = "400 16.5px system-ui, sans-serif";
  ctx.fillStyle = "#f3e3c2";
  ctx.fillText("You are the turkey. The farmer has the fork, the oven is hot,", FIELD.width / 2, 272);
  ctx.fillText(`and the forest is ${RUN.escapeAt} metres away. Run like dinner depends on it — it does.`, FIELD.width / 2, 296);
  ctx.font = "700 15.5px system-ui, sans-serif";
  ctx.fillStyle = PAPER;
  ctx.fillText("SPACE / TAP — jump the oven & the knife      ↓ — duck the banner", FIELD.width / 2, 340);
  ctx.fillText("Grab corn to keep your legs. Three stumbles and you're served.", FIELD.width / 2, 368);
  ctx.fillStyle = "#ffd97a";
  ctx.font = "800 19px system-ui, sans-serif";
  ctx.fillText("Press ENTER or tap to run!", FIELD.width / 2, 408);
  ctx.textAlign = "left";
}

function drawOver(ctx, state, best) {
  ctx.fillStyle = "rgba(64, 36, 16, 0.35)";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  panel(ctx, 560, 300);
  ctx.textAlign = "center";
  const escaped = state.over === "escaped";
  ctx.fillStyle = escaped ? "#9be15d" : "#ff8a70";
  ctx.font = "900 58px 'Avenir Next', system-ui, sans-serif";
  ctx.fillText(escaped ? "ESCAPED! 🌲" : "CAUGHT!", FIELD.width / 2, 218);
  ctx.fillStyle = PAPER;
  ctx.font = "400 17.5px system-ui, sans-serif";
  ctx.fillText(
    escaped
      ? "Over the fence and into the pines — this turkey lives to gobble another day."
      : "The farmer got his Thanksgiving after all. The oven door closes…",
    FIELD.width / 2,
    262,
  );
  const metres = Math.floor(state.distancePx / RUN.pxPerMetre);
  ctx.font = "700 19px system-ui, sans-serif";
  ctx.fillText(`Ran ${metres} m · 🌽 ${state.corn} · Score ${state.score} · Best ${Math.max(best, state.score)}`, FIELD.width / 2, 302);
  ctx.fillStyle = "#ffd97a";
  ctx.font = "800 17px system-ui, sans-serif";
  ctx.fillText("Press ENTER or tap to run again", FIELD.width / 2, 344);
  ctx.textAlign = "left";
}

function drawScene(ctx, state) {
  drawSky(ctx, state);
  drawHillsAndBarn(ctx, state);
  drawGround(ctx, state);
  for (const item of state.items) {
    if (item.gone) continue;
    ITEM_DRAW[item.kind]?.(ctx, item);
  }
  drawFarmer(ctx, state);
  drawTurkey(ctx, state);
}

/** Draw one frame: the scene, plus whichever screen is up. */
export function draw(ctx, state, screen, best = 0) {
  if (screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    return;
  }
  drawScene(ctx, state);
  drawHud(ctx, state);
  if (screen === SCREEN_OVER) drawOver(ctx, state, best);
}
