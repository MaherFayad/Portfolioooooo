// Maher Runner: a Chrome-dino style endless runner with Maher's pixel avatar.
// Usage: const game = await createRunner(canvas, { mini, autoplay, seed });
import { VIEW_H, GROUND_Y, PHYS, SPEED, PLAYER, ENTITIES, AIR_LANES, METEOR } from './config.js';
import { createLevelGen } from './levelgen.js';

const ASSET_BASE = new URL('./assets/', import.meta.url);
const HERO_H = 78; // drawn height of a standing hero frame, in world units
const DT = 1 / 120; // fixed physics step
const PIXEL_FONT = '"Press Start 2P", ui-monospace, monospace';

// ---------------------------------------------------------------- assets
const assetPromises = {};
function loadImage(name) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${name}`));
    img.src = new URL(name, ASSET_BASE).href;
  });
}
const loadJSON = (name) => fetch(new URL(name, ASSET_BASE)).then((r) => r.json());

// theme 'night' (default) blends into dark pages; 'dusk' is the original sunset.
export function loadAssets(theme = 'night') {
  if (!assetPromises[theme]) {
    assetPromises[theme] = Promise.all([
      loadImage(theme === 'dusk' ? 'sky.jpg' : 'sky-night.jpg'), loadImage('mesas.png'), loadImage('ground.png'),
      loadImage('world.png'), loadJSON('world.json'),
      loadImage('hero.png'), loadJSON('hero.json'),
      document.fonts ? document.fonts.load(`10px ${PIXEL_FONT}`).catch(() => null) : null,
    ]).then(([sky, mesas, ground, world, worldMap, hero, heroMap]) => ({ sky, mesas, ground, world, worldMap, hero, heroMap }));
  }
  return assetPromises[theme];
}

// ---------------------------------------------------------------- audio (tiny synth, no files)
function createSfx() {
  let ac = null;
  let muted = false;
  try { muted = localStorage.getItem('runner:muted') === '1'; } catch {}
  const ctx = () => {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  function tone(f0, f1, dur, type = 'square', vol = 0.08, delay = 0) {
    if (muted) return;
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(); const g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.25, cutoff = 900) {
    if (muted) return;
    const a = ctx(); if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = a.createBufferSource(); src.buffer = buf;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff;
    const g = a.createGain(); g.gain.value = vol;
    src.connect(lp).connect(g).connect(a.destination); src.start();
  }
  return {
    unlock: () => { if (!muted) ctx(); },
    get muted() { return muted; },
    setMuted(m) { muted = m; try { localStorage.setItem('runner:muted', m ? '1' : '0'); } catch {} },
    jump: () => tone(440, 880, 0.12, 'square', 0.05),
    dbl: () => tone(660, 1320, 0.1, 'square', 0.05),
    coin: () => { tone(988, 0, 0.07, 'square', 0.05); tone(1319, 0, 0.16, 'square', 0.05, 0.06); },
    stomp: () => { tone(300, 90, 0.14, 'triangle', 0.18); noise(0.06, 0.1, 2000); },
    power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.09, 'square', 0.05, i * 0.06)),
    warn: () => tone(880, 0, 0.05, 'sine', 0.04),
    boom: () => { noise(0.5, 0.35, 700); tone(120, 40, 0.4, 'sawtooth', 0.12); },
    hit: () => { tone(200, 60, 0.25, 'square', 0.1); noise(0.15, 0.15, 1500); },
    die: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0, 0.14, 'square', 0.06, i * 0.11)),
    milestone: () => { tone(1047, 0, 0.08, 'square', 0.04); tone(1568, 0, 0.12, 'square', 0.04, 0.08); },
  };
}

// ---------------------------------------------------------------- helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const pad5 = (n) => String(Math.floor(n)).padStart(5, '0');

// ---------------------------------------------------------------- engine
export async function createRunner(canvas, opts = {}) {
  const mini = !!opts.mini;
  const baseViewH = opts.viewH || (mini ? 150 : VIEW_H);
  const minViewW = mini ? 360 : 560; // keep enough reaction distance on narrow screens
  let viewH = baseViewH;
  const groundY = opts.groundY ?? (mini ? 24 : GROUND_Y);
  const reduced = opts.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let autoplay = !!opts.autoplay;

  const night = (opts.theme || 'night') === 'night';
  const A = await loadAssets(night ? 'night' : 'dusk');
  const ctx = canvas.getContext('2d');
  const sfx = opts.sfx === false ? createSilentSfx() : createSfx();
  const upx = HERO_H / A.heroMap.frames.idle_0[3]; // hero sheet px -> world units

  // view
  let cssW = 0, cssH = 0, dpr = 1, scale = 1, viewW = 600;
  // Faded page edges (fractions of the view) that gameplay and HUD must stay clear of.
  const edge = { side: 0, top: 0, ...(opts.frame || {}) };
  let px0 = PLAYER.x; // screen x of the player's hitbox left edge, in world units
  function resize() {
    const r = canvas.getBoundingClientRect();
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    scale = Math.min(cssH * (1 - edge.top * 0.6) / baseViewH, cssW / minViewW); // jump apex stays clear of the top fade
    viewH = cssH / scale; viewW = cssW / scale;
    px0 = PLAYER.x + edge.side * viewW;
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const sy = (y) => viewH - groundY - y; // world y (up) -> view y (down)

  // state
  let hi = 0;
  try { hi = +localStorage.getItem('runner:hi') || 0; } catch {}
  let S; // run state, rebuilt by reset()
  let mode = 'ready'; // ready | playing | dead | paused | countdown
  let lookDown = false, lookDownAt = 0;
  const ENTRANCE = opts.entrance && !reduced ? 1.0 : 0; // seconds
  const entranceK = () => (ENTRANCE ? clamp(clock / ENTRANCE, 0, 1) : 1);
  const entranceOffset = () => { const k = entranceK(); return k >= 1 ? 0 : -(1 - (1 - (1 - k) ** 3)) * (px0 + 60); };
  let clock = 0; // real seconds since creation
  const listeners = new Set();
  const emit = (type, data) => listeners.forEach((fn) => fn(type, data));

  function reset() {
    S = {
      t: 0, camX: 0, speed: SPEED.start, score: 0, coins: 0, combo: 0, stomps: 0,
      lives: 1, shield: 0, boots: 0, invuln: 0,
      p: { y: 0, vy: 0, grounded: true, ducking: false, coyote: 0, buffer: 0, airJumps: 0, land: 0, squash: 0, jumpHeld: false },
      ents: [], parts: [], pops: [], scorches: [],
      gen: createLevelGen({ seed: opts.seed ?? (Date.now() >>> 0), mini }),
      genX: 0, shake: 0, hitstop: 0, flash: 0, deadT: 0, lastMilestone: 0, countdown: 0,
    };
    S.genX = viewW + 120;
  }
  reset();

  // ------------------------------------------------ input
  const keys = { down: false };
  function pressJump() {
    sfx.unlock();
    if (lookDown) return;
    if (mode === 'ready') return start();
    if (mode === 'dead') { if (S.deadT > 0.45) { reset(); start(); } return; }
    if (mode === 'paused') return resume();
    if (mode !== 'playing') return;
    S.p.jumpHeld = true;
    S.p.buffer = PHYS.jumpBuffer;
  }
  function releaseJump() { S.p.jumpHeld = false; }
  function setDuck(on) { keys.down = on; }

  function onKey(e) {
    if (opts.keyboard === false) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(t.tagName) || t.getAttribute?.('role') === 'button')) return;
    const down = e.type === 'keydown';
    switch (e.code) {
      case 'Space': case 'ArrowUp': case 'KeyW':
        e.preventDefault(); if (down && !e.repeat) pressJump(); else if (!down) releaseJump(); break;
      case 'ArrowDown': case 'KeyS':
        e.preventDefault(); setDuck(down); break;
      case 'KeyP': case 'Escape':
        if (down) togglePause(); break;
      case 'KeyM':
        if (down) sfx.setMuted(!sfx.muted), emit('mute', sfx.muted); break;
    }
  }
  if (!mini && opts.keyboard !== false) { window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey); }

  // touch / pointer: tap = jump (hold for higher), swipe down = duck
  let ptr = null;
  function onPointerDown(e) { if (autoplay) return; ptr = { y: e.clientY, id: e.pointerId }; pressJump(); }
  function onPointerMove(e) { if (ptr && e.pointerId === ptr.id && e.clientY - ptr.y > 30) setDuck(true); }
  function onPointerUp(e) { if (ptr && e.pointerId === ptr.id) { ptr = null; releaseJump(); setDuck(false); } }
  if (!mini) {
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }
  const onVis = () => { if (document.hidden && mode === 'playing') pause(); };
  document.addEventListener('visibilitychange', onVis);

  // ------------------------------------------------ mode changes
  function start() {
    if (mode !== 'ready' && mode !== 'dead') return;
    mode = 'playing';
    S.p.vy = PHYS.jumpVel * 0.75; S.p.grounded = false; // hop into the run, like the dino
    sfx.jump();
    emit('start');
  }
  function pause() { if (mode === 'playing') { mode = 'paused'; emit('pause'); } }
  function resume() { if (mode === 'paused') { mode = 'countdown'; S.countdown = autoplay ? 0.01 : 1.5; emit('resume'); } }
  function togglePause() { mode === 'playing' ? pause() : resume(); }
  function die() {
    mode = 'dead'; S.deadT = 0; S.hitstop = 0.18; S.shake = reduced ? 0 : 10;
    sfx.die();
    const score = Math.floor(S.score);
    if (score > hi) { hi = score; try { localStorage.setItem('runner:hi', String(hi)); } catch {} }
    emit('gameover', { score, hi, coins: S.coins });
  }

  // ------------------------------------------------ particles
  function puff(x, y, n, color, spread = 60, up = 60, life = 0.5, size = 2) {
    if (reduced) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      S.parts.push({ x, y, vx: (Math.random() - 0.5) * spread * 2, vy: Math.random() * up, life, max: life, color, size: size + (Math.random() < 0.3 ? 1 : 0), g: -260 });
    }
  }
  function pop(x, y, text, color = '#ffe08a') { S.pops.push({ x, y, text, color, life: 0.9 }); }

  // ------------------------------------------------ hitboxes
  function playerBox() {
    const h = S.p.ducking ? PLAYER.duckH : PLAYER.h;
    return { x: S.camX + px0, y: S.p.y, w: PLAYER.w, h };
  }
  function entBox(e) {
    const d = e.def; const insetX = d.w * 0.12, insetY = d.h * 0.1;
    if (e.type === 'meteor') return e.phase === 'blast' ? { x: e.targetX + 6, y: 0, w: METEOR.blastW - 12, h: 34 } : null;
    return { x: e.x + insetX, y: e.y + insetY * (d.kind === 'stomp' ? 0 : 1), w: d.w - insetX * 2, h: d.h - insetY * (d.kind === 'stomp' ? 1 : 2) };
  }

  // ------------------------------------------------ spawning
  function spawnAhead() {
    let guard = 0;
    while (S.genX < S.camX + viewW + 600 && guard++ < 20) {
      const chunk = S.gen.nextChunk({ worldX: S.genX, speed: S.speed, t: S.t, score: S.score, camX: S.camX });
      for (const it of chunk.entities || []) {
        const def = ENTITIES[it.type]; if (!def) continue;
        const e = { ...it, def, born: S.t, t: 0, alive: true, y: it.y ?? 0, vx: def.vx || 0, vy: 0, rot: 0, frame: 0 };
        if (it.type === 'vulture') e.y = it.y ?? AIR_LANES[it.lane || 'low'];
        if (it.type === 'meteor') { e.phase = 'wait'; e.delay = it.delay ?? 0; e.x = it.targetX; }
        e.baseY = e.y;
        S.ents.push(e);
      }
      S.genX += Math.max(80, chunk.length || 0);
    }
  }

  // ------------------------------------------------ hurt / pickup
  function hurt(e) {
    if (S.invuln > 0) return;
    if (mini) { S.invuln = 0.8; S.shake = 2; return; } // the loader never dies
    if (S.shield > 0) {
      S.shield = 0; S.invuln = 1; sfx.hit(); S.shake = reduced ? 0 : 6;
      if (e && e.type !== 'meteor') { e.knocked = true; e.vy = 420; e.vx = 260; }
      pop(S.camX + px0, S.p.y + 70, 'SHIELD!', '#8fd3ff');
      return;
    }
    if (S.lives > 1) {
      S.lives--; S.invuln = 1.5; sfx.hit(); S.shake = reduced ? 0 : 7; S.flash = 0.12;
      return;
    }
    die();
  }
  function collect(e) {
    e.alive = false;
    const cx = e.x + e.def.w / 2, cy = e.y + e.def.h / 2;
    switch (e.type) {
      case 'coin': S.coins++; S.score += 10; sfx.coin(); puff(cx, cy, 6, '#ffd84a', 50, 80, 0.35); break;
      case 'shield': S.shield = 1; sfx.power(); pop(cx, cy + 20, 'SHIELD', '#8fd3ff'); break;
      case 'boots': S.boots = 12; sfx.power(); pop(cx, cy + 20, 'DOUBLE JUMP', '#fff'); break;
      case 'heart': S.lives = Math.min(3, S.lives + 1); sfx.power(); pop(cx, cy + 20, '+1 LIFE', '#ff6b6b'); break;
    }
  }

  // ------------------------------------------------ autoplay bot (mini + attract)
  function botThink() {
    const px = S.camX + px0, pw = PLAYER.w;
    let wantDuck = false;
    for (const e of S.ents) {
      if (!e.alive || e.knocked) continue;
      const k = e.def.kind;
      if (k === 'pickup') continue;
      if (e.type === 'meteor') {
        if (e.phase !== 'warn' && e.phase !== 'fall' && e.phase !== 'blast') continue;
        const tImpact = e.impactAt - S.t; // seconds until impact (<0 if already blasting)
        const pAtImpact = px + S.speed * Math.max(0, tImpact);
        const hitsThen = pAtImpact + pw > e.targetX && pAtImpact < e.targetX + METEOR.blastW;
        if (hitsThen && tImpact > 0 && tImpact < 0.3 && S.p.grounded) S.p.buffer = PHYS.jumpBuffer, S.p.jumpHeld = true;
        const dist = e.targetX - (px + pw);
        if (e.phase === 'blast' && dist > 0 && dist < S.speed * 0.3 && S.p.grounded) S.p.buffer = PHYS.jumpBuffer, S.p.jumpHeld = true;
        continue;
      }
      const ex = e.x, ew = e.def.w;
      if (ex + ew < px) continue;
      const closing = S.speed - (e.vx || 0);
      const dist = ex - (px + pw);
      if (k === 'air' && e.lane === 'high') continue;
      if (k === 'air' && e.lane === 'mid') {
        // duck under it, and never jump for the next hazard while it is still overhead
        if (dist < closing * 0.35) wantDuck = true;
        if (dist < closing * 0.6) break;
        continue;
      }
      // be over the obstacle's centre near the apex of a full jump
      const tApex = PHYS.jumpVel / PHYS.gravity;
      const lead = closing * tApex * 0.82 - ew / 2;
      // press inside the jump-buffer window too, so tight doubles at speed are taken on landing
      const landingSoon = !S.p.grounded && S.p.vy < 0 && S.p.y < 40;
      if (dist <= lead && dist > -ew && (S.p.grounded || landingSoon)) { S.p.buffer = PHYS.jumpBuffer; S.p.jumpHeld = true; }
      break;
    }
    if (S.p.grounded && S.p.vy <= 0 && S.p.buffer <= 0) S.p.jumpHeld = false;
    if (!S.p.grounded && S.p.vy < 0) S.p.jumpHeld = false;
    keys.down = wantDuck;
  }

  // ------------------------------------------------ simulation step
  function step(dt) {
    if (mode === 'countdown') { S.countdown -= dt; if (S.countdown <= 0) mode = 'playing'; return; }
    if (mode === 'dead') {
      S.deadT += dt;
      const p = S.p;
      if (p.y > 0 || p.vy > 0) {
        // hit in the air: keep falling, the knee-down plays once he lands
        p.vy = Math.min(p.vy, 0) - PHYS.gravityFall * dt; p.y += p.vy * dt;
        if (p.y <= 0) { p.y = 0; p.vy = 0; p.land = 0.1; puff(S.camX + px0 + 13, 0, 8, '#e9b872', 80, 50, 0.4); }
      } else S.downT = (S.downT || 0) + dt;
      S.speed = Math.max(0, S.speed - 1400 * dt); S.camX += S.speed * dt;
      updateParticles(dt); return;
    }
    if (mode !== 'playing') return;
    if (S.hitstop > 0) { S.hitstop -= dt; return; }
    if (autoplay) botThink();

    S.t += dt;
    S.speed = Math.min(SPEED.max * (mini ? 0.55 : 1), (mini ? 0.8 : 1) * SPEED.start + SPEED.accel * S.t);
    S.camX += S.speed * dt;
    S.score += S.speed * dt / 40;
    S.invuln = Math.max(0, S.invuln - dt); S.boots = Math.max(0, S.boots - dt);
    const ms = Math.floor(S.score / 500);
    if (ms > S.lastMilestone && !mini) { S.lastMilestone = ms; S.flash = 0; S.milestoneT = 1; sfx.milestone(); }
    if (S.milestoneT > 0) S.milestoneT -= dt;

    // player physics: coyote time, jump buffer, variable height, fast-fall, double jump with boots
    const p = S.p;
    p.coyote = p.grounded ? PHYS.coyoteTime : p.coyote - dt;
    p.buffer -= dt;
    if (p.buffer > 0) {
      if (p.coyote > 0) {
        p.vy = PHYS.jumpVel; p.grounded = false; p.coyote = 0; p.buffer = 0; p.airJumps = S.boots > 0 ? 1 : 0;
        p.squash = -0.12; sfx.jump(); puff(S.camX + px0 + 8, 0, 5, '#e9b872', 50, 40, 0.35);
      } else if (p.airJumps > 0 && p.vy < PHYS.jumpVel * 0.6) {
        p.airJumps--; p.vy = PHYS.jumpVel * 0.9; p.buffer = 0; sfx.dbl();
        puff(S.camX + px0 + 13, p.y, 8, '#ffffff', 60, -20, 0.35);
      }
    }
    p.ducking = keys.down && p.grounded;
    if (!p.grounded) {
      let g = p.vy > 0 && p.jumpHeld ? PHYS.gravity : PHYS.gravityFall;
      if (keys.down) g = PHYS.fastFall;
      if (p.vy > 0 && !p.jumpHeld && p.vy > PHYS.minJumpVel) p.vy = PHYS.minJumpVel;
      p.vy -= g * dt; p.y += p.vy * dt;
      if (p.y <= 0) {
        p.y = 0; p.vy = 0; p.grounded = true; p.land = 0.1; p.squash = 0.18; S.combo = 0;
        puff(S.camX + px0 + 13, 0, 6, '#e9b872', 70, 50, 0.4);
      }
    }
    p.land = Math.max(0, p.land - dt);
    p.squash *= Math.pow(0.0005, dt);

    spawnAhead();

    const pb = playerBox();
    const prevBottom = p.y - p.vy * dt;
    for (const e of S.ents) {
      if (!e.alive) continue;
      e.t += dt;
      const d = e.def;
      if (e.knocked) { e.x += e.vx * dt; e.vy -= 1400 * dt; e.y += e.vy * dt; e.rot += 12 * dt; if (e.y < -200) e.alive = false; continue; }
      if (e.flat) { e.flat -= dt; if (e.flat <= 0) e.alive = false; continue; }
      if (e.type === 'meteor') { updateMeteor(e, dt); }
      else {
        e.x += e.vx * dt;
        if (e.type === 'tumbleweed') { e.y = Math.abs(Math.sin(e.t * 5.5)) * 22; e.rot -= 8 * dt; }
        if (e.type === 'vulture') e.y = e.baseY + Math.sin(e.t * 6) * 3;
        if (d.kind === 'pickup') e.y = e.baseY + Math.sin(e.t * 4 + e.x * 0.01) * 2;
      }
      const b = entBox(e); if (!b) continue;
      if (!overlap(pb, b)) continue;
      if (d.kind === 'pickup') { collect(e); continue; }
      if (d.kind === 'stomp' && p.vy < 0 && prevBottom >= b.y + b.h * 0.45) {
        e.flat = 0.5; S.combo++; S.stomps++;
        const pts = 25 * S.combo; S.score += pts;
        p.vy = p.jumpHeld ? PHYS.jumpVel * 0.95 : PHYS.stompBounce; p.airJumps = S.boots > 0 ? 1 : 0;
        S.hitstop = reduced ? 0 : 0.05; S.shake = reduced ? 0 : 3; sfx.stomp();
        pop(e.x + d.w / 2, e.y + 40, S.combo > 1 ? `+${pts} x${S.combo}` : `+${pts}`);
        puff(e.x + d.w / 2, d.h, 8, '#fff3c4', 90, 60, 0.35);
        continue;
      }
      hurt(e);
      if (mode !== 'playing') break;
    }
    S.ents = S.ents.filter((e) => e.alive && (e.type === 'meteor' ? e.phase !== 'done' : e.x + e.def.w > S.camX - 200));
    S.scorches = S.scorches.filter((s) => (s.life -= dt) > 0);
    updateParticles(dt);
    if (Math.floor(S.score) !== S.lastEmit) { S.lastEmit = Math.floor(S.score); emit('score', S.lastEmit); }
  }

  function updateMeteor(e, dt) {
    const since = S.t - e.born;
    if (e.phase === 'wait' && since >= e.delay) {
      e.phase = 'warn'; e.warnAt = S.t; e.impactAt = S.t + METEOR.warn; if (!mini) sfx.warn();
    }
    if (e.phase === 'warn' && S.t >= e.impactAt - METEOR.fallTime) e.phase = 'fall';
    if (e.phase === 'fall' && S.t >= e.impactAt) {
      e.phase = 'blast'; e.blastT = 0;
      S.shake = reduced ? 0 : (mini ? 2 : 8); sfx.boom();
      const cx = e.targetX + METEOR.blastW / 2;
      puff(cx, 4, 18, '#ff8a3d', 160, 200, 0.7, 3); puff(cx, 4, 12, '#5a3a2e', 120, 140, 0.9, 3);
      S.scorches.push({ x: cx, life: 3 });
    }
    if (e.phase === 'blast') { e.blastT += dt; if (e.blastT > Math.max(METEOR.lingerTime, 0.4)) e.phase = 'done'; }
    if (e.phase === 'fall' && Math.random() < 0.6 && !reduced) {
      const m = meteorPos(e); S.parts.push({ x: m.x + 10, y: m.y + 6, vx: 30 + Math.random() * 40, vy: 20 + Math.random() * 30, life: 0.4, max: 0.4, color: Math.random() < 0.5 ? '#ffb347' : '#ff5e3a', size: 2, g: 0 });
    }
  }
  function meteorPos(e) {
    const k = clamp(1 - (e.impactAt - S.t) / METEOR.fallTime, 0, 1);
    const tx = e.targetX + METEOR.blastW / 2, ty = 0;
    const fx = tx + 260, fy = viewH; // enters from the upper right
    return { x: fx + (tx - fx) * k, y: fy + (ty - fy) * k };
  }

  function updateParticles(dt) {
    for (const q of S.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; if (q.y < 0) { q.y = 0; q.vy = 0; q.vx *= 0.8; } }
    S.parts = S.parts.filter((q) => q.life > 0);
    for (const q of S.pops) { q.life -= dt; q.y += 40 * dt; }
    S.pops = S.pops.filter((q) => q.life > 0);
    S.shake = Math.max(0, S.shake - 40 * dt);
    S.flash = Math.max(0, S.flash - dt);
  }

  // ------------------------------------------------ rendering
  function spr(name, x, yBottom, drawH, { flip = false, alpha = 1, rot = 0, anchorY = 1 } = {}) {
    const r = A.worldMap[name]; if (!r) return;
    const [sx, sy0, w, h] = r; const s = drawH / h; const dw = w * s;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(x, sy(yBottom) - drawH * (anchorY - 1));
    if (rot) { ctx.translate(0, -drawH / 2); ctx.rotate(rot); ctx.translate(0, drawH / 2); }
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(A.world, sx, sy0, w, h, -dw / 2, -drawH, dw, drawH);
    ctx.restore();
    return dw;
  }

  function heroFrame() {
    const p = S.p; const an = A.heroMap.anims;
    const loop = (name, fps, t = clock) => an[name][Math.floor(t * fps) % an[name].length];
    if (lookDown) {
      // glance down at the chat, point at it, then keep hopping while looking at it
      const lt = clock - lookDownAt;
      if (lt < 0.35) return { f: an.look[0] };
      if (lt < 1.1) return { f: an.look[1] };
      const hop = reduced ? 0 : Math.abs(Math.sin((lt - 1.1) * 6.5)) * 20;
      return { f: hop > 5 ? an.look[2] : an.look[0], hop };
    }
    if (mode === 'ready') {
      if (entranceK() < 1) return { f: loop('runA', 12) };
      const cyc = clock % 6;
      return cyc > 4.6 ? { f: loop('wave', 8) } : { f: loop('idle', 3) };
    }
    if (mode === 'dead') {
      if (S.p.y > 0) return { f: an.jump[3] }; // still falling
      const i = Math.min(4, Math.floor((S.downT || 0) * 10));
      return { f: an.failed[i] };
    }
    if (p.ducking) return { f: an.duck[0] };
    if (!p.grounded) {
      if (p.vy > 300) return { f: an.jump[1] };
      if (p.vy > -250) return { f: an.jump[2] };
      return { f: an.jump[3] };
    }
    if (p.land > 0) return { f: an.jump[4] };
    if (mode === 'paused' || mode === 'countdown') return { f: an.idle[0] };
    const fps = 9 + (S.speed - SPEED.start) / 60;
    return { f: loop('runA', fps, S.t) };
  }

  function drawHero() {
    const { f, hop = 0 } = heroFrame();
    const [sx, sy0, w, h, ax] = A.heroMap.frames[f];
    const dw = w * upx, dh = h * upx;
    const cx = px0 + PLAYER.w / 2 + entranceOffset();
    const y = S.p.y + hop;
    // squash & stretch around the feet
    const sq = reduced ? 0 : S.p.squash;
    const sxk = 1 + sq * 0.6, syk = 1 - sq;
    if (S.invuln > 0 && Math.floor(clock * 20) % 2 === 0 && mode === 'playing') return;
    // ground shadow shrinks with height
    const sh = clamp(1 - y / 180, 0.3, 1);
    ctx.fillStyle = 'rgba(40,16,24,0.28)';
    ctx.beginPath(); ctx.ellipse(cx, sy(0) + 1, 16 * sh, 3 * sh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(cx, sy(y)); ctx.scale(sxk, syk);
    ctx.drawImage(A.hero, sx, sy0, w, h, -ax * upx, -dh, dw, dh);
    ctx.restore();
    if (S.shield > 0) {
      const r = 46 + Math.sin(clock * 6) * 2;
      ctx.save(); ctx.globalAlpha = 0.35 + Math.sin(clock * 8) * 0.08;
      ctx.strokeStyle = '#8fd3ff'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(143,211,255,0.12)';
      ctx.beginPath(); ctx.ellipse(cx, sy(y + 34), r * 0.62, r * 0.82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (S.boots > 0 && !S.p.grounded) puffTrail(cx, y);
  }
  function puffTrail(cx, y) { if (Math.random() < 0.4) S.parts.push({ x: S.camX + cx - 10, y: y + 4, vx: -60, vy: 0, life: 0.3, max: 0.3, color: '#ffffff', size: 2, g: 0 }); }

  function drawTiled(img, factor, drawH, yBottom) {
    const dw = img.width * (drawH / img.height);
    let off = -((S.camX * factor) % dw);
    for (let x = off; x < viewW; x += dw) ctx.drawImage(img, x, sy(yBottom) - drawH, dw + 0.5, drawH);
  }

  function drawBackground() {
    // sky: cover the view, anchored to the bottom so the sun sits near the horizon
    const sky = A.sky; const sk = Math.max((viewW + 44) / sky.width, (viewH - groundY + 30) / sky.height);
    const sw = sky.width * sk, sh = sky.height * sk;
    const drift = mini ? 0 : (S.camX * 0.01) % 20;
    ctx.drawImage(sky, (viewW - sw) / 2 - drift + 10, sy(-30) - sh, sw, sh); // centred; 44u of slack covers the 20u drift
    // slow day/night cycle tint (dusk theme only; the night sky is already dark)
    if (!mini && !night) {
      const night = (Math.sin(S.t / 30 - Math.PI / 2) + 1) / 2 * 0.45;
      if (night > 0.01) { ctx.fillStyle = `rgba(20,10,40,${night})`; ctx.fillRect(0, 0, viewW, sy(0)); }
    }
    // mesas: content sits in the bottom ~45% of the tile
    const mH = mini ? 96 : 170;
    drawTiled(A.mesas, 0.22, mH, mini ? 2 : 4);
    // atmospheric haze pushes the mesas back so the hero and hazards read first
    const hz = ctx.createLinearGradient(0, sy(mH * 0.5), 0, sy(0));
    if (night) {
      // multiply only darkens: the black sky between the mesas stays black, no band at the top edge
      hz.addColorStop(0, 'rgba(70,56,110,0)'); hz.addColorStop(1, 'rgba(70,56,110,0.6)');
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = hz; ctx.fillRect(0, sy(mH * 0.5), viewW, sy(0) - sy(mH * 0.5));
      ctx.restore();
    } else {
      hz.addColorStop(0, 'rgba(255,140,110,0.38)'); hz.addColorStop(1, 'rgba(120,50,70,0.30)');
      ctx.fillStyle = hz; ctx.fillRect(0, sy(mH * 0.5), viewW, sy(0) - sy(mH * 0.5));
    }
    // ground band
    const gH = groundY + 10;
    drawTiled(A.ground, 1, gH, -groundY);
    if (night) {
      // moonlight grade: multiply the daylit mesas and sand toward cool violet
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      const top = sy(mH * 0.62), full = sy(mH * 0.4); // fade in over the mesa tops so the sky keeps no seam
      const mg = ctx.createLinearGradient(0, top, 0, full);
      mg.addColorStop(0, 'rgba(110,96,150,0)'); mg.addColorStop(1, 'rgba(110,96,150,1)');
      ctx.fillStyle = mg; ctx.fillRect(0, top, viewW, sy(0) - top); // mesas only; the sand stays moonlit
      ctx.fillStyle = 'rgba(150,140,190,0.35)'; ctx.fillRect(0, sy(0), viewW, viewH - sy(0));
      ctx.restore();
    }
    for (const s of S.scorches) {
      ctx.fillStyle = `rgba(30,12,8,${0.45 * Math.min(1, s.life)})`;
      ctx.beginPath(); ctx.ellipse(s.x - S.camX, sy(0) + 2, 30, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawEntities() {
    if (night) ctx.filter = 'brightness(0.9) saturate(0.9)';
    for (const e of S.ents) {
      const d = e.def; const x = e.x - S.camX + d.w / 2;
      if (e.type === 'meteor') { drawMeteor(e); continue; }
      if (x < -120 || x > viewW + 120) continue;
      if (e.flat) { spr('bug_flat', x, 0, d.drawH * 0.75, { alpha: Math.min(1, e.flat * 3) }); continue; }
      switch (e.type) {
        case 'bug': spr(`bug_${Math.floor(e.t * 7) % 2}`, x, e.y, d.drawH, { rot: e.knocked ? e.rot : 0 }); break;
        case 'vulture': spr(`vulture_${Math.floor(e.t * 6) % 2}`, x, e.y - 8, d.drawH, { rot: e.knocked ? e.rot : 0 }); break;
        case 'coin': spr(`coin_${Math.floor(e.t * 10 + e.x * 0.02) % 4}`, x, e.y, d.drawH); break;
        case 'tumbleweed': spr('tumbleweed', x, e.y, d.drawH, { rot: e.rot }); break;
        case 'shield': case 'boots': case 'heart': {
          ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(clock * 6) * 0.1; ctx.fillStyle = '#fff6c8';
          ctx.beginPath(); ctx.arc(x, sy(e.y + d.h / 2), d.w * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          spr(e.type, x, e.y, d.drawH); break;
        }
        default: spr(e.type, x, e.y, d.drawH, { rot: e.knocked ? e.rot : 0 });
      }
    }
    ctx.filter = 'none';
  }

  function drawMeteor(e) {
    if (e.phase === 'wait' || e.phase === 'done') return;
    const cx = e.targetX + METEOR.blastW / 2 - S.camX;
    if (e.phase === 'warn' || e.phase === 'fall') {
      const urgency = clamp((S.t - e.warnAt) / METEOR.warn, 0, 1);
      // steady pulse at 2 Hz max, never below 70% (WCAG 2.3.1); still under reduced motion
      const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(clock * Math.PI * 4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gw = METEOR.blastW / 2;
      const glow = ctx.createRadialGradient(cx, sy(0), 0, cx, sy(0), gw);
      glow.addColorStop(0, `rgba(255,106,61,${(0.45 + 0.4 * urgency) * pulse})`); glow.addColorStop(1, 'rgba(255,106,61,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(cx, sy(0), gw, 9, 0, 0, Math.PI * 2); ctx.fill();
      // a faint column of light marks where it will land
      const col = ctx.createLinearGradient(0, sy(viewH), 0, sy(0));
      col.addColorStop(0, 'rgba(255,170,90,0)'); col.addColorStop(1, `rgba(255,140,80,${0.18 + 0.22 * urgency})`);
      ctx.fillStyle = col; ctx.fillRect(cx - 3, 0, 6, sy(0));
      ctx.restore();
      spr('reticle', cx, -4, 26 + urgency * 10, { alpha: 0.7 + 0.3 * pulse });
    }
    if (e.phase === 'fall') {
      const m = meteorPos(e); const r = A.worldMap.meteor_l; const dh = e.def.drawH; const dw = r[2] * dh / r[3];
      // anchor the rock head (bottom-left of the sprite) at the meteor position
      ctx.drawImage(A.world, r[0], r[1], r[2], r[3], m.x - S.camX - dw * 0.2, sy(m.y) - dh * 0.84, dw, dh);
    }
    if (e.phase === 'blast') {
      const i = Math.min(3, Math.floor(e.blastT / 0.1));
      const hgt = [34, 50, 70, 84][i];
      spr(`boom_${i}`, cx, -6, hgt, { alpha: e.blastT > 0.32 ? Math.max(0, 1 - (e.blastT - 0.32) * 8) : 1 });
    }
  }

  function drawParticles() {
    for (const q of S.parts) {
      ctx.globalAlpha = clamp(q.life / q.max, 0, 1); ctx.fillStyle = q.color;
      ctx.fillRect(Math.round(q.x - S.camX), Math.round(sy(q.y)), q.size, q.size);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.font = `8px ${PIXEL_FONT}`;
    for (const q of S.pops) {
      ctx.globalAlpha = clamp(q.life * 2, 0, 1);
      ctx.fillStyle = '#2a1420'; ctx.fillText(q.text, q.x - S.camX + 1, sy(q.y) + 1);
      ctx.fillStyle = q.color; ctx.fillText(q.text, q.x - S.camX, sy(q.y));
    }
    ctx.globalAlpha = 1;
  }

  function text(str, x, y, size, color = '#fff6e8', align = 'center') {
    size = Math.max(size, (size >= 14 ? 16 : 12) / scale); // never below 12 CSS px (16 for titles) on small screens
    ctx.font = `${size}px ${PIXEL_FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(42,20,32,0.85)'; ctx.fillText(str, x + 1, y + 1);
    ctx.fillStyle = color; ctx.fillText(str, x, y);
  }

  function drawHUD() {
    if (mini || mode === 'ready') return;
    const blink = S.milestoneT > 0 && Math.floor(S.milestoneT * 8) % 2 === 0;
    const right = viewW - 14 - edge.side * viewW, top = 24 + edge.top * viewH;
    if (!blink) text(pad5(S.score), right, top, 12, '#fff6e8', 'right');
    ctx.font = `${Math.max(12, 12 / scale)}px ${PIXEL_FONT}`;
    const scoreW = ctx.measureText('00000').width;
    if (hi) text(`HI ${pad5(hi)}`, right - scoreW * 1.4, top, 12, 'rgba(255,246,232,0.65)', 'right');
    // left: coins, lives, power-ups
    let x = 14 + edge.side * viewW;
    const iconY = 12 + edge.top * viewH;
    drawIcon('coin_0', x, iconY, 12); text(`${S.coins}`, x + 16, iconY + 11, 10, '#ffd84a', 'left');
    x += 16 + ctx.measureText(String(S.coins)).width + 12;
    for (let i = 0; i < S.lives; i++) { drawIcon('heart', x, iconY, 12); x += 16; }
    if (S.shield) { x += 6; drawIcon('shield', x, iconY - 1, 14); x += 18; }
    if (S.boots > 0) { x += 6; drawIcon('boots', x, iconY - 1, 14); ctx.fillStyle = '#fff6e8'; ctx.fillRect(x, iconY + 16, 14 * (S.boots / 12), 2); x += 18; }
  }
  function drawIcon(name, x, y, h) {
    const r = A.worldMap[name]; const w = r[2] * h / r[3];
    ctx.drawImage(A.world, r[0], r[1], r[2], r[3], x, y, w, h);
  }

  function drawOverlay() {
    if (mini) return;
    const cx = viewW / 2, cy = Math.max(viewH * 0.36, edge.top * viewH + 50);
    if (lookDown) return;
    if (mode === 'ready') {
      text('MAHER RUNNER', cx, cy - 8, 16, '#fff6e8');
      ctx.globalAlpha = reduced ? 1 : 0.7 + 0.3 * Math.sin(clock * Math.PI * 2);
      text(matchMedia('(pointer: coarse)').matches ? 'TAP TO PLAY' : 'PRESS SPACE TO PLAY', cx, cy + 18, 9, '#ffd84a');
      ctx.globalAlpha = 1;
    } else if (mode === 'dead' && S.deadT > 0.4) {
      text('G A M E   O V E R', cx, cy - 4, 14, '#fff6e8');
      text(matchMedia('(pointer: coarse)').matches ? 'TAP TO RETRY' : 'SPACE TO RETRY', cx, cy + 20, 9, '#ffd84a');
    } else if (mode === 'paused') {
      text('PAUSED', cx, cy, 14); text('SPACE TO RESUME', cx, cy + 22, 8, '#ffd84a');
    } else if (mode === 'countdown') {
      text(String(Math.ceil(S.countdown / 0.5)), cx, cy + 6, 22, '#ffd84a');
    }
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const s = dpr * scale;
    const shx = S.shake ? (Math.random() - 0.5) * S.shake : 0, shy = S.shake ? (Math.random() - 0.5) * S.shake : 0;
    ctx.setTransform(s, 0, 0, s, shx * s, shy * s);
    drawBackground();
    drawEntities();
    drawHero();
    drawParticles();
    if (S.flash > 0) { ctx.fillStyle = `rgba(255,80,60,${S.flash * 1.5})`; ctx.fillRect(0, 0, viewW, viewH); }
    ctx.setTransform(s, 0, 0, s, 0, 0);
    drawHUD();
    drawOverlay();
  }

  // ------------------------------------------------ loop
  let raf = 0, last = performance.now(), acc = 0, running = true;
  function frame(now) {
    if (!running) return;
    const elapsed = clamp((now - last) / 1000, 0, 0.1); last = now;
    clock += elapsed; acc += elapsed;
    while (acc >= DT) { step(DT); acc -= DT; }
    render();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    start() { if (mode === 'dead') reset(); start(); },
    jump: pressJump, release: releaseJump, duck: setDuck, pause, resume,
    reset() { reset(); mode = 'ready'; },
    setAutoplay(on) { autoplay = on; },
    setLookDown(on) {
      if (on === lookDown) return;
      lookDown = on; lookDownAt = clock;
      if (on && mode === 'playing') pause();
      emit('lookdown', on);
    },
    setMuted(m) { sfx.setMuted(m); },
    get muted() { return sfx.muted; },
    get mode() { return mode; },
    get score() { return Math.floor(S.score); },
    get hi() { return hi; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    // read-only peek for tests and reviewers
    debug() { return { mode, t: S.t, speed: S.speed, score: S.score, ents: S.ents.length, player: { ...S.p }, viewW, viewH }; },
    destroy() {
      running = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}

function createSilentSfx() {
  const n = () => {};
  return { unlock: n, muted: true, setMuted: n, jump: n, dbl: n, coin: n, stomp: n, power: n, warn: n, boom: n, hit: n, die: n, milestone: n };
}
