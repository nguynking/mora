// Only anonymous, short-lived presence reaches this worker. It accepts no notes.
async function presence(request, db) {
  if (request.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return Response.json({ error: 'Use JSON.' }, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'Missing presence.' }, { status: 400 });
  let raw = '', size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 512) { await reader.cancel(); return Response.json({ error: 'Presence payload too large.' }, { status: 413 }); }
    raw += decoder.decode(value, { stream: true });
  }
  let input;
  try { input = JSON.parse(raw + decoder.decode()); } catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
  if (!input || typeof input !== 'object' || Object.keys(input).some(k => !['room', 'visitor', 'typing', 'leave'].includes(k)) || typeof input.room !== 'string' || typeof input.visitor !== 'string' || !uuid.test(input.room) || !uuid.test(input.visitor) || typeof input.typing !== 'boolean' || (input.leave !== undefined && typeof input.leave !== 'boolean')) {
    return Response.json({ error: 'Invalid presence.' }, { status: 400 });
  }
  if (!db) return Response.json({ error: 'Presence unavailable.' }, { status: 503 });
  const { room, visitor, typing, leave } = input, now = Date.now();
  const changes = [db.prepare('DELETE FROM presence WHERE seen < ?').bind(now - 30000)];
  changes.push(leave
    ? db.prepare('DELETE FROM presence WHERE room = ? AND visitor = ?').bind(room, visitor)
    : db.prepare('INSERT INTO presence (room, visitor, seen, typing) VALUES (?, ?, ?, ?) ON CONFLICT (room, visitor) DO UPDATE SET seen = excluded.seen, typing = excluded.typing').bind(room, visitor, now, typing ? now : 0));
  changes.push(db.prepare('SELECT COUNT(*) AS peers, MAX(typing) AS last_typing FROM presence WHERE room = ? AND visitor != ? AND seen > ?').bind(room, visitor, now - 12000));
  const results = await db.batch(changes);
  const peer = results[2].results[0];
  return Response.json({ peers: Math.min(peer.peers, 99), typing: peer.last_typing > now - 7000 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/presence') {
      let response;
      try { response = await presence(request, env.DB); }
      catch { response = Response.json({ error: 'Presence unavailable.' }, { status: 503 }); }
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }
    const asset = assets[url.pathname === '/index.html' ? '/' : url.pathname];
    if (!asset || !['GET', 'HEAD'].includes(request.method)) return new Response('Not found', { status: 404 });
    const body = request.method === 'HEAD' ? null : asset.base64 ? Uint8Array.from(atob(asset.body), c => c.charCodeAt(0)) : asset.body;
    return new Response(body, { headers: {
      'Content-Type': asset.type + (asset.base64 ? '' : '; charset=utf-8'),
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'",
    } });
  },
};
