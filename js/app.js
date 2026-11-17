/* TripYaCa — Caio e Ya na Ilha Grande */
import { store } from './store.js';
import { VIAGEM } from './seed.js';
import { carregarClima, climaCache, emojiClima, descClima } from './clima.js';

/* ================================================= utilidades */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PESSOAS = { caio: 'Caio', yasmin: 'Yasmin' };
const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DOW_LONGO = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const TIPOS = {
  transporte: { e: '🚐', n: 'Transporte' }, trilha: { e: '🥾', n: 'Trilha' }, passeio: { e: '🏖️', n: 'Passeio' },
  comida: { e: '🍽️', n: 'Comida' }, camping: { e: '⛺', n: 'Camping' }, outro: { e: '📌', n: 'Outro' }
};
const brl = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: Number(v) % 1 ? 2 : 0, maximumFractionDigits: 2 });

// "agora" pode ser simulado para testes: ?agora=2026-11-20T09:30
const AGORA_FAKE = new URLSearchParams(location.search).get('agora');
const agora = () => AGORA_FAKE ? new Date(new Date(AGORA_FAKE + '-03:00').getTime() + (performance.now() - T0)) : new Date();
const T0 = performance.now();
const quando = (dia, hora) => new Date(`${dia}T${(hora || '00:00')}:00-03:00`);
const hojeISO = () => { const d = new Date(agora().getTime() - 3 * 3600e3); return d.toISOString().slice(0, 10); };
const diaInfo = iso => { const d = new Date(iso + 'T12:00:00-03:00'); return { n: d.getUTCDate(), dow: DOW[d.getUTCDay()], longo: DOW_LONGO[d.getUTCDay()] }; };
function dur(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  if (h < 24) return h + 'h' + (r ? String(r).padStart(2, '0') : '');
  const d = Math.floor(h / 24), hh = h % 24;
  return d + (d > 1 ? ' dias' : ' dia') + (hh ? ' e ' + hh + 'h' : '');
}

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 2.6a2.2 2.2 0 0 1 2.8 0l7 5.6c.5.4.8 1 .8 1.7v9.4a2.2 2.2 0 0 1-2.2 2.2H5a2.2 2.2 0 0 1-2.2-2.2V9.9c0-.7.3-1.3.8-1.7z"/></svg>',
  rot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
  ilha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18c2 0 2-1.4 4.5-1.4S10 18 12 18s2-1.4 4.5-1.4S19 18 21 18"/><path d="M6 14.5c1.8-4 4.4-6 6-6s4.2 2 6 6"/><path d="M12 8.5V4m0 0 3 1.6M12 4 9 5.6"/></svg>',
  comer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.6-3.5 7v3H17"/></svg>',
  mais: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>'
};

let toastT;
function toast(msg, ms = 2400) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms); }

function abrirSheet(html, aoAbrir) {
  const s = $('#sheet'); s.innerHTML = '<div class="puxa"></div>' + html; s.scrollTop = 0;
  document.body.classList.add('sheet-on'); aoAbrir && aoAbrir(s);
}
function fecharSheet() { document.body.classList.remove('sheet-on'); }
$('#sheet-bg').addEventListener('click', fecharSheet);

