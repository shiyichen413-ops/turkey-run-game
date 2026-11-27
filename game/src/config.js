// Gobble Run — the numbers that shape the game.
//
// The field is a logical 960x540 stage; the renderer scales it
// to whatever window it finds. The turkey runs in place at a
// fixed x while the farm scrolls past — distance is measured
// in "farm metres" so the HUD can promise a finish line: the
// forest, ESCAPE_AT metres away.

export const FIELD = { width: 960, height: 540, groundY: 452 };

export const TURKEY = {
  x: 218, // screen x of the turkey's centre; the world moves, not the bird
  width: 74,
  height: 62, // standing hitbox; ducking lowers it
  duckHeight: 40,
  jumpVelocity: -905,
  gravity: 2450,
  fastFall: 3400, // extra downward pull while ducking mid-air
};

export const RUN = {
  startSpeed: 268, // px per second the farm scrolls at the gun
  topSpeed: 452,
  accel: 5.2, // px per second, per second
  pxPerMetre: 9,
  escapeAt: 1200, // metres to the forest fence — freedom
};

export const FARMER = {
  startGap: 168, // px behind the turkey when the run begins
  catchGap: 20, // this close and his hand is on the tail feathers
  stumbleCost: 88, // px he gains each time the turkey hits something
  cornRelief: 12, // px he falls back when the turkey eats corn
  drift: 1.6, // px per second he creeps up even on a clean run — corn and clean legs outpace it
};

export const STEP = 1 / 120; // fixed simulation step, seconds

export const SCORE = { perMetre: 1, perCorn: 25 };
