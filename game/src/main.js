// Velvet Vault — the simulation: patrols, vision, alarm, loot and the getaway.
//
// One frame of the game is: move the thief, step each guard along its
// patrol, sweep each camera, test every vision cone against the thief, then
// move the alarm meter. The alarm is the game's clock: it climbs while the
// thief is seen and drains while hidden, and it only busts the run at 100%.
// The first second of being spotted is a grace second — the alarm creeps, so
// a player who ducks behind a roulette table in time is never punished for
// a single unlucky step.

import {
  PLAYER, GUARD, CAMERA, ALARM, COIN, LOOT, LOOT_VALUES, GUARDS, CAMERAS, EXIT, VIEW, TABLES, SLOTS,
} from './config.js';
import { moveCircle, hasLineOfSight, inCone, angleDiff } from './world.js';
import { createInput, moveVector, coinRequested, sneaking, pressed } from './input.js';
import * as R from './render.js';
import { stageScene } from './shots.js';

export function createGame(canvas) {
  const input = createInput(canvas);
  const state = freshState();
  return { input, state, canvas };
}

export function freshState() {
  return {
    phase: 'title', // title | playing | busted | getaway
    time: 0,
    elapsed: 0,
    thief: {
      x: PLAYER.start.x, y: PLAYER.start.y,
      facing: -Math.PI / 2, moving: false,
    },
    guards: GUARDS.map((g, i) => ({
      ...g,
      x: g.waypoints[0].x, y: g.waypoints[0].y,
      wp: 1, facing: 0, alert: false, distracted: 0, distractTarget: null,
    })),
    cameras: CAMERAS.map((c) => ({ ...c, angle: c.base })),
    lootTaken: new Set(),
    chips: 0,
    score: 0,
    alarm: 0,
    spotted: false,
    spotTime: 0, // how long the thief has been continuously seen
    coin: null,  // a Lucky Coin in flight, or null
    hasDiamond: false,
    message: '',
  };
}

// --- Guards ------------------------------------------------------------------

function stepGuard(guard, dt, thief, slots) {
  if (guard.distracted > 0) {
    guard.distracted -= dt;
    // Walk toward the slot machine that caught the guard's eye.
    const t = guard.distractTarget;
    if (t) {
      const dx = t.x - guard.x;
      const dy = t.y - guard.y;
      const d = Math.hypot(dx, dy);
      if (d > 6) {
        const sp = GUARD.patrolSpeed * 0.9;
        moveCircle(guard, GUARD.radius, (dx / d) * sp * dt, (dy / d) * sp * dt);
        guard.facing = Math.atan2(dy, dx);
      }
    }
    return;
  }
  // Patrol: walk to the next waypoint, then face along the path.
  const target = guard.waypoints[guard.wp];
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 8) {
    guard.wp = (guard.wp + 1) % guard.waypoints.length;
  } else {
    const sp = GUARD.patrolSpeed;
    moveCircle(guard, GUARD.radius, (dx / d) * sp * dt, (dy / d) * sp * dt);
    guard.facing = Math.atan2(dy, dx);
  }
}

// Does this guard currently see the thief?
function guardSees(guard, thief) {
  if (guard.distracted > 0) return false;
  if (!inCone(guard.x, guard.y, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, thief.x, thief.y)) return false;
  return hasLineOfSight(guard.x, guard.y, thief.x, thief.y);
}

// --- Cameras -----------------------------------------------------------------

function stepCamera(cam, dt) {
  cam.angle = cam.base + Math.sin(cam.time * CAMERA.sweepSpeed) * cam.sweep;
}

function cameraSees(cam, thief) {
  if (!inCone(cam.x, cam.y, cam.angle, CAMERA.range, CAMERA.halfAngle, thief.x, thief.y)) return false;
  return hasLineOfSight(cam.x, cam.y, thief.x, thief.y);
}

// --- Lucky Coin ---------------------------------------------------------------

// The nearest slot machine to a point: where a distracted guard wanders.
function nearestSlot(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const s of SLOTS) {
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    const d = Math.hypot(cx - x, cy - y);
    if (d < bestD) {
      bestD = d;
      best = { x: cx, y: cy };
    }
  }
  return best;
}

