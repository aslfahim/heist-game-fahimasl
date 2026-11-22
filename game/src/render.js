// Velvet Vault — the painter. Every pixel is drawn, no image assets: the
// casino is felt, gold, velvet and neon drawn in canvas paths, so the game
// has zero network requests and the screenshots are renders of this code.
//
// Palette: deep green felt, brass gold, burgundy velvet, purple high-roller
// carpet, cold steel corridor. Vision cones are warm amber; the alarm meter
// is a little roulette wheel that spins faster as the heat rises.

import { VIEW, WALLS, TABLES, SLOTS, ROOMS, LOOT, EXIT } from './config.js';

const GOLD = '#d4af37';
const GOLD_DIM = '#8a6d1f';
const FELT = '#0e5c34';
const FELT_DARK = '#0a4526';
const WALL_TOP = '#5a3a1e';
const WALL_SIDE = '#3d2712';

// --- Floor -------------------------------------------------------------------

function drawFloor(ctx) {
  // Base carpet: dark green with a subtle checker of felt tiles.
  ctx.fillStyle = '#0b3d22';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = '#0d4527';
  const tile = 64;
  for (let y = 0; y < VIEW.h / tile; y++) {
    for (let x = 0; x < VIEW.w / tile; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
  // Room tints.
  for (const room of ROOMS) {
    ctx.fillStyle = room.tint;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(room.x, room.y, room.w, room.h);
    ctx.globalAlpha = 1;
  }
  // Gold trim lines around the main floor.
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 2;
  ctx.strokeRect(234, 194, 716, 590);
  // Room labels, painted on the floor.
  ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';
  ctx.font = '600 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('MAIN FLOOR', 592, 760);
  ctx.fillText('HIGH-ROLLER ROOM', 1114, 60);
  ctx.fillText('SERVICE CORRIDOR', 118, 400);
  ctx.fillText('THE VAULT', 640, 165);
  ctx.fillText("CASHIER'S CAGE", 378, 40);
}

// --- Furniture ---------------------------------------------------------------

function drawRouletteWheel(ctx, x, y, r, spin) {
  // Outer brass rim.
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#6b4d12';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  // Number pockets: alternating red and black wedges, rotating slowly.
  const pockets = 12;
  for (let i = 0; i < pockets; i++) {
    const a0 = spin + (i / pockets) * Math.PI * 2;
    const a1 = spin + ((i + 1) / pockets) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r - 8, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#8e1f2f' : '#16181d';
    ctx.fill();
  }
  // Inner felt circle and spindle.
  ctx.beginPath();
  ctx.arc(x, y, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = FELT;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD_DIM;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
}

function drawTable(ctx, table, time) {
  const { x, y, r } = table;
  // Soft shadow.
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 6, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  if (table.kind === 'roulette') {
    drawRouletteWheel(ctx, x, y, r, time * 0.12);
  } else {
    // Felt table with a gold rail.
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = FELT;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#7a2e2e';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r - 9, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = GOLD_DIM;
    ctx.stroke();
    // Cards / chips resting on the felt.
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(x - 14, y - 6, 12, 17);
    ctx.fillRect(x + 4, y - 2, 12, 17);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Table label.
  ctx.fillStyle = 'rgba(245,240,225,0.75)';
  ctx.font = '11px Georgia, serif';
  ctx.textAlign = 'center';
  const label = { roulette: 'ROULETTE', blackjack: 'BLACKJACK', baccarat: 'BACCARAT', poker: 'POKER' }[table.kind];
  ctx.fillText(label, x, y + r + 16);
}

function drawSlots(ctx, time) {
  for (const s of SLOTS) {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.lineWidth = 2;
    ctx.strokeStyle = GOLD_DIM;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    // Blinking machine lights.
    const n = Math.max(2, Math.floor(Math.min(s.w, s.h) / 18));
    for (let i = 0; i < n; i++) {
      const on = Math.sin(time * 3 + i * 1.7 + s.x) > 0;
      ctx.fillStyle = on ? '#ffd94d' : '#5c4a12';
      if (s.w > s.h) ctx.fillRect(s.x + 6 + i * 18, s.y + s.h / 2 - 4, 8, 8);
      else ctx.fillRect(s.x + s.w / 2 - 4, s.y + 6 + i * 18, 8, 8);
    }
  }
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = WALL_SIDE;
    ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4);
    ctx.strokeStyle = GOLD_DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }
  // Front doors: brass double doors at the bottom centre, with an EXIT sign.
  ctx.fillStyle = '#2a1c08';
  ctx.fillRect(EXIT.x, EXIT.y - 6, EXIT.w, 12);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT.x, EXIT.y - 6, EXIT.w, 12);
  ctx.beginPath();
  ctx.moveTo(640, EXIT.y - 6);
  ctx.lineTo(640, EXIT.y + 6);
  ctx.stroke();
  ctx.fillStyle = '#7dff9a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 640, EXIT.y - 12);
}

// --- Loot --------------------------------------------------------------------

function drawChipStack(ctx, x, y, time) {
  const bob = Math.sin(time * 2 + x) * 1.5;
  const colours = ['#c0392b', '#f5f0e1', '#2e6fd4'];
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y + bob - i * 5, 13, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = colours[i];
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.stroke();
  }
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('100', x, y + bob - 22);
}

