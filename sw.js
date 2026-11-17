/* TripYaCa — funciona sem internet: guarda o app inteiro no celular na primeira visita. */
const VERSAO = 'tripyaca-v2';
const ARQUIVOS = [
  './',
  "css/app.css",
  "data/infos.json",
  "data/lembretes.ics",
  "data/lugares.json",
  "data/rede.json",
  "data/relevo.bin",
  "data/relevo.json",
  "data/restaurantes.json",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/logo.svg",
  "img/abraao.jpg",
  "img/abraaozinho.jpg",
  "img/aqueduto.jpg",
  "img/aventureiro.jpg",
  "img/cachoeira.jpg",
  "img/caxadaco.jpg",
  "img/doisrios.jpg",
  "img/feiticeira.jpg",
  "img/lagoaazul.jpg",
  "img/lagoaverde.jpg",
  "img/lazareto.jpg",
  "img/lopes.jpg",
  "img/palmas.jpg",
  "img/papagaio.jpg",
  "img/pouso.jpg",
  "img/praiapreta.jpg",
  "img/sacoceu.jpg",
  "index.html",
  "js/app.js",
  "js/clima.js",
  "js/icons.js",
  "js/ilha3d.js",
  "js/lembretes.js",
  "js/seed.js",
  "js/store.js",
  "manifest.webmanifest",
  "vendor/addons/controls/OrbitControls.js",
  "vendor/three.module.min.js",];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // servidor, clima e Maps: direto pela rede
  // cache primeiro (abre na hora, mesmo sem sinal) e atualiza em segundo plano
  e.respondWith(caches.open(VERSAO).then(async c => {
    const salvo = await c.match(e.request, { ignoreSearch: true });
    const rede = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return salvo || (await rede) || (e.request.mode === 'navigate' ? c.match('./') : Response.error());
  }));
});
