/* TripYaCa — dados locais + sincronização com a planilha (Apps Script)
 * Cada item: { col, id, d, u (ms), del, por }. Ganha a alteração mais recente.
 * Tudo fica salvo no celular; sem sinal, as mudanças entram na fila e sobem depois. */
import { SEED } from './seed.js';

const LS = 'tripyaca_v1';
const ls = {
  get(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};

const st = ls.get(LS, null) || { itens: {}, fila: {}, rev: 0, cfg: {} };
if (!st.itens) st.itens = {};
if (!st.fila) st.fila = {};
if (!st.cfg) st.cfg = {};

// Itens iniciais: entram com u=1 (mais antigos que qualquer edição) e nunca vão para a fila.
for (const s of SEED) {
  const k = s.col + ':' + s.id;
  if (!st.itens[k]) st.itens[k] = { col: s.col, id: s.id, d: s.d, u: 1, del: false, por: '' };
}

const ouvintes = new Set();
let salvarT = null;
function salvar() { clearTimeout(salvarT); salvarT = setTimeout(() => ls.set(LS, st), 60); }
function avisar(o) { for (const f of ouvintes) try { f(o); } catch (e) { console.error(e); } }

export const store = {
  cfg: st.cfg,
  setCfg(k, v) { st.cfg[k] = v; salvar(); avisar({ cfg: k }); },
  on(f) { ouvintes.add(f); return () => ouvintes.delete(f); },

  lista(col) {
    return Object.values(st.itens).filter(i => i.col === col && !i.del).map(i => ({ id: i.id, ...i.d, _u: i.u, _por: i.por }));
  },
  get(col, id) { const i = st.itens[col + ':' + id]; return i && !i.del ? { id, ...i.d } : null; },

  salvar(col, id, dados) {
    if (!id) id = col[0] + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const k = col + ':' + id;
    const atual = st.itens[k];
    const d = { ...(atual && !atual.del ? atual.d : {}), ...dados };
    delete d.id; for (const c of Object.keys(d)) if (c[0] === '_') delete d[c];
    const it = { col, id, d, u: Date.now(), del: false, por: st.cfg.eu || '' };
    st.itens[k] = it; st.fila[k] = it; salvar(); avisar({ col }); agendar(300);
    return id;
  },
  apagar(col, id) {
    const k = col + ':' + id; const a = st.itens[k];
    const it = { col, id, d: a ? a.d : {}, u: Date.now(), del: true, por: st.cfg.eu || '' };
    st.itens[k] = it; st.fila[k] = it; salvar(); avisar({ col }); agendar(300);
  },

  get pendentes() { return Object.keys(st.fila).length; },
  status: { online: navigator.onLine, sincronizando: false, ultima: ls.get(LS + '_ultima', 0), erro: '' },
  sincronizar: () => sincronizar(),
  temServidor() { return !!(st.cfg.url && st.cfg.k); }
};

/* ------------------------------------------------ sincronização */
let timer = null;
function agendar(ms) { clearTimeout(timer); timer = setTimeout(sincronizar, ms); }

async function sincronizar() {
  const S = store.status;
  if (!store.temServidor() || S.sincronizando) return;
  if (!navigator.onLine) { S.online = false; avisar({ status: 1 }); return; }
  S.sincronizando = true; avisar({ status: 1 });
  const enviando = Object.values(st.fila);
  try {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(st.cfg.url, {
      method: 'POST', body: JSON.stringify({ k: st.cfg.k, rev: st.rev, ch: enviando }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', signal: ctrl.signal
    });
    clearTimeout(to);
    const j = await r.json();
    if (!j.ok) throw new Error(j.erro === 'codigo' ? 'Código da viagem inválido' : (j.erro || 'Erro no servidor'));
    // tira da fila o que foi enviado (se não mudou de novo enquanto enviava)
    for (const e of enviando) { const k = e.col + ':' + e.id; if (st.fila[k] && st.fila[k].u === e.u) delete st.fila[k]; }
    const cols = new Set();
    for (const it of j.it || []) {
      const k = it.col + ':' + it.id; const loc = st.itens[k];
      if (st.fila[k]) continue; // tenho uma alteração local mais nova esperando
      if (!loc || it.u >= loc.u) { st.itens[k] = it; cols.add(it.col); }
    }
    st.rev = j.rev; S.online = true; S.erro = ''; S.ultima = Date.now(); ls.set(LS + '_ultima', S.ultima);
    salvar();
    if (cols.size) avisar({ remoto: [...cols] });
  } catch (e) {
    S.erro = e.name === 'AbortError' ? 'Sem resposta (sinal fraco?)' : e.message;
    S.online = navigator.onLine;
  } finally {
    S.sincronizando = false; avisar({ status: 1 });
    if (Object.keys(st.fila).length) agendar(20000);
  }
}

// a cada 15 s com o app aberto; também ao voltar o sinal ou reabrir o app
setInterval(() => { if (document.visibilityState === 'visible') sincronizar(); }, 15000);
addEventListener('online', () => { store.status.online = true; sincronizar(); });
addEventListener('offline', () => { store.status.online = false; avisar({ status: 1 }); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar(); });