function throwCoin(state) {
  if (state.chips < COIN.cost) {
    state.message = 'Not enough chips for a Lucky Coin — grab a stack first.';
    return;
  }
  // The nearest guard in range is the one the coin lures.
  let best = null;
  let bestD = COIN.distractRange;
  for (const guard of state.guards) {
    const d = Math.hypot(guard.x - state.thief.x, guard.y - state.thief.y);
    if (d < bestD) {
      bestD = d;
      best = guard;
    }
  }
  if (!best) {
    state.message = 'No guard close enough to lure.';
    return;
  }
  state.chips -= COIN.cost;
  const slot = nearestSlot(best.x, best.y);
  state.coin = {
    from: { x: state.thief.x, y: state.thief.y },
    to: { x: slot.x, y: slot.y },
    t: 0, duration: 0.55, guard: best,
  };
  state.message = `${best.name} heard the coin — off to the slots!`;
}

function stepCoin(state, dt) {
  const coin = state.coin;
  if (!coin) return;
  coin.t += dt;
  if (coin.t >= coin.duration) {
    coin.guard.distracted = COIN.distractSeconds;
    coin.guard.distractTarget = { x: coin.to.x, y: coin.to.y };
    state.coin = null;
  }
}

// --- Loot and the exit --------------------------------------------------------

function pickupLoot(state) {
  const thief = state.thief;
  for (const item of LOOT) {
    if (state.lootTaken.has(item.id)) continue;
    const d = Math.hypot(item.x - thief.x, item.y - thief.y);
    const reach = item.kind === 'diamond' ? 40 : 34;
    if (d < reach) {
      state.lootTaken.add(item.id);
      const value = LOOT_VALUES[item.kind];
      state.score += value;
      if (item.kind === 'chips') state.chips += value;
      if (item.kind === 'diamond') {
        state.hasDiamond = true;
        state.message = 'The Velvet Diamond is yours — get out!';
      } else if (item.kind === 'cage') {
        state.message = "Emptied the cashier's cage!";
      }
    }
  }
}

function atExit(state) {
  const t = state.thief;
  // The thief's centre can reach y = 771 at most (the shell clamps it), so
  // the exit triggers as the thief steps onto the doors, not past them.
  return t.x > EXIT.x && t.x < EXIT.x + EXIT.w && t.y > 756;
}

// --- Update ------------------------------------------------------------------

function updatePlaying(game, dt) {
  const { input, state } = game;
  const thief = state.thief;
  state.elapsed += dt;

  // Move the thief.
  const mv = moveVector(input, thief.x, thief.y);
  const speed = sneaking(input) ? PLAYER.sneakSpeed : PLAYER.speed;
  thief.moving = mv.x !== 0 || mv.y !== 0;
  if (thief.moving) thief.facing = Math.atan2(mv.y, mv.x);
  moveCircle(thief, PLAYER.radius, mv.x * speed * dt, mv.y * speed * dt);

  // Lucky Coin.
  if (coinRequested(input)) throwCoin(state);
  stepCoin(state, dt);

  // Guards and cameras (frozen when a screenshot scene stages the frame).
  if (!state.holdActors) {
    for (const guard of state.guards) stepGuard(guard, dt, thief);
    for (const cam of state.cameras) {
      cam.time = (cam.time ?? 0) + dt;
      stepCamera(cam, dt);
    }
  }

  // Vision: any guard or camera with eyes on the thief?
  let seen = false;
  for (const guard of state.guards) {
    guard.alert = guardSees(guard, thief);
    if (guard.alert) seen = true;
  }
  for (const cam of state.cameras) {
    if (cameraSees(cam, thief)) seen = true;
  }
  state.spotted = seen;
  if (state.holdAlarm) {
    // A staged screenshot frame keeps its alarm exactly as placed.
  } else if (seen) {
    state.spotTime += dt;
    // Fair caught moment: the first grace second raises the alarm slowly,
    // so ducking behind a table in time costs almost nothing.
    const rate = state.spotTime < ALARM.graceSeconds ? ALARM.graceRate : ALARM.guardSpotRate;
    state.alarm += rate * dt;
  } else {
    state.spotTime = 0;
    state.alarm = Math.max(0, state.alarm - ALARM.decayRate * dt);
  }

  pickupLoot(state);

  if (state.alarm >= ALARM.bustAt) {
    state.alarm = ALARM.bustAt;
    state.phase = 'busted';
    return;
  }
  if (state.hasDiamond && atExit(state)) {
    state.score += Math.max(0, 600 - Math.round(state.elapsed) * 2); // getaway time bonus
    state.phase = 'getaway';
  }
}

