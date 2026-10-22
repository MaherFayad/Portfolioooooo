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
  el.classList.add('runner-bleed');
  el.innerHTML = '<canvas role="img" aria-label="Maher Runner. Press Space or tap to run and jump. Press Down to duck."></canvas>';
  const tools = document.createElement('div');
  tools.className = 'runner-tools';
  tools.innerHTML = `
    <span class="key-only"><kbd>Space</kbd>Jump, hold to go higher</span>
    <span class="key-only"><kbd>↓</kbd>Duck</span>
    <span class="touch-only">Tap to jump, swipe down to duck</span>
    <button class="runner-mute" type="button"></button>
    <span class="sr-only" aria-live="polite"></span>`;
  el.after(tools);

  const game = await createRunner(el.querySelector('canvas'), { frame: mobile ? FRAME_MOBILE : FRAME, entrance: true, ...opts });

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
  game.on((type, data) => {
    if (type === 'mute') syncMute();
    if (type === 'gameover') live.textContent = `Game over. Score ${data.score}. Best ${data.hi}. Press Space to retry.`;
  });

  // Look down at the site's AI chat while it has focus.
  const isChat = (t) => t?.closest?.('[data-ai-chat]');
  document.addEventListener('focusin', (e) => { if (isChat(e.target)) game.setLookDown(true); });
  document.addEventListener('focusout', (e) => { if (isChat(e.target)) game.setLookDown(false); });

  return game;
}
