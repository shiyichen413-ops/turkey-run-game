# turkey-run-game

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/shiyichen413-ops/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/shiyichen413-ops/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Gobble Run — the great Thanksgiving escape. You are the turkey: outrun the farmer (fork in hand), hurdle the hot oven and the carving knife, duck under the Thanksgiving banner, grab corn to keep your legs, and reach the forest 1,200 metres away. A complete canvas runner with a title screen, a HUD of distance, score, corn and stumble-hearts, a farmer-proximity bar, and both endings — caught, or escaped — with restart. No library at all: every sprite is drawn in code on a 2D canvas, the world is seeded, and the game loads nothing over the network.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies the game into `out/` and writes `out/dossier.json`. To play locally: `node serve.ts`, then open http://localhost:8080/.

---

<sub>Entered on [make.fun](https://make.fun/?ref=&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
