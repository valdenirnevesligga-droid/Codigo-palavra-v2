'use strict';
/* CÓDIGO PALAVRA 2 — atividades dos Mundos 4, 5, 6 e 7 (frases, chat, números, leitura) */
const toks = (s) => s.split(' ');
const sentences = (t) => t.split(/(?<=[.!?])\s+/).filter(Boolean);
const plain = (s) => s.replace(/[.,!?]/g, '');
function pickPhrase(c) {
  c.usedP = c.usedP || new Set(); let p = PHRASES.filter(x => !c.usedP.has(x.sc));
  if (!p.length) { c.usedP.clear(); p = PHRASES; } const x = rnd(p); c.usedP.add(x.sc); return x;
}
function pickChat(c) {
  c.usedC = c.usedC || new Set(); let p = CHATS.filter(x => !c.usedC.has(x.msg));
  if (!p.length) { c.usedC.clear(); p = CHATS; } const x = rnd(p); c.usedC.add(x.msg); return x;
}
const chatSay = (k) => `${k.from} escreveu: ${k.msg}`;
const reply = (k) => k.before + k.word.toLowerCase() + k.after;

/* ===== MUNDO 4 — Conexão Rápida ===== */
ACTS.frase = (c) => {
  const p = pickPhrase(c), opts = shuffle([{ t: p.ok, ok: true }, ...p.bad.slice(0, c.d <= 5 ? 2 : 2).map(t => ({ t }))]);
  return { kind: 'cards', emoji: p.e, scene: p.sc, prompt: 'Qual frase combina?', say: `${p.sc} Qual frase combina?`, options: opts };
};
ACTS.ordemF = (c) => {
  const p = pickPhrase(c), t = toks(p.ok), extra = c.d >= 7 ? sample(toks(p.bad[0]).filter(w => !t.includes(w)), c.d >= 10 ? 2 : 1) : [];
  return { kind: 'seq', prompt: 'Monte a frase', say: `Monte a frase: ${p.ok}`, emoji: p.e, slots: t, pool: shuffle(t.concat(extra)), join: ' ', final: p.ok };
};
ACTS.cloze = (c) => {
  const p = pickPhrase(c), t = toks(p.ok), idx = t.map((w, i) => plain(w).length >= 4 ? i : -1).filter(i => i >= 0);
  const i = rnd(idx.length ? idx : t.map((_, k) => k)), ans = plain(t[i]);
  const bank = uniq(PHRASES.flatMap(x => toks(x.ok)).map(plain).filter(w => w.length >= 3 && w.toLowerCase() !== ans.toLowerCase() && w.length >= ans.length - 2 && w.length <= ans.length + 2));
  let extra = sample(bank, nOpt(c) - 1);
  if (extra.length < 2) extra = extra.concat(sample(uniq(PHRASES.flatMap(x => toks(x.ok)).map(plain)).filter(w => w.length >= 3 && w.toLowerCase() !== ans.toLowerCase() && !extra.includes(w)), 2 - extra.length));
  const opts = [ans, ...extra];
  const shown = t.map((w, k) => k === i ? '_____' + (/[.,!?]$/.test(w) ? w.slice(-1) : '') : w).join(' ');
  return mkChoice('Qual palavra completa a frase?', `Qual palavra completa a frase? ${p.ok.replace(t[i], 'hum')}`.replace('hum', 'qual?'),
    opts.map(l => ({ l, say: l.toLowerCase() })), ans, { emoji: p.e, text: shown, cls: 'words', okSay: `Isso! ${p.ok}`, failSay: `Quase! A palavra é ${ans.toLowerCase()}.` });
};
ACTS.vf = (c) => {
  const p = pickPhrase(c), good = Math.random() < .5, ph = good ? p.ok : rnd(p.bad);
  return mkChoice('Essa frase combina com a cena?', `${p.sc} A frase é: ${ph}. Ela combina com a cena?`,
    [{ l: 'COMBINA ✔', say: 'combina' }, { l: 'NÃO COMBINA ✘', say: 'não combina' }], good ? 'COMBINA ✔' : 'NÃO COMBINA ✘',
    { emoji: p.e, text: ph, cls: 'two', okSay: good ? 'Isso! Combina.' : 'Isso! Não combina.', failSay: good ? 'Quase! Essa frase combina.' : 'Quase! Essa frase não combina.' });
};
function errSentence(c, src) {
  const t = toks(src), idx = t.map((w, i) => plain(w).length >= 4 ? i : -1).filter(i => i >= 0);
  const i = rnd(idx), good = plain(t[i]), bads = misspell(good.toUpperCase()).map(x => x.toLowerCase());
  const bad = bads.length ? bads[0] : good.slice(0, -1);
  const shown = t.map((w, k) => k === i ? w.replace(good, bad) : w);
  const rest = t.map((_, k) => k).filter(k => k !== i && plain(t[k]).length >= 2 && plain(t[k]).toLowerCase() !== bad.toLowerCase());
  const choices = [i, ...sample(idx.filter(k => k !== i), nOpt(c) - 1)];
  for (const k of shuffle(rest)) { if (choices.length >= Math.max(3, Math.min(nOpt(c), 4))) break; if (!choices.includes(k)) choices.push(k); }
  return mkChoice('Toque na palavra com ERRO', `Uma palavra está escrita errada. Qual é? ${shown.join(' ')}`,
    choices.map(k => ({ l: plain(shown[k]), say: plain(shown[k]).toLowerCase() })), plain(shown[i]),
    { text: shown.join(' '), cls: 'words', okSay: `Isso! O certo é ${good.toLowerCase()}.`, failSay: `Quase! A palavra errada era ${bad}. O certo é ${good.toLowerCase()}.` });
}
ACTS.erroF = (c) => errSentence(c, pickPhrase(c).ok);