function drawCage(ctx, x, y, time) {
  // Brass bars over a strongbox.
  ctx.fillStyle = '#3d2b08';
  ctx.fillRect(x - 34, y - 22, 68, 44);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 34, y - 22, 68, 44);
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 13, y - 22);
    ctx.lineTo(x + i * 13, y + 22);
    ctx.stroke();
  }
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('500', x, y - 30);
}

function drawDiamond(ctx, x, y, time) {
  const pulse = 1 + Math.sin(time * 3) * 0.08;
  const r = 20 * pulse;
  // Sparkle halo.
  const glow = ctx.createRadialGradient(x, y, 2, x, y, r + 26);
  glow.addColorStop(0, 'rgba(190,240,255,0.55)');
  glow.addColorStop(1, 'rgba(190,240,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r + 26, 0, Math.PI * 2);
  ctx.fill();
  // Faceted gem.
  ctx.beginPath();
  ctx.moveTo(x - r, y - r * 0.3);
  ctx.lineTo(x - r * 0.55, y - r * 0.9);
  ctx.lineTo(x + r * 0.55, y - r * 0.9);
  ctx.lineTo(x + r, y - r * 0.3);
  ctx.lineTo(x, y + r * 0.8);
  ctx.closePath();
  ctx.fillStyle = '#bfe9ff';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - r, y - r * 0.3);
  ctx.lineTo(x + r, y - r * 0.3);
  ctx.moveTo(x, y - r * 0.9);
  ctx.lineTo(x, y + r * 0.8);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  // Label below the gem: the alarm wheel sits above it in the HUD.
  ctx.fillText('THE VELVET DIAMOND', x, y + r + 16);
}

// --- Loot dispatcher ---------------------------------------------------------

export function drawLoot(ctx, loot, taken, time) {
  for (const item of loot) {
    if (taken.has(item.id)) continue;
    if (item.kind === 'chips') drawChipStack(ctx, item.x, item.y, time);
    else if (item.kind === 'cage') drawCage(ctx, item.x, item.y, time);
    else drawDiamond(ctx, item.x, item.y, time);
  }
}

// --- Vision cones ------------------------------------------------------------

// A soft amber wedge from (x, y) facing `angle`, with a hard edge line.
export function drawCone(ctx, x, y, angle, range, halfAngle, alpha) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  const grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, `rgba(255, 190, 60, ${alpha})`);
  grad.addColorStop(1, 'rgba(255, 190, 60, 0.02)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.strokeStyle = `rgba(255, 190, 60, ${alpha + 0.25})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// --- People ------------------------------------------------------------------

function drawPerson(ctx, x, y, angle, body, trim, label) {
  // Shadow.
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 5, 14, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();
  // Body.
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = trim;
  ctx.stroke();
  // Facing tick.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle) * 17, y + Math.sin(angle) * 17);
  ctx.strokeStyle = trim;
  ctx.lineWidth = 3;
  ctx.stroke();
  // Head.
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#e8c39a';
  ctx.fill();
  if (label) {
    ctx.fillStyle = 'rgba(245,240,225,0.85)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 20);
  }
}

export function drawThief(ctx, thief, time) {
  const bob = Math.sin(time * 10) * (thief.moving ? 1.5 : 0);
  drawPerson(ctx, thief.x, thief.y + bob, thief.facing, '#1d1d24', GOLD, 'YOU');
  // Velvet mask stripe.
  ctx.beginPath();
  ctx.arc(thief.x, thief.y + bob, 13, -0.6, 0.6);
  ctx.strokeStyle = '#8e1f2f';
  ctx.lineWidth = 4;
  ctx.stroke();
}

export function drawGuard(ctx, guard, alert) {
  drawPerson(ctx, guard.x, guard.y, guard.facing, '#232a3a', alert ? '#ff5a4d' : '#7fa8ff', guard.name);
  // Alert mark when the guard has eyes on the thief.
  if (alert) {
    ctx.fillStyle = '#ff5a4d';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - 26);
  }
  // Distraction: a floating coin over a guard lured to a slot machine.
  if (guard.distracted > 0) {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', guard.x, guard.y - 26);
  }
}