const mapsUrl = (lat, lon, nome) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}${nome ? '' : ''}`;
const mapsBusca = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* ================================================= dados estáticos (lugares, restaurantes, infos) */
const DADOS = {};
async function dados(nome) {
  if (!DADOS[nome]) DADOS[nome] = fetch(`data/${nome}.json`).then(r => r.json()).catch(() => null);
  return DADOS[nome];
}
let LUGARES = {};
dados('lugares').then(l => { if (l) { LUGARES = Object.fromEntries(l.lugares.map(x => [x.id, x])); if (store.cfg.eu && ['inicio', 'roteiro'].includes(S.sub || S.tab) && !document.body.classList.contains('sheet-on')) render(); } });

/* ================================================= estado da tela */
const S = { tab: 'inicio', sub: null, dia: null, ckDono: null, comer: 'dia', comerFiltro: '', diaDiario: null };
function setDiaPadrao() {
  const h = hojeISO();
  S.dia = VIAGEM.dias.includes(h) ? h : VIAGEM.dias[0];
  S.diaDiario = S.dia;
}

/* ================================================= roteiro: lógica */
function roteiro(dia) {
  return store.lista('roteiro').filter(i => !dia || i.dia === dia)
    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora) || (a._u - b._u));
}
function situacao() {
  const t = agora(), todos = roteiro();
  const ini = quando(VIAGEM.inicio, todos[0]?.hora || '00:00');
  const ultimo = todos[todos.length - 1];
  const fim = ultimo ? new Date(quando(ultimo.dia, ultimo.hora).getTime() + 2 * 3600e3) : quando(VIAGEM.fim, '23:59');
  const fase = t < ini ? 'antes' : t > fim ? 'depois' : 'durante';
  // item atual = último que já começou e não está feito; próximo = primeiro que ainda não começou
  let atual = null, prox = null;
  for (const i of todos) {
    const q = quando(i.dia, i.hora);
    if (q <= t) { if (!i.feito) atual = i; } else if (!prox && !i.feito) prox = i;
  }
  if (atual && t - quando(atual.dia, atual.hora) > 3 * 3600e3) atual = null; // não arrasta coisa muito antiga
  const proxCrit = todos.find(i => i.critico && !i.feito && quando(i.dia, i.hora) > new Date(t.getTime() - 90 * 60e3));
  return { fase, ini, fim, atual, prox, proxCrit, t };
}
function alertaHtml(sit) {
  const c = sit.proxCrit; if (!c) return '';
  const falta = quando(c.dia, c.hora) - sit.t;
  const nome = c.curto || c.titulo;
  if (falta < 0) return `<div class="alerta ruim"><span class="e">⏰</span><div><b>${esc(cap(nome))}</b> era às ${esc(c.hora)} — ${dur(-falta)} atrás. Já foi? Marque como feito.</div></div>`;
  if (falta <= 30 * 60e3) return `<div class="alerta forte"><span class="e">⚠️</span><div>Faltam <b>${dur(falta)}</b> para ${esc(nome)} (${esc(c.hora)})!</div></div>`;
  if (falta <= 2 * 3600e3) return `<div class="alerta"><span class="e">⏳</span><div>Faltam <b>${dur(falta)}</b> para ${esc(nome)} (${esc(c.hora)}).</div></div>`;
  return '';
}
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

/* ================================================= render geral */
function render() {
  if (!store.cfg.eu) return renderBoasVindas();
  renderTabbar();
  const app = $('#app');
  const tela = S.sub || S.tab;
  const f = TELAS[tela] || TELAS.inicio;
  app.innerHTML = f();
  if (POS[tela]) POS[tela]();
  $('.fab')?.remove();
  if (tela === 'roteiro') { const b = document.createElement('button'); b.className = 'fab'; b.textContent = '+'; b.onclick = () => editarItem(null); document.body.appendChild(b); }
}
function renderTabbar() {
  const pend = store.lista('pend').filter(p => !p.ok).length;
  const fase = situacao().fase;
  const tabs = [['inicio', 'home'], ['roteiro', 'rot'], ['ilha', 'ilha'], ['comer', 'comer'], ['mais', 'mais']];
  $('#tabbar').innerHTML = tabs.map(([t, ic]) => `<button data-tab="${t}" class="${S.tab === t ? 'on' : ''}" aria-label="${t}">${ICON[ic]}${t === 'mais' && pend && fase === 'antes' ? `<span>${pend}</span>` : ''}</button>`).join('');
}
$('#tabbar').addEventListener('click', e => {
  const b = e.target.closest('[data-tab]'); if (!b) return;
  const t = b.dataset.tab;
  if (S.tab === t && !S.sub) { scrollTo({ top: 0, behavior: 'smooth' }); return; }
  S.tab = t; S.sub = null; scrollTo(0, 0); render();
});

function syncBadge() {
  const st = store.status, n = store.pendentes;
  if (!store.temServidor()) return `<button class="sync off" data-act="ajustes"><i></i>Só neste celular</button>`;
  if (st.sincronizando) return `<span class="sync run"><i></i>Sincronizando…</span>`;
  if (!st.online) return `<button class="sync off" data-act="ajustes"><i></i>Offline${n ? ` · ${n} p/ enviar` : ''}</button>`;
  if (st.erro) return `<button class="sync err" data-act="ajustes"><i></i>${n ? n + ' p/ enviar' : 'Erro'}</button>`;
  return `<button class="sync" data-act="sync"><i></i>${n ? n + ' p/ enviar' : 'Sincronizado'}</button>`;
}
function topo(titulo) {
  return `<div class="topo"><div class="marca"><img src="icons/icon-192.png" alt="">${titulo ? esc(titulo) : 'TripYaCa'}</div><span id="syncb">${syncBadge()}</span></div>`;
}
function diasHtml(sel, acao = 'dia') {
  const h = hojeISO();
  return `<div class="dias" id="dias">${VIAGEM.dias.map(d => { const i = diaInfo(d); return `<button class="dia ${d === sel ? 'on' : ''} ${d === h ? 'hoje' : ''}" data-act="${acao}" data-dia="${d}"><small>${i.dow}</small><b>${i.n}</b></button>`; }).join('')}</div>`;
}

/* ================================================= telas */
const TELAS = {}, POS = {};

/* ---------- Início */
TELAS.inicio = () => {
  const sit = situacao();
  const pend = store.lista('pend'); const pOk = pend.filter(p => p.ok).length;
  let big = '';
  if (sit.fase === 'antes') {
    const falta = sit.ini - sit.t;
    const dias = Math.ceil((quando(VIAGEM.inicio, '00:00') - quando(new Date(sit.t.getTime() - 3 * 3600e3).toISOString().slice(0, 10), '00:00')) / 86400e3);
    big = dias >= 1
      ? `<div class="n">${dias}</div><div class="l">${dias === 1 ? 'dia' : 'dias'} para a Ilha 🏝️</div>`
      : `<div class="n">${dur(falta).replace(/(\d+)h(\d*)/, (m, a, b) => a + '<small>h' + b + '</small>')}</div><div class="l">para a Ilha 🏝️ · ${esc(roteiro()[0]?.curto || 'saída')} às ${esc(roteiro()[0]?.hora || '')}</div>`;
  } else if (sit.fase === 'durante') {
    const alvo = sit.prox;
    if (alvo) {
      const f = quando(alvo.dia, alvo.hora) - sit.t;
      big = `<div class="n">${fmtBig(f)}</div><div class="l">para ${esc(alvo.curto || alvo.titulo)}</div>`;
    } else big = `<div class="n">🌙</div><div class="l">Fim da programação de hoje</div>`;
  } else {
    big = `<div class="n">4</div><div class="l">dias inesquecíveis na Ilha Grande 💛</div>`;
  }
  const cl = climaCache();
  const diaRef = VIAGEM.dias.includes(hojeISO()) ? hojeISO() : VIAGEM.dias[0];
  const cd = cl?.dias?.find(d => d.dia === diaRef);
  const mare = cl?.mare?.filter(m => m.t > sit.t.getTime()).find(m => m.tipo === 'alta');
  const hoje = roteiro(hojeISO()); const feitosHoje = hoje.filter(i => i.feito).length;
  const tile3 = sit.fase === 'antes'
    ? `<div class="tile" data-act="sub" data-sub="pend"><small>Pendências</small><b>${pOk}/${pend.length}</b><em>resolvidas</em></div>`
    : `<div class="tile" data-act="tab" data-tab="roteiro"><small>Hoje</small><b>${feitosHoje}/${hoje.length}</b><em>feitos</em></div>`;

  let h = `<div class="hero">${topo()}${diasHtml(sit.fase === 'durante' ? hojeISO() : null, 'dia-rot')}
    <div class="big">${big}</div>
    <div class="tiles">
      <div class="tile" data-act="sub" data-sub="clima"><small>Clima</small><b>${cd ? emojiClima(cd.code) + ' ' + Math.round(cd.max) + '°' : '—'}</b><em>${cd ? diaInfo(cd.dia).dow + ' ' + diaInfo(cd.dia).n : 'abra com sinal'}</em></div>
      <div class="tile" data-act="sub" data-sub="clima"><small>Maré alta</small><b>${mare ? horaDe(mare.t) : '—'}</b><em>${mare ? diaCurto(mare.t) : 'estimativa'}</em></div>
      ${tile3}
    </div></div><div class="pad">`;
  h += alertaHtml(sit);

  if (sit.fase !== 'depois') {
    h += `<h2>${sit.fase === 'antes' ? 'Primeiros passos' : 'Agora'}</h2>`;
    const lista = sit.fase === 'antes' ? roteiro(VIAGEM.inicio).slice(0, 2) : [sit.atual, sit.prox].filter(Boolean);
    if (!lista.length) h += `<div class="card vazio">Nada programado agora. Aproveitem! 🌊</div>`;
    lista.forEach((i, n) => {
      const q = quando(i.dia, i.hora), f = q - sit.t;
      const rotulo = sit.fase === 'antes' ? (n ? 'Depois' : 'Primeiro') : (i === sit.atual ? 'Agora' : 'Próximo');
      h += `<div class="card agora" data-act="item" data-id="${i.id}"><div class="ic" style="${i.critico ? 'background:var(--sand)' : ''}">${TIPOS[i.tipo]?.e || '📌'}</div>
        <div class="tx"><small>${rotulo}${i.critico ? ' · importante' : ''}</small><b>${esc(i.titulo)}</b><span class="small muted">${f > 0 ? 'em ' + dur(f) : 'começou há ' + dur(-f)}</span></div>
        <div class="hr">${esc(i.hora)}</div></div>`;
    });
    // próximos do dia
    const resto = roteiro(sit.fase === 'durante' ? hojeISO() : VIAGEM.inicio).filter(i => !i.feito && quando(i.dia, i.hora) > sit.t && !lista.includes(i)).slice(0, 4);
    if (resto.length) {
      h += `<h2>Ainda ${sit.fase === 'antes' ? 'no dia 19' : 'hoje'} <button class="mais" data-act="tab" data-tab="roteiro">ver tudo</button></h2>`;
      h += resto.map(i => itemHtml(i, { mini: true })).join('');
    }
  } else {
    h += `<div class="card" style="text-align:center"><div style="font-size:42px">🏝️💛</div><p class="txt">Que viagem! Bora relembrar?</p><button class="btn azul" data-act="retro">Ver a retrospectiva</button></div>`;
  }
  if (sit.fase === 'antes') {
    const abertas = pend.filter(p => !p.ok).slice(0, 4);
    h += `<h2>Pendências <button class="mais" data-act="sub" data-sub="pend">todas</button></h2><div class="card">
      <div class="small muted">${pOk} de ${pend.length} resolvidas</div><div class="barra"><i style="width:${pend.length ? pOk / pend.length * 100 : 0}%"></i></div>
      ${abertas.map(p => `<div class="linha-v" data-act="pend-ok" data-id="${p.id}"><span>${esc(p.texto)}</span><span class="check"></span></div>`).join('') || '<div class="small muted">Tudo pronto! ✨</div>'}</div>`;
  }
  h += climaResumoHtml();
  h += '</div>';
  return h;
};
POS.inicio = () => { if (!climaCache() || Date.now() - (climaCache().t || 0) > 3 * 3600e3) carregarClima().then(ok => ok && S.tab === 'inicio' && !S.sub && render()); };
function fmtBig(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return m + '<small>min</small>';
  const h = Math.floor(m / 60), r = m % 60;
  if (h < 24) return h + '<small>h</small>' + String(r).padStart(2, '0');
  return Math.floor(h / 24) + '<small>d</small>' + (h % 24) + '<small>h</small>';
}
const horaDe = t => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
const diaCurto = t => { const iso = new Date(t - 3 * 3600e3).toISOString().slice(0, 10); const i = diaInfo(iso); return i.dow + ' ' + i.n; };
function climaResumoHtml() {
  const cl = climaCache(); if (!cl?.dias?.length) return '';
  return `<h2>Clima na Ilha <button class="mais" data-act="sub" data-sub="clima">detalhes</button></h2><div class="clima">${cl.dias.map(d => `<div class="${d.dia === hojeISO() ? 'on' : ''}"><small>${diaInfo(d.dia).dow} ${diaInfo(d.dia).n}</small><div class="e">${emojiClima(d.code)}</div><b>${Math.round(d.max)}°</b><small>${d.chuva ?? 0}% chuva</small></div>`).join('')}</div>`;
}

/* ---------- Roteiro */
function itemHtml(i, o = {}) {
  const sit = o.sit; const tp = TIPOS[i.tipo] || TIPOS.outro;
  const ehAgora = sit && sit.atual && sit.atual.id === i.id;
  const lugar = i.lugar && LUGARES[i.lugar];
  return `<div class="item ${i.feito ? 'feito' : ''} ${i.critico ? 'critico' : ''} ${ehAgora ? 'agora-on' : ''}" data-id="${i.id}">
    ${o.mini ? '' : `<button class="check ${i.feito ? 'on' : ''}" data-act="feito" data-id="${i.id}" aria-label="Feito">${i.feito ? '✓' : ''}</button>`}
    <div class="hora">${esc(i.hora)}<small>${tp.e}</small></div>
    <div class="corpo" data-act="item" data-id="${i.id}"><b>${esc(i.titulo)}</b>${i.nota ? `<p>${esc(i.nota)}</p>` : ''}
      ${o.mini ? '' : `<div class="tags">${i.critico ? '<span class="tag crit">⏰ importante</span>' : ''}${i.feito && i.feitoPor ? `<span class="tag ok">✓ ${esc(PESSOAS[i.feitoPor] || '')}</span>` : ''}${lugar ? `<a class="tag maps" href="${mapsUrl(lugar.lat, lugar.lon)}" target="_blank" rel="noopener">📍 Maps</a>` : ''}</div>`}</div>
    ${o.mini ? '' : '<div class="alca" data-drag="1" aria-label="Arrastar">⋮⋮</div>'}</div>`;
}
TELAS.roteiro = () => {
  const sit = situacao();
  const itens = roteiro(S.dia);
  const di = diaInfo(S.dia);
  let h = `<div class="hero curto">${topo('Roteiro')}${diasHtml(S.dia)}</div><div class="pad">`;
  h += `<h2 style="margin-top:14px">${cap(di.longo)}, ${di.n} de novembro <span class="muted small" style="font-weight:500">· ${itens.filter(i => i.feito).length}/${itens.length} feitos</span></h2>`;
  h += alertaHtml(sit);
  h += `<div class="dica-arraste">Segure ⋮⋮ e arraste para trocar horários · solte num dia lá em cima para mudar de dia</div>`;
  h += `<div class="lista" id="lista">`;
  let marcou = false;
  for (const i of itens) {
    if (!marcou && S.dia === hojeISO() && quando(i.dia, i.hora) > sit.t) { h += `<div class="linha-agora">AGORA ${horaDe(sit.t.getTime())}</div>`; marcou = true; }
    h += itemHtml(i, { sit });
  }
  if (!itens.length) h += `<div class="card vazio">Nenhum item neste dia.<br>Toque no + para adicionar.</div>`;
  h += `</div></div>`;
  return h;
};
POS.roteiro = () => { ativarArraste(); const a = $('.agora-on'); if (a && !S._rolou) { S._rolou = true; a.scrollIntoView({ block: 'center' }); } };

/* arrastar cards: troca os horários entre os itens; soltar num dia move o item para ele */
function ativarArraste() {
  const lista = $('#lista'); if (!lista) return;
  lista.addEventListener('pointerdown', e => {
    const alca = e.target.closest('[data-drag]'); if (!alca) return;
    e.preventDefault();
    const el = alca.closest('.item'); const id = el.dataset.id;
    const itens = $$('.item', lista); const idx0 = itens.indexOf(el);
    const rects = itens.map(x => x.getBoundingClientRect());
    const passo = rects.length > 1 ? rects[1].top - rects[0].top : rects[0].height + 10;
    const y0 = e.clientY; let alvo = idx0, diaAlvo = null;
    el.classList.add('arrastando'); el.setPointerCapture(e.pointerId);
    navigator.vibrate?.(15);
    const mover = ev => {
      const dy = ev.clientY - y0; el.style.transform = `translateY(${dy}px) scale(1.03)`;
      const centro = rects[idx0].top + rects[idx0].height / 2 + dy;
      alvo = idx0;
      rects.forEach((r, k) => { if (k < idx0 && centro < r.top + r.height / 2) alvo = Math.min(alvo, k); if (k > idx0 && centro > r.top + r.height / 2) alvo = Math.max(alvo, k); });
      itens.forEach((x, k) => {
        if (x === el) return;
        let s = 0; if (idx0 < alvo && k > idx0 && k <= alvo) s = -passo; if (idx0 > alvo && k >= alvo && k < idx0) s = passo;
        x.style.transform = s ? `translateY(${s}px)` : '';
      });
      // sobre um dia?
      diaAlvo = null;
      $$('#dias .dia').forEach(d => { const r = d.getBoundingClientRect(); const on = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top - 10 && ev.clientY <= r.bottom + 10; d.classList.toggle('drop', on); if (on) diaAlvo = d.dataset.dia; });
      // rolar a tela perto das bordas
      if (ev.clientY < 90) scrollBy(0, -8); else if (ev.clientY > innerHeight - 120) scrollBy(0, 8);
    };
    const soltar = () => {
      el.releasePointerCapture?.(e.pointerId);
      el.removeEventListener('pointermove', mover); el.removeEventListener('pointerup', soltar); el.removeEventListener('pointercancel', soltar);
      itens.forEach(x => { x.style.transform = ''; x.classList.remove('arrastando'); });
      $$('#dias .dia').forEach(d => d.classList.remove('drop'));
      if (diaAlvo && diaAlvo !== S.dia) {
        store.salvar('roteiro', id, { dia: diaAlvo });
        toast(`Movido para ${diaInfo(diaAlvo).dow} ${diaInfo(diaAlvo).n} ✓`); render(); return;
      }
      if (alvo !== idx0) {
        const objs = roteiro(S.dia); const horas = objs.map(o => o.hora);
        const nova = objs.slice(); const [m] = nova.splice(idx0, 1); nova.splice(alvo, 0, m);
        nova.forEach((o, k) => { if (o.hora !== horas[k]) store.salvar('roteiro', o.id, { hora: horas[k] }); });
        toast(`${m.titulo.slice(0, 28)} → ${horas[alvo]}`);
        render();
      }
    };
    el.addEventListener('pointermove', mover); el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
  });
}

function editarItem(id) {
  const i = id ? store.get('roteiro', id) : { dia: S.dia, hora: proxHora(), titulo: '', tipo: 'outro', critico: false, nota: '', curto: '', lugar: '' };
  if (!i) return;
  const lugares = Object.values(LUGARES).sort((a, b) => a.nome.localeCompare(b.nome));
  abrirSheet(`<h3>${id ? 'Editar' : 'Novo item'}<button class="x" data-act="fechar">✕</button></h3>
    <label class="campo"><span>O que vão fazer</span><input class="inp" id="f-tit" value="${esc(i.titulo)}" placeholder="Ex.: Barca para Mangaratiba"></label>
    <label class="campo"><span>Dia</span><div class="chips" id="f-dia">${VIAGEM.dias.map(d => `<button class="chip ${d === i.dia ? 'on' : ''}" data-v="${d}">${diaInfo(d).dow} ${diaInfo(d).n}</button>`).join('')}</div></label>
    <label class="campo"><span>Horário</span><input class="inp" type="time" id="f-hora" value="${esc(i.hora)}"></label>
    <label class="campo"><span>Tipo</span><div class="chips" id="f-tipo">${Object.entries(TIPOS).map(([k, t]) => `<button class="chip ${k === i.tipo ? 'on' : ''}" data-v="${k}">${t.e} ${t.n}</button>`).join('')}</div></label>
    <div class="sw ${i.critico ? 'on' : ''}" id="f-crit"><div><b style="font-size:15px">Importante ⏰</b><div class="small muted">Contagem regressiva e aviso de atraso (barca, van, Uber…)</div></div><i></i></div>
    <label class="campo" id="f-curto-w" style="${i.critico ? '' : 'display:none'}"><span>Nome curto na contagem ("Faltam 20 min para …")</span><input class="inp" id="f-curto" value="${esc(i.curto)}" placeholder="a barca"></label>
    <label class="campo"><span>Lugar (botão do Maps)</span><select class="inp" id="f-lugar"><option value="">—</option>${lugares.map(l => `<option value="${l.id}" ${l.id === i.lugar ? 'selected' : ''}>${esc(l.nome)}</option>`).join('')}</select></label>
    <label class="campo"><span>Observação</span><textarea class="inp" id="f-nota" placeholder="Opcional">${esc(i.nota)}</textarea></label>
    <button class="btn" data-act="salvar-item">Salvar</button>
    ${id ? `<div class="btns"><button class="btn sec" data-act="dup-item">Duplicar</button><button class="btn perigo" data-act="apagar-item">Apagar</button></div>` : ''}`, s => {
    s.dataset.id = id || '';
    const chips = sel => $(sel, s).addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; $$('.chip', $(sel, s)).forEach(x => x.classList.toggle('on', x === c)); });
    chips('#f-dia'); chips('#f-tipo');
    $('#f-crit', s).onclick = () => { const on = $('#f-crit', s).classList.toggle('on'); $('#f-curto-w', s).style.display = on ? '' : 'none'; };
    if (!id) setTimeout(() => $('#f-tit', s).focus(), 350);
  });
}
function proxHora() { const it = roteiro(S.dia); const u = it[it.length - 1]; if (!u) return '09:00'; const [h, m] = u.hora.split(':').map(Number); return String(Math.min(23, h + 1)).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
function lerForm() {
  const s = $('#sheet');
  return {
    titulo: $('#f-tit', s).value.trim(), dia: $('#f-dia .on', s)?.dataset.v, hora: $('#f-hora', s).value || '00:00',
    tipo: $('#f-tipo .on', s)?.dataset.v || 'outro', critico: $('#f-crit', s).classList.contains('on'),
    curto: $('#f-curto', s).value.trim(), lugar: $('#f-lugar', s).value, nota: $('#f-nota', s).value.trim()
  };
}

/* ---------- Ilha 3D */
TELAS.ilha = () => `<div class="hero curto">${topo('Ilha Grande 3D')}<div class="sub" style="margin-top:8px">Gire com um dedo · zoom com dois · toque nos pontos</div></div>
  <div class="ilha-wrap" id="ilha"><div class="ilha-load" id="ilha-load">Montando a Ilha… 🏝️</div></div>
  <div class="trilhas-chips" id="trilhas-chips"></div><div class="pad" id="ilha-info"></div>`;
POS.ilha = async () => {
  try {
    const m = await import('./ilha3d.js');
    if (S.tab !== 'ilha') return;
    await m.montarIlha($('#ilha'), { abrirLugar, abrirTrilha, chips: $('#trilhas-chips') });
    $('#ilha-load')?.remove();
  } catch (e) { console.error(e); const l = $('#ilha-load'); if (l) l.textContent = 'Não consegui montar o 3D neste celular 😕'; }
};
async function abrirLugar(id) {
  const L = (await dados('lugares'))?.lugares.find(x => x.id === id); if (!L) return;
  const fatos = [L.alt ? ['Altitude', L.alt + ' m'] : null, L.tipoNome ? ['Tipo', L.tipoNome] : null, L.dist ? ['Do Abraão', L.dist] : null].filter(Boolean);
  abrirSheet(`<h3>${esc(L.nome)}<button class="x" data-act="fechar">✕</button></h3>
    ${L.foto ? `<img class="lugar-foto" src="${esc(L.foto)}" alt="${esc(L.nome)}" loading="lazy"><div class="credito">${esc(L.credito || '')}</div>` : ''}
    ${fatos.length ? `<div class="fatos">${fatos.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
    <div class="card txt">${(L.curiosidades || []).map(c => `<p style="margin:0 0 10px">${esc(c)}</p>`).join('')}</div>
    ${L.noRoteiro ? `<div class="alerta" style="margin-top:0"><span class="e">🗓️</span><div>Está no roteiro: <b>${esc(L.noRoteiro)}</b></div></div>` : ''}
    <a class="btn azul" href="${mapsUrl(L.lat, L.lon)}" target="_blank" rel="noopener">📍 Abrir no Maps</a>`);
}
async function abrirTrilha(t) {
  abrirSheet(`<h3>${esc(t.nome)}<button class="x" data-act="fechar">✕</button></h3>
    ${t.foto ? `<img class="lugar-foto" src="${esc(t.foto)}" alt="" loading="lazy"><div class="credito">${esc(t.credito || '')}</div>` : ''}
    <div class="fatos"><div><small>Distância</small><b>${esc(t.km || '—')}</b></div><div><small>Tempo</small><b>${esc(t.tempo || '—')}</b></div><div><small>Nível</small><b>${esc(t.dif || '—')}</b></div></div>
    ${t.codigo ? `<div class="small muted" style="margin:0 4px 10px">Código oficial do parque (INEA): <b>${esc(t.codigo)}</b></div>` : ''}
    <div class="card txt">${(t.curiosidades || []).map(c => `<p style="margin:0 0 10px">${esc(c)}</p>`).join('')}</div>
    ${t.noRoteiro ? `<div class="alerta" style="margin-top:0"><span class="e">🗓️</span><div>Vocês fazem: <b>${esc(t.noRoteiro)}</b></div></div>` : ''}
    ${t.maps ? `<a class="btn azul" href="${t.maps}" target="_blank" rel="noopener">📍 Abrir início da trilha no Maps</a>` : ''}`);
}

