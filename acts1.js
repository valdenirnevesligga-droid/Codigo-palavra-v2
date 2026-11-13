'use strict';
/* CÓDIGO PALAVRA 2 — atividades dos Mundos 1, 2 e 3 (letras, sílabas, ortografia) */
const ACTS = {};
const FILL = { LH: ['NH', 'CH', 'L'], NH: ['LH', 'CH', 'N'], CH: ['LH', 'NH', 'X'], RR: ['R', 'SS', 'LL'], SS: ['S', 'Ç', 'RR'], 'Ç': ['SS', 'S', 'C'] };
const NEAR = { B: 'PDV', P: 'BTD', D: 'TBG', T: 'DPC', V: 'FBZ', F: 'VPS', C: 'GKS', G: 'CJQ', Q: 'GCK', S: 'ZCX', Z: 'SXJ', M: 'NBP', N: 'MLH', J: 'GXH', R: 'LHP', L: 'RNM', X: 'SZC', H: 'RNM' };
const nOpt = (c) => c.d <= 4 ? 3 : c.d <= 8 ? 4 : 5;

function wpool(c) { const p = WORDS.filter(x => x.t >= c.lo && x.t <= c.hi); return p.length >= 8 ? p : WORDS; }
function pickWord(c, filter) {
  let p = wpool(c); if (filter) { const f = p.filter(filter); p = f.length ? f : WORDS.filter(filter); }
  c.used = c.used || new Set();
  let cand = p.filter(x => !c.used.has(x.w)); if (!cand.length) { c.used.clear(); cand = p; }
  cand = cand.map(x => ({ x, k: (S.mast[x.w] ? S.mast[x.w].b : 0) + Math.random() * 3 })).sort((a, b) => a.k - b.k);
  const w = cand[0].x; c.used.add(w.w); return w;
}
function mkChoice(prompt, say, items, correctL, extra) {
  const seen = new Set(), opts = shuffle(items.filter(o => !seen.has(o.l) && seen.add(o.l)));
  return Object.assign({ kind: 'choice', prompt, say, options: opts, ans: opts.findIndex(o => o.l === correctL) }, extra || {});
}
const wl = (x) => ({ l: x.e + ' ' + x.w, say: x.w.toLowerCase() });
function letterOpts(correct, c) {
  const pool = (NEAR[correct] || '').split('').filter(l => LETTER[l]);
  const out = [correct]; const base = c.d >= 5 ? pool.concat(Object.keys(LETTER)) : Object.keys(LETTER);
  for (const l of shuffle(base)) { if (out.length >= nOpt(c)) break; if (!out.includes(l) && LETTER[l]) out.push(l); }
  return out.map(l => ({ l, say: LETTER[l] }));
}
function others(c, it, n, f) { return sample(wpool(c).filter(x => x.w !== it.w && (!f || f(x))), n); }
function sylDistract(c, it, pos, n) {
  const target = it.s[pos]; const all = uniq(wpool(c).flatMap(x => x.s).filter(s => s !== target && it.s.indexOf(s) < 0));
  const same = shuffle(all.filter(s => s[0] === target[0])); const rest = shuffle(all.filter(s => s[0] !== target[0]));
  return (c.d >= 5 ? same.concat(rest) : rest.concat(same)).slice(0, n);
}