export function drawCamera(ctx, cam, angle, time) {
  // Wall mount.
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(cam.x - 8, cam.y - 6, 16, 12);
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 5, 0, Math.PI * 2);
  ctx.fill();
  // Blinking red eye.
  ctx.fillStyle = Math.sin(time * 4) > 0 ? '#ff3b30' : '#7a1a14';
  ctx.beginPath();
  ctx.arc(cam.x + Math.cos(angle) * 8, cam.y + Math.sin(angle) * 8, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Thrown Lucky Coin: a gold coin arcing toward its target.
export function drawCoinFlight(ctx, coin) {
  const t = coin.t / coin.duration;
  const x = coin.from.x + (coin.to.x - coin.from.x) * t;
  const y = coin.from.y + (coin.to.y - coin.from.y) * t - Math.sin(t * Math.PI) * 46;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff3b0';
  ctx.stroke();
  ctx.fillStyle = '#7a5c00';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('L', x, y + 3.5);
}

// --- HUD ---------------------------------------------------------------------

// The alarm meter: a little roulette wheel whose ball spins faster as the
// alarm rises, plus a bar and a word that tells the player how hot it is.
export function drawAlarm(ctx, alarm, time) {
  const cx = 640;
  const cy = 34;
  const r = 20;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fill();
  // Wheel.
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    const a1 = ((i + 1) / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#8e1f2f' : '#16181d';
    ctx.fill();
  }
  // Ball: speed follows the alarm.
  const ballAngle = time * (0.5 + alarm / 12);
  const bx = cx + Math.cos(ballAngle) * (r - 5);
  const by = cy + Math.sin(ballAngle) * (r - 5);
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#f5f0e1';
  ctx.fill();
  ctx.restore();
  // Bar to the right of the wheel, so the wheel never covers the vault
  // below it; the word sits under the bar.
  const bw = 180;
  const bx0 = cx + r + 14;
  const by0 = cy - 8;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(bx0 - 2, by0 - 2, bw + 4, 12);
  ctx.fillStyle = alarm < 40 ? '#7dff9a' : alarm < 75 ? '#ffd94d' : '#ff5a4d';
  ctx.fillRect(bx0, by0, (bw * alarm) / 100, 8);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  const word = alarm < 1 ? 'ALARM: QUIET' : alarm < 40 ? 'ALARM: WARM' : alarm < 75 ? 'ALARM: HOT' : 'ALARM: RED ALERT';
  ctx.fillText(`${word}  ${Math.round(alarm)}%`, bx0, by0 + 26);
}

export function drawHud(ctx, state, time) {
  // Top-left: chips and loot.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(24, 24, 250, 64);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`CHIPS  ${state.chips}`, 36, 48);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Loot  ${state.lootTaken} / ${state.lootTotal}    Score ${state.score}`, 36, 72);
  // Top-right: controls reminder.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(1006, 24, 250, 64);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = '13px sans-serif';
  ctx.fillText('WASD / arrows — move', 1018, 48);
  ctx.fillText('Click or C — Lucky Coin (50)', 1018, 72);
  drawAlarm(ctx, state.alarm, time);
  // Objective line at the bottom.
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const msg = state.hasDiamond
    ? 'Diamond secured — slip out through the front doors!'
    : 'Steal the Velvet Diamond from the vault, then leave by the front doors.';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  const w = ctx.measureText(msg).width + 28;
  ctx.fillRect(640 - w / 2, 742, w, 26);
  ctx.fillStyle = GOLD;
  ctx.fillText(msg, 640, 760);
  // "SPOTTED!" flash while a guard or camera has eyes on the thief.
  if (state.spotted) {
    ctx.fillStyle = '#ff5a4d';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — break line of sight!', 640, 130);
  }
}

// --- Screens -----------------------------------------------------------------

export function drawTitle(ctx, time) {
  ctx.fillStyle = 'rgba(8, 8, 14, 0.82)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 58px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VELVET VAULT', 640, 250);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('a casino heist', 640, 292);
  ctx.font = '16px Georgia, serif';
  const lines = [
    'One thief. Five guards. Four cameras. One diamond.',
    'Cross the casino floor, dodge the vision cones, grab the loot,',
    'and slip out the front doors before the alarm hits 100%.',
    '',
    'WASD / arrows to move · Shift to sneak · Click or C to throw a Lucky Coin (50 chips)',
    'A coin lures the nearest guard to a slot machine. Cameras sweep — time your crossing.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 360 + i * 28));
  ctx.fillStyle = Math.sin(time * 4) > 0 ? GOLD : '#f5f0e1';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER or click to start the heist', 640, 600);
}

export function drawBusted(ctx, state) {
  ctx.fillStyle = 'rgba(20, 4, 4, 0.85)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = '#ff5a4d';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('BUSTED!', 640, 320);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('The alarm hit 100% and security swarmed the floor.', 640, 366);
  ctx.fillText(`You kept ${state.score} points of loot in your pockets.`, 640, 398);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press R to try the heist again', 640, 470);
}

export function drawGetaway(ctx, state) {
  ctx.fillStyle = 'rgba(6, 20, 10, 0.88)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLEAN GETAWAY!', 640, 280);
  ctx.fillStyle = '#f5f0e1';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('You walked out the front doors with the Velvet Diamond.', 640, 330);
  ctx.fillText(`Loot: ${state.lootTaken} of ${state.lootTotal}   ·   Chips banked: ${state.chips}`, 640, 368);
  ctx.fillText(`Time: ${Math.round(state.elapsed)}s   ·   Final score: ${state.score}`, 640, 402);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press R to run it again', 640, 480);
}

export { drawFloor, drawWalls, drawSlots, drawTable, drawDiamond };
