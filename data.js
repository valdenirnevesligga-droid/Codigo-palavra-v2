'use strict';
/* CÓDIGO PALAVRA 2 — banco de conteúdo */

/* Palavras: sílabas separadas por "-" | emoji | tier (1 simples … 4 difícil) */
const RAW_WORDS = [
  // Tier 1 — duas sílabas simples
  'jo-go|🎮|1', 'fo-ne|🎧|1', 'te-la|🖥️|1', 'bo-la|⚽|1', 're-de|🌐|1', 'ca-sa|🏠|1', 'mo-to|🏍️|1', 'me-sa|🪑|1',
  'ca-ma|🛏️|1', 'ma-pa|🗺️|1', 'ru-a|🛣️|1', 'lu-a|🌙|1', 'ma-la|🧳|1', 'lo-ja|🏬|1', 'ba-la|🍬|1', 'ca-fé|☕|1',
  'sa-pa-to|👟|1', 'to-ma-te|🍅|1', 'ba-na-na|🍌|1', 'ja-ne-la|🪟|1', 'sa-la-da|🥗|1', 'ta-ça|🏆|1', 'pi-pa|🪁|1',
  'bo-ne|🧢|1', 'fi-ta|🎀|1', 'vo-ta|🗳️|1', 'ne-ve|❄️|1', 'su-co|🧃|1', 'ra-dar|📡|1', 'mo-la|🧲|1',
  // Tier 2 — três sílabas e sílabas fechadas
  'ví-de-o|🎬|2', 'mú-si-ca|🎵|2', 'a-mi-go|🤝|2', 'piz-za|🍕|2', 'car-ro|🏎️|2', 'fu-te-bol|🥅|2', 'ce-lu-lar|📱|2',
  'ca-der-no|📓|2', 'ca-ne-ta|🖊️|2', 'ré-gua|📏|2', 'lan-che|🥪|2', 'sor-ve-te|🍦|2', 'ca-pa-ce-te|🪖|2',
  'for-ça|💪|2', 'ma-ra-vi-lha|🌟|2', 'cor-ri-da|🏃|2', 'ba-te-ri-a|🔋|2', 'fo-to-gra-fi-a|📷|2', 'mo-chi-la|🎒|2',
  'ca-mi-sa|👕|2', 'bi-ci-cle-ta|🚲|2', 'pas-ta|📁|2', 'ma-pa-mun-di|🌍|2', 'bos-que|🌲|2', 'ar-ma-rio|🗄️|2',
  // Tier 3 — dígrafos, RR, SS, encontros consonantais
  'tra-ba-lho|💼|3', 'ca-mi-nho|🚶|3', 'ca-chor-ro|🐕|3', 'gui-tar-ra|🎸|3', 'pla-ne-ta|🪐|3', 'men-sa-gem|💬|3',
  'chu-tei-ra|👟|3', 'flo-res-ta|🌳|3', 'pas-sa-gem|🎫|3', 'es-co-la|🏫|3', 'li-vro|📚|3', 'fo-lha|🍃|3',
  'bri-lho|✨|3', 'a-ba-ca-xi|🍍|3', 'ta-ça-bo-la|🏅|3', 'gra-ma-do|🌱|3', 'tro-féu|🏆|3', 'pro-fes-sor|👨‍🏫|3',
  'ba-ta-lha|⚔️|3', 'ca-mi-nhão|🚚|3', 'cam-pe-ão|🥇|3', 'en-tre-vis-ta|🎙️|3', 'bra-ço|💪|3', 'cro-no-me-tro|⏱️|3',
  'pe-ça|🧩|3', 'ma-qui-na|⚙️|3', 'que-bra-ca-be-ça|🧠|3', 'ni-nho|🪹|3', 'chu-va|🌧️|3', 'ma-ca-co|🐒|3',
  // Tier 4 — palavras longas e acentuadas
  'a-pli-ca-ti-vo|📲|4', 'in-ter-net|🌐|4', 'no-ti-fi-ca-ção|🔔|4', 'te-cla-do|⌨️|4', 'trans-mis-são|📡|4',
  'pro-gra-ma|💻|4', 'a-ven-tu-ra|🧭|4', 'cam-pe-o-na-to|🏅|4', 'ob-je-ti-vo|🎯|4', 'cons-tru-ção|🏗️|4',
  'ca-pí-tu-lo|📖|4', 'a-ni-ver-sá-rio|🎂|4', 'e-qui-pe|👥|4', 'ci-ne-ma|🎞️|4', 'es-tá-di-o|🏟️|4',
  'te-le-vi-são|📺|4', 'mu-lher|👩|4', 'ex-cur-são|🚌|4', 'pro-ble-ma|❓|4', 'ex-pe-ri-ên-cia|🔬|4',
  'ar-qui-te-tu-ra|🏛️|4', 'des-cul-pa|🙏|4', 'ge-la-dei-ra|🧊|4', 'ca-ra-me-lo|🍮|4', 'a-ju-da|🤲|4'
];
const WORDS = RAW_WORDS.map(s => {
  const [syl, e, t] = s.split('|'), sy = syl.toUpperCase().split('-');
  return { w: sy.join(''), s: sy, e, t: +t };
});
const WORD_BY = {}; WORDS.forEach(x => WORD_BY[x.w] = x);
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Frases com cenas (Mundo 4, 5 e 7): cena | emoji | certa | errada | errada */
const RAW_PHRASES = [
  'Você chegou em casa com muita fome.|🏠🍕|Eu pedi uma pizza.|Eu perdi o fone.|Eu vi um filme.',
  'Seu amigo chamou para jogar online.|🎮🌙|Vamos jogar hoje à noite.|Vamos jantar de manhã.|Vamos andar de moto.',
  'A bateria do celular acabou.|📱🪫|O celular está sem bateria.|O celular está muito caro.|O sol está sem comida.',
  'Você quer ouvir música, mas esqueceu o fone.|🎧❌|Esqueci o fone em casa.|Esqueci a bola na escola.|Encontrei o fone novo.',
  'Está chovendo forte e você precisa sair.|🌧️☂️|Eu levo o guarda-chuva.|Eu levo o chapéu de praia.|Eu levo a bola de futebol.',
  'Você tirou uma foto legal com a turma.|📸👥|Tirei uma foto com os amigos.|Tirei um dia de folga.|Troquei a foto do carro.',
  'O ônibus da escola demorou muito.|🚌⏰|O ônibus está atrasado.|O almoço está pronto.|A aula está legal.',
  'Você venceu a partida e comemorou.|🏆🎉|Eu ganhei o jogo!|Eu perdi o jogo.|Eu comprei um jogo.',
  'Seu time vai jogar a final no sábado.|⚽🏟️|Meu time joga no sábado.|Meu time dorme no sábado.|Meu tempo acaba no sábado.',
  'Você precisa estudar para a prova.|📚✏️|Eu vou estudar para a prova.|Eu vou comprar uma moto.|Eu vou ver a chuva.',
  'A internet caiu no meio do jogo.|🌐❌|A internet caiu agora.|A internet subiu a rua.|A sorveteria fechou agora.',
  'Você ganhou um presente de aniversário.|🎁🎂|Eu ganhei um presente.|Eu perdi um presente.|Eu guardei um prato.',
  'Você vai andar de bicicleta na praça.|🚲🌳|Vou de bicicleta até a praça.|Vou de ônibus até a lua.|Vou de moto até a mesa.',
  'Você está com sede depois do treino.|💧🏃|Preciso beber água.|Preciso trocar a tela.|Preciso abrir a janela.',
  'Seu professor passou uma tarefa nova.|👨‍🏫📝|Hoje tem tarefa nova.|Hoje tem pizza nova.|Hoje tem festa velha.',
  'Você quer carregar o celular.|🔋🔌|Vou carregar o celular.|Vou lavar o cachorro.|Vou fechar a porta.',
  'Seu amigo mandou uma mensagem.|💬📱|Recebi uma mensagem do amigo.|Recebi uma cadeira do amigo.|Rasguei uma folha do amigo.',
  'Hoje o dia está muito quente.|☀️🥵|O sol está muito forte.|O sol está muito triste.|O som está muito forte.',
  'Você vai ao cinema no fim de semana.|🎬🍿|Vou ao cinema no domingo.|Vou ao vizinho no domingo.|Vou ao mercado no cinema.',
  'Você quer comprar um tênis novo.|👟💰|Quero comprar um tênis novo.|Quero quebrar um tênis novo.|Quero vender um prato novo.',
  'Seu time perdeu, mas você não desistiu.|⚽💪|Vamos treinar mais forte.|Vamos dormir mais cedo.|Vamos fugir da escola.',
  'Você chegou atrasado na escola.|🏫⏰|Cheguei atrasado na aula.|Cheguei pelado na aula.|Comprei atrasado na aula.',
  'Você aprendeu uma música nova no violão.|🎸🎵|Aprendi uma música nova.|Apaguei uma música nova.|Aprendi uma mesa nova.',
  'A fila do mercado está enorme.|🛒🧍🧍🧍|A fila está muito grande.|A fila está muito doce.|A faca está muito grande.'
];
const PHRASES = RAW_PHRASES.map(s => { const p = s.split('|'); return { sc: p[0], e: p[1], ok: p[2], bad: [p[3], p[4]] }; });

