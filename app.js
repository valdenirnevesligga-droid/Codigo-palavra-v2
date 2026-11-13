'use strict';
/* CÓDIGO PALAVRA 2 — fluxo principal: telas, fases, chefes, revisão */
let G = null;
const mult = () => !G ? 1 : G.combo >= 6 ? 3 : G.combo >= 3 ? 2 : 1;

function renderHud() {
  const li = lvlInfo();
  $('#hud-av').textContent = AV[S.avatar].e;
  $('#hud-lv').textContent = 'NV ' + li.l + ' · ' + rankName(li.l).toUpperCase();
  $('#hud-xpbar').style.width = li.pct + '%';
  $('#hud-coins').textContent = S.coins;
  const c = $('#hud-combo');
  if (G && G.combo >= 3) { c.hidden = false; c.textContent = '🔥 x' + mult(); } else c.hidden = true;
}
function addXp(n) {
  const before = lvlInfo().l; S.xp += n; if (G) G.xp = (G.xp || 0) + n; save();
  const after = lvlInfo().l;
  if (after > before) { sfx.level(); vib([60, 40, 60, 40, 120]); toast('⬆️ NÍVEL ' + after + ' · ' + rankName(after) + '!', 2400); confetti(60); speakAuto('Você subiu de nível!', { cancel: false }); checkAch(); }
  renderHud();
}

/* ---------- HOME ---------- */
function goHome() { stopSpeech(); G = null; renderHome(); }
window.goHome = goHome;
function nextTarget() {
  for (const W of WORLDS) for (let L = 1; L <= LEVELS; L++) if (levelUnlocked(W.n, L) && !passed(W.n, L)) return { w: W.n, L };
  return null;
}
function renderHome() {
  G = null; ensureDay(); renderHud();
  const t = nextTarget(), ready = missionsReady(), canRev = passedCount() >= 3, bonus = S.bonusDay !== today();
  V.innerHTML = `
    ${isStandalone() ? '' : '<button class="btn install" data-act="install">📲 Instalar App no Celular</button>'}
    <section class="hero"><h1>CÓDIGO<span>PALAVRA</span></h1>
      <p>${passedCount()}/84 fases · ${totalStars()}/252 ★ · 🔥 ${S.streak} ${S.streak === 1 ? 'dia' : 'dias'}</p>
      <button class="ear big" data-say="Bem-vindo ao Código Palavra! Toque em continuar para jogar a próxima fase.">🔊</button></section>
    ${t ? `<button class="btn full big" data-lvl="${t.w}:${t.L}">▶ CONTINUAR · Mundo ${t.w} · Fase ${t.L}</button>` : '<div class="card-box center"><b>👑 Você zerou o jogo!</b><small>Rejogue fases para ganhar 3 estrelas.</small></div>'}
    <div class="menu">
      <button class="mbtn" data-act="worlds"><span>🗺️</span>Mundos</button>
      <button class="mbtn" data-act="missions"><span>🎯</span>Missões${ready || bonus ? '<i class="badge">' + (ready + (bonus ? 1 : 0)) + '</i>' : ''}</button>
      <button class="mbtn" data-act="review" ${canRev ? '' : 'disabled'}><span>🧠</span>Revisão${canRev ? '' : ' 🔒'}</button>
      <button class="mbtn" data-act="ach"><span>🏅</span>Conquistas</button>
      <button class="mbtn" data-act="shop"><span>🛒</span>Loja</button>
      <button class="mbtn" data-act="profile"><span>📊</span>Perfil</button>
    </div>
    <div class="row"><button class="btn ghost" data-act="auto">${S.auto ? '🔊 Voz automática: LIGADA' : '🔇 Voz automática: DESLIGADA'}</button></div>
    <button class="link" data-act="reset">Zerar progresso</button>`;
}

