const canvas = document.querySelector('#atmosphere');
const ctx = canvas.getContext('2d');
const paper = document.querySelector('.paper');
const logo = document.querySelector('#release');
const portal = document.querySelector('#portal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const tau = Math.PI * 2;
let sparks = [], stars = [], ripples = [], ghosts = [], energy = 0, lastType = 0, lastRipple = 0;
let lastFrame = 0, frame = 0, hold = 0, releasingAt = 0, onRelease;

function geometry() {
  const r = portal.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: r.width * .56 };
}
function resize() {
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * scale; canvas.height = innerHeight * scale;
  ctx?.setTransform(scale, 0, 0, scale, 0, 0); wake();
}
function wake() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }
function glow(x, y, radius, color, alpha) {
  if (!ctx) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${color},${alpha})`); gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}
function orbit(now, center, pressure) {
  if (!ctx) return;
  const { x, y, radius } = center;
  const time = reduced.matches ? 0 : now / 8000;
  const release = releasingAt ? Math.max(0, 1 - (now - releasingAt) / 1600) : 0;
  glow(x, y, radius * 3.1, '79,132,244', .13 + energy * .12 + pressure * .14);
  glow(x, y, radius * 1.25, '116,178,255', .04 + release * .18);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * tau;
    const bright = .25 + .55 * Math.pow((Math.sin(a * 2 - time * 3) + 1) / 2, 4);
    const r = radius * (1 + Math.sin(a * 3 + time) * .014 + energy * .025 + pressure * .09);
    ctx.strokeStyle = `rgba(163,205,255,${bright + pressure * .15})`;
    ctx.lineWidth = 1.1 + bright * 1.8 + pressure * 2;
    ctx.beginPath(); ctx.arc(x, y, r, a, a + tau / 72 + .008); ctx.stroke();
  }
  for (let i = 0; i < 48; i++) {
    const a = i * 2.39996 + time * (i % 2 ? .38 : -.25);
    const r = radius * (1.2 + (i % 7) * .068);
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .43;
    ctx.fillStyle = `rgba(198,218,255,${.18 + (i % 4) * .13})`;
    ctx.beginPath(); ctx.arc(px, py, .55 + i % 3 * .35, 0, tau); ctx.fill();
  }
  if (pressure) {
    ctx.strokeStyle = '#ffdca7'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, radius * .9, -Math.PI / 2, -Math.PI / 2 + tau * pressure); ctx.stroke();
  }
  if (release) {
    ctx.strokeStyle = `rgba(212,229,255,${release * .65})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, radius * (1 + (1 - release) * 2), 0, tau); ctx.stroke();
  }
  ctx.restore();
}
function draw(now) {
  frame = 0;
  if (document.hidden) return;
  if (lastFrame && now - lastFrame < 30) { wake(); return; }
  const dt = Math.min((now - (lastFrame || now)) / 1000, .2); lastFrame = now;
  energy *= Math.exp(-dt / 2.7);
  const center = geometry();
  const pressure = hold ? Math.min(1, (now - hold) / 1100) : 0;
  document.documentElement.style.setProperty('--pace', reduced.matches ? 0 : energy.toFixed(3));
  logo.style.setProperty('--hold', pressure);
  ctx?.clearRect(0, 0, innerWidth, innerHeight);
  orbit(now, center, pressure);
  ripples = ripples.filter(p => {
    const age = (now - p.born) / 1000;
    if (age >= 1) return false;
    if (ctx) {
      ctx.strokeStyle = `rgba(171,205,255,${(1 - age) * .35})`; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 + age * 50, 3 + age * 16, -.15, 0, tau); ctx.stroke();
      glow(p.x, p.y, 25 + age * 15, '124,182,255', (1 - age) * .09);
    }
    return true;
  });
  sparks = sparks.filter(p => {
    const age = (now - p.born) / p.life;
    if (age >= 1) return false;
    const eased = age * age * (3 - 2 * age);
    const angle = p.angle + age * 3;
    const tx = center.x + Math.cos(angle) * center.radius;
    const ty = center.y + Math.sin(angle) * center.radius;
    const x = p.x + (tx - p.x) * eased + Math.sin(age * Math.PI) * p.curve;
    const y = p.y + (ty - p.y) * eased;
    if (ctx) {
      ctx.strokeStyle = `rgba(${p.color},${(1 - age) * .6})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.prevX ?? x, p.prevY ?? y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = `rgba(${p.color},${(1 - age) * .95})`;
      ctx.beginPath(); ctx.arc(x, y, p.size * (1 - age * .4), 0, tau); ctx.fill();
      glow(x, y, p.size * 6, p.color, (1 - age) * .18);
    }
    p.prevX = x; p.prevY = y; return true;
  });
  stars = stars.filter(s => {
    const age = (now - s.born) / 75000;
    if (age >= 1) return false;
    const x = s.x * innerWidth, y = s.y * innerHeight;
    if (ctx) {
      ctx.fillStyle = `rgba(211,228,255,${(1 - age) * .72})`;
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, tau); ctx.fill();
      glow(x, y, 9, '166,203,255', (1 - age) * .19);
    }
    return true;
  });
  ghosts = ghosts.filter(g => {
    const age = (now - g.born) / 1450;
    if (age >= 1) return false;
    const scale = Math.pow(1 - age, 1.4), spin = age * age * 3.2;
    const dx = g.x - center.x, dy = g.y - center.y;
    const x = center.x + (dx * Math.cos(spin) - dy * Math.sin(spin)) * scale;
    const y = center.y + (dx * Math.sin(spin) + dy * Math.cos(spin)) * scale;
    if (ctx) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(spin * .3); ctx.scale(scale, scale);
      ctx.font = g.font; ctx.textBaseline = 'top'; ctx.fillStyle = `rgba(228,239,255,${g.opacity * (1 - age)})`; ctx.fillText(g.text, 0, 0); ctx.restore();
    }
    return true;
  });
  if (pressure === 1) { cancelHold(); onRelease?.(); }
  if (!reduced.matches || hold || ghosts.length) wake();
  else lastFrame = 0;
}
function sparkle(x, y, count = 1, color = '196,220,255') {
  if (reduced.matches || document.hidden) return;
  for (let i = 0; i < count && sparks.length < 160; i++) sparks.push({ x, y, size: 1.1 + Math.random(), curve: (Math.random() - .5) * 170, angle: Math.random() * tau, color, born: performance.now(), life: 1600 + Math.random() * 900 });
  wake();
}
export function rhythm(point, complete = false) {
  const now = performance.now(), bounds = paper.getBoundingClientRect();
  energy = Math.min(1, energy + (now - lastType < 220 ? .14 : .1)); lastType = now;
  const p = point || { x: bounds.left + 20, y: bounds.top + 20 };
  if (!reduced.matches && now - lastRipple > 130) {
    ripples.push({ ...p, born: now }); ripples = ripples.slice(-8); lastRipple = now;
    sparkle(p.x, p.y, complete ? 4 : 1, complete ? '255,216,160' : '164,207,255');
  }
  wake();
}
export function dust(span) {
  if (reduced.matches || document.hidden) return;
  const bounds = paper.getBoundingClientRect();
  for (const r of [...span.getClientRects()].slice(0, 2)) {
    if (r.bottom < bounds.top || r.top > bounds.bottom) continue;
    for (let i = 0; i < 4; i++) sparkle(r.left + Math.random() * Math.min(r.width, 120), r.top + r.height * .5);
  }
}
export function paragraph() {
  const bounds = paper.getBoundingClientRect();
  stars.push({ x: Math.min(innerWidth - 20, bounds.right + 16 + Math.random() * 28) / innerWidth, y: Math.min(innerHeight - 30, bounds.top + Math.random() * Math.min(bounds.height, innerHeight * .45)) / innerHeight, born: performance.now() });
  stars = stars.slice(-24); wake();
}
export function clearAtmosphere() { stars = []; ghosts = []; sparks = []; ripples = []; energy = 0; wake(); }
export function dissolve() {
  if (reduced.matches) return;
  releasingAt = performance.now();
  const bounds = paper.getBoundingClientRect();
  const font = getComputedStyle(document.querySelector('#editor')).font;
  for (const span of document.querySelectorAll('#mirror span')) {
    const opacity = Number(span.style.opacity), r = span.getClientRects()[0];
    if (opacity < .025 || !r || r.bottom < bounds.top || r.top > bounds.bottom) continue;
    ghosts.push({ text: span.textContent.trim().slice(0, 120), x: r.left, y: r.top, opacity, font, born: releasingAt });
    dust(span); if (ghosts.length >= 70) break;
  }
  wake();
}
function cancelHold() { hold = 0; logo.style.setProperty('--hold', 0); document.body.classList.remove('holding'); }
export function releaseGesture(callback) {
  onRelease = callback;
  for (const control of [logo, portal]) {
    const start = () => { hold = performance.now(); document.body.classList.add('holding'); wake(); };
    control.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); control.setPointerCapture(event.pointerId); start();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) control.addEventListener(event, cancelHold);
    control.addEventListener('keydown', event => {
      if (![' ', 'Enter'].includes(event.key)) return;
      event.preventDefault(); if (!event.repeat) start();
    });
    control.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); cancelHold(); } });
    control.addEventListener('click', event => { if (event.detail === 0 && !hold) callback(); });
  }
}
window.addEventListener('resize', resize);
window.addEventListener('scroll', wake, { passive: true });
window.addEventListener('blur', cancelHold);
document.addEventListener('visibilitychange', () => {
  cancelHold(); if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastFrame = 0; } else wake();
});
reduced.addEventListener('change', () => { if (reduced.matches) { sparks = []; ripples = []; ghosts = []; } wake(); });
resize();
