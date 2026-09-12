import { rhythm, dust, paragraph, clearAtmosphere, dissolve, releaseGesture } from './effects.js';
import { typing } from './presence.js';

const editor = document.querySelector('#editor');
const mirror = document.querySelector('#mirror');
const lifetime = 30_000;
let text = '', born = [], fading = [], composing = false, releasing = false;
const emitted = new Map();

// Keep a native textarea for selection, mobile keyboards, and Vietnamese input.
// The mirror paints each word; timestamps never leave this page's memory.
function sync(event) {
  const next = editor.value;
  let start = 0, end = 0;
  while (start < text.length && start < next.length && text[start] === next[start]) start++;
  while (end < text.length - start && end < next.length - start && text[text.length - 1 - end] === next[next.length - 1 - end]) end++;
  born = born.slice(0, start).concat(Array(next.length - start - end).fill(Date.now()), born.slice(text.length - end));
  text = next;
  render();
  if (event) {
    rhythm(); typing();
    if (!composing && event.inputType === 'insertLineBreak' && next.slice(0, editor.selectionStart).split('\n').at(-2)?.trim()) paragraph();
  }
}

function render() {
  const now = Date.now();
  const fragment = document.createDocumentFragment();
  fading = [];
  for (const match of text.matchAll(/\S+\s*|\s+/gu)) {
    const chunk = match[0], index = match.index;
    // Completing a word starts its own clock, without refreshing older words.
    const wordLength = chunk.trimEnd().length || chunk.length;
    let latest = 0;
    for (let i = index; i < index + wordLength; i++) latest = Math.max(latest, born[i]);
    const span = document.createElement('span');
    span.textContent = chunk;
    span.style.opacity = Math.max(0, 1 - (now - latest) / lifetime).toFixed(3);
    if (now - latest < lifetime) fading.push({ span, latest, key: `${index}:${latest}` });
    fragment.append(span);
  }
  // A final newline needs a line box to match the native textarea's scrolling.
  fragment.append(document.createTextNode('\u200b'));
  mirror.replaceChildren(fragment);
  mirror.scrollTop = editor.scrollTop;
}

// Fade only the ink. Keep every character and line break in the layout so
// time passing never moves later words, changes selection, or shifts the caret.
function paint() {
  const now = Date.now();
  fading = fading.filter(({ span, latest, key }) => {
    const remaining = Math.max(0, 1 - (now - latest) / lifetime);
    if (remaining > 0 && remaining < .14 && !emitted.has(key)) { dust(span); emitted.set(key, now); }
    span.style.opacity = remaining.toFixed(3);
    return remaining > 0;
  });
  for (const [key, time] of emitted) if (now - time > lifetime) emitted.delete(key);
}

function reset() {
  text = ''; born = []; fading = []; emitted.clear();
  editor.value = ''; editor.scrollTop = 0; mirror.scrollTop = 0;
  mirror.replaceChildren(); clearAtmosphere();
}
releaseGesture(() => {
  if (!text || composing || releasing) return;
  releasing = true; editor.readOnly = true;
  dissolve(); document.body.classList.add('releasing');
  setTimeout(() => {
    reset(); document.body.classList.remove('releasing');
    editor.readOnly = false; releasing = false; editor.focus();
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700);
});

editor.addEventListener('input', sync);
editor.addEventListener('compositionstart', () => { composing = true; });
editor.addEventListener('compositionend', () => { composing = false; sync(); });
editor.addEventListener('scroll', () => { mirror.scrollTop = editor.scrollTop; });
// Do not let native undo bring back words whose lifetime has ended.
editor.addEventListener('beforeinput', event => {
  if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') event.preventDefault();
});
document.addEventListener('visibilitychange', paint);
window.addEventListener('pagehide', reset);
setInterval(() => { if (fading.length && !document.hidden) paint(); }, 120);
render();

// Optional browser agent access uses the same input path and never reads thoughts.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'write_thought', title: 'Write a thought',
      description: 'Append text to Mora. It fades to invisible in place after 30 seconds, without saving or uploading it.',
      inputSchema: { type: 'object', properties: { text: { type: 'string', minLength: 1, maxLength: 10000 } }, required: ['text'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input.text !== 'string' || !input.text.trim() || input.text.length > 10000) throw new Error('Provide 1 to 10000 characters.');
        if (composing || releasing) throw new Error('Wait until the current action is finished.');
        editor.value += (editor.value && !/\s$/.test(editor.value) ? ' ' : '') + input.text;
        sync();
        editor.focus();
        editor.setSelectionRange(text.length, text.length);
        editor.scrollTop = editor.scrollHeight;
        mirror.scrollTop = editor.scrollTop;
        return { written: true, disappearsAfterSeconds: 30 };
      }
    }, { signal: lifecycle.signal })).catch(() => {});
  } catch { /* Writing still works in browsers without WebMCP support. */ }
}
