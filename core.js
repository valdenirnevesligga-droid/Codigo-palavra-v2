'use strict';
/* CÓDIGO PALAVRA 2 — núcleo: utilidades, save, áudio, voz, efeitos */
const $ = (s, e = document) => e.querySelector(s);
const V = $('#view');
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const sample = (a, n) => shuffle(a).slice(0, n);
const uniq = (a) => [...new Set(a)];
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const dayNum = (s) => Math.floor(new Date(s + 'T12:00:00').getTime() / 864e5);

/* ---------- SAVE ---------- */
const SAVE_KEY = 'codigo-palavra-v2';
const defaults = {
  xp: 0, coins: 0, bestCombo: 0, lv: {}, mast: {}, avatar: 'cyber', theme: 'ciano',
  ownedAv: ['cyber'], ownedTh: ['ciano'], auto: true, inv: { shield: 0, xp2: 0 }, ach: {},
  day: { d: '', prog: {}, claimed: {} }, streak: 0, lastDay: '', bonusDay: '',
  st: { ok: 0, err: 0, typed: 0, levels: 0, perfect: 0, plays: 0 }
};
function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch (e) { }
  const o = JSON.parse(JSON.stringify(defaults));
  Object.assign(o, s);
  o.inv = Object.assign({ shield: 0, xp2: 0 }, o.inv); o.st = Object.assign({}, defaults.st, o.st);
  if (!s.xp && !s.coins) { // migra progresso da versão 1, se existir
    try {
      const v1 = JSON.parse(localStorage.getItem('codigo-palavra-v1') || 'null');
      if (v1) { o.coins = v1.coins || 0; o.xp = Math.min(v1.xp || 0, 300); o.avatar = v1.avatar || 'cyber'; o.theme = v1.theme || 'ciano'; o.ownedAv = v1.ownedAv || ['cyber']; o.ownedTh = v1.ownedTh || ['ciano']; }
    } catch (e) { }
  }
  return o;
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
let S = load();

/* ---------- NÍVEL DO JOGADOR (até 60) ---------- */
const need = (l) => 100 + (l - 1) * 45;
function lvlInfo(xp = S.xp) {
  let l = 1, left = xp;
  while (l < 60 && left >= need(l)) { left -= need(l); l++; }
  return { l, cur: left, max: need(l), pct: l >= 60 ? 100 : Math.floor(left / need(l) * 100) };
}
const RANKS = [[1, 'Recruta'], [5, 'Aprendiz'], [10, 'Operador'], [16, 'Decodificador'], [23, 'Analista'], [31, 'Hacker'], [40, 'Mestre'], [50, 'Elite'], [58, 'Lenda']];
const rankName = (l) => RANKS.filter(r => l >= r[0]).pop()[1];

/* ---------- ÁUDIO: efeitos ---------- */
let AC;
function ac() {
  if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, t0, d, type = 'sine', v = .1) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05);
}
const sfx = {
  tap() { tone(520, 0, .07, 'triangle') },
  key() { tone(700, 0, .04, 'triangle', .06) },
  ok() { tone(660, 0, .1, 'square', .07); tone(880, .09, .18, 'square', .07) },
  err() { tone(220, 0, .18, 'sawtooth', .06); tone(170, .12, .22, 'sawtooth', .06) },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .11, .28, 'square', .07)) },
  boss() { [196, 196, 262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, i * .1, .3, 'sawtooth', .06)) },
  coin() { tone(988, 0, .08, 'square', .06); tone(1319, .08, .22, 'square', .06) },
  level() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * .09, .22, 'triangle', .1)) }
};
const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };

/* ---------- NARRAÇÃO (speechSynthesis pt-BR) ---------- */
let voice = null, readTok = 0;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => v.lang === 'pt-BR') || vs.find(v => v.lang.replace('_', '-').toLowerCase() === 'pt-br') || vs.find(v => v.lang.startsWith('pt')) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, o = {}) {
  const { rate = .9, cancel = true, onend } = o;
  if (!('speechSynthesis' in window)) { onend && onend(); return; }
  if (cancel) { readTok++; speechSynthesis.cancel(); }
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = 'pt-BR'; if (voice) u.voice = voice; u.rate = rate;
  if (onend) { u.onend = onend; u.onerror = onend; }
  speechSynthesis.speak(u);
}
const speakAuto = (t, o) => { if (S.auto) speak(t, o); };
const stopSpeech = () => { readTok++; if ('speechSynthesis' in window) speechSynthesis.cancel(); };
const LETTER = { A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'é', F: 'éfe', G: 'gê', H: 'agá', I: 'i', J: 'jota', K: 'cá', L: 'éle', M: 'ême', N: 'ene', O: 'ó', P: 'pê', Q: 'quê', R: 'érre', S: 'ésse', T: 'tê', U: 'u', V: 'vê', W: 'dáblio', X: 'xis', Y: 'ípsilon', Z: 'zê' };
const VOWELS = 'AEIOU';
const lettersSay = (s) => s.split('').map(c => LETTER[c] || c).join(' ');

/* ---------- UI: toast, texto flutuante, modal, confete ---------- */
function toast(t, ms = 2000) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), ms);
}
function floatText(t, x, y) {
  const el = document.createElement('div'); el.className = 'pop-xp'; el.textContent = t;
  el.style.left = (x || innerWidth / 2) + 'px'; el.style.top = (y || innerHeight / 2) + 'px';
  document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}
function openModal(html) { const m = $('#modal'); m.innerHTML = html; m.hidden = false; m.scrollTop = 0; }
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
function fit() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
addEventListener('resize', fit); fit();
function confetti(n = 90) {
  const cols = [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0ef', '#ffd23d', '#2dff9a', '#ff4fd8', '#fff'];
  for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .4, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 3, g: .38, s: 4 + Math.random() * 6, c: rnd(cols), r: Math.random() * 6, vr: (Math.random() - .5) * .4, l: 90 + Math.random() * 40 });
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.l > 0);
  parts.forEach(p => { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.l--; cx.save(); cx.scale(devicePixelRatio, devicePixelRatio); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.l / 30); cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); cx.restore(); });
  raf = parts.length ? requestAnimationFrame(loop) : 0;
  if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
}

/* ---------- INSTALAÇÃO PWA ---------- */
let deferred = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
addEventListener('appinstalled', () => { deferred = null; if (window.goHome) goHome(); });
async function installApp() {
  if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; if (window.goHome) goHome(); return; }
  const ios = isIOS();
  const steps = ios
    ? `<li><b>1.</b> No <b>Safari</b>, toque em <b>Compartilhar</b> ⬆️ (barra de baixo).</li><li><b>2.</b> Escolha <b>“Adicionar à Tela de Início”</b> ➕ e toque em <b>Adicionar</b>.</li>`
    : `<li><b>1.</b> Toque no menu <b>⋮</b> do navegador (canto superior).</li><li><b>2.</b> Escolha <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</li>`;
  openModal(`<div class="sheet"><h2>📲 Instalar no celular</h2><p style="color:var(--muted);margin:4px 0">Funciona offline depois de instalado.</p>
    <ul class="steps">${steps}</ul><div class="col">
    <button class="btn ghost" data-say="${ios ? 'Passo um: no Safari, toque em Compartilhar. Passo dois: escolha Adicionar à Tela de Início.' : 'Passo um: toque no menu de três pontinhos do navegador. Passo dois: escolha Instalar app.'}">🔊 Ouvir passos</button>
    <button class="btn" data-act="close">Entendi</button></div></div>`);
}
