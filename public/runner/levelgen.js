// Level generator for the endless runner.
//
// Fairness by construction: every hazard is placed in *player time* (seconds after the
// chunk is requested), using the jump arc derived from PHYS, then converted to world x.
// Rules enforced while placing:
//   - every jump group (one or more hazards cleared by one full jump) has a take-off
//     window at least `tol` seconds wide at the current speed;
//   - between groups the player can jump the previous group at its LATEST possible
//     moment, land, stay on the ground `react` seconds, and still have `tol` seconds of
//     take-off window for the next group;
//   - moving entities are placed where they will be when the player meets them (their
//     own vx is added on top of the scroll);
//   - meteors are timed to hit when the player's front is 20% into the reticle (they must
//     be airborne then; the fire lingers on the rest of it) and are spaced like
//     a 64u-wide ground obstacle, so "jump over every reticle" is always safe whatever the
//     exact impact time.
//
// API (see config.js for units):
//   createLevelGen({ seed, mini }) -> { nextChunk({ worldX, speed, t, score, camX? }), difficulty(t, score) }
//   `camX` is optional: when the engine passes its current camera x the generator uses it,
//   otherwise it integrates `speed` over `t` assuming camX = 0 at t = 0.
//   Entities come back in the order the player will reach them. Moving entities' x is
//   their position at the moment nextChunk returns; they must start moving right away.

import { PHYS, SPEED, PLAYER, ENTITIES, AIR_LANES, METEOR } from './config.js';

// Engine behaviour that config.js does not pin down. Values are deliberately pessimistic.
// runner.js today: blast box 34u tall, tumbleweed bounce 22u, vulture bob +-3u, stomp with
// jump held = 0.95 * jumpVel, and minJumpVel caps vy on every frame the button is up.
const ASSUME = {
  meteorBlastH: 36,                  // height of the crater fire hitbox
  tumbleBounceH: 24,                 // max height a tumbleweed's hitbox bottom bounces up to
  vultureBob: 4,                     // vertical wobble of a vulture around its lane
  heldStompVel: 0.95 * PHYS.jumpVel, // bounce when jump is held during a stomp
  camErrorU: 100,                    // camera-estimate error (u) assumed when camX is not passed
  miniMaxSpeed: 0.55 * SPEED.max,    // runner.js caps the mini loader's speed here
};

/* ------------------------------------------------------------------ RNG -- */

function hashSeed(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    // Fold large numbers such as Date.now() into 32 bits.
    return ((seed >>> 0) ^ Math.floor(seed / 4294967296)) >>> 0;
  }
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
const r2 = (n) => Math.round(n * 100) / 100;

/* -------------------------------------------------------------- Physics -- */

// Full-hold jump: rises under `gravity`, falls under `gravityFall`.
const V0 = PHYS.jumpVel;
const G_UP = PHYS.gravity;
const G_DN = PHYS.gravityFall;
const T_UP = V0 / G_UP;                              // ~0.346 s to the apex
const APEX = (V0 * V0) / (2 * G_UP);                 // ~155.8 u
const T_AIR = T_UP + Math.sqrt((2 * APEX) / G_DN);   // ~0.640 s total airtime

/** Height of a full jump `tau` seconds after take-off. */
function jumpY(tau) {
  if (tau <= 0) return 0;
  if (tau <= T_UP) return V0 * tau - 0.5 * G_UP * tau * tau;
  const f = tau - T_UP;
  return Math.max(0, APEX - 0.5 * G_DN * f * f);
}

/** [a, b]: seconds after take-off during which a full jump's feet are above height H. */
function aboveWindow(H) {
  if (H >= APEX) return null;
  const a = (V0 - Math.sqrt(V0 * V0 - 2 * G_UP * H)) / G_UP;
  const b = T_UP + Math.sqrt((2 * (APEX - H)) / G_DN);
  return [a, b];
}

const BUG_H = ENTITIES.bug.h;
// Stomp chains. With the button up, the bounce is stompBounce capped by minJumpVel (the
// engine applies the cap on every frame the button is up), under gravityFall. The player
// returns to bug-top height after 2*v/gFall (~0.289 s) whatever horizontal offset they
// stomped at, so bugs spaced exactly that far apart in contact time keep the rhythm
// hands-off. Holding jump on a stomp bounces higher; a partial hold corrects the offset.
const V_STOMP = Math.min(PHYS.stompBounce, PHYS.minJumpVel);
const STOMP_PERIOD = (2 * V_STOMP) / G_DN;
// Worst case from a stomp to touching the ground: button held through the bounce.
const V_STOMP_HELD = Math.max(PHYS.stompBounce, ASSUME.heldStompVel);
const T_BOUNCE_LAND =
  V_STOMP_HELD / G_UP +
  Math.sqrt((2 * (BUG_H + (V_STOMP_HELD * V_STOMP_HELD) / (2 * G_UP))) / G_DN);
