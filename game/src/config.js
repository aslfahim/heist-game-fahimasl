// Velvet Vault: Casino Heist — tuning constants and the casino floor plan.
//
// Everything on the floor is data here: walls, tables, slot machines, loot,
// guard patrols and cameras. The simulation (main.js) and the painter
// (render.js) only read this table, so a new floor is a new table, not new
// code. Coordinates are in the 1280 x 800 logical canvas space.

export const VIEW = { w: 1280, h: 800 };

// --- Player and guard tuning -------------------------------------------------
export const PLAYER = {
  radius: 13,
  speed: 205,          // px per second on felt
  sneakSpeed: 120,     // while Shift is held
  start: { x: 640, y: 735 },
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 78,
  chaseSpeed: 132,
  visionRange: 185,
  visionHalfAngle: 0.62, // radians, about 35 degrees each side
  turnSpeed: 2.4,
};

export const CAMERA = {
  range: 210,
  halfAngle: 0.5,
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  guardSpotRate: 46,    // per second while a guard sees the thief
  cameraSpotRate: 22,    // per second while a camera sees the thief
  graceSeconds: 1.0,    // fair caught moment: first second spotted is slow
  graceRate: 12,        // alarm rate during the grace second
  decayRate: 9,         // per second while unseen
  bustAt: 100,
};

export const COIN = {
  cost: 50,              // chips spent to throw one Lucky Coin
  distractSeconds: 4.5,
  distractRange: 380,
};

// Loot values in chips; the diamond is the win condition.
export const LOOT_VALUES = { chips: 100, cage: 500, diamond: 1000 };

// --- Floor plan --------------------------------------------------------------
// Walls are solid rectangles. Rooms are shaped by walls with gaps left as
// doorways. The outer shell is four walls; interior walls carve the vault,
// the high-roller room and the service corridor.
export const WALLS = [
  // Outer shell.
  { x: 0, y: 0, w: 1280, h: 16 },
  { x: 0, y: 784, w: 590, h: 16 },
  { x: 690, y: 784, w: 590, h: 16 }, // gap = front doors (the exit)
  { x: 0, y: 0, w: 16, h: 800 },
  { x: 1264, y: 0, w: 16, h: 800 },
  // Vault (top centre): front wall with a door gap in the middle.
  { x: 480, y: 180, w: 120, h: 14 },
  { x: 680, y: 180, w: 120, h: 14 },
  { x: 480, y: 16, w: 14, h: 178 },
  { x: 786, y: 16, w: 14, h: 178 },
  // High-roller room (right): left wall with a door gap.
  { x: 950, y: 16, w: 14, h: 190 },
  { x: 950, y: 266, w: 14, h: 118 },
  { x: 950, y: 370, w: 14, h: 14 },
  // Service corridor (left): right wall with two door gaps.
  { x: 220, y: 16, w: 14, h: 280 },
  { x: 220, y: 356, w: 14, h: 200 },
  { x: 220, y: 612, w: 14, h: 172 },
  // Cashier's cage counter (top left of the main floor).
  { x: 250, y: 150, w: 170, h: 12 },
  { x: 250, y: 60, w: 12, h: 102 },
  // Bar counter (bottom right of the main floor).
  { x: 980, y: 640, w: 200, h: 12 },
  { x: 980, y: 560, w: 12, h: 92 },
];

// Round obstacles: roulette tables, pillars and slot-machine banks.
// Tables are cover: they block movement and line of sight.
export const TABLES = [
  { x: 430, y: 380, r: 58, kind: 'roulette' },
  { x: 700, y: 440, r: 58, kind: 'roulette' },
  { x: 880, y: 320, r: 46, kind: 'roulette' },
  { x: 560, y: 300, r: 34, kind: 'blackjack' },
  { x: 1090, y: 190, r: 52, kind: 'baccarat' }, // high-roller table
  { x: 330, y: 620, r: 40, kind: 'poker' },
];

// Slot machines: thin rectangles hugging walls, decorative cover.
export const SLOTS = [
  { x: 40, y: 60, w: 150, h: 26 },
  { x: 40, y: 420, w: 26, h: 130 },
  { x: 1060, y: 40, w: 150, h: 26 },
  { x: 40, y: 690, w: 150, h: 26 },
];

// --- Loot --------------------------------------------------------------------
export const LOOT = [
  { id: 'chips-a', kind: 'chips', x: 430, y: 380, label: 'Chip stack' },
  { id: 'chips-b', kind: 'chips', x: 700, y: 440, label: 'Chip stack' },
  { id: 'chips-c', kind: 'chips', x: 880, y: 320, label: 'Chip stack' },
  { id: 'chips-d', kind: 'chips', x: 560, y: 300, label: 'Chip stack' },
  { id: 'chips-e', kind: 'chips', x: 1090, y: 190, label: 'Chip stack' },
  { id: 'chips-f', kind: 'chips', x: 330, y: 620, label: 'Chip stack' },
  { id: 'cage', kind: 'cage', x: 330, y: 105, label: "Cashier's cage" },
  { id: 'diamond', kind: 'diamond', x: 640, y: 95, label: 'The Velvet Diamond' },
];

// --- Guards ------------------------------------------------------------------
export const GUARDS = [
  {
    id: 'g1', name: 'Marco',
    waypoints: [
      { x: 380, y: 500 }, { x: 640, y: 560 }, { x: 830, y: 500 }, { x: 640, y: 300 },
    ],
  },
  {
    id: 'g2', name: 'Rosa',
    waypoints: [
      { x: 300, y: 250 }, { x: 620, y: 220 }, { x: 900, y: 250 }, { x: 760, y: 560 },
    ],
  },
  {
    id: 'g3', name: 'Vince',
    waypoints: [
      { x: 1010, y: 120 }, { x: 1200, y: 120 }, { x: 1200, y: 320 }, { x: 1010, y: 320 },
    ],
  },
  {
    id: 'g4', name: 'Ada',
    waypoints: [
      { x: 540, y: 230 }, { x: 740, y: 230 }, { x: 640, y: 120 }, { x: 640, y: 230 },
    ],
  },
  {
    id: 'g5', name: 'Lou',
    waypoints: [
      { x: 110, y: 120 }, { x: 110, y: 700 }, { x: 110, y: 380 },
    ],
  },
];

// --- Cameras -----------------------------------------------------------------
// Wall cameras sweep a cone back and forth around a base angle.
export const CAMERAS = [
  { id: 'cam-vault', x: 640, y: 24, base: Math.PI / 2, sweep: 0.7 },
  { id: 'cam-high', x: 1256, y: 190, base: Math.PI, sweep: 0.55 },
  { id: 'cam-corridor', x: 24, y: 400, base: 0, sweep: 0.6 },
  { id: 'cam-door', x: 640, y: 776, base: -Math.PI / 2, sweep: 0.5 },
];

// Exit zone: the front doors at the bottom centre.
export const EXIT = { x: 590, y: 776, w: 100, h: 24 };

// Rooms, for the floor tint and the room label the HUD shows.
export const ROOMS = [
  { name: 'The Vault', x: 494, y: 16, w: 292, h: 164, tint: '#3a0f2e' },
  { name: 'High-Roller Room', x: 964, y: 16, w: 300, h: 368, tint: '#2c1a4d' },
  { name: 'Service Corridor', x: 16, y: 16, w: 204, h: 768, tint: '#1c2b33' },
  { name: "Cashier's Cage", x: 250, y: 16, w: 170, h: 134, tint: '#33240a' },
  { name: 'Main Floor', x: 234, y: 194, w: 716, h: 590, tint: '#0d3d24' },
];
