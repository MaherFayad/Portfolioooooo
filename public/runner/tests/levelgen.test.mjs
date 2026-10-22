// Headless validation for levelgen.js.  Run: node public/runner/tests/levelgen.test.mjs
// Env: SEEDS (default 200), RUN_SECONDS (default 180).
//
// 1. Structural checks (API shape, entity fields, determinism, difficulty curve).
// 2. An engine model spawns chunks the way runner.js is expected to (horizon = view width +
//    look-ahead, random per seed; camX passed to nextChunk on half the seeds, and on some of
//    the others the camera starts at a non-zero x so the generator's estimate is wrong).
// 3. A search bot (exhaustive forward search over ground states, branching on jump hold
//    length at every ground tick near hazards, ducking, and hold/release after each stomp)
//    must survive every normal-mode run.
// 4. Mini mode is played by the simple bot: full jump when a visible hazard is <= 0.12 s away.
// The physics here is written independently of levelgen.js, from config.js only.

import { createLevelGen } from '../levelgen.js';
import { PHYS, SPEED, PLAYER, ENTITIES, AIR_LANES, METEOR } from '../config.js';

const DT = 1 / 120;
const SEEDS = Number(process.env.SEEDS) || 200;
const DURATION = Number(process.env.RUN_SECONDS) || 180;
const N = Math.round(DURATION / DT);

// Engine details config.js leaves open, modelled here (generator assumes worse values).
const SIM = { meteorBlastH: 32, tumbleBounceH: 20, tumblePeriod: 0.5, stompTol: 6 };

const failures = [];
const fail = (msg) => failures.push(msg);
const speedAt = (t) => Math.min(SPEED.max, SPEED.start + SPEED.accel * t);
const HAZARD_KINDS = new Set(['ground', 'stomp', 'spiky', 'air', 'meteor']);
const MINI_TYPES = new Set(['cactus_s', 'rock', 'bug', 'meteor', 'coin']);

/* ------------------------------------------------------------ engine -- */

function engineParams(seed) {
  let a = (seed * 2654435761) >>> 0;
  const r = () => ((a = (Math.imul(a ^ (a >>> 13), 1274126177) + 7) >>> 0) / 4294967296);
  const passCamX = seed % 2 === 0;
  return {
    viewW: Math.round(480 + r() * 480),        // 16:10 .. 3:1 at VIEW_H 300
    lookahead: Math.round(60 + r() * 440),     // how far past the right edge chunks are requested
    passCamX,
    camStart: passCamX || seed % 4 === 1 ? 0 : Math.round(-150 + r() * 300),
  };
}

function buildRun(seed, mini) {
  const eng = engineParams(seed);
  const gen = createLevelGen({ seed, mini });
  const cam = new Float64Array(N + 2);
  cam[0] = eng.camStart;
  for (let k = 1; k <= N + 1; k++) cam[k] = cam[k - 1] + speedAt((k - 1) * DT) * DT;
  let horizon = cam[0] + eng.viewW;
  const ents = [];
  const chunks = [];
  for (let k = 0; k <= N; k++) {
    const t = k * DT;
    while (horizon <= cam[k] + eng.viewW + eng.lookahead) {
      const args = { worldX: horizon, speed: speedAt(t), t, score: Math.floor((cam[k] - cam[0]) / 10) };
      if (eng.passCamX) args.camX = cam[k];
      const c = gen.nextChunk(args);
      checkChunk(c, { seed, mini, k, worldX: horizon, cam: cam[k], viewW: eng.viewW });
      chunks.push({ name: c.name, k, t, worldX: horizon, length: c.length, d: gen.difficulty(t, args.score), n: c.entities.length });
      for (const e of c.entities) ents.push({ ...e, kSpawn: k, chunk: chunks.length - 1 });
      horizon += c.length;
    }
  }
  return { seed, mini, eng, gen, cam, ents, chunks };
}

