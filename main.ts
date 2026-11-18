// Badak Bowohasim — entrypoint (Node 22, standard library only).
//
// This is the program that hands the game in. The game itself is plain static
// files under game/: game/index.html plus its ES modules, no library, no build
// step, and no network request when a desktop browser opens it. The screenshots
// that show the game (start screen, play with HUD, end screen) live in
// screenshots/; the first file by name is the cover.
//
// What this program does, in order:
//   1. Works out where to write: /output inside the grader, or the directory
//      named by MAKEFUN_OUTPUT_DIR when run outside it.
//   2. Copies game/ and screenshots/ from beside this file into that directory.
//   3. Writes dossier.json there with the vendored make.fun library, the summary
//      the judge reads: the sources, the vendored files, the assets, the totals,
//      and the screenshots.
//
// Run it from this repository's root:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play the game locally first with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The directory this file sits in is the repository root.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, as the gate states them: at most 4 screenshots, each at
// most 256 KiB; game/ at most 993 files and 48 MiB in all, every path under it
// at most 1000 bytes; the dossier's source text at most 160 KiB.
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn(): void {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
  }
  writeFileSync(
    join(outputDir, 'dossier.json'),
    buildDossier(outputDir, dossierLimits),
  );
}

handIn();
