// Velvet Vault — input: keyboard movement plus mouse coin throws.
//
// Keys are read as a held set so diagonal movement just works. The mouse
// records its last canvas position so a click can throw a Lucky Coin toward
// the nearest guard; the game also accepts the C key for the same action.
// Touch is mapped to the same move vector: drag to steer, tap to throw.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    // Keys tapped since the last frame: a quick Enter tap must not be lost
    // between two animation frames, so presses are queued, not just held.
    pressedKeys: new Set(),
    mouse: { x: 0, y: 0, clicked: false },
    touch: { active: false, x: 0, y: 0 },
    anyKey: false,
  };

  const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS.includes(e.code) || e.code === 'Space') e.preventDefault();
    if (!e.repeat) {
      input.keys.add(e.code);
      input.pressedKeys.add(e.code);
    }
    input.anyKey = true;
  });
  window.addEventListener('keyup', (e) => input.keys.delete(e.code));
  window.addEventListener('blur', () => input.keys.clear());

  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPos(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.clicked = true;
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const p = canvasPos(t);
    input.touch.active = true;
    input.touch.x = p.x;
    input.touch.y = p.y;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const p = canvasPos(t);
    input.touch.x = p.x;
    input.touch.y = p.y;
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    input.touch.active = false;
  }, { passive: false });

  return input;
}

// Normalised movement vector from keys (and touch drag) for this frame.
export function moveVector(input, px, py) {
  let x = 0;
  let y = 0;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) y += 1;
  if (input.touch.active) {
    const dx = input.touch.x - px;
    const dy = input.touch.y - py;
    const d = Math.hypot(dx, dy);
    if (d > 24) {
      x = dx / d;
      y = dy / d;
    }
  }
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y };
}

// True once when the player asks to throw a Lucky Coin (click or C key).
export function coinRequested(input) {
  const viaClick = input.mouse.clicked;
  const viaKey = input.keys.has('KeyC');
  if (viaClick) input.mouse.clicked = false;
  if (viaKey) input.keys.delete('KeyC');
  return viaClick || viaKey;
}

export function sneaking(input) {
  return input.keys.has('ShiftLeft') || input.keys.has('ShiftRight');
}

export function pressed(input, code) {
  if (input.pressedKeys.has(code)) {
    input.pressedKeys.delete(code);
    return true;
  }
  return false;
}