/* ---------- Restaurantes */
TELAS.comer = () => `<div class="hero curto">${topo('Onde comer')}<div class="sub" style="margin-top:8px">Pesquisado em guias e avaliações · as notas são de referência</div></div><div class="pad" id="comer"><div class="vazio">Carregando…</div></div>`;
POS.comer = async () => {
  const d = await dados('restaurantes'); const el = $('#comer'); if (!el) return;
  if (!d) { el.innerHTML = '<div class="vazio">Não consegui carregar os restaurantes.</div>'; return; }
  const lista = d.restaurantes.filter(r => S.comer === 'todos' || r.periodo === S.comer || r.periodo === 'ambos')
    .filter(r => !S.comerFiltro || (S.comerFiltro === 'conta' ? r.preco === '$' : S.comerFiltro === 'rec' ? r.recomendo : r.local?.toLowerCase().includes(S.comerFiltro)))
    .sort((a, b) => (b.recomendo ? 1 : 0) - (a.recomendo ? 1 : 0));
  el.innerHTML = `<div class="seg" style="margin-top:14px">${[['dia', '☀️ De dia'], ['noite', '🌙 À noite'], ['todos', 'Todos']].map(([k, n]) => `<button class="${S.comer === k ? 'on' : ''}" data-act="comer" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="chips" style="margin-bottom:14px">${[['', 'Tudo'], ['rec', '⭐ Recomendo'], ['conta', '💸 Mais em conta'], ['abra', 'No Abraão'], ['praia', 'Nas praias']].map(([k, n]) => `<button class="chip ${S.comerFiltro === k ? 'on' : ''}" data-act="comer-f" data-v="${k}">${n}</button>`).join('')}</div>
    ${d.intro ? `<div class="alerta" style="margin-top:0"><span class="e">💡</span><div class="small">${esc(d.intro)}</div></div>` : ''}
    ${lista.map(r => `<div class="card rest"><div class="top"><div><b>${esc(r.nome)}</b><div class="small muted">${esc(r.tipo)} · ${esc(r.local)}</div></div><span class="preco">${esc(r.preco)}</span></div>
      <p>${esc(r.destaque)}</p>${r.dica ? `<p class="small muted">💡 ${esc(r.dica)}</p>` : ''}
      <div class="meta">${r.recomendo ? '<span class="selo">⭐ Recomendo</span>' : ''}${r.nota_referencia ? `<span class="tag">${esc(r.nota_referencia)}</span>` : ''}<span class="tag maps">${r.periodo === 'ambos' ? 'dia e noite' : r.periodo === 'dia' ? 'de dia' : 'à noite'}</span></div>
      <a class="btn sec" style="margin-top:12px" href="${r.lat ? mapsUrl(r.lat, r.lon) : mapsBusca(r.nome + ' Ilha Grande ' + (r.local || ''))}" target="_blank" rel="noopener">📍 Ver no Google Maps (nota atual)</a></div>`).join('') || '<div class="vazio">Nada com esse filtro.</div>'}
    ${d.fontes ? `<div class="small muted" style="margin:10px 4px 0">Fontes: ${d.fontes.map(f => esc(f)).join(' · ')}</div>` : ''}`;
};

/* ---------- Mais */
TELAS.mais = () => {
  const pend = store.lista('pend'); const ck = store.lista('check');
  const it = [
    ['check', '🎒', 'Checklist', `${ck.filter(c => c.ok).length}/${ck.length} na mala`],
    ['pend', '✅', 'Pendências', `${pend.filter(p => !p.ok).length} em aberto`],
    ['grana', '💸', 'Dinheiro', 'estimativa e gastos'],
    ['infos', '🆘', 'Infos úteis', 'camping, barcas, emergência'],
    ['clima', '🌤️', 'Clima e maré', 'previsão dos 4 dias'],
    ['diario', '📔', 'Diário', 'o melhor de cada dia'],
    ['retro', '🎞️', 'Retrospectiva', 'a viagem em stories'],
    ['ajustes', '⚙️', 'Ajustes', 'sincronização e perfil']
  ];
  return `<div class="hero curto">${topo('Mais')}</div><div class="pad"><div class="menu" style="margin-top:12px">${it.map(([k, e, n, d]) => `<button data-act="${k === 'retro' ? 'retro' : 'sub'}" data-sub="${k}"><span class="e">${e}</span><div><b>${n}</b><small>${d}</small></div></button>`).join('')}</div></div>`;
};
const voltar = t => `<div class="topo"><button class="sync" data-act="voltar">‹ Voltar</button><span id="syncb">${syncBadge()}</span></div><h1>${t}</h1>`;

/* ---------- Checklist */
TELAS.check = () => {
  const dono = S.ckDono || 'comum';
  const todos = store.lista('check'); const lista = todos.filter(c => c.dono === dono);
  const ok = lista.filter(c => c.ok).length;
  const grupos = [...new Set(lista.map(c => c.grupo))];
  const cont = d => { const l = todos.filter(c => c.dono === d); return `${l.filter(c => c.ok).length}/${l.length}`; };
  let h = `<div class="hero curto">${voltar('Checklist 🎒')}</div><div class="pad">
    <div class="seg" style="margin-top:12px">${[['comum', 'Comum'], ['caio', 'Caio'], ['yasmin', 'Yasmin']].map(([k, n]) => `<button class="${dono === k ? 'on' : ''}" data-act="ck-dono" data-v="${k}">${n} <small class="muted">${cont(k)}</small></button>`).join('')}</div>
    <div class="card"><div class="small muted">${ok} de ${lista.length} na mala</div><div class="barra"><i style="width:${lista.length ? ok / lista.length * 100 : 0}%"></i></div></div>`;
  for (const g of grupos) {
    h += `<div class="grupo">${esc(g)}</div>`;
    h += lista.filter(c => c.grupo === g).sort((a, b) => (a.ok - b.ok) || a.texto.localeCompare(b.texto)).map(c => `<div class="li ${c.ok ? 'ok' : ''}"><button class="check ${c.ok ? 'on' : ''}" data-act="ck" data-id="${c.id}">${c.ok ? '✓' : ''}</button><span class="t" data-act="ck" data-id="${c.id}">${esc(c.texto)}</span><button class="del" data-act="ck-del" data-id="${c.id}">✕</button></div>`).join('');
  }
  h += `<div class="grupo">Adicionar</div><div class="add"><input class="inp" id="ck-novo" placeholder="Ex.: Pregador de roupa" enterkeyhint="done"><button data-act="ck-add">+</button></div>
    <div class="small muted" style="margin:4px 4px 0">Vai para a lista "${dono === 'comum' ? 'Comum' : PESSOAS[dono]}".</div></div>`;
  return h;
};

/* ---------- Pendências */
TELAS.pend = () => {
  const l = store.lista('pend').sort((a, b) => (a.ok - b.ok) || a.id.localeCompare(b.id));
  const ok = l.filter(p => p.ok).length;
  return `<div class="hero curto">${voltar('Pendências ✅')}</div><div class="pad">
    <div class="card" style="margin-top:12px"><div class="small muted">${ok} de ${l.length} resolvidas antes de sair</div><div class="barra"><i style="width:${l.length ? ok / l.length * 100 : 0}%"></i></div></div>
    ${l.map(p => `<div class="li ${p.ok ? 'ok' : ''}"><button class="check ${p.ok ? 'on' : ''}" data-act="pend-ok" data-id="${p.id}">${p.ok ? '✓' : ''}</button><span class="t" data-act="pend-ok" data-id="${p.id}">${esc(p.texto)}${p.ok && p._por ? ` <small class="muted">· ${esc(PESSOAS[p._por] || '')}</small>` : ''}</span><button class="del" data-act="pend-del" data-id="${p.id}">✕</button></div>`).join('')}
    <div class="add"><input class="inp" id="pend-novo" placeholder="Nova pendência" enterkeyhint="done"><button data-act="pend-add">+</button></div></div>`;
};

/* ---------- Dinheiro */
TELAS.grana = () => {
  const orc = store.lista('orc'), gastos = store.lista('gasto');
  const estPessoa = orc.reduce((s, o) => s + Number(o.valor || 0), 0), estCasal = estPessoa * 2;
  const gasto = gastos.reduce((s, g) => s + Number(g.valor || 0), 0);
  const sobra = estCasal - gasto, pct = estCasal ? Math.min(100, gasto / estCasal * 100) : 0;
  let h = `<div class="hero curto">${voltar('Dinheiro 💸')}</div><div class="pad">
    <div class="card grana" style="margin-top:12px"><div class="small muted">Gasto do casal até agora</div><div class="n">${brl(gasto)}</div>
      <div class="barra"><i style="width:${pct}%;${pct > 95 ? 'background:var(--warn)' : ''}"></i></div>
      <div class="small muted">Estimado: <b style="color:var(--ink)">${brl(estCasal)}</b> (${brl(estPessoa)} por pessoa) · ${sobra >= 0 ? `sobram <b style="color:var(--mint)">${brl(sobra)}</b>` : `<b style="color:var(--bad)">${brl(-sobra)} acima</b>`}</div></div>
    <h2>Anotar gasto</h2><div class="card">
      <div class="linha2"><input class="inp" id="g-desc" placeholder="O quê? (açaí, barco…)"><input class="inp" id="g-val" inputmode="decimal" placeholder="R$"></div>
      <div class="chips" id="g-dia" style="margin:10px 0 4px">${VIAGEM.dias.map(d => `<button class="chip ${d === (VIAGEM.dias.includes(hojeISO()) ? hojeISO() : VIAGEM.dias[0]) ? 'on' : ''}" data-v="${d}">${diaInfo(d).dow} ${diaInfo(d).n}</button>`).join('')}</div>
      <button class="btn" data-act="g-add">Anotar</button></div>
    <h2>Por dia</h2>`;
  for (const d of VIAGEM.dias) {
    const o = orc.filter(x => x.dia === d), g = gastos.filter(x => x.dia === d);
    const e = o.reduce((s, x) => s + Number(x.valor || 0), 0) * 2, gg = g.reduce((s, x) => s + Number(x.valor || 0), 0);
    h += `<div class="card"><div class="linha-v" style="padding-top:0"><b>${diaInfo(d).dow} ${diaInfo(d).n}</b><span><b>${brl(gg)}</b> <small>de ${brl(e)}</small></span></div>
      ${o.map(x => `<div class="linha-v" data-act="orc-edit" data-id="${x.id}"><small>Estimado · ${esc(x.desc)}</small><small>${brl(x.valor)} p/ pessoa ✎</small></div>`).join('')}
      ${g.map(x => `<div class="linha-v"><span>${esc(x.desc)} <small>· ${esc(PESSOAS[x._por] || '')}</small></span><span>${brl(x.valor)} <button class="del" data-act="g-del" data-id="${x.id}" style="color:#C3CCD8">✕</button></span></div>`).join('')}</div>`;
  }
  h += `<div class="small muted" style="margin:4px">💡 Na Ilha, muitos lugares preferem Pix ou dinheiro. Toquem num valor estimado para ajustar.</div></div>`;
  return h;
};

/* ---------- Infos úteis */
TELAS.infos = () => `<div class="hero curto">${voltar('Infos úteis 🆘')}</div><div class="pad" id="infos"><div class="vazio">Carregando…</div></div>`;
POS.infos = async () => {
  const d = await dados('infos'); const el = $('#infos'); if (!el) return;
  const contatos = store.lista('contato');
  let h = '';
  for (const sec of d?.secoes || []) {
    h += `<h2>${esc(sec.titulo)}</h2><div class="card">${sec.itens.map(i => `<div class="linha-v" style="align-items:flex-start;gap:12px"><div style="flex:1"><b style="font-size:15px">${esc(i.nome)}</b>${i.texto ? `<div class="small muted" style="margin-top:3px;line-height:1.45">${esc(i.texto)}</div>` : ''}</div>
      <div style="display:flex;gap:6px;flex:none">${i.tel ? `<a class="tag" href="tel:${esc(i.tel.replace(/[^\d+]/g, ''))}">📞</a>` : ''}${i.whats ? `<a class="tag ok" href="https://wa.me/${esc(i.whats.replace(/\D/g, ''))}" target="_blank" rel="noopener">WhatsApp</a>` : ''}${i.lat ? `<a class="tag maps" href="${mapsUrl(i.lat, i.lon)}" target="_blank" rel="noopener">📍</a>` : ''}${i.link ? `<a class="tag maps" href="${esc(i.link)}" target="_blank" rel="noopener">🔗</a>` : ''}</div></div>`).join('')}</div>`;
  }
  h += `<h2>Nossos contatos</h2><div class="card">${contatos.map(c => `<div class="linha-v"><div><b style="font-size:15px">${esc(c.nome)}</b>${c.obs ? `<div class="small muted">${esc(c.obs)}</div>` : ''}</div><div style="display:flex;gap:6px">${c.tel ? `<a class="tag" href="tel:${esc(c.tel.replace(/[^\d+]/g, ''))}">📞</a><a class="tag ok" href="https://wa.me/55${esc(c.tel.replace(/\D/g, '').replace(/^55/, ''))}" target="_blank" rel="noopener">Whats</a>` : ''}<button class="del" data-act="ct-del" data-id="${c.id}">✕</button></div></div>`).join('') || '<div class="small muted">Barqueiro, guia, motorista… anotem aqui.</div>'}
    <div class="linha2" style="margin-top:12px"><input class="inp" id="ct-nome" placeholder="Nome"><input class="inp" id="ct-tel" inputmode="tel" placeholder="Telefone"></div>
    <input class="inp" id="ct-obs" placeholder="Obs. (ex.: barqueiro de Lopes Mendes)" style="margin-top:10px"><button class="btn" data-act="ct-add" style="margin-top:10px">Salvar contato</button></div>`;
  el.innerHTML = h;
};

/* ---------- Clima e maré */
TELAS.clima = () => {
  const cl = climaCache();
  let h = `<div class="hero curto">${voltar('Clima e maré 🌤️')}</div><div class="pad">`;
  if (!cl) return h + `<div class="card vazio" style="margin-top:12px">Abra esta tela com sinal para baixar a previsão. Depois ela fica salva.</div><button class="btn" data-act="clima-atualizar">Baixar previsão</button></div>`;
  h += `<div class="small muted" style="margin:12px 4px">Atualizado ${new Date(cl.t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · Open-Meteo</div>`;
  for (const d of cl.dias) {
    const m = (cl.mare || []).filter(x => new Date(x.t - 3 * 3600e3).toISOString().slice(0, 10) === d.dia);
    h += `<div class="card"><div class="linha-v" style="padding-top:0"><b>${cap(diaInfo(d.dia).longo)}, ${diaInfo(d.dia).n}</b><span style="font-size:24px">${emojiClima(d.code)}</span></div>
      <div class="small" style="margin:10px 0">${descClima(d.code)} · <b>${Math.round(d.min)}° a ${Math.round(d.max)}°</b> · chuva ${d.chuva ?? 0}% · UV ${d.uv ?? '—'}${d.mar ? ` · água ${Math.round(d.mar)}°` : ''}</div>
      <div class="small muted">🌅 ${d.nascer ? horaDe(d.nascer) : '—'} · 🌇 ${d.por ? horaDe(d.por) : '—'}${d.onda ? ` · ondas até ${d.onda.toFixed(1)} m` : ''}</div>
      ${m.length ? `<div class="mare" style="margin-top:10px">${m.map(x => `<div>${x.tipo === 'alta' ? '🌊 Alta' : '🏖️ Baixa'}<b>${horaDe(x.t)}</b></div>`).join('')}</div>` : ''}</div>`;
  }
  h += `<div class="small muted" style="margin:4px 4px 14px">Maré: horários estimados por modelo oceânico (não é a tábua oficial da Marinha — as alturas podem diferir). Para a apneia, confiram a tábua do porto de Angra.</div><button class="btn sec" data-act="clima-atualizar">Atualizar agora</button></div>`;
  return h;
};

/* ---------- Diário */
TELAS.diario = () => {
  const d = S.diaDiario; const eu = store.cfg.eu;
  const ent = p => store.get('diario', d + '_' + p) || {};
  const card = p => {
    const e = ent(p), meu = p === eu;
    if (!meu) return `<div class="card"><div class="small muted">${PESSOAS[p]}</div>${e.frase || e.nota ? `<div style="font-size:28px;margin:6px 0">${'⭐'.repeat(e.nota || 0)}</div><p class="txt" style="margin:0">${esc(e.frase || '')}</p>${e.melhor ? `<p class="small muted">✨ Melhor momento: ${esc(e.melhor)}</p>` : ''}` : '<p class="small muted">Ainda não escreveu.</p>'}</div>`;
    return `<div class="card"><div class="small muted">Você (${PESSOAS[p]})</div>
      <div class="estrelas" id="di-nota" data-v="${e.nota || 0}">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= (e.nota || 0) ? 'on' : ''}" data-n="${n}">⭐</button>`).join('')}</div>
      <label class="campo" style="margin-top:10px"><span>O dia numa frase</span><textarea class="inp" id="di-frase" placeholder="Hoje foi…">${esc(e.frase || '')}</textarea></label>
      <label class="campo"><span>Melhor momento</span><input class="inp" id="di-melhor" value="${esc(e.melhor || '')}" placeholder="Ex.: o pôr do sol em Lopes Mendes"></label>
      <button class="btn" data-act="di-salvar">Salvar</button></div>`;
  };
  return `<div class="hero curto">${voltar('Diário 📔')}${diasHtml(d, 'dia-diario')}</div><div class="pad" style="margin-top:12px">${card(eu)}${card(eu === 'caio' ? 'yasmin' : 'caio')}</div>`;
};
POS.diario = () => {
  const el = $('#di-nota'); if (!el) return;
  el.addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; const n = +b.dataset.n; el.dataset.v = n; $$('button', el).forEach(x => x.classList.toggle('on', +x.dataset.n <= n)); });
};

/* ---------- Ajustes */
TELAS.ajustes = () => {
  const st = store.status;
  return `<div class="hero curto">${voltar('Ajustes ⚙️')}</div><div class="pad">
    <h2>Quem está usando este celular</h2><div class="seg">${Object.entries(PESSOAS).map(([k, n]) => `<button class="${store.cfg.eu === k ? 'on' : ''}" data-act="eu" data-v="${k}">${n}</button>`).join('')}</div>
    <h2>Sincronização</h2><div class="card">
      ${store.temServidor() ? `<div class="linha-v"><span>Status</span><b>${st.sincronizando ? 'Sincronizando…' : !st.online ? 'Offline' : st.erro ? '⚠️ ' + esc(st.erro) : 'Ligada ✓'}</b></div>
      <div class="linha-v"><span>Última sincronização</span><small>${st.ultima ? new Date(st.ultima).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</small></div>
      <div class="linha-v"><span>Alterações esperando sinal</span><b>${store.pendentes}</b></div>
      <button class="btn" data-act="sync" style="margin-top:12px">Sincronizar agora</button>
      <button class="btn sec" data-act="convite">Copiar link de convite</button>` : `<p class="small muted" style="margin-top:0">Sem sincronização, tudo fica só neste celular. Cole o link de convite (ou o endereço do servidor e o código):</p>`}
      <label class="campo" style="margin-top:14px"><span>Endereço do servidor (termina em /exec)</span><input class="inp" id="cfg-url" value="${esc(store.cfg.url || '')}" placeholder="https://script.google.com/macros/s/…/exec"></label>
      <label class="campo"><span>Código da viagem</span><input class="inp" id="cfg-k" value="${esc(store.cfg.k || '')}" placeholder="código que apareceu no Apps Script"></label>
      <button class="btn sec" data-act="cfg-salvar">Salvar e testar</button></div>
    <h2>Instalar na tela de início</h2><div class="card small" style="line-height:1.55">
      <b>iPhone (Safari):</b> Compartilhar → <b>Adicionar à Tela de Início</b>.<br><b>Android (Chrome):</b> menu ⋮ → <b>Instalar app</b>.<br>
      Depois de aberto uma vez com sinal, o app funciona <b>sem internet</b>.</div>
    <p class="small muted" style="text-align:center;margin:20px 0">TripYaCa v1.0 · Caio & Ya na Ilha Grande 🏝️</p></div>`;
};

/* ---------- Boas-vindas */
function renderBoasVindas() {
  $('#tabbar').innerHTML = ''; $('.fab')?.remove();
  $('#app').innerHTML = `<div class="boas"><img class="logo" src="icons/icon-512.png" alt=""><h1>TripYaCa</h1>
    <p>Caio & Ya na Ilha Grande 🏝️<br>19 a 22 de novembro${store.temServidor() ? ' · sincronização ligada ✓' : ''}</p>
    <div class="small" style="color:var(--ink2);margin:0 4px 10px;font-weight:600">Quem é você?</div>
    <div class="quem"><button data-act="eu" data-v="caio"><span>🧔🏻‍♂️</span>Caio</button><button data-act="eu" data-v="yasmin"><span>👩🏻</span>Yasmin</button></div></div>`;
}

/* ---------- Retrospectiva */
function abrirRetro() {
  const it = roteiro(); const feitos = it.filter(i => i.feito);
  const trilhas = feitos.filter(i => i.tipo === 'trilha').length;
  const diarios = VIAGEM.dias.flatMap(d => ['caio', 'yasmin'].map(p => ({ d, p, ...(store.get('diario', d + '_' + p) || {}) }))).filter(e => e.nota || e.frase);
  const notas = diarios.filter(e => e.nota); const media = notas.length ? (notas.reduce((s, e) => s + e.nota, 0) / notas.length) : 0;
  const melhorDia = VIAGEM.dias.map(d => ({ d, n: diarios.filter(e => e.d === d && e.nota).reduce((s, e) => s + e.nota, 0) })).sort((a, b) => b.n - a.n)[0];
  const gasto = store.lista('gasto').reduce((s, g) => s + Number(g.valor || 0), 0);
  const slides = [
    `<div class="k">TripYaCa</div><div class="v">🏝️</div><div class="d">Caio & Ya na Ilha Grande<br>19 a 22 de novembro</div>`,
    `<div class="k">Vocês fizeram</div><div class="v">${feitos.length}</div><div class="d">coisas do roteiro${trilhas ? `, sendo ${trilhas} de trilha 🥾` : ''}</div>`,
    ...(notas.length ? [`<div class="k">Nota da viagem</div><div class="v">${media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</div><div class="d">${'⭐'.repeat(Math.round(media))}<br>${melhorDia?.n ? `O melhor dia: ${diaInfo(melhorDia.d).longo}, ${diaInfo(melhorDia.d).n}` : ''}</div>`] : []),
    ...diarios.filter(e => e.melhor || e.frase).map(e => `<div class="k">${diaInfo(e.d).dow} ${diaInfo(e.d).n} · ${PESSOAS[e.p]}</div>${e.frase ? `<div class="q">“${esc(e.frase)}”</div>` : ''}${e.melhor ? `<div class="d">✨ ${esc(e.melhor)}</div>` : ''}`),
    ...(gasto ? [`<div class="k">Investimento em felicidade</div><div class="v" style="font-size:56px">${brl(gasto)}</div><div class="d">gastos anotados pelo casal</div>`] : []),
    `<div class="k">Até a próxima</div><div class="v">💛</div><div class="d">Para onde vamos agora?</div>`
  ];
  let n = 0; let el = $('#retro'); if (!el) { el = document.createElement('div'); el.id = 'retro'; document.body.appendChild(el); }
  const mostrar = () => { el.innerHTML = `<div class="bars">${slides.map((_, k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</div><button class="fechar" data-x="1">✕</button><div class="slide">${slides[n]}</div>`; };
  el.onclick = e => { if (e.target.closest('[data-x]')) { el.classList.remove('on'); return; } n = e.clientX < innerWidth / 3 ? Math.max(0, n - 1) : n + 1; if (n >= slides.length) { el.classList.remove('on'); return; } mostrar(); };
  mostrar(); el.classList.add('on');
}

/* ================================================= ações */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act, id = a.dataset.id;
  const eu = store.cfg.eu;
  switch (act) {
    case 'fechar': fecharSheet(); break;
    case 'tab': S.tab = a.dataset.tab; S.sub = null; scrollTo(0, 0); render(); break;
    case 'sub': if (a.dataset.sub === 'retro') return abrirRetro(); S.sub = a.dataset.sub; if (S.tab !== 'mais' && !['clima', 'pend'].includes(S.sub)) S.tab = 'mais'; scrollTo(0, 0); render(); break;
    case 'voltar': S.sub = null; scrollTo(0, 0); render(); break;
    case 'retro': abrirRetro(); break;
    case 'ajustes': S.sub = 'ajustes'; scrollTo(0, 0); render(); break;
    case 'sync': store.sincronizar(); toast('Sincronizando…'); break;
    case 'dia': S.dia = a.dataset.dia; S._rolou = false; render(); break;
    case 'dia-rot': S.dia = a.dataset.dia; S.tab = 'roteiro'; S.sub = null; S._rolou = false; scrollTo(0, 0); render(); break;
    case 'dia-diario': S.diaDiario = a.dataset.dia; render(); break;
    case 'item': editarItem(id); break;
    case 'feito': {
      const i = store.get('roteiro', id); if (!i) return;
      store.salvar('roteiro', id, { feito: !i.feito, feitoPor: !i.feito ? eu : '' });
      navigator.vibrate?.(10); if (!i.feito) toast('Feito ✓'); render(); break;
    }
    case 'salvar-item': {
      const f = lerForm(); if (!f.titulo) return toast('Escreva o que vão fazer');
      const sid = $('#sheet').dataset.id || null;
      store.salvar('roteiro', sid, f); fecharSheet(); S.dia = f.dia; toast('Salvo ✓'); render(); break;
    }
    case 'dup-item': { const f = lerForm(); store.salvar('roteiro', null, { ...f, feito: false }); fecharSheet(); toast('Duplicado ✓'); render(); break; }
    case 'apagar-item': {
      if (a.dataset.conf !== '1') { a.dataset.conf = '1'; a.textContent = 'Toque de novo p/ apagar'; return; }
      store.apagar('roteiro', $('#sheet').dataset.id); fecharSheet(); toast('Apagado'); render(); break;
    }
    case 'pend-ok': { const p = store.get('pend', id); store.salvar('pend', id, { ok: !p.ok }); render(); break; }
    case 'pend-del': store.apagar('pend', id); render(); break;
    case 'pend-add': { const v = $('#pend-novo').value.trim(); if (!v) return; store.salvar('pend', 'p' + Date.now().toString(36), { texto: v, ok: false }); render(); setTimeout(() => $('#pend-novo')?.focus(), 50); break; }
    case 'ck': { const c = store.get('check', id); store.salvar('check', id, { ok: !c.ok }); render(); break; }
    case 'ck-del': store.apagar('check', id); render(); break;
    case 'ck-dono': S.ckDono = a.dataset.v; render(); break;
    case 'ck-add': { const v = $('#ck-novo').value.trim(); if (!v) return; store.salvar('check', null, { texto: v, dono: S.ckDono || 'comum', grupo: 'Adicionados', ok: false }); render(); setTimeout(() => $('#ck-novo')?.focus(), 50); break; }
    case 'g-add': {
      const desc = $('#g-desc').value.trim(); const val = parseFloat(($('#g-val').value || '').replace(/\./g, '').replace(',', '.'));
      if (!desc || !(val > 0)) return toast('Preencha o que foi e o valor');
      store.salvar('gasto', null, { desc, valor: val, dia: $('#g-dia .on')?.dataset.v || VIAGEM.dias[0] }); toast('Anotado ✓'); render(); break;
    }
    case 'g-del': store.apagar('gasto', id); render(); break;
    case 'orc-edit': {
      const o = store.get('orc', id); const v = prompt(`Estimado por pessoa — ${o.desc}`, String(o.valor).replace('.', ','));
      if (v == null) return; const n = parseFloat(v.replace(',', '.')); if (isNaN(n)) return; store.salvar('orc', id, { valor: n }); render(); break;
    }
    case 'ct-add': {
      const nome = $('#ct-nome').value.trim(); if (!nome) return toast('Coloque o nome');
      store.salvar('contato', null, { nome, tel: $('#ct-tel').value.trim(), obs: $('#ct-obs').value.trim() }); render(); break;
    }
    case 'ct-del': store.apagar('contato', id); render(); break;
    case 'comer': S.comer = a.dataset.v; POS.comer(); break;
    case 'comer-f': S.comerFiltro = a.dataset.v; POS.comer(); break;
    case 'clima-atualizar': toast('Buscando previsão…'); carregarClima(true).then(ok => { toast(ok ? 'Previsão atualizada ✓' : 'Sem sinal agora'); render(); }); break;
    case 'di-salvar': {
      const nota = +($('#di-nota').dataset.v || 0);
      store.salvar('diario', S.diaDiario + '_' + eu, { nota, frase: $('#di-frase').value.trim(), melhor: $('#di-melhor').value.trim() }); toast('Salvo no diário 📔'); render(); break;
    }
    case 'eu': store.setCfg('eu', a.dataset.v); setDiaPadrao(); render(); break;
    case 'cfg-salvar': {
      store.setCfg('url', $('#cfg-url').value.trim()); store.setCfg('k', $('#cfg-k').value.trim());
      toast('Testando…'); store.sincronizar().then(() => { toast(store.status.erro ? '⚠️ ' + store.status.erro : 'Sincronização ligada ✓'); render(); }); break;
    }
    case 'convite': {
      const link = location.origin + location.pathname + '#v=' + btoa(JSON.stringify({ u: store.cfg.url, k: store.cfg.k }));
      (navigator.clipboard?.writeText(link) || Promise.reject()).then(() => toast('Link copiado! Mande para o outro celular 💌')).catch(() => prompt('Copie o link:', link)); break;
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'ck-novo') $('[data-act="ck-add"]').click();
  if (e.target.id === 'pend-novo') $('[data-act="pend-add"]').click();
});

/* ================================================= início */
(function lerConvite() {
  const m = location.hash.match(/#v=([^&]+)/); if (!m) return;
  try { const c = JSON.parse(atob(decodeURIComponent(m[1]))); if (c.u && c.k) { store.setCfg('url', c.u); store.setCfg('k', c.k); } } catch { }
  history.replaceState(null, '', location.pathname + location.search);
})();
// atalhos de teste/compartilhamento: ?eu=caio&tela=roteiro
const QS = new URLSearchParams(location.search);
if (QS.get('eu') && PESSOAS[QS.get('eu')] && !store.cfg.eu) store.setCfg('eu', QS.get('eu'));
setDiaPadrao();
if (QS.get('tela')) { const t = QS.get('tela'); if (['inicio', 'roteiro', 'ilha', 'comer', 'mais'].includes(t)) S.tab = t; else { S.tab = 'mais'; S.sub = t; } }
if (QS.get('dia')) S.dia = QS.get('dia');
store.on(o => {
  if (o.status) { const b = $('#syncb'); if (b) b.innerHTML = syncBadge(); return; }
  if (o.remoto && !document.body.classList.contains('sheet-on') && S.tab !== 'ilha' && !document.activeElement?.matches('input,textarea')) render();
});
render();
store.sincronizar();
// atualiza contagens a cada 30 s
setInterval(() => { if (document.visibilityState === 'visible' && !document.body.classList.contains('sheet-on') && ['inicio', 'roteiro'].includes(S.sub || S.tab) && !$('.arrastando') && !document.activeElement?.matches('input,textarea')) render(); }, 30000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