function checkChunk(c, ctx) {
  const where = `seed ${ctx.seed}${ctx.mini ? ' mini' : ''} chunk@${(ctx.k * DT).toFixed(2)}s ${c && c.name}`;
  if (!c || typeof c.name !== 'string' || !(c.length > 0) || !Array.isArray(c.entities)) {
    return fail(`${where}: bad chunk shape`);
  }
  for (const e of c.entities) {
    const def = ENTITIES[e.type];
    if (!def) { fail(`${where}: unknown type ${e.type}`); continue; }
    if (!Number.isFinite(e.x)) fail(`${where}: ${e.type} has no x`);
    if (ctx.mini && !MINI_TYPES.has(e.type)) fail(`${where}: ${e.type} not allowed in mini`);
    if (e.type === 'vulture' && !(e.lane in AIR_LANES)) fail(`${where}: vulture lane ${e.lane}`);
    if (e.type === 'meteor' && !(Number.isFinite(e.targetX) && e.delay >= 0)) fail(`${where}: meteor fields`);
    // Hazards must be spawned off-screen to the right and inside or after the chunk.
    if (HAZARD_KINDS.has(def.kind)) {
      const x = e.type === 'meteor' ? e.targetX : e.x;
      if (x < ctx.worldX - 0.5) fail(`${where}: ${e.type} at ${x} before chunk start ${ctx.worldX}`);
      if (x < ctx.cam + ctx.viewW - 1) fail(`${where}: ${e.type} spawned on screen`);
    }
  }
}

/* ----------------------------------------------------------- hazards -- */

function prepare(run) {
  const { cam } = run;
  const hz = [];
  for (const e of run.ents) {
    const def = ENTITIES[e.type];
    if (!HAZARD_KINDS.has(def.kind)) continue;
    const h = {
      type: e.type, lane: e.lane, kind: def.kind, chunk: e.chunk, kSpawn: e.kSpawn,
      x0: e.x, vx: def.vx || 0, w: def.w, h: def.h, y: 0,
    };
    if (e.type === 'vulture') h.y = AIR_LANES[e.lane];
    if (e.type === 'meteor') {
      h.x0 = e.targetX;
      h.w = METEOR.blastW;
      h.h = SIM.meteorBlastH;
      h.kReticle = e.kSpawn + Math.round(e.delay / DT);
      h.kImp = h.kReticle + Math.round(METEOR.warn / DT);
      h.kEnd = h.kImp + Math.round(METEOR.lingerTime / DT);
    }
    // rel(k) = playerX - entityX grows monotonically; overlap iff -PLAYER.w < rel < w.
    const rel = (k) => cam[k] + PLAYER.x - (h.x0 + h.vx * (k - h.kSpawn) * DT);
    if (rel(h.kSpawn) > -PLAYER.w) fail(`seed ${run.seed}: ${e.type} spawned on the player`);
    let lo = h.kSpawn, hi = N + 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (rel(m) > -PLAYER.w) hi = m; else lo = m + 1; }
    h.kIn = lo;
    lo = h.kIn; hi = N + 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (rel(m) >= h.w) hi = m; else lo = m + 1; }
    h.kOut = lo - 1;
    if (h.kIn <= N) hz.push(h);
  }
  hz.sort((a, b) => a.kIn - b.kIn);
  const active = new Array(N + 2);
  const LOOK = Math.ceil(0.8 / DT);
  const busyDiff = new Int32Array(N + 3);
  hz.forEach((h, i) => {
    for (let k = h.kIn; k <= Math.min(N + 1, h.kOut); k++) (active[k] ||= []).push(i);
    busyDiff[Math.max(0, h.kIn - LOOK)]++;
    busyDiff[Math.min(N + 2, h.kOut + 1)]--;
  });
  const busy = new Uint8Array(N + 2);
  for (let k = 0, acc = 0; k <= N + 1; k++) busy[k] = (acc += busyDiff[k]) > 0 ? 1 : 0;
  return { hz, active, busy };
}

const SAFE = -1;
const DEAD = -2;