// A full jump comes back down through bug-top height this long after take-off.
const T_DESCEND_BUG = aboveWindow(BUG_H)[1];

/** How the player has to deal with a hazard, and its effective footprint. */
function spec(type, lane) {
  const e = ENTITIES[type];
  if (!e) throw new Error(`levelgen: unknown entity type ${type}`);
  const u = -(e.vx || 0); // extra closing speed on top of the scroll
  if (type === 'vulture') {
    const y = AIR_LANES[lane];
    if (lane === 'low') return { mode: 'jump', w: e.w, H: y + e.h + ASSUME.vultureBob, u };
    if (lane === 'mid') return { mode: 'duck', w: e.w, H: y + e.h, u };
    return { mode: 'ground', w: e.w, H: 0, u }; // high: safe only while not jumping
  }
  if (type === 'meteor') return { mode: 'jump', w: METEOR.blastW, H: ASSUME.meteorBlastH, u: 0 };
  if (type === 'tumbleweed') return { mode: 'jump', w: e.w, H: e.h + ASSUME.tumbleBounceH, u };
  return { mode: 'jump', w: e.w, H: e.h, u };
}

// Contract sanity: these must hold for the lane rules (low = jump, mid = duck) to work.
if (PLAYER.duckH >= AIR_LANES.mid - ASSUME.vultureBob || PLAYER.h <= AIR_LANES.mid) {
  console.warn('levelgen: AIR_LANES.mid no longer separates ducking from standing');
}
if (PLAYER.duckH <= AIR_LANES.low - ASSUME.vultureBob) {
  console.warn('levelgen: low vultures can be ducked under; low lane is meant to be jumped');
}

/* ---------------------------------------------------------- Difficulty -- */

// Designed curve (t in seconds -> difficulty). Speed already ramps 380 -> 920 over ~77 s,
// so difficulty mostly controls pattern complexity, gaps and reaction margins.
// Gates: bug ~6 s (onboarding), tumbleweed 0.12 (~14 s), low vulture 0.17 (~21 s),
// duck 0.22 (~28 s), stomp chain 0.26 (~33 s), hedgehog 0.29 (~38 s), meteors 0.34 (~45 s),
// combos 0.4+ (~52 s), meteor stacking allowed at 0.6 (~90 s).
const CURVE = [[0, 0], [8, 0.08], [60, 0.45], [90, 0.6], [120, 0.74], [180, 0.9], [240, 1]];
const MINI_CURVE = [[0, 0], [20, 0.15], [60, 0.35], [120, 0.5], [240, 0.6]];