/* Chat: remetente | mensagem | antes | palavra (sílabas) | depois | resposta errada | resposta errada */
const RAW_CHAT = [
  'Lucas|Salve! Vamos jogar bola hoje?|Bora! Eu levo a |bo-la|.|Não posso, estou dormindo.|Prefiro comer pizza.',
  'Duda|Qual é o seu esporte favorito?|Meu favorito é o |fu-te-bol|!|Meu favorito é o sorvete.|Eu não gosto de bola.',
  'Mãe|Você já fez o dever de casa?|Já! Terminei a |ta-re-fa|.|Ainda não acordei hoje.|Eu perdi o meu sapato.',
  'Pedro|Me manda uma foto da festa?|Claro! Já mandei a |fo-to|.|Não sei onde fica a rua.|Quero comer bolo agora.',
  'Bia|Qual música você curte?|Eu amo essa |mú-si-ca|!|Eu amo essa porta!|Não tenho música nenhuma.',
  'Rafa|Você vai de ônibus amanhã?|Vou sim, pego o |ô-ni-bus|.|Vou sim, pego o sorvete.|Não vou ao cinema hoje.',
  'Gabi|Valeu pela ajuda no jogo!|De nada, |a-mi-go|!|De nada, cadeira!|Eu não joguei nada.',
  'Davi|Que horas começa a aula?|Começa na |es-co-la|.|Começa no sorvete.|Eu não gosto de chuva.',
  'Lia|Você viu o novo vídeo do canal?|Vi sim! Achei o |ví-de-o| ótimo.|Vi sim! Achei o prato ótimo.|Não vi a rua nova.',
  'Caio|Tá sem bateria de novo?|Sim, preciso do |car-re-ga-dor|.|Sim, preciso do cachorro.|Não, eu estou com sono.',
  'Nina|Você sabe a senha do wifi?|Sei sim, é na |re-de| da casa.|Sei sim, é na rua da lua.|Não sei andar de moto.',
  'Teo|Quer pizza ou hambúrguer?|Quero |piz-za|, por favor.|Quero chuva, por favor.|Não quero ir à escola.',
  'Vovó|Você vem almoçar domingo?|Vou sim, vovó! Vou de |ô-ni-bus|.|Vou sim, vovó! Vou de colher.|Eu não gosto de domingo.',
  'Sara|Qual é o seu jogo favorito?|Meu favorito é o |jo-go| de corrida.|Meu favorito é o bolo de corrida.|Não tenho nenhum favorito.',
  'Léo|Vai ter prova de matemática?|Vai sim, vou estudar o |li-vro|.|Vai sim, vou estudar a chuva.|Não vai ter sol amanhã.',
  'Ana|Onde você deixou o fone?|Deixei o |fo-ne| na mochila.|Deixei o sono na mochila.|Deixei a lua na mesa.'
];
const CHATS = RAW_CHAT.map(s => {
  const p = s.split('|'), sy = p[3].toUpperCase().split('-');
  return { from: p[0], msg: p[1], before: p[2], s: sy, word: sy.join(''), after: p[4], bad: [p[5], p[6]] };
});

