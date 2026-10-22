// Site-wide AI chat: a dock at the bottom of every page that opens a full-screen chat.
// While the agent is thinking, its bubble runs the mini runner, which the visitor can play.
//
//   mountChat({ respond })          respond(messages) -> Promise<string>
//   mountChat({ endpoint: '/api/chat' })   POST { messages } -> { reply }
//
// Anything inside [data-ai-chat] makes Maher look down at it on pages that show the game.
import { mountThinkingRunner } from './mini.js';

const ICON = {
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

export function mountChat({ respond, endpoint, note = '', placeholder = 'Ask about my work, process or availability' } = {}) {
  const ask = respond || (endpoint ? (messages) => postJSON(endpoint, messages) : null);
  if (!ask) throw new Error('mountChat needs respond() or endpoint');

  // ---------------------------------------------------------------- dock
  const dock = document.createElement('form');
  dock.className = 'ai-dock';
  dock.setAttribute('data-ai-chat', '');
  dock.setAttribute('autocomplete', 'off');
  dock.innerHTML = `
    <label class="ai-sr" for="ai-dock-input">Message Maher's agent</label>
    <input id="ai-dock-input" type="text" maxlength="500" placeholder="${placeholder}" />
    <button class="ai-send" type="submit" aria-label="Send message">${ICON.send}</button>`;
  document.body.appendChild(dock);

  // ---------------------------------------------------------------- full-screen chat
  const sheet = document.createElement('div');
  sheet.className = 'ai-chat';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'ai-chat-title');
  sheet.innerHTML = `
    <header class="ai-chat-bar">
      <div class="ai-chat-id">
        <span class="ai-dot" aria-hidden="true"></span>
        <h2 id="ai-chat-title">Maher's agent</h2>
        ${note ? `<span class="ai-note">${note}</span>` : ''}
      </div>
      <button class="ai-icon" type="button" data-close aria-label="Close chat">${ICON.close}</button>
    </header>
    <div class="ai-thread" role="log" aria-live="polite"></div>
    <form class="ai-composer" data-ai-chat autocomplete="off">
      <label class="ai-sr" for="ai-chat-input">Message</label>
      <input id="ai-chat-input" type="text" maxlength="500" placeholder="Ask a follow-up" />
      <button class="ai-send" type="submit" aria-label="Send message">${ICON.send}</button>
    </form>`;
  document.body.appendChild(sheet);

  const thread = sheet.querySelector('.ai-thread');
  const input = sheet.querySelector('#ai-chat-input');
  const dockInput = dock.querySelector('input');
  const messages = [];
  let busy = false;

  function open() {
    if (!sheet.hidden) return;
    sheet.hidden = false;
    document.documentElement.classList.add('ai-chat-open');
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    input.focus();
  }
  function close() {
    sheet.classList.remove('is-open');
    document.documentElement.classList.remove('ai-chat-open');
    sheet.hidden = true;
    dockInput.focus();
  }
  sheet.querySelector('[data-close]').addEventListener('click', close);
  sheet.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') trapFocus(e, sheet);
  });

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    open();
    messages.push({ role: 'user', content: text });
    bubble('user', text);
    const b = bubble('agent', '');
    b.classList.add('is-thinking');
    const stop = await mountThinkingRunner(b, { label: 'Thinking', hint: true });
    let reply;
    try { reply = await ask(messages.slice()); }
    catch { reply = 'I could not reach the agent just now. Try again in a moment, or use the contact page.'; }
    stop();
    b.classList.remove('is-thinking');
    b.textContent = reply;
    messages.push({ role: 'assistant', content: reply });
    thread.scrollTop = thread.scrollHeight;
    busy = false;
  }
  function bubble(who, text) {
    const el = document.createElement('div');
    el.className = `ai-msg ai-${who}`;
    el.textContent = text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
    return el;
  }

  dock.addEventListener('submit', (e) => { e.preventDefault(); const v = dockInput.value; dockInput.value = ''; send(v); });
  sheet.querySelector('.ai-composer').addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });

  return { open, close, send };
}

async function postJSON(url, messages) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
  if (!r.ok) throw new Error(String(r.status));
  const data = await r.json();
  return data.reply;
}

function trapFocus(e, root) {
  const f = [...root.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
