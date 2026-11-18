# 🦏 Badak Bowohasim

Game bertahan (defense) 2D khas Indonesia untuk bounty **best-game-01**
di make.fun ($1.000, 10 tempat dibayar). Dibangun dengan AI agent untuk
akun **@dob2x**.

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/dobdobid/badak-bowohasim/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/dobdobid/badak-bowohasim/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

## Cerita (fiksi)

Pemerintah prabroro ingin memindahkan badak dari hutan ini dan mengubah
hutan jadi tambang. Kamu jagoannya: siapa yang mampu menahan pemerintah
prabroro memindahkan badak dari hutan itu, dialah pemenangnya — dan siapa
yang berhasil menyelamatkan hutan dari pemerintah prabroro agar hutan tidak
dirusak dan dijadikan tambang, dia juga pemenangnya.

Tahan 5 gelombang serangan: tim pemindah yang mencoba menangkap badak,
truk dan ekskavator yang merusak hutan, sampai Konvoi Prabroro di gelombang
terakhir. Jaga badak tetap di hutan, jaga Jantung Hutan tetap utuh.

## Cara main

Kamu menggerakkan badak. Seruduk (Spasi) untuk mengusir musuh.

| Musuh | Cara mengusir | Efek bila dibiarkan |
| --- | --- | --- |
| 🧑‍🤝‍🧑 Tim Pemindah | Seruduk saat mendekat | Memegang badak — meter penangkapan naik, penuh = badak dipindahkan |
| 🚚 Truk Tambang | Seruduk | Sampai ke Jantung Hutan: hutan −15% |
| 🏗️ Ekskavator | Seruduk | Sampai ke Jantung Hutan: hutan −20% |
| 👑 Konvoi Prabroro (bos, gelombang 5) | Seruduk 3 kali | Sampai ke Jantung Hutan: hutan −40% |

| Makanan | Efek |
| --- | --- |
| 🍃 Daun | +10 poin |
| 🍎 Buah hutan | +20 poin |
| ✨ Buah Emas | +50 poin, hutan +5% |

- **Menang:** tahan semua 5 gelombang — hutan selamat!
- **Kalah:** badak berhasil dipindahkan (meter penangkapan penuh), atau
  hutan rusak habis jadi tambang (kesehatan hutan 0%).
- **Kombo:** usir/makan 5 kali berturut-turut tanpa jeda → +5/+10 bonus.
- **Jeda antar gelombang:** 4 detik untuk makan dan bersiap.
- **Kontrol:** `←` `↑` `↓` `→` atau `W` `A` `S` `D`, atau gerakkan mouse
  (badak mengikuti pointer). `Spasi` mulai dan menyeruduk, `P` jeda,
  `M` suara, `R` main lagi.
- **Suara:** efek WebAudio murni (tanpa file audio) — makan, emas,
  serudukan, gelombang, menang, dan kalah.

## Mainkan

Buka `game/index.html` di desktop Chrome (atau jalankan `node serve.ts` lalu
buka http://localhost:8080). Tanpa build step, tanpa network request.
Versi ini sengaja 2D (Canvas 2D murni): tampilannya tajam di semua Chrome,
termasuk saat tangkapan layar diambil tanpa GPU.

Tangkapan layar deterministik: `?shot=start`, `?shot=play`, atau `?shot=end`
(ditambah `&seed=N`).

## Struktur

- `main.ts` — entrypoint Node 22: menyalin `game/` dan `screenshots/` ke output
  dan menulis `dossier.json` dengan `vendor/makefun-game.ts`.
- `game/index.html` + `game/src/` — permainan Canvas 2D murni:
  `config.js` (angka penyeimbang), `world.js` (logika murni, bisa diuji di Node),
  `render.js` (semua gambar digambar di canvas), `input.js`, `audio.js`,
  `shots.js` (keadaan deterministik untuk screenshot), `main.js` (loop).
- `screenshots/` — 3 tangkapan layar asli dari kode game sendiri.

## Lisensi

MIT — lihat `LICENSE`.
