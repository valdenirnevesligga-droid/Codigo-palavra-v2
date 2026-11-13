'use strict';
/* CÓDIGO PALAVRA 2 — mundos, loja, missões diárias, conquistas, perfil */
const WORLDS = [
  { n: 1, ico: '🎧', t: 'Decodificador de Sons', d: 'Letras, sons, rimas e sílabas', say: 'Mundo um. Decodificador de sons.', acts: ['ini', 'fin', 'vc', 'sil1', 'cnt', 'silN', 'inisil', 'rima', 'letraPal'] },
  { n: 2, ico: '⚙️', t: 'Forja de Sílabas', d: 'Monte e reconheça palavras', say: 'Mundo dois. Forja de sílabas.', acts: ['build', 'figura', 'falta', 'ouvir', 'certo'] },
  { n: 3, ico: '🧩', t: 'Missão Ortográfica', d: 'LH, NH, CH, RR, SS, R/L e ditado', say: 'Mundo três. Missão ortográfica.', acts: ['dig', 'certo', 'buildH', 'grupo', 'nasal', 'ditado'] },
  { n: 4, ico: '⚡', t: 'Conexão Rápida', d: 'Frases, ordem e erros', say: 'Mundo quatro. Conexão rápida.', acts: ['frase', 'ordemF', 'vf', 'cloze', 'erroF'] },
  { n: 5, ico: '💬', t: 'Mestre do Chat', d: 'Converse e escreva respostas', say: 'Mundo cinco. Mestre do chat.', acts: ['chatOp', 'chatSil', 'chatFrase', 'chatType', 'chatDigita'] },
  { n: 6, ico: '🔢', t: 'Números do Dia a Dia', d: 'Preços, horas, contas e datas', say: 'Mundo seis. Números do dia a dia.', acts: ['numOuvir', 'numLer', 'ordemNum', 'dias', 'preco', 'hora', 'conta', 'digitar'] },
  { n: 7, ico: '📖', t: 'Leitor Pro', d: 'Textos, ditado e compreensão', say: 'Mundo sete. Leitor Pro.', acts: ['texto', 'ordemTexto', 'vfTexto', 'erro', 'ditadoF', 'digFrase'] }
];
const LEVELS = 12, NEED_STARS = 18;
const lk = (w, L) => w + '-' + L;
const passed = (w, L) => !!(S.lv[lk(w, L)] && S.lv[lk(w, L)].s >= 1);
const wStars = (w) => { let s = 0; for (let L = 1; L <= LEVELS; L++) s += (S.lv[lk(w, L)] || {}).s || 0; return s; };
const totalStars = () => WORLDS.reduce((a, w) => a + wStars(w.n), 0);
const passedCount = () => Object.values(S.lv).filter(x => x.s >= 1).length;
const worldUnlocked = (w) => w === 1 || (passed(w - 1, LEVELS) && wStars(w - 1) >= NEED_STARS);
const levelUnlocked = (w, L) => worldUnlocked(w) && (L === 1 || passed(w, L - 1));
const mastered = () => Object.values(S.mast).filter(m => m.b >= 4).length;
function levelCfg(w, L) {
  const W = WORLDS[w - 1], n = W.acts.length, k = Math.min(n, 2 + Math.floor((L - 1) * (n - 1) / 11));
  let lo = 1, hi = 4;
  if (w <= 2) { [lo, hi] = L <= 3 ? [1, 1] : L <= 6 ? [1, 2] : L <= 9 ? [2, 3] : [2, 4]; }
  if (w === 3) { [lo, hi] = L <= 3 ? [2, 3] : L <= 7 ? [3, 3] : [3, 4]; }
  const boss = L === LEVELS;
  return { w, L, d: L, lo, hi, acts: boss ? W.acts : W.acts.slice(0, k), n: boss ? 15 : L >= 6 ? 10 : 8, boss, need: boss ? .75 : .6 };
}

