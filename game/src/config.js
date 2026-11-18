// Badak Bowohasim — konfigurasi permainan.
// Satu tempat untuk semua angka yang menentukan rasa permainan, supaya
// penyeimbangannya bisa diubah tanpa menyentuh logika di world.js.
export const FIELD = { width: 1280, height: 720 };

// Jantung hutan yang harus dijaga — truk/ekskavator yang sampai ke sini
// merusak hutan.
export const HEART = { x: 300, y: 360, radius: 70 };

export const PLAYER = {
  width: 84,
  height: 56,
  x: 300,
  y: 330,
  speed: 380, // px/detik
  dashSpeed: 850,
  dashTime: 0.35,
  dashCooldown: 1.2,
};

export const GAME = {
  waves: 5, // jumlah gelombang yang harus ditahan
  forestHealth: 100,
  captureMax: 100, // meter penangkapan: penuh = badak dipindahkan
  captureRate: 30, // % per detik saat tim pemindah memegang badak
  captureDecay: 25, // % per detik saat badak bebas
  spawnInterval: 1.1, // detik antar musuh dalam satu gelombang
  restSeconds: 4, // jeda antar gelombang
};

export const FOODS = {
  leaf: { points: 10, weight: 55, radius: 20, label: 'Daun' },
  fruit: { points: 20, weight: 25, radius: 22, label: 'Buah Hutan' },
  golden: { points: 50, weight: 5, radius: 24, label: 'Buah Emas' },
};

// Komposisi tiap gelombang: [tim pemindah, truk, ekskavator].
// Gelombang 5 ditambah bos "Konvoi Pemerintah".
export const WAVES = [
  { capture: 3, truck: 1, excavator: 0 },
  { capture: 4, truck: 2, excavator: 1 },
  { capture: 5, truck: 2, excavator: 2 },
  { capture: 6, truck: 3, excavator: 2 },
  { capture: 7, truck: 3, excavator: 3 },
];

export const ENEMIES = {
  capture: { speed: 75, radius: 26, score: 20, label: 'Tim Pemindah' },
  truck: { speed: 95, radius: 30, score: 30, label: 'Truk Tambang' },
  excavator: { speed: 55, radius: 32, score: 40, label: 'Ekskavator' },
  boss: { speed: 60, radius: 52, hp: 3, score: 150, label: 'Konvoi Pemerintah' },
};

// Warna hutan, tambang, dan musuh.
export const COLORS = {
  skyTop: '#7ec8f7',
  skyBottom: '#e8f9ff',
  sun: '#ffd93d',
  forestFar: '#4c9a52',
  forest: '#2f7d3a',
  forestDark: '#1f5c2a',
  clearing: '#8fce6e',
  heartTree: '#2b8a3e',
  rhino: '#8d99ae',
  rhinoDark: '#6c757d',
  rhinoBelly: '#adb5bd',
  horn: '#f8f9fa',
  leaf: '#51cf66',
  leafDark: '#2b8a3e',
  fruit: '#ff6b6b',
  golden: '#ffd60a',
  captureTeam: '#1971c2',
  captureTeamDark: '#0b4a7a',
  truck: '#f76707',
  truckDark: '#c2410c',
  excavator: '#fab005',
  excavatorDark: '#e67700',
  bossMachine: '#862e9c',
  bossMachineDark: '#5f1a72',
  hudPanel: 'rgba(255,255,255,0.92)',
  ink: '#213547',
};