/* ===== MUNDO 1 — Decodificador de Sons ===== */
ACTS.ini = (c) => {
  const it = pickWord(c), a = strip(it.w)[0];
  return mkChoice('Qual letra COMEÇA a palavra?', `Qual letra começa a palavra: ${it.w.toLowerCase()}?`, letterOpts(a, c), a,
    { big: '❓', reveal: `${it.w} ${it.e}`, okSay: `Isso! ${LETTER[a]} de ${it.w.toLowerCase()}.`, failSay: `Quase! A letra certa é ${LETTER[a]}.`, word: it.w });
};
ACTS.fin = (c) => {
  const it = pickWord(c), a = strip(it.w).slice(-1);
  return mkChoice('Qual letra TERMINA a palavra?', `Qual letra termina a palavra: ${it.w.toLowerCase()}?`, letterOpts(a, c), a,
    { big: '❓', reveal: `${it.w} ${it.e}`, okSay: `Muito bem! ${LETTER[a]}.`, failSay: `Quase! A palavra termina com ${LETTER[a]}.`, word: it.w });
};
ACTS.vc = (c) => {
  const L = rnd(Object.keys(LETTER)), v = VOWELS.includes(L);
  return mkChoice('Vogal ou consoante?', `A letra ${LETTER[L]} é vogal ou consoante?`,
    [{ l: 'VOGAL', say: 'vogal' }, { l: 'CONSOANTE', say: 'consoante' }], v ? 'VOGAL' : 'CONSOANTE',
    { big: L, cls: 'two', okSay: v ? 'Isso! É vogal.' : 'Isso! É consoante.', failSay: v ? 'Quase! É vogal.' : 'Quase! É consoante.' });
};
ACTS.sil1 = (c) => {
  const it = pickWord(c), f = it.s[0], d = sylDistract(c, it, 0, nOpt(c) - 1);
  return mkChoice('Qual SÍLABA começa a palavra?', `Qual sílaba começa a palavra: ${it.w.toLowerCase()}?`,
    [f, ...d].map(s => ({ l: s, say: s.toLowerCase() })), f,
    { big: '❓', reveal: `${it.w} ${it.e}`, okSay: `Isso! ${f.toLowerCase()}.`, failSay: `Quase! A sílaba é ${f.toLowerCase()}.`, word: it.w });
};
ACTS.silN = (c) => {
  const it = pickWord(c, x => x.s.length >= 2), p = it.s.length - 1, f = it.s[p], d = sylDistract(c, it, p, nOpt(c) - 1);
  return mkChoice('Qual SÍLABA termina a palavra?', `Qual sílaba termina a palavra: ${it.w.toLowerCase()}?`,
    [f, ...d].map(s => ({ l: s, say: s.toLowerCase() })), f,
    { big: '❓', reveal: `${it.w} ${it.e}`, okSay: `Isso! ${f.toLowerCase()}.`, failSay: `Quase! A sílaba é ${f.toLowerCase()}.`, word: it.w });
};
ACTS.cnt = (c) => {
  const it = pickWord(c), n = it.s.length;
  const nums = uniq([n, n - 1, n + 1, n + 2, n - 2].filter(x => x >= 1 && x <= 7)).slice(0, nOpt(c));
  if (!nums.includes(n)) nums[0] = n;
  return mkChoice('Quantas SÍLABAS?', `Quantas sílabas tem a palavra: ${it.w.toLowerCase()}? ${it.s.map(s => s.toLowerCase()).join(', ')}`,
    nums.map(x => ({ l: String(x), say: numWords(x) })), String(n),
    { big: it.e, cls: 'num', reveal: `${it.s.join(' · ')}`, okSay: `Isso! ${numWords(n)} sílabas.`, failSay: `Quase! São ${numWords(n)} sílabas.`, word: it.w });
};
ACTS.rima = (c) => {
  const idx = {}; wpool(c).forEach(x => { const k = strip(x.s[x.s.length - 1]); (idx[k] = idx[k] || []).push(x); });
  const keys = Object.keys(idx).filter(k => idx[k].length >= 2);
  if (!keys.length) return ACTS.inisil(c);
  const k = rnd(keys), pair = sample(idx[k], 2), it = pair[0], rhyme = pair[1];
  const d = others(c, it, nOpt(c) - 1, x => strip(x.s[x.s.length - 1]) !== k && x.w !== rhyme.w);
  return mkChoice('Qual palavra RIMA?', `Qual palavra rima com ${it.w.toLowerCase()}? Termina com o mesmo som.`,
    [rhyme, ...d].map(wl), wl(rhyme).l, { big: `${it.e} ${it.w}`, cls: 'words', okSay: `Isso! ${it.w.toLowerCase()} rima com ${rhyme.w.toLowerCase()}.`, failSay: `Quase! Rima com ${rhyme.w.toLowerCase()}.`, word: it.w });
};
ACTS.inisil = (c) => {
  const it = pickWord(c), f = it.s[0];
  const d = others(c, it, nOpt(c) - 1, x => x.s[0] !== f);
  return mkChoice('Qual palavra começa com esta sílaba?', `Qual palavra começa com a sílaba ${f.toLowerCase()}?`,
    [it, ...d].map(wl), wl(it).l, { big: f, cls: 'words', okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! É ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.letraPal = (c) => {
  const it = pickWord(c), L = strip(it.w)[0];
  const d = others(c, it, nOpt(c) - 1, x => strip(x.w)[0] !== L);
  return mkChoice('Qual palavra começa com esta letra?', `Qual palavra começa com a letra ${LETTER[L]}?`,
    [it, ...d].map(wl), wl(it).l, { big: L, cls: 'words', okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! É ${it.w.toLowerCase()}.`, word: it.w });
};

/* ===== MUNDO 2 — Forja de Sílabas ===== */
function mkPool(it, c, bonus = 0) {
  const ex = (c.d <= 3 ? 0 : c.d <= 7 ? 1 : c.d <= 10 ? 2 : 3) + bonus;
  const extra = sample(uniq(wpool(c).flatMap(x => x.s)).filter(s => !it.s.includes(s)), ex);
  return shuffle(it.s.concat(extra));
}
ACTS.build = (c) => {
  const it = pickWord(c);
  return { kind: 'seq', prompt: 'Monte a palavra', say: `Monte a palavra: ${it.w.toLowerCase()}`, emoji: it.e, slots: it.s, pool: mkPool(it, c), final: it.w.toLowerCase(), word: it.w };
};
ACTS.ouvir = (c) => {
  const it = pickWord(c), L = it.w[0];
  const d = others(c, it, nOpt(c) - 1, x => Math.abs(x.w.length - it.w.length) <= 2 && (c.d < 5 || x.w[0] === L));
  while (d.length < nOpt(c) - 1) d.push(...others(c, it, 1, x => !d.includes(x))); // completa
  return mkChoice('Ouça e toque na palavra escrita', `Toque na palavra: ${it.w.toLowerCase()}`,
    [it, ...d].map(x => ({ l: x.w, say: x.w.toLowerCase() })), it.w, { big: '🎧', cls: 'words', okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! É ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.falta = (c) => {
  const it = pickWord(c, x => x.s.length >= 2), p = ri(0, it.s.length - 1), f = it.s[p];
  const pat = it.s.map((s, i) => i === p ? '__' : s).join('·');
  const d = sylDistract(c, it, p, nOpt(c) - 1);
  return mkChoice('Qual sílaba FALTA?', `Qual sílaba falta na palavra ${it.w.toLowerCase()}?`, [f, ...d].map(s => ({ l: s, say: s.toLowerCase() })), f,
    { big: pat, emoji: it.e, cls: 'small', reveal: it.w, okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! Falta ${f.toLowerCase()}.`, word: it.w });
};
const SWAPS = [['SS', 'S'], ['S', 'SS'], ['RR', 'R'], ['LH', 'LI'], ['NH', 'NI'], ['CH', 'X'], ['Ç', 'SS'], ['Ç', 'S'], ['Z', 'S'], ['S', 'Z'], ['G', 'J'], ['J', 'G'], ['Ã', 'AO'], ['QU', 'K'], ['E', 'I'], ['O', 'U'], ['L', 'U'], ['M', 'N']];
function misspell(w) {
  const outs = new Set();
  shuffle(SWAPS).forEach(([a, b]) => { const i = w.indexOf(a); if (i >= 0) { const m = w.slice(0, i) + b + w.slice(i + a.length); if (m !== w) outs.add(m); } });
  for (let k = 0; k < 6 && outs.size < 4; k++) { const i = ri(1, w.length - 2); const m = k % 2 ? w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2) : w.slice(0, i) + w.slice(i + 1); if (m !== w) outs.add(m); }
  return [...outs];
}
ACTS.certo = (c) => {
  const it = pickWord(c, x => x.w.length >= 4), bad = sample(misspell(it.w), nOpt(c) - 1);
  return mkChoice('Qual está escrito CERTO?', `Qual é a escrita certa da palavra ${it.w.toLowerCase()}?`,
    [it.w, ...bad].map(w => ({ l: w, say: it.w.toLowerCase() })), it.w, { emoji: it.e, cls: 'words', okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! O certo é ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.figura = (c) => {
  const it = pickWord(c), d = others(c, it, nOpt(c) - 1);
  return mkChoice('Qual palavra combina com a figura?', `Qual palavra combina com esta figura?`,
    [it, ...d].map(x => ({ l: x.w, say: x.w.toLowerCase() })), it.w, { big: it.e, cls: 'words', okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! É ${it.w.toLowerCase()}.`, word: it.w });
};

/* ===== MUNDO 3 — Missão Ortográfica ===== */
ACTS.dig = (c) => {
  const it = pickWord(c, x => /LH|NH|CH|RR|SS|Ç/.test(x.w)), m = it.w.match(/LH|NH|CH|RR|SS|Ç/)[0];
  const pat = it.w.replace(m, '_'.repeat(m.length));
  const opts = [m, ...sample(FILL[m], Math.min(nOpt(c) - 1, 3))];
  return mkChoice('Complete a palavra', `Qual letra ou grupo falta na palavra ${it.w.toLowerCase()}?`, opts.map(l => ({ l, say: l.length === 1 ? (LETTER[l] || l.toLowerCase()) : lettersSay(l) })), m,
    { big: pat, emoji: it.e, cls: 'small', reveal: it.w, okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! O certo é ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.grupo = (c) => {
  const it = pickWord(c, x => /(BR|TR|PL|FL|GR|CR|PR|BL|CL|FR|DR|GL)/.test(x.w)), m = it.w.match(/(BR|TR|PL|FL|GR|CR|PR|BL|CL|FR|DR|GL)/)[0];
  const i = it.w.indexOf(m) + 1, miss = it.w[i], pat = it.w.slice(0, i) + '_' + it.w.slice(i + 1);
  const opts = uniq([miss, miss === 'R' ? 'L' : 'R', 'N', 'S']).slice(0, nOpt(c) > 3 ? 3 : 2);
  return mkChoice('R ou L? Complete a palavra', `Qual letra falta na palavra ${it.w.toLowerCase()}?`, opts.map(l => ({ l, say: LETTER[l] })), miss,
    { big: pat, emoji: it.e, cls: 'num', reveal: it.w, okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! O certo é ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.nasal = (c) => {
  const it = pickWord(c, x => /[AEIOUÃÕ][MN][BCDFGJLPQSTVXZ]/.test(x.w)), mm = it.w.match(/[AEIOUÃÕ]([MN])[BCDFGJLPQSTVXZ]/);
  const i = mm.index + 1, pat = it.w.slice(0, i) + '_' + it.w.slice(i + 1), miss = mm[1];
  return mkChoice('M ou N? Complete a palavra', `Qual letra falta na palavra ${it.w.toLowerCase()}?`, ['M', 'N', 'NH'].map(l => ({ l, say: lettersSay(l) })), miss,
    { big: pat, emoji: it.e, cls: 'num', reveal: it.w, okSay: `Isso! ${it.w.toLowerCase()}.`, failSay: `Quase! O certo é ${it.w.toLowerCase()}.`, word: it.w });
};
ACTS.buildH = (c) => {
  const it = pickWord(c, x => x.t >= 3 || x.s.length >= 3);
  return { kind: 'seq', prompt: 'Monte a palavra', say: `Monte a palavra: ${it.w.toLowerCase()}`, emoji: it.e, slots: it.s, pool: mkPool(it, c, 1), final: it.w.toLowerCase(), word: it.w };
};
ACTS.ditado = (c) => {
  const it = pickWord(c, x => x.w.length <= 11 || c.d >= 9);
  return { kind: 'type', mode: 'word', prompt: 'Ouça e escreva a palavra', say: `Escreva a palavra: ${it.w.toLowerCase()}`, emoji: c.d <= 8 ? it.e : '', target: it.w, final: it.w.toLowerCase(), word: it.w, typed: true };
};
