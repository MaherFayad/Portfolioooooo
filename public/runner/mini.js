// Mini runner: the AI agent's "thinking" indicator. It plays itself, and the visitor can take over:
// tap it, or focus it and press Space or Up. After a few idle seconds the bot takes back control.
// mountThinkingRunner(container, { label, hint }) -> stop()
import { createRunner, loadAssets } from './runner.js';

export async function mountThinkingRunner(container, { label = 'Thinking', hint = false, theme = 'night' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'mini-runner';
  wrap.setAttribute('role', 'status');
  wrap.innerHTML = `<canvas tabindex="0" aria-label="Mini game while the agent thinks. Press Space to jump."></canvas>
    ${label ? `<span class="mini-label">${label}<span class="dots" aria-hidden="true"></span>${hint ? '<span class="mini-hint"> Tap the game to jump</span>' : ''}</span>` : ''}`;
  container.appendChild(wrap);
  const canvas = wrap.querySelector('canvas');

  // Reduced motion: no scrolling world, only the label (WCAG 2.2 SC 2.3.3, 2.2.2).
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove(); wrap.querySelector('.mini-hint')?.remove();
    return () => wrap.remove();
  }

  await loadAssets(theme);
  const game = await createRunner(canvas, { mini: true, autoplay: true, sfx: false, keyboard: false, theme });
  game.start();

  let idle = 0;
  const takeOver = () => {
    game.setAutoplay(false);
    clearTimeout(idle);
    idle = setTimeout(() => game.setAutoplay(true), 3000);
  };
  const down = () => { takeOver(); game.jump(); };
  const up = () => game.release();
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); down(); });
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (!e.repeat) down(); }
    if (e.code === 'ArrowDown') { e.preventDefault(); takeOver(); game.duck(true); }
  });
  canvas.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') up();
    if (e.code === 'ArrowDown') game.duck(false);
  });

  return () => { clearTimeout(idle); game.destroy(); wrap.remove(); };
}
