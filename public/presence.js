const button = document.querySelector('#room-button');
const dialog = document.querySelector('#room-dialog');
const status = document.querySelector('#room-status');
const invite = document.querySelector('#invite');
const leave = document.querySelector('#leave');
const link = document.querySelector('#room-link');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const visitor = crypto.randomUUID();
let room = null, lastTyped = 0, polling = false, timer = 0, controller, revision = 0;

export function typing() { lastTyped = Date.now(); }
function show(message, state = '') {
  if (status.textContent !== message) status.textContent = message;
  button.dataset.state = state;
  button.title = message;
  button.setAttribute('aria-label', `Shared silence: ${message}`);
}
function invitation() { return `${location.origin}${location.pathname}#room=${room}`; }
async function heartbeat() {
  if (!room || polling || document.hidden) return;
  const current = revision;
  polling = true;
  const requestController = new AbortController(); controller = requestController;
  const timeout = setTimeout(() => requestController.abort(), 6000);
  try {
    // Never include text, keystrokes, or timestamps from the writing surface.
    const response = await fetch('/api/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room, visitor, typing: Date.now() - lastTyped < 5000 }), signal: requestController.signal });
    if (!response.ok) throw new Error('Presence unavailable');
    const result = await response.json();
    if (current !== revision) return;
    show(result.typing ? 'Someone is writing with you.' : result.peers ? 'Someone is here with you.' : 'Waiting for someone to join.', result.typing ? 'typing' : result.peers ? 'here' : 'waiting');
  } catch {
    if (current === revision) show('Reconnecting. You can keep writing.', 'offline');
  } finally {
    clearTimeout(timeout);
    if (current === revision) { polling = false; timer = setTimeout(heartbeat, 3500); }
  }
}
function depart() {
  if (room) {
    const body = JSON.stringify({ room, visitor, typing: false, leave: true });
    navigator.sendBeacon?.('/api/presence', new Blob([body], { type: 'application/json' }));
  }
  revision++; clearTimeout(timer); controller?.abort(); polling = false;
}
function join(next) {
  depart(); room = next; leave.hidden = !room; link.hidden = true;
  invite.textContent = 'Copy invitation';
  if (room) { show('Joining…', 'waiting'); heartbeat(); }
  else show('Invite someone to write alongside you.');
}
button.addEventListener('click', () => dialog.showModal());
invite.addEventListener('click', async () => {
  if (!room) { const next = crypto.randomUUID(); history.replaceState(null, '', `#room=${next}`); join(next); }
  try { await navigator.clipboard.writeText(invitation()); invite.textContent = 'Copied'; }
  catch { link.value = invitation(); link.hidden = false; link.focus(); link.select(); invite.textContent = 'Copy invitation'; }
});
leave.addEventListener('click', () => { join(null); history.replaceState(null, '', location.pathname + location.search); });
function readRoom() {
  const next = new URLSearchParams(location.hash.slice(1)).get('room');
  join(next && uuid.test(next) ? next : null);
}
window.addEventListener('hashchange', readRoom);
window.addEventListener('pagehide', depart);
window.addEventListener('pageshow', event => { if (event.persisted) readRoom(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { clearTimeout(timer); heartbeat(); } });
readRoom();
