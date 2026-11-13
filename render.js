'use strict';
/* CÓDIGO PALAVRA 2 — telas de atividade (4 tipos): choice, seq, type, cards
   Depende de app.js: G, mistake(r), finishRound(r) */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const gc = () => $('#gc');
const earBtn = '<button class="ear big" data-act="repeat" aria-label="Ouvir de novo">🔊</button>';
const norm = (s) => s.toUpperCase().replace(/[^A-Z0-9ÁÉÍÓÚÂÊÔÃÕÇÀ ]/g, '').replace(/\s+/g, ' ').trim();

function drawRound(r) {
  ({ choice: rChoice, seq: rSeq, type: rType, cards: rCards })[r.kind](r);
}

/* ---------- CHOICE ---------- */
function rChoice(r) {
  gc().innerHTML = `
    <div class="prompt">${earBtn}<h2>${r.prompt}</h2></div>
    ${r.emoji ? `<div class="emoji-big">${r.emoji}</div>` : ''}
    ${r.text ? `<div class="sentence">${esc(r.text)}</div>` : ''}
    ${r.big ? `<div class="reveal" id="reveal">${r.big}</div>` : ''}
    <div class="opts ${r.cls || ''}">${r.options.map((o, i) => `<button class="opt ${o.l.length > 4 ? 'small' : ''} ${o.l.length > 14 ? 'long' : ''}" data-i="${i}">${o.l}</button>`).join('')}</div>`;
}
function onChoice(i) {
  const r = G.r; if (G.lock) return; G.lock = true;
  const btns = [...document.querySelectorAll('.opt')], ans = r.ans;
  const op = r.options[i]; if (op.say) speak(op.say, { rate: .8 });
  if (i === ans) { btns[i].classList.add('ok'); }
  else { btns[i].classList.add('bad'); btns[ans].classList.add('show'); mistake(r); }
  if (r.reveal) { const rv = $('#reveal'); if (rv) rv.innerHTML = r.reveal; }
  setTimeout(() => speak(i === ans ? (r.okSay || 'Muito bem!') : (r.failSay || 'Quase!'), { cancel: false, rate: .88 }), 650);
  finishRound(r);
}

/* ---------- SEQ (montar na ordem: sílabas, palavras, frases, números) ---------- */
function rSeq(r) {
  r.pos = 0; const f = r.frame;
  const slots = `<div class="slots">${r.slots.map((s, i) => `<div class="slot ${r.join ? 'w' : ''}" data-s="${i}"></div>`).join('')}</div>`;
  gc().innerHTML = `
    ${f ? `<div class="chat">
        <div class="bub in"><div><small>${esc(f.from)}</small>${esc(f.msg)}</div><button class="ear sm" data-say="${esc(f.msg)}">🔊</button></div>
        <div class="bub out">${esc(f.before)}${slots}${esc(f.after)}</div></div>
      <div class="prompt">${earBtn}<h2>${r.prompt}</h2></div>`
      : `<div class="prompt">${earBtn}<h2>${r.prompt}</h2></div>${r.emoji ? `<div class="emoji-big">${r.emoji}</div>` : ''}${slots}`}
    <div class="pool">${r.pool.map((p, i) => `<button class="blk ${r.join ? 'w' : ''} ${r.long ? 'long' : ''}" data-b="${i}">${esc(p)}</button>`).join('')}</div>
    <div class="tools"><button class="btn ghost" data-act="hint">💡 Dica</button></div>`;
}
function hintSeq(r) {
  if (r.kind !== 'seq' || G.lock) return;
  const want = r.slots[r.pos]; if (want == null) return;
  const el = [...document.querySelectorAll('.blk')].find((b, i) => !b.classList.contains('used') && r.pool[i] === want);
  if (el) { el.classList.add('hint'); r.hinted = true; }
}
function onTile(i) {
  const r = G.r; if (G.lock) return;
  const b = document.querySelector(`.blk[data-b="${i}"]`); if (!b || b.classList.contains('used')) return;
  const txt = r.pool[i];
  document.querySelectorAll('.blk.hint').forEach(x => x.classList.remove('hint'));
  if (txt === r.slots[r.pos]) {
    sfx.tap(); speak(String(txt).toLowerCase(), { rate: .78 });
    const sl = document.querySelector(`.slot[data-s="${r.pos}"]`); sl.textContent = txt; sl.classList.add('fill');
    b.classList.add('used'); r.pos++;
    if (r.pos === r.slots.length) {
      G.lock = true; setTimeout(() => speak(r.final || r.slots.join(r.join || ''), { rate: .85 }), 450);
      finishRound(r, 2300);
    }
  } else {
    mistake(r); b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 450);
    speak('Essa não. Tente: ' + String(r.slots[r.pos]).toLowerCase(), { rate: .82 });
    if (r.mistakes >= 2) hintSeq(r);
  }
}