function makeCollider(run, P) {
  const { cam } = run;
  const { hz, active } = P;
  const boxY = (h, k) =>
    h.type === 'tumbleweed'
      ? SIM.tumbleBounceH * Math.abs(Math.sin((Math.PI * (k - h.kSpawn) * DT) / SIM.tumblePeriod))
      : h.y;
  // Returns SAFE, DEAD, or the index of a bug being stomped.
  return function collide(k, y, ph, vy, prevY, killed) {
    const list = active[k];
    if (!list) return SAFE;
    const px = cam[k] + PLAYER.x;
    for (const i of list) {
      const h = hz[i];
      if (h.kind === 'stomp' && killed.includes(i)) continue;
      if (h.kind === 'meteor' && (k < h.kImp || k > h.kEnd)) continue;
      const ex = h.x0 + h.vx * (k - h.kSpawn) * DT;
      if (!(px < ex + h.w && px + PLAYER.w > ex)) continue;
      const ey = boxY(h, k);
      if (!(y < ey + h.h && y + ph > ey)) continue;
      if (h.kind === 'stomp' && vy < 0 && prevY >= ey + h.h - SIM.stompTol) return i;
      return DEAD;
    }
    return SAFE;
  };
}

/* -------------------------------------------------------- search bot -- */

const HOLDS = [0, 6, 14, 24, 42];         // ticks the jump button is held (0 = tap)
const STOMP_OPTS = [[false, 0], [true, 42], [true, 10]]; // [held, ticks] after a stomp
const STEP = 2;                           // ground decisions every 1/60 s

function solve(run, P, { stompOpts = STOMP_OPTS } = {}) {
  const collide = makeCollider(run, P);
  const { hz, busy } = P;
  const frontier = new Array(N + 2);
  let states = 0;
  let maxK = 0;
  const add = (k, killed) => {
    if (k > N) k = N;
    const live = killed.filter((i) => hz[i].kOut >= k);
    const key = live.join(',');
    const m = (frontier[k] ||= new Map());
    if (!m.has(key)) m.set(key, live);
  };
  function fly(k, y, vy, held, rem, killed) {
    for (;;) {
      k++;
      if (k > N) return add(N, killed);
      if (held && --rem < 0) {
        held = false;
        if (vy > PHYS.minJumpVel) vy = PHYS.minJumpVel; // early-release cap
      }
      const g = held && vy > 0 ? PHYS.gravity : PHYS.gravityFall;
      const prevY = y;
      vy -= g * DT;
      y += vy * DT;
      const landed = y <= 0;
      if (landed) y = 0;
      const r = collide(k, y, PLAYER.h, vy, prevY, killed);
      if (k > maxK) maxK = k;
      if (r === DEAD) return;
      if (r >= 0) {
        const k2 = killed.concat(r);
        for (const [h2, t2] of stompOpts) fly(k, Math.max(y, 0), PHYS.stompBounce, h2, t2, k2);
        return;
      }
      if (landed) return add(k, killed);
    }
  }
  add(0, []);
  for (let k = 0; k <= N; k++) {
    const m = frontier[k];
    if (!m) continue;
    frontier[k] = undefined;
    for (const killed of m.values()) {
      states++;
      if (k > maxK) maxK = k;
      if (k >= N) return { ok: true, states };
      // Run (ducking whenever it helps: ducking has no momentum cost).
      let ok = true;
      for (let s = 1; s <= STEP && ok && k + s <= N; s++) {
        if (collide(k + s, 0, PLAYER.duckH, 0, 0, killed) !== SAFE) ok = false;
      }
      if (ok) add(k + STEP, killed);
      if (busy[k]) {
        for (const hold of HOLDS) {
          fly(k, 0, hold > 0 ? PHYS.jumpVel : PHYS.minJumpVel, hold > 0, hold, killed);
        }
      }
    }
  }
  return { ok: false, states, maxK };
}

/* -------------------------------------------------------- simple bot -- */

const TRIGGER = 0.12; // s: jump when a visible hazard is this close

