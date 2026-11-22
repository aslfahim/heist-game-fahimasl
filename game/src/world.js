// Velvet Vault — world queries: collision and line of sight.
//
// Movement is circle-vs-rectangle against walls, slot banks and the cage
// counter, and circle-vs-circle against the round tables. Vision is a
// segment test against the same solids: a table or a wall between two points
// breaks the line of sight, so the felt floor really is cover.

import { WALLS, TABLES, SLOTS } from './config.js';

// All solid rectangles on the floor (walls + slot banks).
export function solidRects() {
  return [...WALLS, ...SLOTS];
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Push a circle (x, y, r) out of a rectangle, if they overlap.
function resolveCircleRect(p, r, rect) {
  const cx = clamp(p.x, rect.x, rect.x + rect.w);
  const cy = clamp(p.y, rect.y, rect.y + rect.h);
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return;
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2);
    p.x = cx + (dx / d) * r;
    p.y = cy + (dy / d) * r;
  } else {
    // Centre inside the rectangle: push out along the smallest overlap.
    const left = p.x - rect.x;
    const right = rect.x + rect.w - p.x;
    const top = p.y - rect.y;
    const bottom = rect.y + rect.h - p.y;
    const m = Math.min(left, right, top, bottom);
    if (m === left) p.x = rect.x - r;
    else if (m === right) p.x = rect.x + rect.w + r;
    else if (m === top) p.y = rect.y - r;
    else p.y = rect.y + rect.h + r;
  }
}

// Push a circle out of a round table, if they overlap.
function resolveCircleTable(p, r, table) {
  const dx = p.x - table.x;
  const dy = p.y - table.y;
  const min = r + table.r;
  const d2 = dx * dx + dy * dy;
  if (d2 >= min * min || d2 < 0.0001) return;
  const d = Math.sqrt(d2);
  p.x = table.x + (dx / d) * min;
  p.y = table.y + (dy / d) * min;
}

// Move a circle by (dx, dy), then resolve it against every solid.
export function moveCircle(p, r, dx, dy) {
  p.x += dx;
  p.y += dy;
  for (const rect of solidRects()) resolveCircleRect(p, r, rect);
  for (const table of TABLES) resolveCircleTable(p, r, table);
  // Keep the circle inside the room shell.
  p.x = clamp(p.x, 16 + r, 1264 - r);
  p.y = clamp(p.y, 16 + r, 784 - r);
}

// --- Line of sight ------------------------------------------------------------

// Does segment (ax, ay)-(bx, by) cross rectangle rect?
function segmentHitsRect(ax, ay, bx, by, rect) {
  // Slab test: the segment enters the rect's x-range and y-range together.
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;
  const axes = [
    [ax, dx, rect.x, rect.x + rect.w],
    [ay, dy, rect.y, rect.y + rect.h],
  ];
  for (const [o, d, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return false;
    } else {
      let ta = (lo - o) / d;
      let tb = (hi - o) / d;
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
  }
  return true;
}

// Does segment (ax, ay)-(bx, by) cross circle (cx, cy, r)?
function segmentHitsCircle(ax, ay, bx, by, cx, cy, r) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return false;
  let t = ((cx - ax) * dx + (cy - ay) * dy) / len2;
  t = clamp(t, 0, 1);
  const px = ax + dx * t - cx;
  const py = ay + dy * t - cy;
  return px * px + py * py < r * r;
}

// True when nothing solid stands between (ax, ay) and (bx, by).
export function hasLineOfSight(ax, ay, bx, by) {
  for (const rect of solidRects()) {
    if (segmentHitsRect(ax, ay, bx, by, rect)) return false;
  }
  for (const table of TABLES) {
    if (segmentHitsCircle(ax, ay, bx, by, table.x, table.y, table.r)) return false;
  }
  return true;
}

// Angle helpers.
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is target inside a vision cone (origin, facing, range, half-angle)?
export function inCone(ox, oy, facing, range, halfAngle, tx, ty) {
  const dx = tx - ox;
  const dy = ty - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 12) return true; // nose to nose counts
  const ang = Math.atan2(dy, dx);
  return Math.abs(angleDiff(ang, facing)) <= halfAngle;
}
