// Input keyboard + mouse/pointer. Satu sumber kebenaran untuk arah gerak:
// directionX/directionY: -1, 0 atau 1, plus posisi pointer untuk mengikuti mouse.
export function createInput(canvas) {
  const keys = new Set();
  let pointerX = null; // posisi pointer dalam koordinat canvas, null bila tak dipakai
  let pointerY = null;
  const pressed = new Set(); // tombol yang baru ditekan sejak frame lalu

  function canvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
    if (!event.repeat) pressed.add(event.key.toLowerCase());
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPos(event.clientX, event.clientY);
    pointerX = p.x;
    pointerY = p.y;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = canvasPos(event.clientX, event.clientY);
    pointerX = p.x;
    pointerY = p.y;
    pressed.add('click');
  });
  window.addEventListener('blur', () => {
    keys.clear();
    pointerX = null;
    pointerY = null;
  });

  return {
    /** -1, 0 atau 1 dari keyboard (horizontal). */
    directionX() {
      const left = keys.has('arrowleft') || keys.has('a');
      const right = keys.has('arrowright') || keys.has('d');
      if (left && !right) return -1;
      if (right && !left) return 1;
      return 0;
    },
    /** -1, 0 atau 1 dari keyboard (vertikal). */
    directionY() {
      const up = keys.has('arrowup') || keys.has('w');
      const down = keys.has('arrowdown') || keys.has('s');
      if (up && !down) return -1;
      if (down && !up) return 1;
      return 0;
    },
    pointerX() {
      return pointerX;
    },
    pointerY() {
      return pointerY;
    },
    clearPointer() {
      pointerX = null;
      pointerY = null;
    },
    /** Benar sekali saat tombol baru ditekan; dibersihkan tiap frame oleh main.js. */
    wasPressed(key) {
      return pressed.has(key.toLowerCase());
    },
    endFrame() {
      pressed.clear();
    },
  };
}