/* ---------- LOJA ---------- */
const AV = {
  cyber: { n: 'Cyber', e: '🤖', p: 0 }, gamer: { n: 'Gamer', e: '🎮', p: 40 }, ninja: { n: 'Ninja', e: '🥷', p: 70 },
  hacker: { n: 'Hacker', e: '🧑‍💻', p: 100 }, espacial: { n: 'Espacial', e: '🚀', p: 140 }, piloto: { n: 'Piloto', e: '🧑‍🚀', p: 180 },
  mago: { n: 'Mago', e: '🧙', p: 220 }, dragao: { n: 'Dragão', e: '🐉', p: 260 }, lobo: { n: 'Lobo', e: '🐺', p: 300 }, alien: { n: 'Alien', e: '👽', p: 350 }
};
const TH = {
  ciano: { n: 'Ciano', a: '#00e5ff', b: '#7c4dff', p: 0 }, roxo: { n: 'Roxo', a: '#b26bff', b: '#ff4fd8', p: 60 },
  verde: { n: 'Matrix', a: '#22ff88', b: '#00c2ff', p: 80 }, laranja: { n: 'Lava', a: '#ff8a1f', b: '#ff3d6e', p: 100 },
  rosa: { n: 'Neon Rosa', a: '#ff3d9a', b: '#ffd23d', p: 120 }, vermelho: { n: 'Alerta', a: '#ff3b3b', b: '#ff9a3b', p: 150 },
  ouro: { n: 'Ouro', a: '#ffd23d', b: '#ff7a1a', p: 200 }, gelo: { n: 'Gelo', a: '#9be7ff', b: '#5aa9ff', p: 250 }
};
const POW = {
  shield: { n: 'Escudo', e: '🛡️', p: 25, d: 'Protege do 1º erro de uma fase', max: 5 },
  xp2: { n: 'XP em dobro', e: '⚡', p: 40, d: 'Dobra o XP de uma fase', max: 5 }
};
function applyTheme() { const t = TH[S.theme] || TH.ciano, r = document.documentElement.style; r.setProperty('--accent', t.a); r.setProperty('--accent2', t.b); }
function renderShop() {
  G = null; renderHud();
  const av = Object.entries(AV).map(([k, a]) => { const own = S.ownedAv.includes(k), sel = S.avatar === k;
    return `<div class="item ${sel ? 'sel' : ''}"><div class="em">${a.e}</div><b>${a.n}</b><button class="btn ${own ? 'ghost' : ''}" data-buy="av:${k}">${sel ? '✔ Em uso' : own ? 'Usar' : '🪙 ' + a.p}</button></div>`; }).join('');
  const th = Object.entries(TH).map(([k, t]) => { const own = S.ownedTh.includes(k), sel = S.theme === k;
    return `<div class="item ${sel ? 'sel' : ''}"><div class="sw" style="background:linear-gradient(135deg,${t.a},${t.b})"></div><b>${t.n}</b><button class="btn ${own ? 'ghost' : ''}" data-buy="th:${k}">${sel ? '✔ Em uso' : own ? 'Usar' : '🪙 ' + t.p}</button></div>`; }).join('');
  const pw = Object.entries(POW).map(([k, p]) => `<div class="item"><div class="em">${p.e}</div><b>${p.n} <small>(você tem ${S.inv[k]})</small></b><small>${p.d}</small><button class="btn" data-buy="pw:${k}">🪙 ${p.p}</button></div>`).join('');
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="home">←</button><h1 class="ttl">LOJA</h1><span class="chip coins" style="margin-left:auto">🪙 ${S.coins}</span></div>
    <h2>POWER-UPS</h2><div class="grid">${pw}</div><h2>AVATARES</h2><div class="grid">${av}</div><h2>TEMAS DE COR</h2><div class="grid">${th}</div></div>`;
}
function buy(spec) {
  const [kind, key] = spec.split(':');
  if (kind === 'pw') {
    const p = POW[key]; if (S.inv[key] >= p.max) { toast('Máximo de ' + p.max + ' no estoque'); return; }
    if (S.coins < p.p) return noCoins(); S.coins -= p.p; S.inv[key]++; sfx.coin(); toast(p.e + ' ' + p.n + ' comprado!');
  } else {
    const tbl = kind === 'av' ? AV : TH, own = kind === 'av' ? S.ownedAv : S.ownedTh;
    if (!own.includes(key)) { if (S.coins < tbl[key].p) return noCoins(); S.coins -= tbl[key].p; own.push(key); sfx.coin(); confetti(30); }
    if (kind === 'av') S.avatar = key; else { S.theme = key; applyTheme(); }
  }
  save(); renderShop(); checkAch();
}
function noCoins() { sfx.err(); toast('Faltam moedas! Complete fases 🪙'); speak('Faltam moedas. Complete fases para ganhar mais.'); }

/* ---------- MISSÕES DIÁRIAS ---------- */
const MTPL = [
  { k: 'levels', n: 2, t: 'Complete 2 fases', c: 15 }, { k: 'levels', n: 4, t: 'Complete 4 fases', c: 30 },
  { k: 'ok', n: 25, t: 'Acerte 25 desafios de primeira', c: 15 }, { k: 'ok', n: 60, t: 'Acerte 60 desafios de primeira', c: 30 },
  { k: 'combo', n: 6, t: 'Faça um combo de 6', c: 20 }, { k: 'combo', n: 10, t: 'Faça um combo de 10', c: 30 },
  { k: 'type', n: 8, t: 'Digite 8 palavras ou frases', c: 20 }, { k: 'stars', n: 4, t: 'Ganhe 4 estrelas', c: 20 },
  { k: 'review', n: 1, t: 'Faça 1 revisão inteligente', c: 20 }
];
function todayMissions() {
  const dn = dayNum(today()), out = [], used = new Set();
  for (let i = 0; out.length < 3 && i < 30; i++) { const m = MTPL[(dn * 7 + i * 4) % MTPL.length]; if (!used.has(m.k)) { used.add(m.k); out.push(Object.assign({ id: out.length }, m)); } }
  return out;
}
function ensureDay() {
  const t = today();
  if (S.day.d !== t) { S.day = { d: t, prog: {}, claimed: {} }; }
  if (S.lastDay !== t) { S.streak = (S.lastDay && dayNum(t) - dayNum(S.lastDay) === 1) ? S.streak + 1 : 1; S.lastDay = t; }
  save();
}
function bump(k, n = 1, max = false) { ensureDay(); S.day.prog[k] = max ? Math.max(S.day.prog[k] || 0, n) : (S.day.prog[k] || 0) + n; save(); }
function missionsReady() { ensureDay(); return todayMissions().filter(m => (S.day.prog[m.k] || 0) >= m.n && !S.day.claimed[m.id]).length; }
function renderMissions() {
  G = null; ensureDay(); renderHud();
  const bonus = S.bonusDay !== today(), bv = 10 + Math.min(S.streak, 10) * 5;
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="home">←</button><h1 class="ttl">MISSÕES</h1></div>
    <div class="card-box"><b>🔥 ${S.streak} ${S.streak === 1 ? 'dia' : 'dias'} seguidos</b><small>Volte todo dia para aumentar o bônus.</small>
      <button class="btn full" data-act="bonus" ${bonus ? '' : 'disabled'}>${bonus ? `🎁 Pegar bônus: +${bv} 🪙` : '✔ Bônus de hoje já pego'}</button></div>
    <h2>MISSÕES DE HOJE</h2>
    ${todayMissions().map(m => { const p = Math.min(S.day.prog[m.k] || 0, m.n), done = p >= m.n, cl = S.day.claimed[m.id];
    return `<div class="mission"><div class="mt"><b>${m.t}</b><div class="xpbar"><i style="width:${p / m.n * 100}%"></i></div><small>${p}/${m.n} · 🪙 ${m.c} + ⚡ 30 XP</small></div>
      <button class="btn ${done && !cl ? '' : 'ghost'}" data-claim="${m.id}" ${done && !cl ? '' : 'disabled'}>${cl ? '✔' : done ? 'Pegar' : '…'}</button>
      <button class="ear sm" data-say="${esc(m.t)}">🔊</button></div>`; }).join('')}
    <p class="muted">As missões mudam todo dia.</p></div>`;
}
function claimBonus() { ensureDay(); if (S.bonusDay === today()) return; const bv = 10 + Math.min(S.streak, 10) * 5; S.bonusDay = today(); S.coins += bv; save(); sfx.coin(); confetti(40); toast('🎁 +' + bv + ' moedas!'); checkAch(); renderMissions(); }
function claimMission(id) {
  const m = todayMissions().find(x => x.id === +id); if (!m || S.day.claimed[m.id] || (S.day.prog[m.k] || 0) < m.n) return;
  S.day.claimed[m.id] = 1; S.coins += m.c; save(); sfx.coin(); confetti(40); toast('Missão cumprida! +' + m.c + ' 🪙');
  G = { xp: 0 }; addXp(30); G = null; checkAch(); renderMissions();
}