/* Textos curtos (Mundo 7): título | texto | (pergunta | certa | errada | errada) × 2 */
const RAW_TEXTS = [
  'O treino de sábado|Pedro acordou cedo no sábado. Ele colocou a chuteira e foi para o campo. O treino começou às nove horas. No final, o técnico elogiou o time.|Quando Pedro acordou?|Cedo, no sábado.|Tarde, no domingo.|À noite, na sexta.|Quem elogiou o time?|O técnico.|O vizinho.|A professora.',
  'A mensagem nova|Bia estava na escola quando o celular vibrou. Era uma mensagem da mãe. Ela pedia para comprar pão na volta para casa. Bia respondeu que sim.|Quem mandou a mensagem?|A mãe da Bia.|O treinador.|O professor.|O que a mãe pediu?|Comprar pão.|Comprar um tênis.|Lavar o carro.',
  'O jogo online|Davi e os amigos combinaram de jogar à noite. Cada um entrou na sala às oito horas. O time de Davi ganhou duas partidas seguidas. Todos riram muito no final.|A que horas eles entraram na sala?|Às oito horas.|Às cinco horas.|À meia-noite.|Quantas partidas o time ganhou?|Duas.|Cinco.|Nenhuma.',
  'A viagem de ônibus|A turma foi de ônibus até o museu da cidade. A viagem durou uma hora. No museu, eles viram fotos antigas e máquinas diferentes. Na volta, todos estavam cansados.|Para onde a turma foi?|Para o museu.|Para a praia.|Para o estádio.|Quanto tempo durou a viagem?|Uma hora.|Cinco horas.|Um dia inteiro.',
  'Receita de lanche|Lia quer fazer um lanche rápido. Ela pega o pão, o queijo e o tomate. Primeiro, ela corta o tomate. Depois, coloca tudo dentro do pão e come.|O que Lia quer fazer?|Um lanche rápido.|Um bolo de festa.|Uma sopa quente.|O que ela faz primeiro?|Corta o tomate.|Come o pão.|Pega o ônibus.',
  'O aplicativo novo|Caio baixou um aplicativo de música no celular. Ele criou uma lista com as suas dez músicas favoritas. À noite, ele ouviu a lista inteira com o fone. Depois, mandou o link para um amigo.|O que Caio baixou?|Um aplicativo de música.|Um jogo de corrida.|Um livro de receitas.|Quando ele ouviu a lista?|À noite.|De manhã.|No almoço.',
  'Dia de chuva|Choveu forte o dia inteiro na cidade. Nina ficou em casa e leu um livro de aventura. A mãe fez pipoca para os dois. Quando a chuva parou, o céu ficou cheio de estrelas.|Onde Nina ficou?|Em casa.|Na praça.|No campo.|O que a mãe fez?|Pipoca.|Uma pizza.|Um bolo.',
  'A final do campeonato|O time da escola chegou à final do campeonato. O jogo foi no estádio da cidade e teve muita torcida. No último minuto, Léo fez o gol da vitória. A equipe ganhou o troféu.|Onde foi o jogo?|No estádio da cidade.|Na rua da escola.|No cinema.|Quem fez o gol da vitória?|Léo.|Davi.|Pedro.'
];
const TEXTS = RAW_TEXTS.map(s => {
  const p = s.split('|');
  return { title: p[0], text: p[1], qs: [{ q: p[2], ok: p[3], bad: [p[4], p[5]] }, { q: p[6], ok: p[7], bad: [p[8], p[9]] }] };
});

