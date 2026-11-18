// Badak Bowohasim — pengikat permainan: loop, transisi layar, tombol, dan skor terbaik.
import { FIELD, GAME } from './config.js';
import { createWorld, update, startGame, togglePause, dash, saveBest, loadBest, PHASE } from './world.js';
import { draw } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 1) || 1;

const world = createWorld(seed);
const input = createInput(canvas);
const audio = createAudio();
const isShot = applyShot(world, params);
let best = loadBest();
let last = performance.now();

function startOrRestart() {
  audio.unlock();
  if (world.phase === PHASE.START || world.phase === PHASE.WON || world.phase === PHASE.LOST) {
    startGame(world, audio);
  }
}

canvas.addEventListener('click', () => {
  if (world.phase === PHASE.START || world.phase === PHASE.WON || world.phase === PHASE.LOST) {
    startOrRestart();
  } else if (world.phase === PHASE.PAUSED) {
    togglePause(world);
  }
});

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (!isShot) {
    if (input.wasPressed('enter')) startOrRestart();
    if (input.wasPressed(' ')) {
      if (world.phase === PHASE.PLAYING) dash(world, audio);
      else startOrRestart();
    }
    if (input.wasPressed('p') || input.wasPressed('escape')) {
      if (world.phase === PHASE.PLAYING || world.phase === PHASE.PAUSED) togglePause(world);
    }
    if (input.wasPressed('m')) {
      const muted = audio.toggleMute();
      world.message = muted ? 'Suara mati' : 'Suara hidup';
    }
    if (input.wasPressed('r') && (world.phase === PHASE.WON || world.phase === PHASE.LOST)) {
      startOrRestart();
    }
    if (world.phase === PHASE.PLAYING) {
      update(world, dt, {
        directionX: input.directionX(),
        directionY: input.directionY(),
        pointerX: input.pointerX(),
        pointerY: input.pointerY(),
        dash: false,
      }, audio);
      if (world.phase === PHASE.WON || world.phase === PHASE.LOST) {
        best = saveBest(world.score);
      }
    }
  }
  input.endFrame();

  draw(ctx, world, now / 1000);
  if (world.phase === PHASE.START && best > 0) {
    ctx.fillStyle = 'rgba(33,53,71,0.75)';
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Skor terbaikmu: ${best}`, FIELD.width / 2, FIELD.height - 18);
    ctx.textAlign = 'left';
  }
  requestAnimationFrame(frame);
}

// Buat permainan bisa diperiksa dari luar (untuk pengujian otomatis).
window.BOWOHASIM = { world, GAME, PHASE };

requestAnimationFrame(frame);