/* ---------- CONQUISTAS ---------- */
const ACH = [
  { id: 'a1', ic: '🚀', t: 'Primeira missão', d: 'Complete 1 fase', c: 10, f: () => passedCount() >= 1 },
  { id: 'a2', ic: '🎯', t: 'Em ritmo', d: 'Complete 10 fases', c: 20, f: () => passedCount() >= 10 },
  { id: 'a3', ic: '🛰️', t: 'Explorador', d: 'Complete 25 fases', c: 40, f: () => passedCount() >= 25 },
  { id: 'a4', ic: '🌌', t: 'Veterano', d: 'Complete 50 fases', c: 80, f: () => passedCount() >= 50 },
  { id: 'a5', ic: '👑', t: 'Código completo', d: 'Complete todas as 84 fases', c: 300, f: () => passedCount() >= 84 },
  { id: 'b1', ic: '⭐', t: 'Estrelinha', d: 'Ganhe 15 estrelas', c: 15, f: () => totalStars() >= 15 },
  { id: 'b2', ic: '🌟', t: 'Brilhante', d: 'Ganhe 80 estrelas', c: 60, f: () => totalStars() >= 80 },
  { id: 'b3', ic: '💫', t: 'Constelação', d: 'Ganhe 180 estrelas', c: 150, f: () => totalStars() >= 180 },
  { id: 'c1', ic: '🔥', t: 'Combo 10', d: 'Acerte 10 seguidas', c: 20, f: () => S.bestCombo >= 10 },
  { id: 'c2', ic: '💥', t: 'Combo 20', d: 'Acerte 20 seguidas', c: 50, f: () => S.bestCombo >= 20 },
  { id: 'c3', ic: '☄️', t: 'Combo 35', d: 'Acerte 35 seguidas', c: 100, f: () => S.bestCombo >= 35 },
  { id: 'd1', ic: '✅', t: '100 acertos', d: '100 acertos de primeira', c: 25, f: () => S.st.ok >= 100 },
  { id: 'd2', ic: '🏅', t: '500 acertos', d: '500 acertos de primeira', c: 80, f: () => S.st.ok >= 500 },
  { id: 'd3', ic: '🏆', t: '1500 acertos', d: '1500 acertos de primeira', c: 200, f: () => S.st.ok >= 1500 },
  { id: 'e1', ic: '⌨️', t: 'Digitador', d: 'Digite 25 palavras', c: 30, f: () => S.st.typed >= 25 },
  { id: 'e2', ic: '✍️', t: 'Escritor', d: 'Digite 100 palavras', c: 100, f: () => S.st.typed >= 100 },
  { id: 'f1', ic: '👹', t: 'Caça-chefes', d: 'Vença 1 chefe', c: 40, f: () => WORLDS.some(w => passed(w.n, LEVELS)) },
  { id: 'f2', ic: '⚔️', t: 'Domador de chefes', d: 'Vença 4 chefes', c: 120, f: () => WORLDS.filter(w => passed(w.n, LEVELS)).length >= 4 },
  { id: 'f3', ic: '🐲', t: 'Lenda dos chefes', d: 'Vença os 7 chefes', c: 250, f: () => WORLDS.filter(w => passed(w.n, LEVELS)).length >= 7 },
  { id: 'g1', ic: '🧠', t: 'Memória boa', d: 'Domine 25 palavras', c: 40, f: () => mastered() >= 25 },
  { id: 'g2', ic: '📚', t: 'Dicionário', d: 'Domine 70 palavras', c: 120, f: () => mastered() >= 70 },
  { id: 'h1', ic: '📆', t: '3 dias seguidos', d: 'Jogue 3 dias em sequência', c: 30, f: () => S.streak >= 3 },
  { id: 'h2', ic: '🗓️', t: 'Semana completa', d: 'Jogue 7 dias em sequência', c: 120, f: () => S.streak >= 7 },
  { id: 'i1', ic: '⬆️', t: 'Nível 10', d: 'Chegue ao nível 10', c: 40, f: () => lvlInfo().l >= 10 },
  { id: 'i2', ic: '🔝', t: 'Nível 25', d: 'Chegue ao nível 25', c: 100, f: () => lvlInfo().l >= 25 },
  { id: 'i3', ic: '🏔️', t: 'Nível 40', d: 'Chegue ao nível 40', c: 200, f: () => lvlInfo().l >= 40 },
  { id: 'j1', ic: '💎', t: 'Perfeccionista', d: '5 fases com 3 estrelas', c: 50, f: () => S.st.perfect >= 5 },
  { id: 'j2', ic: '🔮', t: 'Impecável', d: '25 fases com 3 estrelas', c: 150, f: () => S.st.perfect >= 25 },
  { id: 'k1', ic: '🛍️', t: 'Estilo próprio', d: 'Compre um item na loja', c: 15, f: () => S.ownedAv.length > 1 || S.ownedTh.length > 1 },
  { id: 'k2', ic: '💰', t: 'Cofre cheio', d: 'Junte 500 moedas', c: 50, f: () => S.coins >= 500 }
];
function checkAch() {
  const got = ACH.filter(a => !S.ach[a.id] && a.f());
  if (!got.length) return;
  got.forEach((a, i) => { S.ach[a.id] = today(); S.coins += a.c; setTimeout(() => { sfx.level(); toast(`${a.ic} Conquista: ${a.t}! +${a.c} 🪙`, 2600); confetti(40); }, 900 + i * 2800); });
  save(); renderHud();
}
function renderAch() {
  G = null; renderHud(); const n = ACH.filter(a => S.ach[a.id]).length;
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="home">←</button><h1 class="ttl">CONQUISTAS</h1><span class="chip" style="margin-left:auto">${n}/${ACH.length}</span></div>
    <div class="alist">${ACH.map(a => { const ok = S.ach[a.id]; return `<div class="ach ${ok ? 'on' : ''}"><span class="ai">${ok ? a.ic : '🔒'}</span><div><b>${a.t}</b><small>${a.d}</small></div><span class="ac">${ok ? '✔' : '🪙 ' + a.c}</span></div>`; }).join('')}</div></div>`;
}

/* ---------- PERFIL ---------- */
function renderProfile() {
  G = null; renderHud(); const li = lvlInfo(), st = S.st;
  const hard = Object.entries(S.mast).filter(([, m]) => m.e > 0).sort((a, b) => (b[1].e - b[1].o * .3) - (a[1].e - a[1].o * .3)).slice(0, 8);
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="home">←</button><h1 class="ttl">PERFIL</h1></div>
    <div class="card-box center"><div class="em big">${AV[S.avatar].e}</div><b>${rankName(li.l)} · Nível ${li.l}</b>
      <div class="xpbar wide"><i style="width:${li.pct}%"></i></div><small>${li.l >= 60 ? 'Nível máximo!' : li.cur + ' / ' + li.max + ' XP'}</small></div>
    <div class="stats">
      <div><b>${passedCount()}/84</b><small>fases</small></div><div><b>${totalStars()}/252</b><small>estrelas</small></div>
      <div><b>${st.ok}</b><small>acertos de 1ª</small></div><div><b>${S.bestCombo}</b><small>melhor combo</small></div>
      <div><b>${st.typed}</b><small>digitadas</small></div><div><b>${mastered()}/${WORDS.length}</b><small>palavras dominadas</small></div>
      <div><b>${S.streak}</b><small>dias seguidos</small></div><div><b>${ACH.filter(a => S.ach[a.id]).length}/${ACH.length}</b><small>conquistas</small></div></div>
    <h2>PROGRESSO POR MUNDO</h2>
    ${WORLDS.map(w => `<div class="wprog"><span>${w.ico} ${w.n}</span><div class="xpbar wide"><i style="width:${wStars(w.n) / 36 * 100}%"></i></div><small>${wStars(w.n)}/36 ★</small></div>`).join('')}
    <h2>PALAVRAS PARA TREINAR</h2>
    ${hard.length ? `<div class="chips">${hard.map(([w]) => `<button class="chip" data-say="${esc(w.toLowerCase())}">${(WORD_BY[w] || {}).e || ''} ${w}</button>`).join('')}</div>` : '<p class="muted">Ainda sem erros registrados. Continue jogando!</p>'}
  </div>`;
}