/* ---------- MUNDOS E FASES ---------- */
function renderWorlds() {
  G = null; renderHud();
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="home">←</button><h1 class="ttl">MUNDOS</h1></div>
    <div class="worlds">${WORLDS.map(w => {
    const ok = worldUnlocked(w.n), st = wStars(w.n), prev = w.n > 1 ? WORLDS[w.n - 2] : null;
    const why = ok ? '' : `<small class="lock">🔒 Vença o chefe do mundo ${w.n - 1} com ${NEED_STARS}★ (você tem ${wStars(w.n - 1)}★)</small>`;
    return `<div class="world"><button class="w-main" data-world="${w.n}" ${ok ? '' : 'disabled'}>
      <span class="w-ico">${ok ? w.ico : '🔒'}</span>
      <span class="w-txt"><b>${w.n}. ${w.t}</b><small>${w.d}</small>${why}
        <span class="xpbar"><i style="width:${st / 36 * 100}%"></i></span></span>
      <span class="w-stars">${st}<small>/36★</small></span></button>
      <button class="ear" data-say="${w.say}" aria-label="Ouvir">🔊</button></div>`;
  }).join('')}</div></div>`;
}
function renderLevels(w) {
  G = null; renderHud(); const W = WORLDS[w - 1];
  V.innerHTML = `<div class="shop"><div class="g-top"><button class="icon" data-act="worlds">←</button><h1 class="ttl">${W.ico} ${W.t}</h1>
    <button class="ear sm" data-say="${W.say}">🔊</button></div>
    <p class="muted">Acerte pelo menos 60% de primeira para passar. O chefe exige 75%.</p>
    <div class="lvlgrid">${Array.from({ length: LEVELS }, (_, i) => i + 1).map(L => {
    const ok = levelUnlocked(w, L), s = (S.lv[lk(w, L)] || {}).s || 0, boss = L === LEVELS;
    return `<button class="lvl ${boss ? 'boss' : ''} ${s ? 'done' : ''}" data-lvl="${w}:${L}" ${ok ? '' : 'disabled'}>
      <b>${ok ? (boss ? '👹' : L) : '🔒'}</b><span>${boss ? 'CHEFE' : 'Fase ' + L}</span><i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></button>`;
  }).join('')}</div></div>`;
}

/* ---------- FLUXO DE UMA FASE ---------- */
function startLevel(w, L) {
  ac(); closeModal(); const cfg = levelCfg(w, L);
  const useShield = S.inv.shield > 0, useXp2 = S.inv.xp2 > 0;
  if (useShield) S.inv.shield--; if (useXp2) S.inv.xp2--; save();
  G = { cfg, ctx: Object.assign({ used: new Set() }, cfg), i: 0, combo: 0, perfect: 0, xp: 0, lock: false, r: null, lastAct: null, shield: useShield ? 1 : 0, xpMult: useXp2 ? 2 : 1, tag: `${WORLDS[w - 1].ico} Mundo ${w} · ${cfg.boss ? '👹 CHEFE' : 'Fase ' + L}${useShield ? ' · 🛡️' : ''}${useXp2 ? ' · ⚡x2' : ''}` };
  shell();
}
function startReview() {
  ac(); closeModal();
  const cfg = { w: 0, L: 0, d: 8, lo: 1, hi: 4, acts: ['build', 'ouvir', 'certo', 'falta', 'dig', 'ditado', 'ini', 'sil1', 'figura', 'buildH', 'silN'], n: 10, boss: false, need: 0, review: true };
  G = { cfg, ctx: Object.assign({ used: new Set() }, cfg), i: 0, combo: 0, perfect: 0, xp: 0, lock: false, r: null, lastAct: null, shield: 0, xpMult: 1, tag: '🧠 Revisão inteligente' };
  shell();
}
function shell() {
  V.innerHTML = `<div class="game ${G.cfg.boss ? 'boss' : ''}">
    <div class="g-top"><button class="icon" data-act="quit" aria-label="Sair">✕</button><div class="prog"><i id="prog"></i></div><span class="g-count" id="cnt"></span></div>
    <div class="g-tag">${G.tag}</div><div id="gc"></div></div>`;
  if (G.cfg.boss) { sfx.boss(); toast('👹 BATALHA DE CHEFE!', 1800); }
  showRound();
}
function genRound() {
  const c = G.ctx; let id;
  do { id = rnd(c.acts); } while (c.acts.length > 1 && id === G.lastAct && Math.random() < .85);
  G.lastAct = id;
  let r; try { r = ACTS[id](c); } catch (e) { console.error(id, e); r = ACTS[c.acts[0]](c); }
  r.mistakes = 0; r.act = id; return r;
}
function showRound() {
  G.lock = false; G.r = genRound();
  $('#prog').style.width = (G.i / G.cfg.n * 100) + '%'; $('#cnt').textContent = (G.i + 1) + '/' + G.cfg.n;
  renderHud(); drawRound(G.r);
  setTimeout(() => speakAuto(G.r.say, { rate: .85 }), 250);
}
function markWord(w, ok) {
  const m = S.mast[w] || (S.mast[w] = { o: 0, e: 0, b: 0 });
  if (ok) { m.o++; m.b = Math.min(5, m.b + 1); } else { m.e++; m.b = Math.max(0, m.b - 1); }
}
function mistake(r) {
  if (G.shield) { G.shield = 0; toast('🛡️ O escudo protegeu você!'); sfx.coin(); return; }
  r.mistakes++; G.combo = 0; S.st.err++; sfx.err(); vib([80, 40, 80]); renderHud();
}
function finishRound(r, delay = 2600) {
  G.lock = true; const perfect = r.mistakes === 0;
  if (perfect) {
    G.combo++; G.perfect++; if (G.combo > S.bestCombo) S.bestCombo = G.combo; bump('combo', G.combo, true);
    const m = mult(), gain = Math.max(1, Math.round((10 + Math.floor(G.cfg.d / 3)) * m * (r.hinted ? .5 : 1) * G.xpMult));
    sfx.ok(); vib(40); confetti(14); floatText('+' + gain + ' XP' + (m > 1 ? ' x' + m : '')); addXp(gain);
    S.st.ok++; bump('ok');
  } else addXp(3 * G.xpMult);
  if (r.typed) { S.st.typed++; bump('type'); }
  if (r.word) markWord(r.word, perfect && !r.hinted);
  save(); renderHud(); setTimeout(nextRound, delay);
}
function nextRound() {
  if (!G) return; G.i++;
  if (G.i >= G.cfg.n) endLevel(); else showRound();
}
function endLevel() {
  const g = G, c = g.cfg, n = c.n, acc = g.perfect / n;
  stopSpeech();
  if (c.review) {
    const coins = g.perfect + 5; S.coins += coins; addXp(30); bump('review'); save(); sfx.win(); confetti(100);
    speakAuto('Revisão completa! Muito bem!');
    openModal(`<div class="sheet"><h2>🧠 REVISÃO COMPLETA!</h2><div class="stat"><div>✅ ${g.perfect}/${n}</div><div>⚡ +${g.xp} XP</div><div>🪙 +${coins}</div></div>
      <div class="col"><button class="btn" data-act="review">🔁 Revisar de novo</button><button class="btn ghost" data-act="home">🏠 Menu</button></div></div>`);
    G = null; renderHud(); checkAch(); return;
  }
  const pass = acc >= c.need;
  const stars = !pass ? 0 : c.boss ? (acc >= .93 ? 3 : acc >= .85 ? 2 : 1) : (acc >= .9 ? 3 : acc >= .75 ? 2 : 1);
  const k = lk(c.w, c.L), prev = S.lv[k] || { s: 0, b: 0, p: 0 }, first = prev.s < 1;
  let coins, bonusXp = 0;
  if (pass) {
    coins = (g.perfect + stars * 4 + (first ? 10 : 0)) * (c.boss ? 2 : 1); bonusXp = 20 + stars * 10 + (c.boss ? 60 : 0);
    const ns = Math.max(prev.s, stars), gain = ns - prev.s;
    S.lv[k] = { s: ns, b: Math.max(prev.b, acc), p: prev.p + 1 };
    if (stars === 3 && prev.s < 3) S.st.perfect++;
    bump('levels'); if (gain > 0) bump('stars', gain);
  } else { coins = Math.floor(g.perfect / 2); S.lv[k] = Object.assign(prev, { p: prev.p + 1 }); }
  S.coins += coins; S.st.plays++; addXp(bonusXp); save();
  if (pass) { c.boss ? sfx.boss() : sfx.win(); vib([100, 50, 100, 50, 200]); confetti(c.boss ? 200 : 130); setTimeout(() => sfx.coin(), 700); }
  speakAuto(pass ? (stars === 3 ? 'Missão perfeita! Você é incrível!' : 'Missão completa! Muito bem!') : 'Quase! Vamos tentar de novo. Você consegue!');
  let nxt = null;
  if (pass) { if (c.L < LEVELS) nxt = [c.w, c.L + 1]; else if (c.w < 7 && worldUnlocked(c.w + 1)) nxt = [c.w + 1, 1]; }
  openModal(`<div class="sheet"><h2>${pass ? (c.boss ? '👹 CHEFE DERROTADO!' : 'MISSÃO COMPLETA!') : 'QUASE LÁ!'}</h2>
    <div class="stars">${pass ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '☆☆☆'}</div>
    <p class="muted">${g.perfect}/${n} de primeira (${Math.round(acc * 100)}%) · precisa de ${Math.round(c.need * 100)}%</p>
    <div class="stat"><div>⚡ +${g.xp} XP</div><div>🪙 +${coins}</div><div>🔥 ${S.bestCombo}</div></div>
    ${pass && c.boss && c.w < 7 && !worldUnlocked(c.w + 1) ? `<p class="muted">Para abrir o próximo mundo, junte ${NEED_STARS}★ neste mundo (tem ${wStars(c.w)}★). Rejogue fases para ganhar mais estrelas!</p>` : ''}
    <div class="col">
      ${nxt ? `<button class="btn" data-lvl="${nxt[0]}:${nxt[1]}">▶ Próxima fase</button>` : ''}
      <button class="btn ${nxt ? 'ghost' : ''}" data-lvl="${c.w}:${c.L}">🔁 ${pass ? 'Jogar de novo' : 'Tentar de novo'}</button>
      <button class="btn ghost" data-act="levels" data-w="${c.w}">🗺️ Mapa do mundo</button>
    </div></div>`);
  G = null; renderHud(); setTimeout(checkAch, 600);
}

/* ---------- EVENTOS ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  const say = t.closest('[data-say]'); if (say) { ac(); speak(say.dataset.say, { rate: .88 }); return; }
  const rd = t.closest('[data-read]'); if (rd) { ac(); readOption(+rd.dataset.read); return; }
  if (t.closest('[data-readall]')) { ac(); readPassage(); return; }
  const lv = t.closest('[data-lvl]'); if (lv && !lv.disabled) { const [w, L] = lv.dataset.lvl.split(':').map(Number); if (levelUnlocked(w, L)) startLevel(w, L); return; }
  const wd = t.closest('[data-world]'); if (wd && !wd.disabled) { renderLevels(+wd.dataset.world); return; }
  const bu = t.closest('[data-buy]'); if (bu) { buy(bu.dataset.buy); return; }
  const cl = t.closest('[data-claim]'); if (cl && !cl.disabled) { claimMission(cl.dataset.claim); return; }
  const kk = t.closest('[data-k]'); if (kk && G) { onKey(kk.dataset.k); return; }
  const act = t.closest('[data-act]');
  if (act) {
    switch (act.dataset.act) {
      case 'install': installApp(); break;
      case 'home': closeModal(); goHome(); break;
      case 'close': closeModal(); break;
      case 'worlds': closeModal(); renderWorlds(); break;
      case 'levels': closeModal(); renderLevels(+act.dataset.w); break;
      case 'shop': renderShop(); break;
      case 'missions': renderMissions(); break;
      case 'ach': renderAch(); break;
      case 'profile': renderProfile(); break;
      case 'bonus': claimBonus(); break;
      case 'review': if (passedCount() >= 3) startReview(); break;
      case 'quit': if (!G || G.i === 0 || confirm('Sair da fase? O progresso desta fase será perdido.')) { const w = G && G.cfg.w; stopSpeech(); G = null; w ? renderLevels(w) : renderHome(); } break;
      case 'auto': S.auto = !S.auto; save(); renderHome(); break;
      case 'reset': if (confirm('Apagar TODO o progresso? Isso não pode ser desfeito.')) { localStorage.removeItem(SAVE_KEY); S = load(); S.xp = 0; S.coins = 0; save(); applyTheme(); renderHome(); } break;
      case 'repeat': if (G && G.r) speak(G.r.say, { rate: .85 }); break;
      case 'hint': if (G && G.r && !G.lock) { hintSeq(G.r); hintType(G.r); } break;
    }
    return;
  }
  if (!G || !G.r) return;
  const op = t.closest('.opt'); if (op) { onChoice(+op.dataset.i); return; }
  const bl = t.closest('.blk'); if (bl) { onTile(+bl.dataset.b); return; }
  const co = t.closest('.card-opt'); if (co) { onCard(+co.dataset.i); return; }
});
document.addEventListener('keydown', (e) => {
  if (!G || !G.r || G.r.kind !== 'type' || e.ctrlKey || e.metaKey) return;
  const r = G.r;
  if (e.key === 'Backspace') onKey('⌫'); else if (e.key === 'Enter') onKey('OK');
  else if (e.key.length === 1) { const k = e.key.toUpperCase(); if (r.mode === 'num' ? /\d/.test(k) : (/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(k) || (k === ' ' && r.mode === 'text'))) onKey(k); }
});

/* ---------- INÍCIO ---------- */
applyTheme(); ensureDay(); renderHome(); setTimeout(checkAch, 500);
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