/* ---------- TYPE (digitar com teclado virtual) ---------- */
const KB = { l1: 'QWERTYUIOP', l2: 'ASDFGHJKL', l3: 'ZXCVBNM', ac: 'ÁÉÍÓÚÂÊÔÃÕÇ' };
function rType(r) {
  r.buf = ''; r.tries = 0;
  const num = r.mode === 'num';
  const keys = num
    ? ['123', '456', '789'].map(row => `<div class="kr">${[...row].map(k => `<button class="key" data-k="${k}">${k}</button>`).join('')}</div>`).join('') + '<div class="kr"><button class="key fn" data-k="⌫">⌫</button><button class="key" data-k="0">0</button><button class="key go" data-k="OK">✔</button></div>'
    : [KB.l1, KB.l2, KB.l3].map(row => `<div class="kr">${[...row].map(k => `<button class="key" data-k="${k}">${k}</button>`).join('')}</div>`).join('')
    + `<div class="kr ac">${[...KB.ac].map(k => `<button class="key sm" data-k="${k}">${k}</button>`).join('')}</div>`
    + `<div class="kr"><button class="key fn" data-k="⌫">⌫</button>${r.mode === 'text' ? '<button class="key sp" data-k=" ">espaço</button>' : ''}<button class="key go" data-k="OK">✔</button></div>`;
  gc().innerHTML = `
    <div class="prompt">${earBtn}<h2>${r.prompt}</h2></div>
    ${r.emoji ? `<div class="emoji-big sm">${r.emoji}</div>` : ''}
    ${r.frame ? `<div class="bub in"><div><small>${esc(r.frame.from)}</small>${esc(r.frame.msg)}</div><button class="ear sm" data-say="${esc(r.frame.msg)}">🔊</button></div>` : ''}
    ${r.text ? `<div class="sentence">${esc(r.text)}</div>` : ''}
    <div class="typed ${r.mode}" id="typed"></div>
    <div class="kb">${keys}</div>
    <div class="tools"><button class="btn ghost" data-act="hint">💡 Revelar letra</button></div>`;
  paintTyped(r);
}
function paintTyped(r, marks) {
  const el = $('#typed'); if (!el) return;
  if (r.mode === 'text') { el.textContent = r.buf || '…'; return; }
  const n = r.target.length;
  el.innerHTML = Array.from({ length: n }, (_, i) => `<span class="tb ${i < r.buf.length ? 'f' : ''} ${marks ? marks[i] || '' : ''}">${r.buf[i] || ''}</span>`).join('');
}
function onKey(k) {
  const r = G.r; if (G.lock || r.kind !== 'type') return;
  if (k === '⌫') { r.buf = r.buf.slice(0, -1); sfx.key(); paintTyped(r); return; }
  if (k === 'OK') { return checkType(r); }
  if (r.mode !== 'text' && r.buf.length >= r.target.length) return;
  if (r.buf.length >= 60) return;
  r.buf += k; sfx.key(); if (r.mode !== 'text') speak(k.length === 1 && LETTER[k] ? LETTER[k] : k.toLowerCase(), { rate: 1.1 });
  paintTyped(r);
}
function hintType(r) {
  if (r.kind !== 'type' || G.lock) return;
  const t = r.target; let i = 0; while (i < r.buf.length && r.buf[i] === t[i]) i++;
  r.buf = t.slice(0, i + 1); r.hinted = true; paintTyped(r); speak('A próxima letra é ' + (LETTER[t[i]] || t[i]), { rate: .85 });
}
function checkType(r) {
  const a = norm(r.buf), b = norm(r.target);
  if (a === b) {
    G.lock = true; paintTyped(r, Array(b.length).fill('ok'));
    setTimeout(() => speak(r.final || r.target.toLowerCase(), { rate: .85 }), 350); finishRound(r, 2300); return;
  }
  r.tries++; mistake(r);
  const marks = [...r.target].map((c, i) => r.buf[i] === c ? 'ok' : 'bad');
  if (r.mode !== 'text') paintTyped(r, marks);
  if (r.tries >= 3 || !a) {
    G.lock = true; r.buf = r.target; paintTyped(r, Array(r.target.length).fill('show'));
    speak('Quase! O certo é: ' + (r.final || r.target.toLowerCase()), { rate: .82 }); finishRound(r, 2800); return;
  }
  const accentOnly = strip(a) === strip(b);
  speak(accentOnly ? 'Quase! Falta um acento, ou tem um acento a mais.' : 'Quase! Olhe as letras vermelhas e tente de novo.', { rate: .88 });
}