function simpleBot(run, P) {
  const collide = makeCollider(run, P);
  const { cam, eng } = run;
  const { hz } = P;
  let y = 0, vy = 0, grounded = true, held = false, rem = 0;
  const killed = [];
  let first = 0;
  for (let k = 1; k <= N; k++) {
    if (grounded) {
      const v = speedAt((k - 1) * DT);
      const px = cam[k - 1] + PLAYER.x;
      while (first < hz.length && hz[first].kOut < k - 1) first++;
      for (let i = first; i < hz.length && hz[i].kIn <= k + 240; i++) {
        const h = hz[i];
        if (killed.includes(i) || h.kSpawn > k - 1) continue;
        if (h.kind === 'meteor' && !(k - 1 >= h.kReticle && k - 1 <= h.kEnd)) continue;
        const ex = h.x0 + h.vx * (k - 1 - h.kSpawn) * DT;
        if (ex > cam[k - 1] + eng.viewW || ex + h.w < px) continue; // off-screen or passed
        const ttc = (ex - (px + PLAYER.w)) / (v - h.vx);
        if (ttc <= TRIGGER) { grounded = false; vy = PHYS.jumpVel; held = true; rem = 42; break; }
      }
    }
    if (!grounded) {
      if (held && --rem < 0) { held = false; if (vy > PHYS.minJumpVel) vy = PHYS.minJumpVel; }
      const g = held && vy > 0 ? PHYS.gravity : PHYS.gravityFall;
      const prevY = y;
      vy -= g * DT;
      y += vy * DT;
      if (y <= 0) { y = 0; grounded = true; }
      const r = collide(k, y, PLAYER.h, vy, prevY, killed);
      if (r === DEAD) return { ok: false, k };
      if (r >= 0) { killed.push(r); vy = PHYS.stompBounce; held = false; grounded = false; }
      if (grounded) vy = 0;
    } else if (collide(k, 0, PLAYER.h, 0, 0, killed) !== SAFE) return { ok: false, k };
  }
  return { ok: true };
}

/* ------------------------------------------------------------- stats -- */

const BANDS = [0, 0.2, 0.4, 0.6, 0.8, 1.0001];
const bandOf = (d) => BANDS.findIndex((b, i) => d >= b && d < BANDS[i + 1]);

function newStats() {
  return {
    runs: 0, bandHaz: new Array(5).fill(0), bandTime: new Array(5).fill(0),
    patterns: new Map(), longestBreather: [], meteorEvents: 0, meteors: 0, powerups: 0,
    coins: 0, firstSeen: new Map(), states: 0, meteorThreat: 0, meteorTotal: 0,
    reticleLead: [],
  };
}

function firstSeenKey(h) {
  if (h.type === 'vulture') return `vulture_${h.lane}`;
  return h.type;
}

function collect(st, run, P) {
  st.runs++;
  const { gen } = run;
  for (let k = 0; k < N; k += 12) st.bandTime[bandOf(gen.difficulty(k * DT, 0))] += 12 * DT;
  for (const h of P.hz) if (h.kIn < N) st.bandHaz[bandOf(gen.difficulty(h.kIn * DT, 0))]++;
  for (const c of run.chunks) {
    if (c.k * DT > DURATION - 2) continue;
    st.patterns.set(c.name, (st.patterns.get(c.name) || 0) + 1);
    if (c.name === 'meteor_shower') st.meteorEvents++;
  }
  for (const e of run.ents) {
    if (e.kSpawn * DT > DURATION) continue;
    if (e.type === 'coin') st.coins++;
    if (e.type === 'shield' || e.type === 'boots' || e.type === 'heart') st.powerups++;
    if (e.type === 'meteor') st.meteors++;
  }
  // Longest hazard-free stretch after the first hazard (seconds).
  let longest = 0;
  let lastOut = null;
  for (const h of P.hz) {
    if (h.kIn > N) break;
    if (lastOut !== null) longest = Math.max(longest, (h.kIn - lastOut) * DT);
    lastOut = Math.max(lastOut ?? 0, h.kOut);
  }
  st.longestBreather.push(longest);
  // Meteors: does the blast window overlap the player's crossing, and how long is the
  // reticle visible on screen before the player reaches it?
  for (const h of P.hz) {
    if (h.type !== 'meteor' || h.kIn > N) continue;
    st.meteorTotal++;
    if (h.kIn <= h.kEnd && h.kOut >= h.kImp) st.meteorThreat++;
    let kVis = h.kReticle;
    while (kVis < h.kIn && h.x0 > run.cam[kVis] + run.eng.viewW) kVis++;
    st.reticleLead.push((h.kIn - kVis) * DT);
  }
  const seen = new Map();
  for (const h of P.hz) {
    const key = firstSeenKey(h);
    if (!seen.has(key)) seen.set(key, h.kIn * DT);
  }
  for (const [key, t] of seen) (st.firstSeen.get(key) || st.firstSeen.set(key, []).get(key)).push(t);
  return seen;
}