/* ===== MUNDO 5 — Mestre do Chat ===== */
ACTS.chatSil = (c) => {
  const k = pickChat(c), allS = uniq(CHATS.flatMap(x => x.s)), ex = c.d <= 3 ? 2 : c.d <= 7 ? 3 : 4;
  return { kind: 'seq', prompt: 'Responda tocando nas sílabas', say: `${chatSay(k)}. Complete a sua resposta.`, frame: { from: k.from, msg: k.msg, before: k.before, after: k.after }, slots: k.s, pool: shuffle(k.s.concat(sample(allS.filter(s => !k.s.includes(s)), ex))), final: reply(k), word: k.word };
};
ACTS.chatOp = (c) => {
  const k = pickChat(c), opts = shuffle([{ t: reply(k), ok: true }, ...k.bad.map(t => ({ t }))]);
  return { kind: 'cards', emoji: '💬', scene: `${k.from}: ${k.msg}`, prompt: 'Qual resposta combina?', say: `${chatSay(k)}. Qual resposta combina?`, options: opts };
};
ACTS.chatType = (c) => {
  const k = pickChat(c);
  return { kind: 'type', mode: 'word', prompt: 'Escreva a palavra que falta', say: `${chatSay(k)}. Escreva a palavra que falta na sua resposta: ${reply(k)}`, frame: { from: k.from, msg: k.msg }, text: k.before + '_____' + k.after, target: k.word, final: reply(k), word: k.word, typed: true };
};
ACTS.chatFrase = (c) => {
  const k = pickChat(c), r = reply(k), t = toks(r), ex = c.d >= 8 ? sample(toks(k.bad[0]).filter(w => !t.includes(w)), 2) : [];
  return { kind: 'seq', prompt: 'Monte a sua resposta', say: `${chatSay(k)}. Monte a sua resposta.`, frame: { from: k.from, msg: k.msg, before: '', after: '' }, slots: t, pool: shuffle(t.concat(ex)), join: ' ', final: r };
};
ACTS.chatDigita = (c) => {
  const k = pickChat(c), r = reply(k);
  return { kind: 'type', mode: 'text', prompt: 'Escreva a sua resposta', say: `${chatSay(k)}. Escreva esta resposta: ${r}`, frame: { from: k.from, msg: k.msg }, target: norm(r), final: r, typed: true };
};

