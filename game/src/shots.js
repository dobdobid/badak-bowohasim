// Tangkapan layar deterministik untuk screenshots/.
// `?shot=start`  → layar judul.
// `?shot=play`   → tengah permainan: gelombang 2-3 sedang berlangsung.
// `?shot=end`    → layar menang: hutan selamat.
// `&seed=N` memilih urutan yang sama setiap kali.
import { createWorld, update, PHASE } from './world.js';
import { FOODS, HEART } from './config.js';

/** Autopilot: kejar musuh terdekat, seruduk bila sudah dekat, makan bila aman. */
export function autopilotInput(world) {
  const cx = world.playerX + 42;
  const cy = world.playerY + 28;
  const dashReady = world.dashCooldown <= 0;

  // 1. Tim pemindah yang sedang memegang badak: seruduk dia segera.
  for (const e of world.enemies) {
    if (!e.active || e.kind !== 'capture') continue;
    const d = Math.hypot(e.x - cx, e.y - cy);
    if (d < 160) {
      return {
        directionX: e.x > cx ? 1 : -1,
        directionY: e.y > cy + 10 ? 1 : e.y < cy - 10 ? -1 : 0,
        pointerX: null, pointerY: null,
        dash: dashReady && d < 140,
      };
    }
  }

  // 2. Musuh terdekat yang mengancam jantung hutan.
  let target = null;
  let targetD = Infinity;
  for (const e of world.enemies) {
    if (!e.active) continue;
    const dHeart = Math.hypot(e.x - HEART.x, e.y - HEART.y);
    const dRhino = Math.hypot(e.x - cx, e.y - cy);
    const score = dHeart + dRhino * 0.5;
    if (score < targetD) { targetD = score; target = e; }
  }
  if (target !== null) {
    const d = Math.hypot(target.x - cx, target.y - cy);
    return {
      directionX: target.x > cx + 10 ? 1 : target.x < cx - 10 ? -1 : 0,
      directionY: target.y > cy + 10 ? 1 : target.y < cy - 10 ? -1 : 0,
      pointerX: null, pointerY: null,
      dash: dashReady && d < 130,
    };
  }

  // 3. Tidak ada musuh: makan makanan terdekat.
  let food = null;
  let foodD = Infinity;
  for (const f of world.foods) {
    if (!f.active) continue;
    const d = Math.hypot(f.x - cx, f.y - cy);
    if (d < foodD) { foodD = d; food = f; }
  }
  if (food !== null && foodD < 320) {
    return {
      directionX: food.x > cx + 10 ? 1 : food.x < cx - 10 ? -1 : 0,
      directionY: food.y > cy + 10 ? 1 : food.y < cy - 10 ? -1 : 0,
      pointerX: null, pointerY: null,
      dash: false,
    };
  }

  // 4. Jaga dekat jantung hutan.
  const dx = HEART.x - cx;
  const dy = HEART.y - cy;
  if (Math.hypot(dx, dy) > 120) {
    return {
      directionX: dx > 12 ? 1 : dx < -12 ? -1 : 0,
      directionY: dy > 12 ? 1 : dy < -12 ? -1 : 0,
      pointerX: null, pointerY: null,
      dash: false,
    };
  }
  return { directionX: 0, directionY: 0, pointerX: null, pointerY: null, dash: false };
}

export function applyShot(world, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed') ?? 1) || 1;
  if (shot === 'start') {
    Object.assign(world, createWorld(seed), { phase: PHASE.START });
    return true;
  }
  if (shot === 'play') {
    Object.assign(world, createWorld(seed), { phase: PHASE.PLAYING });
    // Mulai gelombang 1 lalu mainkan ~30 detik dengan autopilot.
    const dt = 1 / 60;
    for (let i = 0; i < 30 * 60; i += 1) {
      update(world, dt, autopilotInput(world), null);
      if (world.phase !== PHASE.PLAYING) break;
    }
    // Pastikan tampilannya ramai: tambah makanan dan musuh yang terlihat.
    const kinds = ['leaf', 'fruit', 'golden', 'leaf', 'fruit'];
    kinds.forEach((kind, i) => {
      world.foods.push({
        kind,
        x: 350 + i * 160 + world.random() * 40,
        y: 150 + (i % 3) * 160,
        radius: FOODS[kind].radius,
        bob: i,
        active: true,
      });
    });
    if (world.enemies.length < 2) {
      world.enemies.push({ kind: 'truck', x: 950, y: 480, radius: 30, hp: 1, maxHp: 1, speed: 95, active: true, grabbing: false, wobble: 0 });
      world.enemies.push({ kind: 'capture', x: 820, y: 220, radius: 26, hp: 1, maxHp: 1, speed: 75, active: true, grabbing: false, wobble: 1 });
    }
    world.score = Math.max(world.score, 60);
    return true;
  }
  if (shot === 'end') {
    Object.assign(world, createWorld(seed), {
      phase: PHASE.WON,
      score: 480,
      eaten: 16,
      goldenEaten: 2,
      bestCombo: 8,
      defeated: 24,
      forestHealth: 75,
      wave: 5,
      message: 'HUTAN SELAMAT!',
    });
    return true;
  }
  return false;
}
