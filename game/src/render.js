// Semua gambar digambar dengan Canvas 2D — tanpa aset eksternal dan tanpa
// network — supaya game tetap jalan offline dari file statis.
import { FIELD, HEART, PLAYER, GAME, COLORS } from './config.js';
import { PHASE } from './world.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawShadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, x, y, scale, t, dark) {
  const sway = Math.sin(t * 0.8 + x) * 3;
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(x - 9 * scale, y - 80 * scale, 18 * scale, 80 * scale);
  ctx.fillStyle = dark ? COLORS.forestDark : COLORS.forest;
  ctx.beginPath();
  ctx.arc(x + sway, y - 100 * scale, 48 * scale, 0, Math.PI * 2);
  ctx.arc(x - 32 * scale + sway, y - 74 * scale, 33 * scale, 0, Math.PI * 2);
  ctx.arc(x + 32 * scale + sway, y - 74 * scale, 33 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.leaf;
  ctx.beginPath();
  ctx.arc(x - 10 * scale + sway, y - 108 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 16 * scale + sway, y - 84 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(x, y, 26 * scale, 0, Math.PI * 2);
  ctx.arc(x + 28 * scale, y - 8 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x + 60 * scale, y, 24 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeartTree(ctx, t) {
  const x = HEART.x;
  const y = HEART.y + 40;
  const sway = Math.sin(t * 0.7) * 4;
  // Lingkaran pelindung jantung hutan.
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(HEART.x, HEART.y, HEART.radius + 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(x - 14, y - 110, 28, 110);
  ctx.fillStyle = COLORS.heartTree;
  ctx.beginPath();
  ctx.arc(x + sway, y - 140, 72, 0, Math.PI * 2);
  ctx.arc(x - 48 + sway, y - 100, 50, 0, Math.PI * 2);
  ctx.arc(x + 48 + sway, y - 100, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#69db7c';
  ctx.beginPath();
  ctx.arc(x - 18 + sway, y - 152, 32, 0, Math.PI * 2);
  ctx.arc(x + 26 + sway, y - 118, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff6b6b';
  for (const [dx, dy] of [[-38, -120], [30, -150], [8, -100]]) {
    ctx.beginPath();
    ctx.arc(x + dx + sway, y + dy, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JANTUNG HUTAN', x, y + 34);
  ctx.textAlign = 'left';
}

function drawFood(ctx, food, t) {
  const y = food.y + Math.sin(food.bob + t) * 4;
  if (food.kind === 'leaf') {
    ctx.fillStyle = COLORS.leaf;
    ctx.beginPath();
    ctx.ellipse(food.x, y, food.radius, food.radius * 0.55, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.leafDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(food.x - food.radius + 4, y);
    ctx.lineTo(food.x + food.radius - 4, y - 4);
    ctx.stroke();
  } else if (food.kind === 'fruit') {
    ctx.fillStyle = COLORS.fruit;
    ctx.beginPath();
    ctx.arc(food.x, y, food.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd6d6';
    ctx.beginPath();
    ctx.arc(food.x - 6, y - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#588157';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(food.x, y - food.radius);
    ctx.quadraticCurveTo(food.x + 4, y - food.radius - 8, food.x + 10, y - food.radius - 8);
    ctx.stroke();
  } else {
    ctx.fillStyle = COLORS.golden;
    ctx.beginPath();
    ctx.arc(food.x, y, food.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(food.x - 8, y - 2);
    ctx.lineTo(food.x, y + 10);
    ctx.lineTo(food.x + 8, y - 2);
    ctx.stroke();
  }
}

function drawCaptureTeam(ctx, e, t) {
  const bob = Math.sin(t * 8 + e.wobble) * 2;
  // Orang dengan jaring penangkap.
  ctx.fillStyle = COLORS.captureTeam;
  ctx.beginPath();
  ctx.arc(e.x, e.y - 8 + bob, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffdfb3';
  ctx.beginPath();
  ctx.arc(e.x, e.y - 26 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.captureTeamDark;
  ctx.beginPath();
  ctx.arc(e.x, e.y - 30 + bob, 11, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = COLORS.captureTeam;
  ctx.fillRect(e.x - 10, e.y + 4 + bob, 20, 24);
  ctx.strokeStyle = '#868e96';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(e.x + 18, e.y - 6 + bob, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.x + 10, e.y + 2 + bob);
  ctx.lineTo(e.x + 22, e.y - 12 + bob);
  ctx.stroke();
  if (e.grabbing) {
    ctx.fillStyle = '#c1121f';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENANGKAP!', e.x, e.y - 48);
    ctx.textAlign = 'left';
  }
}

function drawTruck(ctx, e) {
  ctx.fillStyle = COLORS.truck;
  roundRect(ctx, e.x - 55, e.y - 22, 110, 44, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.truckDark;
  ctx.fillRect(e.x - 47, e.y + 8, 94, 10);
  ctx.fillStyle = '#ffe8cc';
  roundRect(ctx, e.x - 50, e.y - 16, 26, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.arc(e.x - 28, e.y + 22, 10, 0, Math.PI * 2);
  ctx.arc(e.x + 28, e.y + 22, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd43b';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TAMBANG', e.x + 12, e.y + 2);
  ctx.textAlign = 'left';
}

function drawExcavator(ctx, e, t) {
  const ang = Math.sin(t * 1.2 + e.wobble) * 0.9;
  ctx.fillStyle = COLORS.excavatorDark;
  ctx.fillRect(e.x - 30, e.y - 8, 60, 30);
  ctx.fillStyle = COLORS.excavator;
  roundRect(ctx, e.x - 22, e.y - 30, 44, 26, 6);
  ctx.fill();
  const ax = e.x - 70 + Math.cos(ang) * 20;
  const ay = e.y - 10 + Math.sin(ang) * 20;
  ctx.strokeStyle = COLORS.excavatorDark;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(e.x - 10, e.y - 18);
  ctx.lineTo(ax, ay);
  ctx.stroke();
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.arc(ax, ay, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.arc(e.x - 16, e.y + 24, 8, 0, Math.PI * 2);
  ctx.arc(e.x + 16, e.y + 24, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoss(ctx, e, t) {
  // Konvoi pemerintah prabroro: truk raksasa ungu dengan spanduk dan pengawalan.
  const bob = Math.sin(t * 3) * 2;
  ctx.fillStyle = COLORS.bossMachineDark;
  ctx.fillRect(e.x - 58, e.y - 10, 116, 44);
  ctx.fillStyle = COLORS.bossMachine;
  roundRect(ctx, e.x - 62, e.y - 42, 124, 40, 10);
  ctx.fill();
  ctx.fillStyle = '#ffe8cc';
  roundRect(ctx, e.x - 56, e.y - 36, 34, 24, 5);
  ctx.fill();
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.arc(e.x - 34, e.y + 36, 12, 0, Math.PI * 2);
  ctx.arc(e.x + 34, e.y + 36, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KONVOI', e.x + 22, e.y - 24);
  ctx.fillText('PRABRORO', e.x + 22, e.y - 8);
  ctx.textAlign = 'left';
  // Bendera di atas konvoi.
  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(e.x + 50, e.y - 42);
  ctx.lineTo(e.x + 50, e.y - 66 + bob);
  ctx.stroke();
  ctx.fillStyle = '#862e9c';
  ctx.beginPath();
  ctx.moveTo(e.x + 50, e.y - 66 + bob);
  ctx.lineTo(e.x + 82, e.y - 58 + bob);
  ctx.lineTo(e.x + 50, e.y - 50 + bob);
  ctx.closePath();
  ctx.fill();
  // Bar nyawa bos.
  const bw = 90;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, e.x - bw / 2, e.y - 82, bw, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#e03131';
  roundRect(ctx, e.x - bw / 2, e.y - 82, bw * (e.hp / e.maxHp), 10, 5);
  ctx.fill();
}

function drawRhino(ctx, world, t) {
  const x = world.playerX;
  const y = world.playerY;
  const face = world.playerFace;
  const dashing = world.dashTime > 0;
  const blink = world.invuln > 0 && Math.floor(t * 12) % 2 === 0;
  const legSwing = Math.sin(t * 10) * 5;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.45;
  if (dashing) {
    ctx.strokeStyle = 'rgba(255,212,59,0.8)';
    ctx.lineWidth = 4;
    for (let i = 1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + (face === 1 ? -i * 18 : PLAYER.width + i * 18), y + 14);
      ctx.lineTo(x + (face === 1 ? -i * 18 - 22 : PLAYER.width + i * 18 + 22), y + 14);
      ctx.stroke();
    }
  }
  ctx.fillStyle = COLORS.rhinoDark;
  const legs = [[8, legSwing], [26, -legSwing], [56, -legSwing], [70, legSwing]];
  for (const [lx, sw] of legs) ctx.fillRect(x + lx, y + PLAYER.height - 14, 10, 14 + sw * 0.2);
  ctx.fillStyle = COLORS.rhino;
  ctx.beginPath();
  ctx.ellipse(x + PLAYER.width / 2, y + PLAYER.height / 2 - 4, PLAYER.width / 2, PLAYER.height / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.rhinoBelly;
  ctx.beginPath();
  ctx.ellipse(x + PLAYER.width / 2, y + PLAYER.height - 16, PLAYER.width / 2 - 8, 8, 0, 0, Math.PI);
  ctx.fill();
  const hx = face === 1 ? x + PLAYER.width - 6 : x + 6;
  ctx.fillStyle = COLORS.rhino;
  ctx.beginPath();
  ctx.arc(hx, y + 22, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.horn;
  ctx.beginPath();
  if (face === 1) {
    ctx.moveTo(hx + 8, y + 12);
    ctx.lineTo(hx + 30, y + 2);
    ctx.lineTo(hx + 16, y + 20);
  } else {
    ctx.moveTo(hx - 8, y + 12);
    ctx.lineTo(hx - 30, y + 2);
    ctx.lineTo(hx - 16, y + 20);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.rhinoDark;
  ctx.beginPath();
  ctx.arc(hx - face * 8, y + 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.arc(hx + face * 6, y + 18, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.rhinoDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + (face === 1 ? 2 : PLAYER.width - 2), y + 22);
  ctx.quadraticCurveTo(x + (face === 1 ? -12 : PLAYER.width + 12), y + 30, x + (face === 1 ? -8 : PLAYER.width + 8), y + 44);
  ctx.stroke();
  ctx.restore();
}

function bar(ctx, x, y, w, h, frac, color, bg = 'rgba(0,0,0,0.15)') {
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  if (frac > 0) {
    roundRect(ctx, x, y, Math.max(h, w * frac), h, h / 2);
    ctx.fill();
  }
}

function drawHud(ctx, world) {
  const pad = 16;
  ctx.fillStyle = COLORS.hudPanel;
  roundRect(ctx, pad, pad, 320, 108, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Skor ${world.score}`, pad + 16, pad + 24);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(`Gelombang ${Math.max(1, world.wave)} / ${GAME.waves}  •  Musuh diusir: ${world.defeated}`, pad + 16, pad + 56);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#2f9e44';
  ctx.fillText(`🌳 Hutan ${Math.round(world.forestHealth)}%`, pad + 16, pad + 84);
  bar(ctx, pad + 130, pad + 76, 170, 14, world.forestHealth / 100, world.forestHealth < 30 ? '#e03131' : '#2f9e44');

  // Meter penangkapan badak (kanan atas) + cooldown serudukan.
  const bx = FIELD.width - pad - 300;
  ctx.fillStyle = COLORS.hudPanel;
  roundRect(ctx, bx, pad, 300, 86, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('🦏 Badak ditangkap', bx + 16, pad + 22);
  bar(ctx, bx + 16, pad + 36, 268, 16, world.capture / 100, world.capture > 60 ? '#e03131' : '#f76707');
  ctx.fillStyle = world.dashCooldown > 0 ? '#868e96' : '#1971c2';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(world.dashCooldown > 0 ? 'Seruduk: isi ulang...' : 'Seruduk: SIAP (Spasi)', bx + 16, pad + 70);

  // Bar waktu gelombang istirahat.
  if (world.waveState === 'rest') {
    ctx.fillStyle = 'rgba(33,53,71,0.85)';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Gelombang berikutnya dalam ${Math.ceil(world.restTimer)} detik — makan dulu!`, FIELD.width / 2, 60);
    ctx.textAlign = 'left';
  }
}

function overlay(ctx, title, lines, button, accent) {
  ctx.fillStyle = 'rgba(20,40,20,0.35)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const w = 760;
  const h = 150 + lines.length * 32 + 92;
  const x = (FIELD.width - w) / 2;
  const y = Math.max(10, (FIELD.height - h) / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  roundRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  roundRect(ctx, x, y, w, h, 22);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.fillText(title, FIELD.width / 2, y + 70);
  ctx.fillStyle = COLORS.ink;
  ctx.font = '19px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, FIELD.width / 2, y + 124 + i * 32));
  ctx.fillStyle = accent;
  roundRect(ctx, FIELD.width / 2 - 160, y + h - 82, 320, 56, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(button, FIELD.width / 2, y + h - 53);
  ctx.textAlign = 'left';
}

export function draw(ctx, world, t) {
  ctx.save();
  if (world.shake > 0) {
    const s = world.shake * 22;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  // Langit, matahari, awan.
  const sky = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  sky.addColorStop(0, COLORS.skyTop);
  sky.addColorStop(1, COLORS.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = COLORS.sun;
  ctx.beginPath();
  ctx.arc(1150, 90, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,217,61,0.35)';
  ctx.beginPath();
  ctx.arc(1150, 90, 60, 0, Math.PI * 2);
  ctx.fill();
  drawCloud(ctx, 180 + Math.sin(t * 0.1) * 12, 80, 1);
  drawCloud(ctx, 620 + Math.sin(t * 0.07 + 2) * 16, 130, 0.8);
  drawCloud(ctx, 980, 55, 0.7);

  // Tanah hutan + tanah bekas tambang di kanan (tempat musuh masuk).
  ctx.fillStyle = COLORS.forestFar;
  ctx.fillRect(0, 560, FIELD.width, FIELD.height - 560);
  ctx.fillStyle = '#c98f4e';
  ctx.fillRect(1050, 560, FIELD.width - 1050, FIELD.height - 560);
  ctx.fillStyle = COLORS.clearing;
  ctx.beginPath();
  ctx.ellipse(HEART.x, HEART.y + 60, 190, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  drawTree(ctx, 70, 620, 1.1, t, false);
  drawTree(ctx, 170, 660, 0.9, t, true);
  drawTree(ctx, 90, 180, 0.85, t, true);
  drawTree(ctx, 1180, 640, 1.0, t, false);
  drawTree(ctx, 1240, 200, 0.9, t, true);

  // Rambu peringatan tambang di sisi kanan.
  ctx.fillStyle = '#ffd43b';
  ctx.fillRect(1060, 120, 150, 44);
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ AREA TAMBANG', 1135, 147);
  ctx.textAlign = 'left';

  drawHeartTree(ctx, t);
  for (const food of world.foods) drawFood(ctx, food, t);
  for (const e of world.enemies) {
    drawShadow(ctx, e.x, e.y + e.radius * 0.8, e.radius * 0.9, e.radius * 0.3);
    if (e.kind === 'capture') drawCaptureTeam(ctx, e, t);
    else if (e.kind === 'truck') drawTruck(ctx, e);
    else if (e.kind === 'excavator') drawExcavator(ctx, e, t);
    else drawBoss(ctx, e, t);
  }

  // Partikel.
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawShadow(ctx, world.playerX + PLAYER.width / 2, world.playerY + PLAYER.height - 2, 44, 10);
  drawRhino(ctx, world, t);

  // Teks melayang.
  ctx.textAlign = 'center';
  for (const p of world.popups) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(p.text, p.x, p.y - p.age * 40);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  if (world.phase === PHASE.PLAYING || world.phase === PHASE.PAUSED) drawHud(ctx, world);
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(224,49,49,${world.flash * 0.8})`;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  if (world.phase === PHASE.START) {
    overlay(ctx, '🦏 BADAK BOWOHASIM', [
      'Cerita fiksi: pemerintah prabroro ingin memindahkan badak',
      'dari hutan ini dan mengubah hutan jadi tambang.',
      'Kamu jagoannya: tahan mereka, selamatkan badak dan hutan!',
      'Tim pemindah mencoba menangkap badak — seruduk mereka!',
      'Truk & ekskavator merusak hutan — usir sebelum sampai',
      'ke Jantung Hutan. Makan daun +10, buah +20, buah emas +50.',
      'Tahan 5 gelombang! Di gelombang 5, Konvoi Prabroro datang.',
      'Seruduk (Spasi) untuk mengusir musuh. Kalah bila badak',
      'dipindahkan atau hutan rusak habis jadi tambang.',
      'Gerak: ← ↑ ↓ → atau W A S D, atau ikuti mouse.',
    ], '▶  JAGA HUTAN!', '#2f9e44');
  } else if (world.phase === PHASE.PAUSED) {
    overlay(ctx, 'ISTIRAHAT DULU', ['Permainan dijeda.', 'Tekan P atau klik untuk lanjut.'], '▶  LANJUT', '#1971c2');
  } else if (world.phase === PHASE.WON) {
    overlay(ctx, '🎉 HUTAN SELAMAT!', [
      'Semua 5 gelombang berhasil ditahan!',
      `Skor akhir: ${world.score}  •  Musuh diusir: ${world.defeated}`,
      `Makanan dimakan: ${world.eaten}  •  Hutan tersisa: ${Math.round(world.forestHealth)}%`,
      'Badak tetap di hutan. Pemerintah prabroro mundur!',
    ], '↻  MAIN LAGI', '#2f9e44');
  } else if (world.phase === PHASE.LOST) {
    overlay(ctx, world.message, [
      `Skor akhir: ${world.score}  •  Gelombang: ${world.wave} / ${GAME.waves}`,
      `Musuh diusir: ${world.defeated}  •  Hutan tersisa: ${Math.round(world.forestHealth)}%`,
      'Coba lagi — badak dan hutan masih menunggu dijaga.',
    ], '↻  COBA LAGI', '#c1121f');
  }
  ctx.restore();
}
