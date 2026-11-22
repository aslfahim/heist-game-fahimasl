// Velvet Vault: Casino Heist — the entry program (Node 22, stdlib only).
//
// It hands the game in: copies this repository's game/ and screenshots/
// beside this file into the grader's output directory and writes
// dossier.json there with the vendored make.fun library. The copy is a plain
// recursive copy and the dossier is rebuilt from the copied files, so the
// two grader runs land byte-identical: nothing here reads the clock, the
// network or any mutable state.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// and the result can be checked with: diff -r out1 out2

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory holding this file.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  console.error(`velvet-vault: ${message}`);
  process.exit(1);
}

function requireDir(path, label) {
  if (!existsSync(path) || !statSync(path).isDirectory()) fail(`missing ${label} directory: ${path}`);
}

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    const from = join(source, entry);
    const to = join(target, entry);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
requireDir(gameDir, 'game');
if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
requireDir(shotsDir, 'screenshots');

mkdirSync(outDir, { recursive: true });
copyTree(gameDir, join(outDir, 'game'));
copyTree(shotsDir, join(outDir, 'screenshots'));

// The scorer's own caps (from the competition's gate): only text_max_bytes
// shapes the dossier bytes; the rest refuse an entry the scorer would
// refuse anyway — more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a game path over
// 1000 bytes. game/ counts beside /output's own 1000-entry cap with its
// screenshots/ and dossier.json, so the game is kept well under the caps.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

const gameFiles = readdirSync(join(outDir, 'game'), { recursive: true }).length;
const shotFiles = readdirSync(join(outDir, 'screenshots')).length;
console.log(`velvet-vault: wrote ${outDir} (game: ${gameFiles} entries, screenshots: ${shotFiles}, dossier.json ${dossier.length} bytes)`);
