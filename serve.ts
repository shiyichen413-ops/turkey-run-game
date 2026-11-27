/**
 * Gobble Run — a tiny local preview server (development only).
 *
 * Serves game/ on http://localhost:8080 so the game can be played
 * and its screenshots taken:
 *
 *   node serve.ts            # port 8080
 *   node serve.ts --port 9   # any free port
 *
 * The grader never runs this file; main.ts is the entrypoint.
 */

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const GAME_DIR = join(dirname(fileURLToPath(import.meta.url)), "game");

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function portFromArgs(): number {
  const at = process.argv.indexOf("--port");
  const value = at >= 0 ? Number(process.argv[at + 1]) : NaN;
  return Number.isInteger(value) && value > 0 ? value : 8080;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const path = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, "");
    const file = join(GAME_DIR, path === "" ? "index.html" : path);
    if (!file.startsWith(GAME_DIR)) throw new Error("outside game/");
    const body = await readFile(file);
    response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  }
});

const port = portFromArgs();
server.listen(port, () => {
  console.log(`Gobble Run preview at http://localhost:${port}/`);
});
