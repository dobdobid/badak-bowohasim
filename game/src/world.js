// Logika permainan murni — tanpa DOM dan tanpa canvas — supaya alurnya bisa
// diuji di Node dan dirender oleh render.js.
//
// "Badak Bowohasim" — game bertahan (defense) fiksi: pemain menjaga badak
// dan hutan dari pemerintah prabroro yang berusaha memindahkan badak dari
// hutan dan mengubah hutan jadi tambang. Gelombang demi gelombang datang:
// tim pemindah yang mencoba menangkap badak, truk dan ekskavator yang
// merusak hutan, dan di gelombang terakhir konvoi pemerintah prabroro.
// Menang bila semua 5 gelombang ditahan dan hutan selamat; kalah bila
// badak berhasil dipindahkan (meter penangkapan penuh) atau hutan rusak
// habis jadi tambang (kesehatan hutan 0).
import { FIELD, HEART, PLAYER, GAME, FOODS, WAVES, ENEMIES } from './config.js';
import { mulberry32, pickWeighted } from './random.js';

export const PHASE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WON: 'won',
  LOST: 'lost',
};

const FOOD_WEIGHTS = {
  leaf: FOODS.leaf.weight,
  fruit: FOODS.fruit.weight,
  golden: FOODS.golden.weight,
};

/** State awal sebuah permainan, memakai seed supaya bisa diulang. */
export function createWorld(seed = 1) {
  return {
    seed,
    random: mulberry32(seed),
    phase: PHASE.START,
    elapsed: 0,
    wave: 0, // gelombang aktif (1..5), 0 = belum mulai
    waveState: 'idle', // 'idle' | 'spawning' | 'fighting' | 'rest'
    restTimer: 0,
    spawnQueue: [],
    spawnTimer: 0,
    score: 0,
    bestCombo: 0,
    combo: 0,
    eaten: 0,
    goldenEaten: 0,
    defeated: 0,
    forestHealth: GAME.forestHealth,
    capture: 0, // meter penangkapan badak, 0..100
    grabbed: false, // tim pemindah sedang memegang badak
    playerX: PLAYER.x,
    playerY: PLAYER.y,
    playerFace: 1,
    dashTime: 0,
    dashCooldown: 0,
    dashDirX: 1,
    dashDirY: 0,
    invuln: 0,
    foods: [],
    enemies: [],
    particles: [],
    popups: [],
    foodTimer: 1.0,
    shake: 0,
    flash: 0,
    message: '',
    lastHit: '',
  };
}

function burst(world, x, y, color, count = 10) {
  for (let i = 0; i < count; i += 1) {
    const angle = world.random() * Math.PI * 2;
    const speed = 60 + world.random() * 160;
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      life: 0.5 + world.random() * 0.3,
      age: 0,
      color,
      size: 3 + world.random() * 5,
    });
  }
}

function popup(world, x, y, text, color) {
  const recent = world.popups.filter((p) => p.age < 0.35).length;
  world.popups.push({ x, y: y - recent * 26, text, color, age: 0, life: 0.9 });
}

/** Mulai permainan baru dari layar judul / layar akhir. */
export function startGame(world, audio) {
  const fresh = createWorld(world.seed);
  Object.assign(world, fresh, { phase: PHASE.PLAYING });
  startWave(world, 1, audio);
  audio?.click();
}

export function togglePause(world) {
  if (world.phase === PHASE.PLAYING) world.phase = PHASE.PAUSED;
  else if (world.phase === PHASE.PAUSED) world.phase = PHASE.PLAYING;
}