/* ----------------------------------------------------- design checks -- */

function designChecks(run, P, seen) {
  const where = `seed ${run.seed}`;
  // Onboarding: first 8 s only small cacti, rocks, clusters and bugs.
  for (const h of P.hz) {
    if (h.kIn * DT >= 8) break;
    if (!['cactus_s', 'rock', 'cactus_cluster', 'bug'].includes(h.type)) fail(`${where}: ${h.type} during onboarding`);
  }
  // One mechanic at a time, in order.
  const order = ['bug', 'tumbleweed', 'vulture_low', 'vulture_mid', 'hedgehog', 'meteor'];
  let prev = -1;
  for (const m of order) {
    const t = seen.get(m);
    if (t === undefined) continue;
    if (t < prev) fail(`${where}: ${m} first seen at ${t.toFixed(1)}s before an earlier mechanic`);
    prev = t;
  }
  // Below difficulty 0.6 a meteor never shares a jump window with another hazard:
  // at least a full airtime of clear time on both sides of its blast-crossing interval.
  const T_AIR = PHYS.jumpVel / PHYS.gravity + Math.sqrt((PHYS.jumpVel ** 2 / PHYS.gravity) / PHYS.gravityFall);
  for (let i = 0; i < P.hz.length; i++) {
    const m = P.hz[i];
    if (m.type !== 'meteor' || run.gen.difficulty(m.kIn * DT, 0) >= 0.6) continue;
    for (let j = Math.max(0, i - 6); j < Math.min(P.hz.length, i + 7); j++) {
      if (j === i) continue;
      const o = P.hz[j];
      const gap = o.kIn > m.kOut ? (o.kIn - m.kOut) * DT : (m.kIn - o.kOut) * DT;
      if (gap < T_AIR) fail(`${where}: meteor at ${(m.kIn * DT).toFixed(1)}s stacked with ${o.type} (gap ${gap.toFixed(2)}s)`);
    }
  }
}

/* -------------------------------------------------------------- main -- */

function staticChecks() {
  const g = createLevelGen({ seed: 1 });
  if (typeof g.nextChunk !== 'function' || typeof g.difficulty !== 'function') fail('API shape');
  let prev = -1;
  for (let t = 0; t <= 400; t += 0.5) {
    const d = g.difficulty(t, 0);
    if (!(d >= 0 && d <= 1)) fail(`difficulty(${t}) = ${d} out of range`);
    if (d < prev - 1e-12) fail(`difficulty not monotone at ${t}`);
    prev = d;
  }
  // Determinism: same seed + same calls => identical chunks; different seed => different.
  const seq = (seed) => {
    const gg = createLevelGen({ seed });
    let x = 600;
    const out = [];
    for (let i = 0; i < 60; i++) {
      const t = i * 1.5;
      const c = gg.nextChunk({ worldX: x, speed: speedAt(t), t, score: 0 });
      out.push(c);
      x += c.length;
    }
    return JSON.stringify(out);
  };
  if (seq(42) !== seq(42)) fail('same seed produced different levels');
  if (seq(42) === seq(43)) fail('different seeds produced identical levels');
  createLevelGen().nextChunk({ worldX: 600, speed: 380, t: 0, score: 0 }); // default args
}

