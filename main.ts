/**
 * Gobble Run — the program that hands the game in.
 *
 * The game itself is this directory's game/ folder: static files
 * (an index.html and ES modules under src/, no library at all —
 * the whole game is drawn on a 2D canvas) that play offline in a
 * desktop browser and load nothing over the network.
 *
 * Running this program copies game/ and screenshots/ into the
 * output directory and writes dossier.json there with make.fun's
 * vendored game library. vendor/makefun-game.ts is left exactly
 * as the kit ships it: the scorer rebuilds the dossier with its
 * own copy of the same file and requires the two to match.
 *
 * Outside the grader's container, MAKEFUN_OUTPUT_DIR names the
 * output directory:
 *
 *   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDossier } from "./vendor/makefun-game.ts";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The platform's own caps for a game dossier, as the kit's
// starter passes them.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  cpSync(join(ROOT, "game"), join(OUTPUT_DIR, "game"), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, "screenshots"), { recursive: true });
  if (existsSync(join(ROOT, "screenshots"))) {
    cpSync(join(ROOT, "screenshots"), join(OUTPUT_DIR, "screenshots"), {
      recursive: true,
    });
  }
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), buildDossier(OUTPUT_DIR, DOSSIER_CAPS));
}

handIn();
