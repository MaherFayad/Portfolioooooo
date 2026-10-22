// Mini runner: a small, auto-played version of the game used as the AI agent's "thinking" indicator.
// mountThinkingRunner(container, { label }) -> stop()
import { createRunner, loadAssets } from './runner.js';

export async function mountThinkingRunner(container, { label = 'Thinking' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'mini-runner';
  wrap.setAttribute('role', 'status');
  wrap.innerHTML = `<canvas aria-hidden="true"></canvas><span class="mini-label">${label}<span class="dots" aria-hidden="true"></span></span>`;
  container.appendChild(wrap);
  const canvas = wrap.querySelector('canvas');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: no scrolling world, only the label (WCAG 2.2 SC 2.3.3 / 2.2.2).
  if (reduced) { canvas.remove(); return () => wrap.remove(); }

  await loadAssets();
  const game = await createRunner(canvas, { mini: true, autoplay: true, sfx: false, keyboard: false });
  game.start();
  return () => { game.destroy(); wrap.remove(); };
}