// The bots must be able to fail: hand-made levels with a known-impossible spot.
function botSanity() {
  const v = SPEED.start;
  const mk = (ents, mini = false) => {
    const eng = { viewW: 600, lookahead: 200, passCamX: true, camStart: 0 };
    const cam = new Float64Array(N + 2);
    for (let k = 1; k <= N + 1; k++) cam[k] = cam[k - 1] + speedAt((k - 1) * DT) * DT;
    const run = { seed: 'sanity', mini, eng, cam, chunks: [], gen: createLevelGen({ seed: 1 }),
      ents: ents.map((e) => ({ ...e, kSpawn: 0, chunk: 0 })) };
    return [run, prepare(run)];
  };
  // Pillar 0.34 s behind a tall cactus: one jump needs take-off <= t-0.089 and >= t-0.047;
  // two jumps need to land by t+0.215 but falling from 70u ends no earlier than t+0.33.
  const deadZone = [{ type: 'cactus_l', x: 1200 }, { type: 'pillar', x: 1200 + 0.34 * v }];
  // Two pillars 0.33 s apart: 0.477 s above 92u needed (window 0.41 s), or a landing
  // 0.37 s after the first contact when the second take-off must happen by 0.205 s.
  const wall = [{ type: 'pillar', x: 1200 }, { type: 'pillar', x: 1200 + 0.33 * v }];
  for (const [name, ents] of [['dead zone', deadZone], ['wall', wall]]) {
    const [run, P] = mk(ents);
    if (solve(run, P).ok) fail(`search bot survived impossible level "${name}"`);
  }
  // A 4-bug chain spaced one un-held bounce apart works with plain bounces (button not
  // held after a stomp), at low and top speed. With this PHYS two bugs one bounce apart
  // also fit under one full jump, so pair-jumping is an alternative (tighter) route.
  const P0 = (2 * PHYS.stompBounce) / PHYS.gravityFall;
  for (const at of [0, 120]) {
    const [cRun] = mk([]);
    const kSpawn = Math.round(at / DT);
    const kc = Math.round((at + 1.5) / DT);
    cRun.ents = [0, 1, 2, 3].map((i) => {
      const kHit = kc + Math.round((i * P0) / DT); // contact tick of bug i
      const x = cRun.cam[kHit] + PLAYER.x + PLAYER.w - ENTITIES.bug.vx * (kHit - kSpawn) * DT;
      return { type: 'bug', x, kSpawn, chunk: 0 };
    });
    const cP = prepare(cRun);
    // One full jump onto bug 1, then hands off: some take-off tick must stomp all four.
    const collide = makeCollider(cRun, cP);
    let rides = 0;
    for (let k0 = kc - 90; k0 < kc; k0++) {
      let y = 0, vy = PHYS.jumpVel, held = true, rem = 42;
      const killed = [];
      for (let k = k0 + 1; k < kc + 200; k++) {
        if (held && --rem < 0) { held = false; if (vy > PHYS.minJumpVel) vy = PHYS.minJumpVel; }
        const prevY = y;
        vy -= (held && vy > 0 ? PHYS.gravity : PHYS.gravityFall) * DT;
        y += vy * DT;
        const r = collide(k, Math.max(0, y), PLAYER.h, vy, prevY, killed);
        if (r === DEAD) break;
        if (r >= 0) { killed.push(r); vy = PHYS.stompBounce; held = false; }
        if (y <= 0) break;
      }
      if (killed.length === 4) rides++;
    }
    if (!rides) fail(`no hands-off bounce ride through a 4-bug chain at ${speedAt(at)} u/s`);
  }
  // A single cactus is solvable, and the simple bot dies to a meteor with no reticle lead.
  const [okRun, okP] = mk([{ type: 'cactus_s', x: 1200 }]);
  if (!solve(okRun, okP).ok || !simpleBot(okRun, okP).ok) fail('bots failed a single cactus');
  // Simple bot lands 0.52 s after the first contact and cannot get above 40u by 0.55 s.
  const [mRun, mP] = mk([{ type: 'cactus_s', x: 1200 }, { type: 'cactus_s', x: 1200 + 0.55 * v }], true);
  if (simpleBot(mRun, mP).ok) fail('simple bot survived two cacti 0.55 s apart');
}

function fmtPct(n, d) { return `${((100 * n) / d).toFixed(1)}%`; }

const t0 = Date.now();
staticChecks();
botSanity();

const normal = newStats();
const mini = newStats();
let solved = 0, miniSolved = 0;
const deaths = [];

