// Regression: a notification section must never occupy a chat-layout grid cell.
// Check the actual production-rendered shell, including third-party component DOM.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const state = mkdtempSync(join(tmpdir(), 'mora-layout-'));
const server = spawn(process.execPath, ['./node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '8790'], { stdio: 'pipe' });
let logs = '';
server.stdout.on('data', data => logs += data);
server.stderr.on('data', data => logs += data);
try {
  let html;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { const response = await fetch('http://127.0.0.1:8790'); assert.equal(response.status, 200); html = await response.text(); break; }
    catch { if (attempt === 49) throw Error(logs); await new Promise(resolve => setTimeout(resolve, 200)); }
  }
  assert.match(html, /class="mora-app[^\"]*"[^>]*>\s*<aside class="chat-list"/, 'The chat list must be the first pane, with no notification section before it.');
  assert.match(html, /<\/aside>\s*<main class="conversation"/, 'The selected conversation must be the adjacent second pane.');
  assert.doesNotMatch(html, /class="(?:empty-)?wordmark"/, 'No wordmark in the app surface.');
  assert.match(html, /aria-label="Cuộc trò chuyện mới"/);
  assert.match(html, /id="chat-search"/);
  assert.match(html, /aria-label="Thu gọn danh sách"/, 'The sidebar can collapse to an avatar rail.');
  assert.match(html, /class="brand-mark"[^>]*><svg class="mora-mark/, 'The arch mark heads the room list.');
  assert.doesNotMatch(html, /newsreader|art-frame/i, 'The restored shell uses system typography and no decorative paintings.');
  console.log('PASS production shell: exactly adjacent chat panes, no intervening overlay, no wordmark, arch mark, system typography, search and new-chat controls present.');
} finally {
  server.kill('SIGTERM');
  if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve));
  rmSync(state, { recursive: true, force: true });
}
