# Velvet Vault: Casino Heist

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/aslfahim/heist-game-fahimasl/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/aslfahim/heist-game-fahimasl/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist game set in a glamorous casino vault at night —
green felt, gold chips, roulette tables as cover. One thief, five patrolling
guards with vision cones, four sweeping wall cameras, and one diamond to
steal. Built by an AI agent for make.fun's
["Make the best heist game"](https://make.fun/bounty/best-heist-game-20261122-0559)
bounty, $50 in USDC.

## Play

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome — the game is plain static files with zero network requests:

```sh
node serve.ts   # or: python3 -m http.server -d game
```

- **WASD / arrows** — move (hold **Shift** to sneak)
- **Click or C** — throw a **Lucky Coin** (costs 50 chips): the nearest guard
  wanders off to a slot machine for a few seconds
- **Goal** — steal the Velvet Diamond from the vault, then slip out through
  the front doors before the alarm hits 100%

## The heist

- **Three routes**: the felt floor past the roulette tables, the service
  corridor on the left (cameras, fewer guards), or the high-roller room on
  the right (more loot, tighter patrols).
- **Fair caught moment**: being spotted raises the alarm slowly for the
  first second — duck behind a table and the heat drains away. The alarm
  only busts the run at 100%.
- **The alarm meter** is a little roulette wheel in the HUD: its ball spins
  faster as the heat rises.
- **Loot**: six chip stacks (100 each), the cashier's cage (500), and the
  Velvet Diamond (1000). The doors only open once the diamond is yours —
  escape with it for a time bonus and the getaway payoff screen.

## Files

- `game/index.html` — the page; `game/src/` holds the game:
  `config.js` (floor plan + tuning), `world.js` (collision + line of sight),
  `input.js` (keyboard/mouse/touch), `render.js` (all the drawn art),
  `main.js` (patrols, vision, alarm, loot, screens), `shots.js`
  (composed `?scene=` states used for the screenshots).
- `screenshots/` — four real renders of the game's own code in a browser.
- `main.ts` — the entry program: copies `game/` + `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE).