for (let s = 1; s <= SEEDS; s++) {
  const run = buildRun(s, false);
  const P = prepare(run);
  const seen = collect(normal, run, P);
  designChecks(run, P, seen);
  const res = solve(run, P);
  normal.states += res.states;
  if (res.ok) solved++;
  else {
    const c = [...run.chunks].reverse().find((ch) => ch.k * DT <= res.maxK * DT) || {};
    const near = P.hz.filter((h) => Math.abs(h.kIn - res.maxK) < 120).map((h) => `${h.type}${h.lane ? ':' + h.lane : ''}@${(h.kIn * DT).toFixed(2)}`);
    deaths.push(`normal seed ${s} ${JSON.stringify(run.eng)}: stuck at ${(res.maxK * DT).toFixed(2)}s (last chunk requested: ${c.name}); hazards near: ${near.join(' ')}`);
  }

  const mrun = buildRun(s, true);
  const MP = prepare(mrun);
  collect(mini, mrun, MP);
  const mres = simpleBot(mrun, MP);
  if (mres.ok) miniSolved++;
  else {
    const near = MP.hz.filter((h) => Math.abs(h.kIn - mres.k) < 120).map((h) => `${h.type}@${(h.kIn * DT).toFixed(2)}`);
    deaths.push(`mini seed ${s} ${JSON.stringify(mrun.eng)}: simple bot died at ${(mres.k * DT).toFixed(2)}s near ${near.join(' ')}`);
  }
}
deaths.forEach(fail);

/* ------------------------------------------------------------ report -- */

const avg = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
function report(label, st) {
  console.log(`\n== ${label}: ${st.runs} runs x ${DURATION}s`);
  console.log('hazards/s by difficulty band:');
  for (let b = 0; b < 5; b++) {
    if (st.bandTime[b] < 1) continue;
    console.log(`  d ${BANDS[b].toFixed(1)}-${Math.min(1, BANDS[b + 1]).toFixed(1)}: ${(st.bandHaz[b] / st.bandTime[b]).toFixed(2)} /s  (${(st.bandTime[b] / st.runs).toFixed(0)} s per run)`);
  }
  const total = [...st.patterns.values()].reduce((s, x) => s + x, 0);
  const pats = [...st.patterns.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`patterns (${total} chunks):`);
  for (let i = 0; i < pats.length; i += 3) {
    console.log('  ' + pats.slice(i, i + 3).map(([n, c]) => `${n.padEnd(18)} ${fmtPct(c, total).padStart(6)}`).join('   '));
  }
  const lb = st.longestBreather;
  console.log(`longest hazard-free stretch per run: mean ${avg(lb).toFixed(2)}s, max ${Math.max(...lb).toFixed(2)}s`);
  console.log(`meteor showers/run ${(st.meteorEvents / st.runs).toFixed(2)}, meteors/run ${(st.meteors / st.runs).toFixed(1)}, power-ups/run ${(st.powerups / st.runs).toFixed(2)}, coins/run ${(st.coins / st.runs).toFixed(0)}`);
  if (st.meteorTotal) {
    console.log(`meteors whose blast overlaps the player's path: ${fmtPct(st.meteorThreat, st.meteorTotal)}; reticle on screen before contact: min ${Math.min(...st.reticleLead).toFixed(2)}s, mean ${avg(st.reticleLead).toFixed(2)}s`);
  }
  const fs = [...st.firstSeen.entries()].map(([k, v]) => [k, avg(v), v.length]).sort((a, b) => a[1] - b[1]);
  console.log('first appearance (mean s, runs): ' + fs.map(([k, t, n]) => `${k} ${t.toFixed(1)} (${n})`).join(', '));
}
report('normal', normal);
console.log(`search bot survived ${solved}/${SEEDS} (${(normal.states / SEEDS / 1000).toFixed(1)}k ground states/run)`);
report('mini', mini);
console.log(`simple bot survived ${miniSolved}/${SEEDS}`);
console.log(`\n${((Date.now() - t0) / 1000).toFixed(1)}s`);

if (failures.length) {
  console.log(`\nFAIL (${failures.length})`);
  for (const f of failures.slice(0, 40)) console.log('  - ' + f);
  process.exit(1);
}
console.log('\nPASS');
