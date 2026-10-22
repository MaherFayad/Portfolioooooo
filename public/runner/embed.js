// Drop-in mount for the runner: <div data-runner></div> + mountRunner(el).
// The scene fades in once its art has loaded, and Maher looks down at any
// chat input on the page marked with [data-ai-chat] while it has focus.
import { createRunner } from './runner.js';

// Must match --runner-side / --runner-top in embed.css (fractions of the view).
const FRAME = { side: 0.12, top: 0.26 };
const FRAME_MOBILE = { side: 0.06, top: 0.22 };

const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>';

export async function mountRunner(el, opts = {}) {
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  el.classList.add('runner-wrap');
  el.innerHTML = `
    <div class="runner-bleed"><canvas role="img" aria-label="Maher Runner. Press Space or tap to play. Up jumps, Down ducks."></canvas></div>
    <div class="runner-stick" aria-hidden="true"><span class="runner-knob"></span></div>`;
  const tools = document.createElement('div');
  tools.className = 'runner-tools';
  tools.innerHTML = `
    <span class="key-only"><kbd>Space</kbd>Jump, hold to go higher</span>
    <span class="key-only"><kbd>↓</kbd>Duck</span>
    <span class="touch-only">Push the stick up to jump, down to duck</span>
    <button class="runner-mute" type="button"></button>
    <span class="sr-only" aria-live="polite"></span>`;
  el.after(tools);

  const game = await createRunner(el.querySelector('canvas'), { frame: mobile ? FRAME_MOBILE : FRAME, entrance: true, ...opts });
  game.canvas = el.querySelector('canvas');
  bindStick(el.querySelector('.runner-stick'), game);

  // fade in on the next frame, once the first render has happened
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-ready')));

  const mute = tools.querySelector('.runner-mute');
  const live = tools.querySelector('[aria-live]');
  const syncMute = () => {
    mute.innerHTML = game.muted ? ICON_OFF : ICON_ON;
    mute.setAttribute('aria-pressed', String(game.muted));
    mute.setAttribute('aria-label', game.muted ? 'Unmute sound' : 'Mute sound');
  };
  mute.addEventListener('click', () => { game.setMuted(!game.muted); syncMute(); });
  syncMute();
  // Touch screens: a run takes over the bottom of the screen (scene + stick), the chat dock steps aside.
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  game.on((type, data) => {
    if (touch && (type === 'start' || type === 'resume')) {
      root.classList.add('runner-playing');
      el.scrollIntoView({ block: 'end', behavior: reduced ? 'auto' : 'smooth' });
    }
    if (type === 'gameover' || type === 'pause') root.classList.remove('runner-playing');
    if (type === 'mute') syncMute();
    if (type === 'gameover') live.textContent = `Game over. Score ${data.score}. Best ${data.hi}. Press Space to retry.`;
  });

  // Look down at the site's AI chat while it has focus.
  const isChat = (t) => t?.closest?.('[data-ai-chat]');
  const onIn = (e) => { if (isChat(e.target)) game.setLookDown(true); };
  const onOut = (e) => { if (isChat(e.target)) game.setLookDown(false); };
  // hovering the chat counts too: on the live site the chat pill opens on click
  const onOver = (e) => { if (isChat(e.target) && !isChat(e.relatedTarget)) game.setLookDown(true); };
  const onLeave = (e) => { if (isChat(e.target) && !isChat(e.relatedTarget) && !isChat(document.activeElement)) game.setLookDown(false); };
  document.addEventListener('focusin', onIn);
  document.addEventListener('focusout', onOut);
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onLeave);

  // destroy() also removes everything mountRunner added (for client-side route changes)
  const destroyGame = game.destroy;
  game.destroy = () => {
    destroyGame();
    document.removeEventListener('focusin', onIn);
    document.removeEventListener('focusout', onOut);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onLeave);
    root.classList.remove('runner-playing');
    tools.remove();
    el.innerHTML = '';
    el.classList.remove('runner-wrap', 'is-ready');
  };
  return game;
}

// Touch analog stick: push up to jump (hold for a higher jump), pull down to duck.
function bindStick(stick, game) {
  const knob = stick.querySelector('.runner-knob');
  const R = 34, DEAD = 14; // max knob travel and dead zone, in CSS px
  let id = null, cy = 0, state = 0; // state: 1 up, -1 down, 0 neutral
  const set = (next) => {
    if (next === state) return;
    if (state === 1) game.release();
    if (state === -1) game.duck(false);
    if (next === 1) game.jump();
    if (next === -1) game.duck(true);
    state = next;
  };
  const move = (y) => {
    const dy = Math.max(-R, Math.min(R, y - cy));
    knob.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
    set(dy < -DEAD ? 1 : dy > DEAD ? -1 : 0);
  };
  stick.addEventListener('pointerdown', (e) => {
    e.preventDefault(); id = e.pointerId; stick.setPointerCapture(id);
    const r = stick.getBoundingClientRect(); cy = r.top + r.height / 2;
    stick.classList.add('is-active'); move(e.clientY);
  });
  stick.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e.clientY); });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null; stick.classList.remove('is-active');
    knob.style.transform = ''; set(0);
  };
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);
}