/* ===== MUNDO 6 — Números do Dia a Dia ===== */
function numRange(c) { return c.d <= 3 ? [1, 20] : c.d <= 6 ? [10, 99] : c.d <= 9 ? [100, 999] : [1000, 9999]; }
function numNear(n, cnt) {
  const out = new Set([n]); const s = String(n);
  if (s.length >= 2) out.add(+(s[1] + s[0] + s.slice(2)));
  [1, 10, -1, -10, 100, 5, 2, -2, 20].forEach(d => { if (out.size < 10 && n + d > 0) out.add(n + d); });
  return [n, ...shuffle([...out].filter(x => x !== n && x > 0 && x !== 0))].slice(0, cnt);
}
ACTS.numOuvir = (c) => {
  const [a, b] = numRange(c), n = ri(a, b);
  return mkChoice('Ouça e toque no número', `Toque no número: ${numWords(n)}`, numNear(n, nOpt(c)).map(x => ({ l: String(x), say: numWords(x) })), String(n),
    { big: '🎧', cls: 'num', okSay: `Isso! ${numWords(n)}.`, failSay: `Quase! É ${numWords(n)}.` });
};
ACTS.numLer = (c) => {
  const [a, b] = numRange(c), n = ri(a, b);
  return mkChoice('Como se escreve este número?', 'Veja o número e toque em como ele se escreve. Toque nas opções para ouvir.', numNear(n, Math.min(nOpt(c), 4)).map(x => ({ l: numWords(x), say: numWords(x) })), numWords(n),
    { big: String(n), cls: 'words', okSay: `Isso! ${numWords(n)}.`, failSay: `Quase! É ${numWords(n)}.` });
};
ACTS.preco = (c) => {
  const r = c.d <= 4 ? ri(1, 20) : c.d <= 8 ? ri(5, 120) : ri(20, 999), cent = c.d <= 4 ? 0 : rnd([0, 50, 90, 99, 25, 75]);
  const fmt = (x, y) => `R$ ${x},${String(y).padStart(2, '0')}`;
  const o = [[r, cent], [r, cent ? 0 : 50], [r + ri(1, 9), cent], [cent ? cent : 90, r % 100 || 5]].map(([x, y]) => [x, y]);
  const lst = uniq(o.map(([x, y]) => x + ':' + y)).slice(0, Math.min(nOpt(c), 4)).map(s => s.split(':').map(Number));
  return mkChoice('Quanto custa?', 'Leia o preço e toque na opção certa. Toque nas opções para ouvir.', lst.map(([x, y]) => ({ l: money(x, y), say: money(x, y) })), money(r, cent),
    { big: fmt(r, cent), emoji: '🏷️', cls: 'words', okSay: `Isso! ${money(r, cent)}.`, failSay: `Quase! É ${money(r, cent)}.` });
};
ACTS.hora = (c) => {
  const h = ri(c.d <= 4 ? 7 : 0, c.d <= 4 ? 20 : 23), m = c.d <= 4 ? rnd([0, 30]) : rnd([0, 15, 30, 45, 10, 20, 40, 50]);
  const f = (a, b) => `${String(a).padStart(2, '0')}:${String(b).padStart(2, '0')}`;
  const cand = uniq([[h, m], [(h + 1) % 24, m], [h, m === 30 ? 0 : 30], [(h + 12) % 24, m], [(h + 11) % 24, m + 0]].map(([a, b]) => a + ':' + b)).slice(0, nOpt(c)).map(s => s.split(':').map(Number));
  return mkChoice('Que horas são?', 'Veja o relógio e escolha como se fala. Toque nas opções para ouvir.', cand.map(([a, b]) => ({ l: timeWords(a, b), say: timeWords(a, b) })), timeWords(h, m),
    { big: f(h, m), emoji: '⏰', cls: 'words', okSay: `Isso! ${timeWords(h, m)}.`, failSay: `Quase! São ${timeWords(h, m)}.` });
};
ACTS.conta = (c) => {
  const big = c.d <= 4 ? 20 : c.d <= 8 ? 100 : 500, a = ri(Math.floor(big / 2), big), b = ri(2, Math.floor(a / 2)), p = ri(2, c.d <= 6 ? 9 : 30), n = ri(2, c.d <= 6 ? 4 : 7);
  const T = [
    [`Você tinha ${a} reais e gastou ${b} reais num lanche. Quanto sobrou?`, a - b, '💸'],
    [`Cada pizza custa ${p} reais. Você comprou ${n} pizzas. Quanto você pagou?`, p * n, '🍕'],
    [`Você tinha ${a} figurinhas e ganhou ${b}. Quantas figurinhas tem agora?`, a + b, '🃏'],
    [`Um jogo custa ${a} reais. Você tem ${b} reais. Quanto falta?`, a - b, '🎮'],
    [`Seu time fez ${b} pontos na primeira partida e ${a} na segunda. Quantos pontos no total?`, a + b, '🏆']
  ];
  const [q, ans, em] = c.d <= 3 ? rnd([T[0], T[2]]) : rnd(T);
  return mkChoice('Resolva o problema', `${q}`, numNear(ans, nOpt(c)).map(x => ({ l: String(x), say: numWords(x) })), String(ans),
    { emoji: em, text: q, cls: 'num', okSay: `Isso! A resposta é ${numWords(ans)}.`, failSay: `Quase! A resposta é ${numWords(ans)}.` });
};
ACTS.ordemNum = (c) => {
  const [a, b] = numRange(c), cnt = c.d <= 4 ? 3 : c.d <= 8 ? 4 : 5, ns = uniq(Array.from({ length: cnt + 3 }, () => ri(a, b))).slice(0, cnt);
  const asc = Math.random() < .6, sorted = ns.slice().sort((x, y) => asc ? x - y : y - x).map(String);
  return { kind: 'seq', prompt: asc ? 'Do MENOR para o MAIOR' : 'Do MAIOR para o MENOR', say: asc ? 'Toque nos números, do menor para o maior.' : 'Toque nos números, do maior para o menor.', emoji: asc ? '📈' : '📉', slots: sorted, pool: shuffle(sorted), join: ' ', final: sorted.map(x => numWords(+x)).join(', ') };
};
ACTS.digitar = (c) => {
  const [a, b] = numRange(c), n = ri(a, b);
  return { kind: 'type', mode: 'num', prompt: 'Ouça e digite o número', say: `Digite o número: ${numWords(n)}`, target: String(n), final: numWords(n), typed: true };
};
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
ACTS.dias = (c) => {
  const useM = Math.random() < .5, L = useM ? MESES : DIAS, i = ri(0, L.length - 1), before = Math.random() < .4 && c.d >= 4;
  const ans = L[(i + (before ? -1 : 1) + L.length) % L.length], nm = L[i];
  const opts = [ans, ...sample(L.filter(x => x !== ans && x !== nm), nOpt(c) - 1)];
  const q = before ? `Antes de ${nm} vem qual ${useM ? 'mês' : 'dia'}?` : `Depois de ${nm} vem qual ${useM ? 'mês' : 'dia'}?`;
  return mkChoice(q, q, opts.map(l => ({ l, say: l })), ans, { emoji: useM ? '📅' : '🗓️', cls: 'words', okSay: `Isso! ${ans}.`, failSay: `Quase! É ${ans}.` });
};

