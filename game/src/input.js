// Gobble Run — input: the keyboard, and a pointer for touch.
//
// The game reads a plain {jump, duck, start} shape each frame,
// however it was produced: Space / ArrowUp / W jump, ArrowDown /
// S duck, Enter starts and restarts. A pointer press jumps too,
// and holding the pointer low on the screen ducks — so the game
// plays the same on a trackpad, a phone, or a keyboard.

export function createInput(canvas) {
  const held = { jump: false, duck: false };
  let startPressed = false;
  let pointerY = null;

  const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];
  const DUCK_KEYS = ["ArrowDown", "KeyS"];

  window.addEventListener("keydown", (e) => {
    if (JUMP_KEYS.includes(e.code) || DUCK_KEYS.includes(e.code)) e.preventDefault();
    if (JUMP_KEYS.includes(e.code)) held.jump = true;
    if (DUCK_KEYS.includes(e.code)) held.duck = true;
    if (e.code === "Enter" || e.code === "Space") startPressed = true;
  });
  window.addEventListener("keyup", (e) => {
    if (JUMP_KEYS.includes(e.code)) held.jump = false;
    if (DUCK_KEYS.includes(e.code)) held.duck = false;
  });

  canvas.addEventListener("pointerdown", (e) => {
    pointerY = e.clientY;
    startPressed = true;
    if (e.clientY > window.innerHeight * 0.62) held.duck = true;
    else held.jump = true;
  });
  window.addEventListener("pointerup", () => {
    pointerY = null;
    held.jump = false;
    held.duck = false;
  });

  return {
    /** The current input shape; `start` is consumed by reading it. */
    read() {
      const start = startPressed;
      startPressed = false;
      return { jump: held.jump, duck: held.duck, start, pointerLow: pointerY !== null && pointerY > window.innerHeight * 0.62 };
    },
  };
}
