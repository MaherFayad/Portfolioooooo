// Shared contract between the engine (runner.js) and the level generator (levelgen.js).
// World units: x grows right, y grows UP from the ground line (y = 0 is the ground).
// The viewport is VIEW_H units tall; width depends on the screen aspect ratio.

export const VIEW_H = 300;
export const GROUND_Y = 50; // screen units from the bottom of the view to the ground line

export const PHYS = {
  gravity: 2600,        // u/s^2 while rising with the button held
  gravityFall: 3600,    // u/s^2 when falling or after the button is released
  jumpVel: 900,         // initial jump velocity (u/s). Full-hold apex ~ 156 u, airtime ~ 0.6 s
  minJumpVel: 520,      // velocity cap applied on early release (short hop apex ~ 52 u)
  stompBounce: 640,     // velocity after stomping an enemy
  coyoteTime: 0.08,     // seconds after leaving the ground a jump is still allowed
  jumpBuffer: 0.12,     // seconds a jump press is remembered before landing
  fastFall: 5200,       // gravity while holding down in the air
};

export const SPEED = {
  start: 380,           // u/s
  max: 920,
  accel: 7,             // u/s gained per second of play
};

// Player hitbox (forgiving: smaller than the sprite).
export const PLAYER = {
  x: 90,                // fixed screen x of the player's left edge
  w: 26,
  h: 58,
  duckH: 34,
};

// Entity catalogue. w/h are hitbox sizes in world units; drawH is the sprite's drawn height.
// kind: 'ground' obstacles kill on touch; 'stomp' enemies die if landed on from above;
// 'spiky' enemies kill from any side; 'air' flyers sit at a height y; 'meteor' falls to targetX.
export const ENTITIES = {
  cactus_s:       { kind: 'ground', w: 18, h: 40, drawH: 46 },
  cactus_l:       { kind: 'ground', w: 24, h: 70, drawH: 78 },
  cactus_cluster: { kind: 'ground', w: 46, h: 42, drawH: 48 },
  rock:           { kind: 'ground', w: 56, h: 26, drawH: 32 },
  pillar:         { kind: 'ground', w: 30, h: 92, drawH: 100 },
  tumbleweed:     { kind: 'ground', w: 30, h: 30, drawH: 34, vx: -110, bounce: true },
  bug:            { kind: 'stomp',  w: 34, h: 28, drawH: 34, vx: -60 },
  hedgehog:       { kind: 'spiky',  w: 32, h: 26, drawH: 32, vx: -40 },
  vulture:        { kind: 'air',    w: 44, h: 26, drawH: 46, vx: -140 },
  meteor:         { kind: 'meteor', w: 26, h: 26, drawH: 70 },
  coin:           { kind: 'pickup', w: 18, h: 18, drawH: 20 },
  shield:         { kind: 'pickup', w: 24, h: 24, drawH: 28 },
  boots:          { kind: 'pickup', w: 24, h: 24, drawH: 28 },
  heart:          { kind: 'pickup', w: 22, h: 22, drawH: 24 },
};

// Vulture flight heights (y of the hitbox bottom). LOW must be jumped, MID must be ducked under, HIGH is free.
export const AIR_LANES = { low: 8, mid: 40, high: 110 };

// Meteor timing: it is announced by a ground reticle at targetX `warn` seconds before impact.
export const METEOR = { warn: 1.1, fallTime: 0.55, blastW: 64, lingerTime: 0.25 };
