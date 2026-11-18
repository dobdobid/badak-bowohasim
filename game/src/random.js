// RNG kecil yang bisa di-seed (mulberry32), supaya tangkapan layar
// `?shot=...&seed=N` selalu menampilkan buah yang sama.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pilih satu kunci dari tabel bobot, memakai `random` yang di-seed. */
export function pickWeighted(weights, random) {
  let total = 0;
  for (const key of Object.keys(weights)) total += weights[key];
  let roll = random() * total;
  for (const key of Object.keys(weights)) {
    roll -= weights[key];
    if (roll <= 0) return key;
  }
  return Object.keys(weights)[0];
}