function piecewise(knots, x) {
  if (x <= knots[0][0]) return knots[0][1];
  for (let i = 1; i < knots.length; i++) {
    const [x1, y1] = knots[i];
    const [x0, y0] = knots[i - 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return knots[knots.length - 1][1];
}

/** Per-difficulty spacing knobs, in seconds. */
function tuning(d, mini) {
  if (mini) {
    return { react: 0.5, tol: 0.14, slackBase: lerp(0.6, 0.4, d), slackVar: 0.6, iso: 0.8 };
  }
  return {
    react: lerp(0.42, 0.18, d),     // ground time between landing and the next take-off
    tol: lerp(0.12, 0.05, d),       // minimum take-off window width
    slackBase: lerp(0.35, 0.0, d),  // extra air between groups (randomised below)
    slackVar: lerp(0.35, 0.12, d),
    iso: 0.45,                      // extra clear time on both sides of a meteor below d 0.6
  };
}

/* ------------------------------------------------------------- Clock ---- */

/** Player-front position over time from the moment a chunk is requested. */
function makeClock(front0, v0, accel, vCap) {
  const vmax = Math.max(vCap, v0);
  const tCap = accel > 0 ? Math.max(0, (vmax - v0) / accel) : Infinity;
  const dCap = Number.isFinite(tCap) ? v0 * tCap + 0.5 * accel * tCap * tCap : Infinity;
  const dist = (tau) =>
    tau <= tCap ? v0 * tau + 0.5 * accel * tau * tau : dCap + vmax * (tau - tCap);
  return {
    speedAt: (tau) => (tau <= tCap ? v0 + accel * Math.max(0, tau) : vmax),
    front: (tau) => front0 + dist(tau),
    tauAt(x) {
      const d = x - front0;
      if (d <= 0 || accel <= 0) return d / v0;
      if (d <= dCap) return (-v0 + Math.sqrt(v0 * v0 + 2 * accel * d)) / accel;
      return tCap + (d - dCap) / vmax;
    },
  };
}

/* --------------------------------------------------------- Chunk builder -- */

class Unfair extends Error {}

const I = (type, lane) => (lane ? { type, lane } : { type });

class Chunk {
  constructor({ worldX, d, mini, clock, rng, has, camUncertain }) {
    this.worldX = worldX;
    this.d = d;
    this.mini = mini;
    this.clock = clock;
    this.rng = rng;
    this.has = has;
    this.T = tuning(d, mini);
    this.camUncertain = camUncertain;
    this.start = clock.tauAt(worldX); // when the player's front reaches worldX
    this.ready = this.start;          // earliest time the player is grounded and has reacted
    this.entities = [];
    this.heat = 0;
  }

  range(a, b) { return a + (b - a) * this.rng(); }
  chance(p) { return this.rng() < p; }
  pick(list) {
    // list: [[value, weight], ...]
    const total = list.reduce((s, [, w]) => s + Math.max(0, w), 0);
    let r = this.rng() * total;
    for (const [v, w] of list) if ((r -= Math.max(0, w)) <= 0) return v;
    return list[list.length - 1][0];
  }
  slack(extra = 0) { return this.T.slackBase + this.rng() * this.T.slackVar + extra; }
  tight() { return this.rng() * this.T.slackVar * 0.5; }
  rest(seconds) { this.ready += seconds; }

  // A moving hazard's meeting time shifts if our camera estimate is off; pad around it.
  moveSlack(s, v) {
    if (!this.camUncertain || !s.u) return 0;
    return (s.u * ASSUME.camErrorU) / (v * (v + s.u));
  }

  /** Hazards cleared by one full jump. items[i].rel = seconds after the first item's contact. */
  jump(items, { slack = this.slack(), heat = 1 } = {}) {
    const { tol, react } = this.T;
    const v = this.clock.speedAt(this.ready);
    const parts = items.map((it) => {
      const s = spec(it.type, it.lane);
      const win = aboveWindow(s.H);
      if (s.mode !== 'jump' || !win) throw new Unfair(`${it.type} is not jumpable`);
      return { ...it, rel: it.rel || 0, s, win };
    });
    const pad = Math.max(...parts.map((p) => this.moveSlack(p.s, v)));
    // Latest take-off for the group must be >= ready + slack + tol.
    let base = this.ready + slack + pad + tol - Math.min(...parts.map((p) => p.rel - p.win[0]));
    for (const p of parts) {
      base = Math.max(base, this.start - p.rel);
      // The reticle cannot appear before the chunk exists: delay = impact - warn >= 0.
      if (p.type === 'meteor') base = Math.max(base, METEOR.warn - p.rel);
    }
    let jLate = Infinity;
    let jEarly = -Infinity;
    let stompEnd = -Infinity;
    for (const p of parts) {
      p.sIn = base + p.rel;
      p.dur = (p.s.w + PLAYER.w) / (this.clock.speedAt(p.sIn) + p.s.u); // overlap time
      jLate = Math.min(jLate, p.sIn - p.win[0]);
      jEarly = Math.max(jEarly, p.sIn + p.dur - p.win[1]);
      // A bug can also be stomped; the bounce may land later than a plain jump would.
      if (p.type === 'bug') stompEnd = Math.max(stompEnd, p.sIn + p.dur + T_BOUNCE_LAND);
    }
    if (jEarly > jLate - tol) throw new Unfair(`group ${items.map((i) => i.type)} not clearable`);
    parts.forEach((p) => this.emitHazard(p));
    this.ready = Math.max(jLate + T_AIR, stompEnd) + react + pad;
    this.heat += heat * parts.length;
    return { jEarly, jLate, parts };
  }

  /** Feasible rel range for b behind a so that both clear in one jump (static pairs). */
  oneJumpRange(a, b) {
    const sa = spec(a.type, a.lane);
    const sb = spec(b.type, b.lane);
    const wa = aboveWindow(sa.H);
    const wb = aboveWindow(sb.H);
    const v = this.clock.speedAt(this.ready + 1);
    const durA = (sa.w + PLAYER.w) / (v + sa.u);
    const durB = (sb.w + PLAYER.w) / (v + sb.u);
    const relMin = (sa.w + 12) / v; // keep a visible gap between the two sprites
    let relMax = -1;
    for (let r = relMin; r < 0.8; r += 0.005) {
      const late = Math.min(-wa[0], r - wb[0]);
      const early = Math.max(durA - wa[1], r + durB - wb[1]);
      if (early <= late - this.T.tol - 0.03) relMax = r; // keep a little extra window
    }
    return relMax >= relMin ? [relMin, relMax] : null;
  }

  /** Mid-lane vulture: duck under it (or a well-timed full jump). */
  duck({ slack = this.slack() } = {}) {
    const s = spec('vulture', 'mid');
    const pad = this.moveSlack(s, this.clock.speedAt(this.ready));
    const sIn = Math.max(this.ready + slack + pad, this.start);
    const dur = (s.w + PLAYER.w) / (this.clock.speedAt(sIn) + s.u);
    this.emitHazard({ type: 'vulture', lane: 'mid', s, sIn });
    this.ready = sIn + dur + 0.6 * this.T.react + pad;
    this.heat += 1;
    return { sIn, dur };
  }

  /** High-lane vulture: harmless on the ground, but a jump (>52u) would clip it. */
  stayLow({ slack = this.slack(), coins = true } = {}) {
    const s = spec('vulture', 'high');
    const pad = this.moveSlack(s, this.clock.speedAt(this.ready));
    // The player only needs to have landed (ready - react), not to react to anything.
    const sIn = Math.max(this.ready - 0.5 * this.T.react + slack + pad, this.start);
    const dur = (s.w + PLAYER.w) / (this.clock.speedAt(sIn) + s.u);
    this.emitHazard({ type: 'vulture', lane: 'high', s, sIn });
    if (coins) this.coinLine(sIn - 0.12, sIn + dur + 0.05, 5, 20); // collected by running
    this.ready = sIn + dur + 0.1 + pad;
    this.heat += 0.5;
    return { sIn, dur };
  }

  /** n bugs spaced one un-held stomp bounce apart: bounce off one onto the next. */
  chain(n, { slack = this.slack(), coins = false } = {}) {
    const s = spec('bug');
    const pad = this.moveSlack(s, this.clock.speedAt(this.ready));
    // Leave room for a full jump to come down onto the first bug.
    const s1 = Math.max(this.ready + slack + pad + this.T.tol + T_DESCEND_BUG, this.start);
    let last = null;
    for (let k = 0; k < n; k++) {
      const sIn = s1 + k * STOMP_PERIOD;
      const dur = (s.w + PLAYER.w) / (this.clock.speedAt(sIn) + s.u);
      this.emitHazard({ type: 'bug', s, sIn });
      if (coins) this.bounceCoins(sIn + 0.4 * dur, k < n - 1 ? STOMP_PERIOD : T_BOUNCE_LAND * 0.6);
      last = { sIn, dur };
    }
    this.ready = last.sIn + last.dur + T_BOUNCE_LAND + this.T.react + pad;
    this.heat += 0.8 * n;
    return { s1, n };
  }

  /** Meteor treated as a 64u ground obstacle; isolated below difficulty 0.6. */
  meteor({ slack = this.slack(), isolate = this.d < 0.6 || this.mini } = {}) {
    const iso = isolate ? this.T.iso : 0;
    const g = this.jump([I('meteor')], { slack: slack + iso, heat: 1.5 });
    this.ready += iso;
    return g;
  }

  emitHazard(p) {
    const m = this.clock.front(p.sIn); // left edge at the moment the player touches it
    const e = { type: p.type };
    if (p.type === 'meteor') {
      e.x = r2(m);
      e.targetX = r2(m);
      // Impact when the player's front is 20% into the blast zone: the fire then covers
      // the rest of the crossing even if our camera estimate is a little off, and a bot
      // that asks "will I be inside the zone at impact?" gets a yes.
      const impact = this.clock.tauAt(m + 0.2 * METEOR.blastW);
      e.delay = r2(Math.max(0, impact - METEOR.warn));
    } else {
      // Moving entities start (when the chunk is spawned) further right by u * time-to-meet.
      e.x = r2(m + p.s.u * p.sIn);
    }
    if (p.type === 'vulture') {
      e.lane = p.lane;
      e.y = AIR_LANES[p.lane];
    }
    this.entities.push({ e, at: p.sIn });
  }

  /* ---- pickups ---- */

  /** Item centred on the player's body at time tau with body-centre height yc. */
  item(type, tau, yc) {
    if (tau < this.start) return;
    const def = ENTITIES[type];
    const x = this.clock.front(tau) - PLAYER.w / 2 - def.w / 2;
    this.entities.push({ e: { type, x: r2(x), y: r2(Math.max(0, yc - def.h / 2)) }, at: tau });
  }

  /** Coins along the ideal full-jump arc over a jump group (teaches the arc). */
  coinsArc(g, n = 5, from = (g.jEarly + g.jLate) / 2) {
    for (let i = 1; i <= n; i++) {
      const tau = (T_AIR * i) / (n + 1);
      this.item('coin', from + tau, jumpY(tau) + PLAYER.h / 2);
    }
  }

  /** Coins showing a jump that comes down onto a bug, then the bounce. */
  stompArc(g) {
    const p = g.parts.find((q) => q.type === 'bug');
    if (!p) return;
    const stomp = p.sIn + 0.4 * p.dur;
    const j = stomp - T_DESCEND_BUG;
    for (let i = 1; i <= 4; i++) {
      const tau = (T_DESCEND_BUG * i) / 5;
      this.item('coin', j + tau, jumpY(tau) + PLAYER.h / 2);
    }
    this.bounceCoins(stomp, STOMP_PERIOD);
  }

  bounceCoins(stomp, span) {
    for (let i = 1; i <= 3; i++) {
      const tau = (span * i) / 4;
      const y = BUG_H + V_STOMP * tau - 0.5 * G_DN * tau * tau;
      this.item('coin', stomp + tau, Math.max(0, y) + PLAYER.h / 2);
    }
  }

  coinLine(t0, t1, n, yc) {
    for (let i = 0; i < n; i++) this.item('coin', t0 + ((t1 - t0) * i) / Math.max(1, n - 1), yc);
  }

  finish(name) {
    const end = this.clock.front(this.ready);
    const length = Math.max(80, end - this.worldX); // runner.js floors lengths at 80
    // Listed in the order the player reaches them (not by spawn x: a moving entity spawns
    // further right than where it is met), so "first entity not yet passed" is the next one.
    const entities = this.entities.sort((a, b) => a.at - b.at).map((q) => q.e);
    return { length: r2(length), name, entities };
  }
}

/* -------------------------------------------------------------- Patterns -- */

/** Single hazards that are cleared by a jump and are unlocked right now. */
function jumpables(c) {
  const d = c.d;
  const L = [
    [I('cactus_s'), 3],
    [I('rock'), 2],
    [I('cactus_cluster'), 1.2 + d],
    [I('cactus_l'), 1 + 1.5 * d],
  ];
  if (c.has('bug')) L.push([I('bug'), 1]);
  if (c.has('tumbleweed')) L.push([I('tumbleweed'), 1]);
  if (c.has('vulture_low')) L.push([I('vulture', 'low'), 1]);
  if (c.has('hedgehog')) L.push([I('hedgehog'), 1]);
  if (d >= 0.25) L.push([I('pillar'), 0.6]);
  return L;
}

/** One "beat" for mixed sequences: a jump, a duck, a short stomp chain or a meteor. */
function beat(c, slack) {
  const opts = [['jump', 4]];
  if (c.has('vulture_mid')) opts.push(['duck', 1]);
  if (c.has('stomp_chain')) opts.push(['chain', 0.8]);
  if (c.has('meteor') && c.d >= 0.6) opts.push(['meteor', 0.6]);
  const kind = c.pick(opts);
  if (kind === 'duck') return c.duck({ slack });
  if (kind === 'chain') return c.chain(2, { slack });
  if (kind === 'meteor') return c.meteor({ slack });
  return c.jump([c.pick(jumpables(c))], { slack });
}

// name -> { minD, uses (mechanics that must be introduced), weight(d), build(c), flags }
// Patterns without `weight` are only ever forced by the director (onboarding, intros, events).
const PATTERNS = {
  /* --- forced: onboarding, intros, events --- */
  runway: { breather: true, build: (c) => c.rest(1.0) },
  onboard_cactus: {
    build: (c) => c.coinsArc(c.jump([I('cactus_s')], { slack: c.slack(0.5) }), 5),
  },
  onboard_rock: { build: (c) => c.jump([I('rock')], { slack: c.slack(0.3) }) },
  onboard_bug: {
    intro: 'bug',
    build: (c) => c.stompArc(c.jump([I('bug')], { slack: c.slack(0.6) })),
  },
  onboard_cluster: {
    build: (c) => c.coinsArc(c.jump([I('cactus_cluster')], { slack: c.slack(0.3) }), 5),
  },
  tumbleweed_intro: {
    intro: 'tumbleweed',
    build: (c) => c.coinsArc(c.jump([I('tumbleweed')], { slack: c.slack(0.6) }), 5),
  },
  vulture_low_intro: {
    intro: 'vulture_low',
    build: (c) => c.coinsArc(c.jump([I('vulture', 'low')], { slack: c.slack(0.6) }), 5),
  },
  duck_intro: {
    intro: 'vulture_mid',
    build: (c) => {
      const g = c.duck({ slack: c.slack(0.6) });
      // Low coins that only a ducking player's path crosses comfortably.
      c.coinLine(g.sIn - 0.05, g.sIn + g.dur, 4, 12);
    },
  },
  stomp_chain_intro: {
    intro: 'stomp_chain',
    build: (c) => c.chain(2, { slack: c.slack(0.6), coins: true }),
  },
  hedgehog_intro: {
    intro: 'hedgehog',
    build: (c) => c.coinsArc(c.jump([I('hedgehog')], { slack: c.slack(0.6) }), 5),
  },
  meteor_intro: {
    intro: 'meteor',
    build: (c) => c.coinsArc(c.meteor({ slack: c.slack(0.6), isolate: true }), 5),
  },
  breather: {
    breather: true,
    build: (c) => {
      const len = lerp(1.9, 1.0, c.d) + c.range(0, 0.4);
      if (c.chance(0.5)) {
        const from = c.ready + 0.3;
        c.coinsArc({ jEarly: from, jLate: from }, 5);
      }
      c.rest(len);
    },
  },
  powerup_break: {
    breather: true,
    build: (c) => {
      c.rest(0.4);
      const type = c.pick([['shield', 0.45], ['boots', 0.35], ['heart', 0.2]]);
      c.coinLine(c.ready - 0.2, c.ready + 0.15, 3, 20);
      // Floating at 70u: a small hop grabs it, standing (58u) does not.
      c.item(type, c.ready + 0.4, 70 + ENTITIES[type].h / 2);
      c.rest(1.3);
    },
  },
  meteor_shower: {
    build: (c) => {
      const n = 3 + Math.round(c.d * 3);
      c.rest(0.3);
      for (let i = 0; i < n; i++) {
        const g = c.meteor({ slack: i === 0 ? c.slack(0.3) : c.tight() });
        c.coinsArc(g, 5);
      }
      // Reward: a run of ground coins once the sky clears.
      c.coinLine(c.ready - 0.1, c.ready + 0.9, 10, 20);
      c.rest(1.0);
    },
  },

  /* --- weighted library --- */
  single_small: {
    minD: 0,
    weight: (d) => 3 - 2.4 * d,
    build: (c) => {
      const g = c.jump([c.pick([[I('cactus_s'), 2], [I('rock'), 1]])]);
      if (c.chance(0.6 - 0.5 * c.d)) c.coinsArc(g, 5);
    },
  },
  single_big: {
    minD: 0.06,
    weight: () => 1.6,
    build: (c) => c.jump([c.pick([[I('cactus_l'), 1], [I('cactus_cluster'), 1]])]),
  },
  bug_single: {
    minD: 0.08, uses: ['bug'],
    weight: (d) => 1.4 - d,
    build: (c) => {
      const g = c.jump([I('bug')]);
      if (c.chance(0.4)) c.stompArc(g);
    },
  },
  tumbleweed: { minD: 0.12, uses: ['tumbleweed'], weight: () => 1, build: (c) => c.jump([I('tumbleweed')]) },
  vulture_low: { minD: 0.17, uses: ['vulture_low'], weight: () => 1, build: (c) => c.jump([I('vulture', 'low')]) },
  duck: { minD: 0.22, uses: ['vulture_mid'], weight: () => 1.1, build: (c) => c.duck() },
  high_flyby: {
    minD: 0.2, uses: ['vulture_low'],
    weight: () => 0.5,
    build: (c) => c.stayLow(),
  },
  hedgehog: { minD: 0.29, uses: ['hedgehog'], weight: () => 1, build: (c) => c.jump([I('hedgehog')]) },
  pillar: {
    minD: 0.25,
    weight: () => 0.7,
    build: (c) => {
      const g = c.jump([I('pillar')]);
      if (c.chance(0.5)) c.coinsArc(g, 6);
    },
  },
  double: {
    minD: 0.15,
    weight: () => 1.6,
    build: (c) => {
      c.jump([c.pick(jumpables(c))]);
      c.jump([c.pick(jumpables(c))], { slack: c.tight() });
    },
  },
  pair_onejump: {
    minD: 0.2,
    weight: () => 1,
    build: (c) => {
      const a = c.pick([[I('cactus_s'), 2], [I('rock'), 1]]);
      const b = c.pick([[I('cactus_s'), 2], [I('cactus_cluster'), 1]]);
      const rr = c.oneJumpRange(a, b);
      if (!rr) throw new Unfair('pair does not fit one jump');
      const g = c.jump([a, { ...b, rel: c.range(rr[0], rr[0] + 0.7 * (rr[1] - rr[0])) }]);
      if (c.chance(0.5)) c.coinsArc(g, 6);
    },
  },
  stomp_chain: {
    minD: 0.26, uses: ['stomp_chain'],
    weight: (d) => 1 + 0.5 * d,
    build: (c) => {
      const n = 2 + (c.chance(c.d) ? 1 : 0) + (c.chance(c.d - 0.4) ? 1 : 0);
      c.chain(n, { coins: c.chance(0.4) });
    },
  },
  triple: {
    minD: 0.35,
    weight: () => 1.2,
    build: (c) => {
      c.jump([c.pick(jumpables(c))]);
      c.jump([c.pick(jumpables(c))], { slack: c.tight() });
      c.jump([c.pick(jumpables(c))], { slack: c.tight() });
    },
  },
  meteor_single: {
    minD: 0.34, uses: ['meteor'],
    weight: () => 0.5,
    build: (c) => {
      const g = c.meteor();
      if (c.chance(0.5)) c.coinsArc(g, 5);
    },
  },
  stairs: {
    minD: 0.4,
    weight: () => 0.6,
    build: (c) => {
      c.jump([I('rock')]);
      c.jump([I('cactus_s')], { slack: c.tight() });
      c.jump([I('cactus_l')], { slack: c.tight() });
    },
  },
  low_then_ground: {
    minD: 0.4, uses: ['vulture_low'],
    weight: () => 0.8,
    build: (c) => {
      c.jump([I('vulture', 'low')]);
      c.jump([c.pick([[I('cactus_s'), 1], [I('cactus_l'), 1], [I('rock'), 1]])], { slack: c.tight() });
    },
  },
  duck_then_jump: {
    minD: 0.45, uses: ['vulture_mid'],
    weight: () => 0.9,
    build: (c) => {
      c.duck();
      c.jump([c.pick(jumpables(c))], { slack: c.tight() });
    },
  },
  tumble_pair: {
    minD: 0.45, uses: ['tumbleweed'],
    weight: () => 0.6,
    build: (c) => {
      c.jump([I('tumbleweed')]);
      c.jump([I('tumbleweed')], { slack: c.tight() });
    },
  },
  hedgehog_chain: {
    minD: 0.5, uses: ['hedgehog', 'stomp_chain'],
    weight: () => 0.7,
    build: (c) => {
      c.jump([I('hedgehog')]);
      c.chain(2, { slack: c.tight() });
    },
  },
  vulture_flock: {
    minD: 0.55, uses: ['vulture_mid'],
    weight: () => 0.7,
    build: (c) => {
      c.jump([I('vulture', 'low')]);
      c.duck({ slack: c.tight() });
      c.jump([I('vulture', 'low')], { slack: c.tight() });
    },
  },
  meteor_combo: {
    minD: 0.6, uses: ['meteor'],
    weight: () => 0.7,
    build: (c) => {
      c.jump([c.pick(jumpables(c))]);
      c.meteor({ slack: c.tight(), isolate: false });
      c.jump([c.pick(jumpables(c))], { slack: c.tight() });
    },
  },
  gauntlet: {
    minD: 0.7,
    weight: (d) => 0.9 + d,
    build: (c) => {
      const n = 4 + (c.chance(0.5) ? 1 : 0);
      beat(c, c.slack());
      for (let i = 1; i < n; i++) beat(c, c.tight());
    },
  },
  coin_run: {
    minD: 0, breather: true,
    weight: () => 0.35,
    build: (c) => {
      // Two empty-air jump arcs of coins: rhythm practice with nothing to hit.
      const a = c.ready + 0.35;
      c.coinsArc({ jEarly: a, jLate: a }, 5);
      const b = a + T_AIR + c.T.react + 0.1;
      c.coinsArc({ jEarly: b, jLate: b }, 5);
      c.ready = b + T_AIR + c.T.react;
    },
  },

  /* --- mini mode (chat-bubble, auto-played): small obstacles, bugs, rare meteors --- */
  mini_runway: { breather: true, build: (c) => c.rest(1.0) },
  mini_single: {
    mini: true, minD: 0,
    weight: () => 3,
    build: (c) => {
      const g = c.jump([c.pick([[I('cactus_s'), 2], [I('rock'), 1]])]);
      if (c.chance(0.3)) c.coinsArc(g, 5);
    },
  },
  mini_bug: { mini: true, minD: 0.05, weight: () => 1.2, build: (c) => c.jump([I('bug')]) },
  mini_pair: {
    mini: true, minD: 0.25,
    weight: () => 1,
    build: (c) => {
      c.jump([c.pick([[I('cactus_s'), 2], [I('rock'), 1]])]);
      c.jump([c.pick([[I('cactus_s'), 2], [I('bug'), 1]])]);
    },
  },
  mini_meteor: {
    mini: true, minD: 0.15,
    weight: () => 0.35,
    build: (c) => c.coinsArc(c.meteor({ isolate: true }), 5),
  },
  mini_coins: {
    mini: true, minD: 0, breather: true,
    weight: () => 0.4,
    build: (c) => {
      c.coinLine(c.ready + 0.2, c.ready + 0.9, 6, 20);
      c.rest(1.2);
    },
  },
};

// Mechanics are introduced one at a time, in this order, once difficulty passes the gate.
const INTROS = [
  { mech: 'tumbleweed', gate: 0.12, pattern: 'tumbleweed_intro' },
  { mech: 'vulture_low', gate: 0.17, pattern: 'vulture_low_intro' },
  { mech: 'vulture_mid', gate: 0.22, pattern: 'duck_intro' },
  { mech: 'stomp_chain', gate: 0.26, pattern: 'stomp_chain_intro' },
  { mech: 'hedgehog', gate: 0.29, pattern: 'hedgehog_intro' },
  { mech: 'meteor', gate: 0.34, pattern: 'meteor_intro' },
];
const ONBOARDING = ['runway', 'onboard_cactus', 'onboard_rock', 'onboard_bug', 'onboard_cluster'];

/* ------------------------------------------------------------- Director -- */

export function createLevelGen({ seed = Date.now(), mini = false } = {}) {
  const rng = mulberry32(hashSeed(seed));
  const S = {
    queue: mini ? ['mini_runway'] : ONBOARDING.slice(),
    introduced: new Set(),
    fresh: new Map(),          // mechanic -> picks left with a novelty boost
    last: null,
    lastWasBreather: false,
    sinceIntro: 99,
    heat: 0,
    nextPowerT: 25 + rng() * 10,
    nextShowerT: Infinity,
    lastMeteorT: -Infinity,
    cam: null,                 // { t, camX, speed } at the previous call
    accel: SPEED.accel,
  };
  const has = (m) => S.introduced.has(m);

  function difficulty(t, score) {
    // Time drives the curve (speed is time-based too). `score` is only a fallback for
    // callers that cannot provide t (runner.js scores 1 point per 40u, ~10-23 points/s).
    let time = Number(t);
    if (!Number.isFinite(time)) time = Number.isFinite(Number(score)) ? Number(score) / 15 : 0;
    const d = piecewise(mini ? MINI_CURVE : CURVE, Math.max(0, time));
    return Math.max(0, Math.min(1, d));
  }

  function updateClock(t, speed, camX) {
    const prev = S.cam;
    let cam;
    if (Number.isFinite(camX)) cam = camX;
    else if (!prev) {
      // First call: assume the camera started at 0 at t = 0 and ramped up to `speed` at
      // SPEED.accel (works for any start speed, e.g. the slower mini curve).
      const v0 = Math.max(0, speed - SPEED.accel * t);
      cam = 0.5 * (v0 + speed) * t;
    } else cam = prev.camX + 0.5 * (prev.speed + speed) * Math.max(0, t - prev.t);
    if (prev && t - prev.t > 0.25) {
      S.accel = Math.max(0, Math.min(3 * SPEED.accel, (speed - prev.speed) / (t - prev.t)));
    }
    if (speed >= (mini ? ASSUME.miniMaxSpeed : SPEED.max) - 1e-6) S.accel = 0;
    S.cam = { t, camX: cam, speed };
  }

  function choose(t, d) {
    // A due power-up rides on the next breather instead of adding a second empty chunk.
    const powerDue = !mini && t >= S.nextPowerT;
    const breather = () => {
      if (!powerDue) return 'breather';
      S.nextPowerT = t + 25 + rng() * 15;
      return 'powerup_break';
    };
    if (S.queue.length) {
      const q = S.queue.shift();
      return q === 'breather' ? breather() : q;
    }
    if (!mini) {
      if (!S.lastWasBreather && S.heat > lerp(5, 9, d)) return breather();
      if (powerDue && !S.lastWasBreather) return breather();
      if (t >= S.nextShowerT) {
        S.nextShowerT = t + 45 + rng() * 15;
        S.queue.push('breather');
        return 'meteor_shower';
      }
      const intro = INTROS.find((i) => !has(i.mech));
      if (intro && d >= intro.gate && S.sinceIntro >= 2) return intro.pattern;
    }
    const pool = [];
    for (const [name, p] of Object.entries(PATTERNS)) {
      if (!p.weight || !!p.mini !== mini || name === S.last) continue;
      if (p.breather && S.lastWasBreather) continue; // never two breathers in a row
      if (d < (p.minD || 0) || !(p.uses || []).every(has)) continue;
      if (name === 'mini_meteor' && t - S.lastMeteorT < 12) continue;
      let w = Math.max(0.05, p.weight(d));
      // Novelty boost for patterns that use a freshly introduced mechanic.
      if ((p.uses || []).some((m) => (S.fresh.get(m) || 0) > 0)) w *= 2.5;
      pool.push([name, w]);
    }
    const total = pool.reduce((s, [, w]) => s + w, 0);
    let r = rng() * total;
    for (const [name, w] of pool) if ((r -= w) <= 0) return name;
    return pool.length ? pool[pool.length - 1][0] : mini ? 'mini_single' : 'single_small';
  }

  function nextChunk({ worldX, speed, t = 0, score = 0, camX } = {}) {
    const v0 = Math.max(1, Number(speed) || SPEED.start);
    t = Number.isFinite(Number(t)) ? Number(t) : 0;
    updateClock(t, v0, camX);
    const vCap = mini ? ASSUME.miniMaxSpeed : SPEED.max;
    const clock = makeClock(S.cam.camX + PLAYER.x + PLAYER.w, v0, S.accel, vCap);
    const d = difficulty(t, score);
    const ctx = { worldX, d, mini, clock, rng, has, camUncertain: !Number.isFinite(camX) };

    let name = choose(t, d);
    let c;
    try {
      c = new Chunk(ctx);
      PATTERNS[name].build(c);
    } catch (err) {
      if (!(err instanceof Unfair)) throw err;
      name = mini ? 'mini_single' : 'single_small'; // always fair at any speed
      c = new Chunk(ctx);
      PATTERNS[name].build(c);
    }

    // Director bookkeeping.
    const p = PATTERNS[name];
    const dur = Math.max(0, c.ready - c.start);
    S.heat = S.heat * Math.exp(-dur / 6) + c.heat;
    if (p.breather) S.heat *= 0.35;
    S.lastWasBreather = !!p.breather;
    for (const [m, n] of S.fresh) S.fresh.set(m, n - 1);
    S.sinceIntro++;
    if (p.intro) {
      S.introduced.add(p.intro);
      S.fresh.set(p.intro, 4);
      S.sinceIntro = 0;
      if (p.intro === 'meteor') S.nextShowerT = t + 8 + rng() * 6;
    }
    if (c.entities.some((q) => q.e.type === 'meteor')) S.lastMeteorT = t;
    S.last = name;
    return c.finish(name);
  }

  return { nextChunk, difficulty };
}