function update(game, dt) {
  const { input, state } = game;
  state.time += dt;
  if (state.phase === 'title') {
    if (pressed(input, 'Enter') || pressed(input, 'Space') || input.mouse.clicked) {
      input.mouse.clicked = false;
      state.phase = 'playing';
    }
    return;
  }
  if (state.phase === 'playing') {
    updatePlaying(game, dt);
    return;
  }
  if (pressed(input, 'KeyR') || pressed(input, 'Enter')) {
    const fresh = freshState();
    fresh.phase = 'playing';
    game.state = fresh;
  }
}

// --- Render ------------------------------------------------------------------

function render(game) {
  const { state, canvas } = game;
  const ctx = canvas.getContext('2d');
  const time = state.time;
  R.drawFloor(ctx);
  R.drawWalls(ctx);
  R.drawSlots(ctx, time);
  for (const table of TABLES) R.drawTable(ctx, table, time);
  R.drawLoot(ctx, LOOT, state.lootTaken, time);
  // Vision cones sit under the people, over the floor.
  for (const guard of state.guards) {
    if (guard.distracted <= 0) {
      R.drawCone(ctx, guard.x, guard.y, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, 0.16);
    }
  }
  for (const cam of state.cameras) {
    R.drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA.range, CAMERA.halfAngle, 0.12);
  }
  for (const cam of state.cameras) R.drawCamera(ctx, cam, cam.angle, time);
  for (const guard of state.guards) R.drawGuard(ctx, guard, guard.alert);
  R.drawThief(ctx, state.thief, time);
  if (state.coin) R.drawCoinFlight(ctx, state.coin);
  if (state.phase === 'playing' || state.phase === 'busted' || state.phase === 'getaway') {
    R.drawHud(ctx, {
      chips: state.chips,
      lootTaken: state.lootTaken.size,
      lootTotal: LOOT.length,
      score: state.score,
      alarm: state.alarm,
      spotted: state.spotted,
      hasDiamond: state.hasDiamond,
    }, time);
  }
  if (state.phase === 'title') R.drawTitle(ctx, time);
  if (state.phase === 'busted') R.drawBusted(ctx, state);
  if (state.phase === 'getaway') {
    R.drawGetaway(ctx, {
      lootTaken: state.lootTaken.size,
      lootTotal: LOOT.length,
      chips: state.chips,
      elapsed: state.elapsed,
      score: state.score,
    });
  }
  // One-line status for screen readers.
  const status = document.getElementById('status');
  if (status) {
    status.textContent = `Velvet Vault: alarm ${Math.round(state.alarm)} percent, `
      + `${state.lootTaken.size} of ${LOOT.length} loot taken, score ${state.score}.`;
  }
}

// --- Boot --------------------------------------------------------------------

export function boot(canvas) {
  const game = createGame(canvas);
  // ?scene=cover (and friends) stages a composed mid-heist frame for the
  // screenshots: real renders of this same code, frozen in a good moment.
  const scene = new URLSearchParams(window.location.search).get('scene');
  if (scene) stageScene(game, scene);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(game, dt);
    render(game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return game;
}

// Expose the live game for the screenshot driver and for playtesting.
window.__velvetVault = null;
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  if (!canvas) return;
  canvas.width = VIEW.w;
  canvas.height = VIEW.h;
  window.__velvetVault = boot(canvas);
});
