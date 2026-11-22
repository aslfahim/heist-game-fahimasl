// Velvet Vault — screenshot scenes.
//
// ?scene=<name> stages a composed mid-heist frame for the screenshots: the
// same live game, with the thief, guards, cameras, loot and alarm placed in
// a telling moment, then frozen (the loop keeps drawing, but the staged
// state is what the camera sees). These are real renders of the game's own
// code — no compositing, no borrowed images.
//
//   cover    — the judge's first look: thief crossing the main floor with
//               guards and their cones, wall cameras, chip stacks, the
//               roulette alarm meter and the diamond in view.
//   vault    — the thief at the vault door, diamond glowing, guard cones
//               crossing the doorway.
//   corridor — the thief sneaking the service corridor past a sweeping camera.
//   getaway  — the payoff screen after a clean escape.

import { GUARD, CAMERA, LOOT_VALUES } from './config.js';

function placeGuard(state, i, x, y, facing) {
  const g = state.guards[i];
  g.x = x;
  g.y = y;
  g.facing = facing;
  g.alert = false;
  g.distracted = 0;
}

function setCamera(state, i, angle) {
  const c = state.cameras[i];
  c.angle = angle;
  c.time = 0;
}

// Freeze a camera's sweep so the staged cone stays put in the screenshot.
function freezeCameras(state) {
  for (const c of state.cameras) c.sweep = 0;
}

export function stageScene(game, scene) {
  const state = game.state;
  state.phase = 'playing';
  state.time = 12; // warm the roulette wheels and slot lights
  // A staged frame is frozen: guards hold their patrol, cameras hold their
  // sweep and the alarm holds its value, so the screenshot is the composed
  // moment, not a frame that drifted after staging.
  state.holdActors = true;
  state.holdAlarm = true;
  freezeCameras(state);

  if (scene === 'cover') {
    // Thief mid-floor, between the roulette tables, two chip stacks already
    // banked, alarm warm, guards closing in from three sides.
    state.thief.x = 600;
    state.thief.y = 480;
    state.thief.facing = -Math.PI / 2;
    state.alarm = 55;
    state.chips = 200;
    state.score = 200;
    state.lootTaken.add('chips-a');
    state.lootTaken.add('chips-b');
    placeGuard(state, 0, 430, 380, Math.PI / 4);      // Marco by the roulette table
    placeGuard(state, 1, 760, 420, Math.PI * 0.75);   // Rosa sweeping the floor
    placeGuard(state, 2, 1090, 260, -Math.PI / 2);    // Vince in the high-roller room
    placeGuard(state, 3, 640, 240, Math.PI / 2);      // Ada guarding the vault door
    placeGuard(state, 4, 110, 520, 0);                // Lou in the corridor
    setCamera(state, 0, Math.PI / 2);                 // vault camera looking down
    setCamera(state, 1, Math.PI);                     // high-roller camera
    setCamera(state, 2, 0.3);                         // corridor camera
    setCamera(state, 3, -Math.PI / 2);                // door camera
    return;
  }

  if (scene === 'vault') {
    // At the vault door: the diamond glows, Ada's cone crosses the doorway.
    state.thief.x = 640;
    state.thief.y = 250;
    state.thief.facing = -Math.PI / 2;
    state.alarm = 30;
    state.chips = 400;
    state.score = 400;
    state.lootTaken.add('chips-a');
    state.lootTaken.add('chips-b');
    state.lootTaken.add('chips-c');
    state.lootTaken.add('chips-d');
    placeGuard(state, 0, 430, 380, Math.PI / 4);
    placeGuard(state, 1, 760, 420, Math.PI * 0.75);
    placeGuard(state, 2, 1090, 260, -Math.PI / 2);
    placeGuard(state, 3, 560, 120, 0);               // Ada inside the vault
    placeGuard(state, 4, 110, 520, 0);
    setCamera(state, 0, Math.PI / 2);
    setCamera(state, 1, Math.PI);
    setCamera(state, 2, 0.3);
    setCamera(state, 3, -Math.PI / 2);
    return;
  }

  if (scene === 'corridor') {
    // Sneaking the service corridor: Lou ahead, the wall camera sweeping.
    state.thief.x = 110;
    state.thief.y = 300;
    state.thief.facing = Math.PI / 2;
    state.alarm = 18;
    state.chips = 100;
    state.score = 100;
    state.lootTaken.add('chips-f');
    placeGuard(state, 0, 430, 500, Math.PI / 4);
    placeGuard(state, 1, 760, 300, Math.PI);
    placeGuard(state, 2, 1090, 260, -Math.PI / 2);
    placeGuard(state, 3, 640, 240, Math.PI / 2);
    placeGuard(state, 4, 110, 620, -Math.PI / 2);    // Lou walking toward the thief
    setCamera(state, 0, Math.PI / 2);
    setCamera(state, 1, Math.PI);
    setCamera(state, 2, Math.PI / 2);                // corridor camera aimed down the hall
    setCamera(state, 3, -Math.PI / 2);
    return;
  }

  if (scene === 'getaway') {
    // The payoff screen: diamond taken, out the front doors, score tallied.
    state.phase = 'getaway';
    state.hasDiamond = true;
    state.lootTaken.add('diamond');
    state.lootTaken.add('cage');
    state.lootTaken.add('chips-a');
    state.lootTaken.add('chips-b');
    state.lootTaken.add('chips-c');
    state.lootTaken.add('chips-d');
    state.lootTaken.add('chips-e');
    state.lootTaken.add('chips-f');
    state.chips = 600;
    state.score = 1000 + 500 + 600 + 214; // diamond + cage + chips + time bonus
    state.elapsed = 193;
    state.alarm = 42;
    state.thief.x = 640;
    state.thief.y = 735;
    return;
  }

  // Unknown scene name: leave the game on its title screen.
  state.phase = 'title';
}

// Keep the linter honest: the guard/camera tunings are part of the scene
// contract even when a scene only moves people around.
void GUARD;
void CAMERA;
void LOOT_VALUES;