/* ---------- CARDS (frases e textos com leitura palavra por palavra) ---------- */
function wordSpans(t) { return t.split(' ').map(w => `<b>${esc(w)}</b>`).join(' '); }
function rCards(r) {
  gc().innerHTML = `
    ${r.emoji ? `<div class="scene">${r.emoji}</div>` : ''}
    ${r.passage ? `<div class="passage"><div class="ptop"><b>${esc(r.title || 'Leia')}</b><button class="ear sm" data-readall="1" aria-label="Ler o texto">🔊</button></div><p id="pass">${wordSpans(r.passage)}</p></div>` : ''}
    ${r.scene ? `<p class="scene-txt">${esc(r.scene)}</p>` : ''}
    <div class="prompt">${earBtn}<h2>${r.prompt}</h2></div>
    <div class="phr">${r.options.map((o, i) => `<div class="card-opt" data-i="${i}" role="button"><button class="ear sm" data-read="${i}" aria-label="Ouvir palavra por palavra">🔊</button><span class="words">${wordSpans(o.t)}</span></div>`).join('')}</div>`;
}
function readSpans(spans) {
  readTok++; const my = readTok; if ('speechSynthesis' in window) speechSynthesis.cancel();
  let k = 0;
  (function nxt() {
    document.querySelectorAll('b.on').forEach(s => s.classList.remove('on'));
    if (my !== readTok || k >= spans.length) return;
    spans[k].classList.add('on'); spans[k].scrollIntoView && spans[k].scrollIntoView({ block: 'nearest' });
    speak(spans[k].textContent.replace(/[.,!?]/g, ''), { rate: .78, cancel: false, onend: () => { k++; setTimeout(nxt, 50); } });
  })();
}
const readOption = (i) => readSpans([...document.querySelectorAll(`.card-opt[data-i="${i}"] b`)]);
const readPassage = () => readSpans([...document.querySelectorAll('#pass b')]);
function onCard(i) {
  const r = G.r; if (G.lock) return; G.lock = true; stopSpeech();
  const els = [...document.querySelectorAll('.card-opt')];
  if (r.options[i].ok) { els[i].classList.add('ok'); setTimeout(() => speak(r.okSay || 'Isso mesmo!', { rate: .9 }), 300); }
  else {
    mistake(r); els[i].classList.add('bad'); const ok = r.options.findIndex(o => o.ok); els[ok].classList.add('show');
    setTimeout(() => speak('Quase! O certo é: ' + r.options[ok].t, { rate: .85 }), 400);
  }
  finishRound(r, 2800);
}