/* ===== MUNDO 7 — Leitor Pro ===== */
ACTS.texto = (c) => {
  const t = rnd(TEXTS), q = rnd(t.qs), opts = shuffle([{ t: q.ok, ok: true }, ...q.bad.map(x => ({ t: x }))]);
  return { kind: 'cards', emoji: '📖', title: t.title, passage: t.text, prompt: q.q, say: `${t.title}. ${t.text} Pergunta: ${q.q}`, options: opts, okSay: 'Isso! Boa leitura!' };
};
ACTS.vfTexto = (c) => {
  const t = rnd(TEXTS), q = rnd(t.qs), good = Math.random() < .5, a = good ? q.ok : rnd(q.bad);
  return { kind: 'cards', emoji: '🔎', title: t.title, passage: t.text, prompt: `${q.q} Resposta: ${a}`, say: `${t.title}. ${t.text} Pergunta: ${q.q} A resposta é: ${a}. Está certo ou errado?`, options: [{ t: 'CERTO', ok: good }, { t: 'ERRADO', ok: !good }], okSay: 'Isso mesmo!' };
};
ACTS.ordemTexto = (c) => {
  const t = rnd(TEXTS), s = sentences(t.text).slice(0, c.d <= 6 ? 3 : 4);
  return { kind: 'seq', prompt: 'Coloque a história na ordem', say: `Toque nas frases na ordem em que elas acontecem. Título: ${t.title}`, emoji: '📖', slots: s, pool: shuffle(s), join: ' ', long: true, final: s.join(' ') };
};
ACTS.ditadoF = (c) => {
  const p = pickPhrase(c), t = toks(p.ok), ex = sample(toks(p.bad[0]).filter(w => !t.includes(w)), c.d >= 9 ? 3 : 2);
  return { kind: 'seq', prompt: 'Ouça e monte a frase', say: `Ouça e monte a frase: ${p.ok}`, emoji: '🎧', slots: t, pool: shuffle(t.concat(ex)), join: ' ', final: p.ok };
};
ACTS.digFrase = (c) => {
  const cand = PHRASES.filter(p => toks(p.ok).length <= (c.d <= 8 ? 4 : 6)), p = rnd(cand.length ? cand : PHRASES);
  return { kind: 'type', mode: 'text', prompt: 'Ouça e escreva a frase', say: `Escreva a frase: ${p.ok}`, emoji: c.d <= 8 ? p.e : '', target: norm(p.ok), final: p.ok, typed: true };
};
ACTS.erro = (c) => { const t = rnd(TEXTS); return errSentence(c, rnd(sentences(t.text).filter(s => toks(s).length >= 4))); };
