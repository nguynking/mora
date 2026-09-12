const canvas = document.querySelector('#atmosphere');
const ctx = canvas.getContext('2d');
const paper = document.querySelector('.paper');
const logo = document.querySelector('#release');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let particles = [], stars = [], energy = 0, lastType = 0, lastFrame = 0, frame = 0, hold = 0, onRelease;

function resize() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * scale; canvas.height = innerHeight * scale;
  ctx?.setTransform(scale, 0, 0, scale, 0, 0);
  wake();
}
function wake() { if (!frame) frame = requestAnimationFrame(draw); }
function draw(now) {
  frame = 0;
  const dt = Math.min((now - (lastFrame || now)) / 1000, .1); lastFrame = now;
  energy *= Math.exp(-dt / 2.5);
  document.documentElement.style.setProperty('--pace', reduced.matches ? 0 : energy.toFixed(3));
  document.documentElement.style.setProperty('--drift', reduced.matches ? '0px' : `${Math.sin(now / 3500) * energy * 18}px`);
  ctx?.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => {
    const age = (now - p.born) / p.life;
    if (age >= 1) return false;
    if (ctx) {
      ctx.fillStyle = `rgba(47,80,180,${(1 - age) * .3})`;
      ctx.beginPath(); ctx.arc(p.x + p.dx * age, p.y - p.dy * age, p.size * (1 - age / 2), 0, Math.PI * 2); ctx.fill();
    }
    return true;
  });
  stars = stars.filter(s => {
    const age = (now - s.born) / 75000;
    if (age >= 1) return false;
    if (ctx) {
      const x = s.x * innerWidth, y = s.y * innerHeight;
      ctx.fillStyle = `rgba(47,80,180,${Math.min(1, (now - s.born) / 900) * (1 - age) * .4})`;
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    return true;
  });
  if (hold) {
    const progress = Math.min(1, (now - hold) / 1100);
    logo.style.setProperty('--hold', progress);
    if (progress === 1) { cancelHold(); onRelease?.(); }
  }
  if (energy > .003 || particles.length || stars.length || hold) wake();
  else { lastFrame = 0; document.documentElement.style.setProperty('--pace', 0); }
}
export function rhythm() {
  const now = performance.now();
  energy = Math.min(1, energy + (now - lastType < 220 ? .09 : .04));
  lastType = now; wake();
}
export function dust(span) {
  if (reduced.matches || document.hidden || !ctx) return;
  const bounds = paper.getBoundingClientRect();
  const rects = [...span.getClientRects()].filter(r => r.bottom > bounds.top && r.top < bounds.bottom);
  for (const r of rects.slice(0, 2)) {
    for (let i = 0; i < 4 && particles.length < 180; i++) {
      const x = r.left + Math.random() * Math.min(r.width, 160), y = r.top + r.height * (.35 + Math.random() * .3);
      if (y < bounds.top || y > bounds.bottom) continue;
      particles.push({ x, y, dx: 8 + Math.random() * 18, dy: 12 + Math.random() * 22, size: .6 + Math.random() * .7, born: performance.now(), life: 1400 + Math.random() * 900 });
    }
  }
  wake();
}
export function paragraph() {
  const bounds = paper.getBoundingClientRect();
  const right = Math.min(innerWidth - 16, bounds.right + 12 + Math.random() * 22);
  stars.push({ x: right / innerWidth, y: Math.min(innerHeight - 30, bounds.top + Math.random() * Math.min(bounds.height, innerHeight * .45)) / innerHeight, born: performance.now() });
  stars = stars.slice(-24); wake();
}
export function clearAtmosphere() { stars = []; energy = 0; wake(); }
export function dissolve() {
  if (reduced.matches) return;
  for (const span of document.querySelectorAll('#mirror span')) {
    if (Number(span.style.opacity) > .03) dust(span);
    if (particles.length >= 180) break;
  }
}
function cancelHold() { hold = 0; logo.style.setProperty('--hold', 0); }
export function releaseGesture(callback) {
  onRelease = callback;
  logo.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault(); logo.setPointerCapture(event.pointerId);
    hold = performance.now(); wake();
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) logo.addEventListener(event, cancelHold);
  logo.addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault(); if (!event.repeat) { hold = performance.now(); wake(); }
  });
  logo.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); cancelHold(); } });
  // Assistive technologies can activate a button without a physical key hold.
  logo.addEventListener('click', event => { if (event.detail === 0 && !hold) callback(); });
}
window.addEventListener('resize', resize);
window.addEventListener('blur', cancelHold);
document.addEventListener('visibilitychange', () => { cancelHold(); if (!document.hidden) wake(); });
reduced.addEventListener('change', () => { if (reduced.matches) particles = []; wake(); });
resize();