function startWave(world, n, audio) {
  world.wave = n;
  const def = WAVES[n - 1];
  const queue = [];
  for (let i = 0; i < def.capture; i += 1) queue.push('capture');
  for (let i = 0; i < def.truck; i += 1) queue.push('truck');
  for (let i = 0; i < def.excavator; i += 1) queue.push('excavator');
  // Acak urutan kedatangan.
  for (let i = queue.length - 1; i > 0; i -= 1) {
    const j = Math.floor(world.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  if (n === GAME.waves) queue.push('boss');
  world.spawnQueue = queue;
  world.spawnTimer = 0.5;
  world.waveState = 'spawning';
  popup(world, FIELD.width / 2, 130, `GELOMBANG ${n} DATANG!`, '#c1121f');
  audio?.waveStart();
}

function endGame(world, won, audio) {
  world.phase = won ? PHASE.WON : PHASE.LOST;
  world.message = won
    ? 'HUTAN SELAMAT!'
    : world.capture >= GAME.captureMax
      ? 'BADAK DIPINDAHKAN!'
      : 'HUTAN RUSAK JADI TAMBANG!';
  if (won) audio?.win();
  else audio?.lose();
}

function spawnEnemy(world, kind) {
  const def = ENEMIES[kind];
  const enemy = {
    kind,
    x: FIELD.width + 60,
    y: 90 + world.random() * (FIELD.height - 180),
    radius: def.radius,
    hp: kind === 'boss' ? def.hp : 1,
    maxHp: kind === 'boss' ? def.hp : 1,
    speed: def.speed * (0.9 + world.random() * 0.25),
    active: true,
    grabbing: false,
    wobble: world.random() * Math.PI * 2,
  };
  world.enemies.push(enemy);
  return enemy;
}

function defeatEnemy(world, enemy, audio, byDash) {
  enemy.active = false;
  world.defeated += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  const def = ENEMIES[enemy.kind];
  const bonus = world.combo >= 5 ? 10 : 0;
  world.score += def.score + bonus;
  burst(world, enemy.x, enemy.y, '#ffd43b', enemy.kind === 'boss' ? 26 : 14);
  popup(world, enemy.x, enemy.y - 30, `+${def.score + bonus} ${def.label} DIUSIR!`, '#2f9e44');
  if (enemy.kind === 'boss') popup(world, enemy.x, enemy.y - 60, 'KONVOI PEMERINTAH PRABRORO MUNDUR!', '#862e9c');
  audio?.ram();
  void byDash;
}

function damageForest(world, amount, label, x, y, audio) {
  world.forestHealth = Math.max(0, world.forestHealth - amount);
  world.shake = 0.4;
  world.flash = 0.2;
  popup(world, x, y, `${label}! HUTAN -${amount}`, '#c1121f');
  audio?.forestHit();
  if (world.forestHealth <= 0) endGame(world, false, audio);
}

function eatFood(world, food, audio) {
  const def = FOODS[food.kind];
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  const bonus = world.combo >= 5 ? 5 : 0;
  world.score += def.points + bonus;
  world.eaten += 1;
  if (food.kind === 'golden') {
    world.goldenEaten += 1;
    world.forestHealth = Math.min(GAME.forestHealth, world.forestHealth + 5);
  }
  const color = food.kind === 'golden' ? '#ffd60a' : food.kind === 'fruit' ? '#ff6b6b' : '#51cf66';
  burst(world, food.x, food.y, color, food.kind === 'golden' ? 18 : 10);
  popup(world, food.x, food.y - 30, `+${def.points + bonus}${food.kind === 'golden' ? ' HUTAN +5' : ''}`, color);
  if (food.kind === 'golden') audio?.catchGolden();
  else audio?.catchFood(world.combo);
}

function spawnFood(world) {
  const kind = pickWeighted(FOOD_WEIGHTS, world.random);
  const def = FOODS[kind];
  world.foods.push({
    kind,
    x: 120 + world.random() * (FIELD.width - 260),
    y: 90 + world.random() * (FIELD.height - 180),
    radius: def.radius,
    bob: world.random() * Math.PI * 2,
    active: true,
  });
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

/** Badak menyeruduk (dash): ke arah yang sedang ditekan / dihadapi. */
export function dash(world, audio) {
  if (world.phase !== PHASE.PLAYING) return;
  if (world.dashCooldown > 0 || world.dashTime > 0) return;
  world.dashTime = PLAYER.dashTime;
  world.dashCooldown = PLAYER.dashCooldown;
  world.invuln = Math.max(world.invuln, 0.4);
  audio?.dash();
}

/**
 * Satu langkah simulasi.
 * `input` = { directionX, directionY, pointerX, pointerY, dash: boolean }.
 */
export function update(world, dt, input, audio) {
  if (world.phase !== PHASE.PLAYING) return [];
  const events = [];
  world.elapsed += dt;

  // Dash.
  if (input.dash) dash(world, audio);
  if (world.dashCooldown > 0) world.dashCooldown = Math.max(0, world.dashCooldown - dt);
  const dashing = world.dashTime > 0;
  if (dashing) world.dashTime = Math.max(0, world.dashTime - dt);

  // Gerak badak: mouse/pointer mengalahkan keyboard saat aktif.
  const speed = dashing ? PLAYER.dashSpeed : PLAYER.speed;
  const slowed = world.grabbed && !dashing;
  const effSpeed = slowed ? speed * 0.45 : speed;
  let mx = 0;
  let my = 0;
  if (input.pointerX !== null && input.pointerX !== undefined && input.pointerY !== null && input.pointerY !== undefined) {
    const cx = world.playerX + PLAYER.width / 2;
    const cy = world.playerY + PLAYER.height / 2;
    const dx = input.pointerX - cx;
    const dy = input.pointerY - cy;
    const d = Math.hypot(dx, dy);
    if (d > 8) {
      const step = Math.min(d, effSpeed * dt);
      world.playerX += (dx / d) * step;
      world.playerY += (dy / d) * step;
      mx = dx / d;
      my = dy / d;
    }
  } else {
    mx = input.directionX || 0;
    my = input.directionY || 0;
    const len = Math.hypot(mx, my) || 1;
    world.playerX += (mx / len) * effSpeed * dt * (mx !== 0 || my !== 0 ? 1 : 0);
    world.playerY += (my / len) * effSpeed * dt * (mx !== 0 || my !== 0 ? 1 : 0);
  }
  if (mx !== 0) world.playerFace = mx > 0 ? 1 : -1;
  if (dashing && (mx !== 0 || my !== 0)) {
    world.dashDirX = mx / (Math.hypot(mx, my) || 1);
    world.dashDirY = my / (Math.hypot(mx, my) || 1);
  }
  world.playerX = Math.max(0, Math.min(FIELD.width - PLAYER.width, world.playerX));
  world.playerY = Math.max(30, Math.min(FIELD.height - PLAYER.height - 10, world.playerY));
  if (world.invuln > 0) world.invuln = Math.max(0, world.invuln - dt);

  const rcx = world.playerX + PLAYER.width / 2;
  const rcy = world.playerY + PLAYER.height / 2;

  // Gelombang: keluarkan musuh dari antrean, lalu istirahat antar gelombang.
  if (world.waveState === 'spawning') {
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      if (world.spawnQueue.length > 0) {
        spawnEnemy(world, world.spawnQueue.shift());
        world.spawnTimer = GAME.spawnInterval;
      } else {
        world.waveState = 'fighting';
      }
    }
  } else if (world.waveState === 'rest') {
    world.restTimer -= dt;
    if (world.restTimer <= 0) {
      startWave(world, world.wave + 1, audio);
    }
  }
  if (world.waveState === 'fighting' && world.enemies.length === 0 && world.spawnQueue.length === 0) {
    if (world.wave >= GAME.waves) {
      endGame(world, true, audio);
      return events;
    }
    world.waveState = 'rest';
    world.restTimer = GAME.restSeconds;
    popup(world, FIELD.width / 2, 130, `GELOMBANG ${world.wave} DITAHAN!`, '#2f9e44');
    audio?.waveClear();
  }

  // Makanan hutan bermunculan.
  world.foodTimer -= dt;
  if (world.foodTimer <= 0) {
    spawnFood(world);
    world.foodTimer = 1.4 * (0.8 + world.random() * 0.5);
  }

  // Makan.
  for (const food of world.foods) {
    if (!food.active) continue;
    food.bob += dt * 2;
    if (dist(food.x, food.y, rcx, rcy) < food.radius + 34) {
      food.active = false;
      eatFood(world, food, audio);
    }
  }
  world.foods = world.foods.filter((f) => f.active);

  // Musuh bergerak dan berinteraksi dengan badak / jantung hutan.
  world.grabbed = false;
  for (const enemy of world.enemies) {
    if (!enemy.active) continue;
    enemy.wobble += dt * 3;
    const ecx = enemy.x;
    const ecy = enemy.y;
    const dRhino = dist(ecx, ecy, rcx, rcy);
    const touch = dRhino < enemy.radius + 34;

    if (enemy.kind === 'capture') {
      // Tim pemindah berjalan ke arah badak.
      const dx = rcx - ecx;
      const dy = rcy - ecy;
      const d = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / d) * enemy.speed * dt;
      enemy.y += (dy / d) * enemy.speed * dt;
      if (touch) {
        if (dashing) {
          defeatEnemy(world, enemy, audio, true);
          continue;
        }
        // Memegang badak: meter penangkapan naik.
        enemy.grabbing = true;
        world.grabbed = true;
        world.capture = Math.min(GAME.captureMax, world.capture + GAME.captureRate * dt);
        if (world.capture >= GAME.captureMax) {
          world.lastHit = 'TIM PEMINDAH';
          endGame(world, false, audio);
          return events;
        }
      } else {
        enemy.grabbing = false;
      }
    } else {
      // Truk / ekskavator / bos berjalan ke jantung hutan.
      const dx = HEART.x - ecx;
      const dy = HEART.y - ecy;
      const d = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / d) * enemy.speed * dt;
      enemy.y += (dy / d) * enemy.speed * dt;
      if (touch) {
        if (dashing) {
          if (enemy.kind === 'boss') {
            enemy.hp -= 1;
            burst(world, ecx, ecy, '#ffd43b', 20);
            popup(world, ecx, ecy - 50, `KONVOI KENA! ${enemy.hp}/3`, '#862e9c');
            audio?.ram();
            // Bos terdorong mundur.
            enemy.x += 120;
            world.invuln = Math.max(world.invuln, 0.4);
            if (enemy.hp <= 0) defeatEnemy(world, enemy, audio, true);
          } else {
            defeatEnemy(world, enemy, audio, true);
          }
          continue;
        }
        // Tanpa serudukan, badak terpental — musuh jalan terus.
        if (world.invuln <= 0) {
          world.playerX = Math.max(0, world.playerX - 40);
          world.invuln = 0.5;
          world.lastHit = ENEMIES[enemy.kind].label;
          audio?.bump();
        }
      }
      // Sampai di jantung hutan: hutan rusak.
      if (dist(ecx, ecy, HEART.x, HEART.y) < HEART.radius + enemy.radius - 10) {
        enemy.active = false;
        const dmg = enemy.kind === 'boss' ? 40 : enemy.kind === 'excavator' ? 20 : 15;
        damageForest(world, dmg, ENEMIES[enemy.kind].label, ecx, ecy, audio);
        if (world.phase !== PHASE.PLAYING) return events;
      }
    }
  }
  world.enemies = world.enemies.filter((e) => e.active);

  // Meter penangkapan turun saat badak bebas.
  if (!world.grabbed && world.capture > 0) {
    world.capture = Math.max(0, world.capture - GAME.captureDecay * dt);
  }
  if (world.grabbed) world.combo = 0;

  for (const p of world.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 320 * dt;
  }
  world.particles = world.particles.filter((p) => p.age < p.life);
  for (const p of world.popups) p.age += dt;
  world.popups = world.popups.filter((p) => p.age < p.life);
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt);
  if (world.flash > 0) world.flash = Math.max(0, world.flash - dt);
  return events;
}

/** Skor terbaik di mesin ini (localStorage, gagal diam-diam bila tak tersedia). */
export function loadBest() {
  try {
    return Number(window.localStorage.getItem('badak-bowohasim-best') ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    const best = loadBest();
    if (score > best) window.localStorage.setItem('badak-bowohasim-best', String(score));
    return Math.max(best, score);
  } catch {
    return score;
  }
}