/* Números por extenso (pt-BR, 0 a 9999) */
const U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CT = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
function numWords(n) {
  if (n < 20) return U[n];
  if (n < 100) return DZ[Math.floor(n / 10)] + (n % 10 ? ' e ' + U[n % 10] : '');
  if (n === 100) return 'cem';
  if (n < 1000) return CT[Math.floor(n / 100)] + (n % 100 ? ' e ' + numWords(n % 100) : '');
  const m = Math.floor(n / 1000), r = n % 1000, mil = (m === 1 ? 'mil' : numWords(m) + ' mil');
  if (!r) return mil;
  return mil + ((r < 100 || r % 100 === 0) ? ' e ' : ' ') + numWords(r);
}
const money = (r, c) => {
  const a = r === 1 ? 'um real' : numWords(r) + ' reais';
  return c ? a + ' e ' + (c === 1 ? 'um centavo' : numWords(c) + ' centavos') : a;
};
const HORAS = ['meia-noite', 'uma hora', 'duas horas', 'três horas', 'quatro horas', 'cinco horas', 'seis horas', 'sete horas', 'oito horas', 'nove horas', 'dez horas', 'onze horas', 'meio-dia'];
function timeWords(h, m) {
  const hh = h % 12 === 0 ? (h === 0 ? 'meia-noite' : 'meio-dia') : numWords(h % 12);
  const unit = (h % 12 === 1) ? 'uma' : (h % 12 === 2 ? 'duas' : hh);
  const per = h < 6 ? 'da madrugada' : h < 12 ? 'da manhã' : h < 18 ? 'da tarde' : 'da noite';
  if (h === 0 || h === 12) return m === 0 ? hh : hh + (m === 30 ? ' e meia' : ' e ' + numWords(m));
  const base = m === 0 ? (unit + (unit === 'uma' ? ' hora' : ' horas')) : (unit + (m === 30 ? ' e meia' : ' e ' + numWords(m)));
  return base + ' ' + per;
}
