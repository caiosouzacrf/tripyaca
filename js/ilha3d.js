/* TripYaCa — Ilha Grande em 3D
 * Relevo: dados de altitude abertos (Terrarium/AWS, SRTM) recortados pela costa do OpenStreetMap.
 * Trilhas: OpenStreetMap (códigos T1–T16 do Parque Estadual). */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const U = 0.01;      // 1 unidade = 100 m
const EXAG = 1.7;    // exagero vertical para o relevo "aparecer"
let ativo = null;    // cena atual (para limpar ao sair da aba)

export async function montarIlha(el, { abrirLugar, abrirTrilha, chips }) {
  if (ativo) ativo.parar();
  const [M, bin, rede, info] = await Promise.all([
    fetch('data/relevo.json').then(r => r.json()),
    fetch('data/relevo.bin').then(r => r.arrayBuffer()),
    fetch('data/rede.json').then(r => r.json()),
    fetch('data/lugares.json').then(r => r.json())
  ]);
  const H = new Int16Array(bin);
  const { GW, GH } = M;
  const W = M.kmW * 1000 * U, D = M.kmH * 1000 * U;

  // lon/lat -> x/z e altura
  const lx = lon => (lon - M.lon0) / (M.lon1 - M.lon0) * W - W / 2;
  const lz = lat => (lat - M.lat0) / (M.lat1 - M.lat0) * D - D / 2;
  const alt = (lon, lat) => {
    const fx = (lon - M.lon0) / (M.lon1 - M.lon0) * (GW - 1), fy = (lat - M.lat0) / (M.lat1 - M.lat0) * (GH - 1);
    const x0 = Math.max(0, Math.min(GW - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(GH - 2, Math.floor(fy)));
    const dx = fx - x0, dy = fy - y0, g = (a, b) => H[b * GW + a];
    return g(x0, y0) * (1 - dx) * (1 - dy) + g(x0 + 1, y0) * dx * (1 - dy) + g(x0, y0 + 1) * (1 - dx) * dy + g(x0 + 1, y0 + 1) * dx * dy;
  };
  const yDe = m => (m > 0 ? m * U * EXAG : m * U * 0.6);

  /* ---------- cena */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xd6e9fb, 420, 1500);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 3000);
  const cam0 = new THREE.Vector3(60, 150, 230);
  camera.position.copy(cam0);
  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x5a7a50, 1.05));
  const sol = new THREE.DirectionalLight(0xfff3d6, 1.5); sol.position.set(-160, 260, 140); scene.add(sol);

  /* ---------- terreno */
  const geo = new THREE.PlaneGeometry(W, D, GW - 1, GH - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cores = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const paleta = [[-30, 0x3fa3e0], [-12, 0x48aee0], [-3, 0x8fdcdc], [0, 0xa8e8dc], [1, 0xf3e3b0], [8, 0xe9dca8], [14, 0xa8d68a], [80, 0x6cbf6e], [250, 0x4aa462], [500, 0x37884f], [800, 0x2f7346], [950, 0x8c9a86], [1100, 0xb7b9b0]];
  const corDe = m => {
    for (let i = 1; i < paleta.length; i++) if (m <= paleta[i][0]) {
      const [a, ca] = paleta[i - 1], [b, cb] = paleta[i];
      return c.set(ca).lerp(new THREE.Color(cb), Math.max(0, Math.min(1, (m - a) / (b - a))));
    }
    return c.set(paleta[paleta.length - 1][1]);
  };
  // PlaneGeometry rotacionado: vértice (i,j) -> x de -W/2..W/2, z de -D/2 (norte) .. D/2 (sul)
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const k = j * GW + i, m = H[k];
    pos.setY(k, yDe(m));
    corDe(m); cores[k * 3] = c.r; cores[k * 3 + 1] = c.g; cores[k * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  geo.computeVertexNormals();
  const terreno = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  scene.add(terreno);
  // água por cima do fundo do mar
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(W * 14, D * 14), new THREE.MeshLambertMaterial({ color: 0x3fa3e0 }));
  fundo.rotateX(-Math.PI / 2); fundo.position.y = -0.2; scene.add(fundo);
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(W * 14, D * 14), new THREE.MeshLambertMaterial({ color: 0x5fb8ea, transparent: true, opacity: 0.42, depthWrite: false }));
  agua.rotateX(-Math.PI / 2); agua.position.y = 0.01; scene.add(agua);

  /* ---------- trilhas */
  const densificar = pts => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      if (i) {
        const [a, b] = [pts[i - 1], pts[i]];
        const n = Math.max(1, Math.ceil(Math.hypot((b[0] - a[0]) * 102000, (b[1] - a[1]) * 111000) / 35));
        for (let s = 1; s < n; s++) out.push([a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n]);
      }
      out.push(pts[i]);
    }
    return out.map(([lon, lat]) => new THREE.Vector3(lx(lon), yDe(Math.max(1, alt(lon, lat))) + 0.18, lz(lat)));
  };
  const matRede = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
  const grupoRede = new THREE.Group(); scene.add(grupoRede);
  const caminhos = rede.map(w => ({ n: w.n, p: w.p, v: densificar(w.p) }));
  for (const w of caminhos) grupoRede.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(w.v), matRede));

  const trilhas = info.trilhas || [];
  const casa = (t, w) => {
    const s = t.sel || {};
    if (s.nomes && !s.nomes.includes(w.n)) return false;
    if (s.semNome && w.n) return false;
    if (s.bbox) { const [a, b, cc, d] = s.bbox; if (!w.p.every(([lon, lat]) => lon >= a && lon <= b && lat >= cc && lat <= d)) return false; }
    return !!(s.nomes || s.semNome || s.bbox);
  };
  const grupoDestaque = new THREE.Group(); scene.add(grupoDestaque);
  const matDest = new THREE.MeshBasicMaterial({ color: 0xf5c842 });
  const matSel = new THREE.MeshBasicMaterial({ color: 0xff7a3d });
  const tubos = {};
  for (const t of trilhas) {
    tubos[t.id] = [];
    const sels = t.sels || [t.sel];
    for (const w of caminhos) {
      if (!sels.some(sel => casa({ sel }, w))) continue;
      if (w.v.length < 2) continue;
      const tubo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(w.v), Math.min(400, w.v.length * 2), 0.7, 5, false), t.roteiro ? matDest : matRede.clone());
      tubo.visible = !!t.roteiro; tubo.userData.trilha = t.id;
      grupoDestaque.add(tubo); tubos[t.id].push(tubo);
    }
  }

  /* ---------- lugares (alfinetes) */
  const lugares = info.lugares;
  const grupoPins = new THREE.Group(); scene.add(grupoPins);
  const sprites = [];
  const texCache = {};
  function texPin(emoji, nome, destaque) {
    const k = emoji + nome + destaque; if (texCache[k]) return texCache[k];
    const cv = document.createElement('canvas'); const s = 2; cv.width = 360 * s; cv.height = 120 * s;
    const g = cv.getContext('2d'); g.scale(s, s);
    g.font = '600 30px -apple-system,Segoe UI,Roboto,sans-serif';
    const tw = Math.min(250, g.measureText(nome).width);
    const w = 70 + tw + 18, x0 = (360 - w) / 2;
    g.fillStyle = destaque ? '#F5C842' : 'rgba(255,255,255,.95)';
    g.shadowColor = 'rgba(20,50,90,.25)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
    g.beginPath(); g.roundRect(x0, 22, w, 60, 30); g.fill(); g.shadowColor = 'transparent';
    g.beginPath(); g.moveTo(180 - 10, 80); g.lineTo(180, 100); g.lineTo(180 + 10, 80); g.fill();
    g.font = '32px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textBaseline = 'middle'; g.fillText(emoji, x0 + 16, 53);
    g.font = '600 26px -apple-system,Segoe UI,Roboto,sans-serif'; g.fillStyle = '#0E1A2B'; g.fillText(nome, x0 + 62, 54, 250);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texCache[k] = t; return t;
  }
  const EMO = { vila: '🏘️', praia: '🏖️', cachoeira: '💦', pico: '⛰️', historia: '🏛️', lagoa: '🐠', gruta: '🕳️', mirante: '👀', camping: '⛺', reserva: '🌿', parque: '🌳' };
  for (const L of lugares) {
    if (L.lat == null) continue;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPin(EMO[L.tipo] || '📍', L.curto || L.nome, !!L.noRoteiro), depthTest: false, transparent: true }));
    const y = yDe(Math.max(2, alt(L.lon, L.lat)));
    sp.position.set(lx(L.lon), y + 6, lz(L.lat)); sp.center.set(0.5, 0.05);
    sp.userData = { id: L.id, base: 1, prio: L.noRoteiro ? 2 : L.prio || 1 };
    sp.renderOrder = L.noRoteiro ? 10 : 5;
    grupoPins.add(sp); sprites.push(sp);
  }

  /* ---------- controles */
  const ctr = new OrbitControls(camera, renderer.domElement);
  ctr.enableDamping = true; ctr.dampingFactor = 0.08;
  ctr.maxPolarAngle = Math.PI * 0.47; ctr.minDistance = 25; ctr.maxDistance = 520;
  ctr.target.set(0, 0, 0); ctr.rotateSpeed = 0.7; ctr.zoomSpeed = 0.9; ctr.panSpeed = 0.8;
  ctr.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  ctr.autoRotate = true; ctr.autoRotateSpeed = 0.35;
  ctr.addEventListener('start', () => { ctr.autoRotate = false; });

  // voo suave até um ponto
  let voo = null;
  function voar(alvo, dist = 90) {
    const dir = camera.position.clone().sub(ctr.target).normalize();
    voo = { t0: performance.now(), de: { p: camera.position.clone(), t: ctr.target.clone() }, para: { t: alvo.clone(), p: alvo.clone().add(dir.multiplyScalar(dist)).setY(Math.max(alvo.y + dist * 0.55, 40)) } };
    ctr.autoRotate = false;
  }

  /* ---------- toque nos alfinetes */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let downXY = null;
  renderer.domElement.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!downXY || Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 8) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(sprites.filter(s => s.visible), false)[0];
    if (hit) { voar(hit.object.position.clone().setY(hit.object.position.y - 6), 70); abrirLugar(hit.object.userData.id); }
  });

  /* ---------- botões */
  const ctrl = document.createElement('div'); ctrl.className = 'ilha-ctrl';
  ctrl.innerHTML = `<button data-b="casa" aria-label="Voltar">⟲</button><button data-b="nomes" class="on" aria-label="Nomes">Aa</button><button data-b="trilhas" class="on" aria-label="Trilhas">🥾</button><button data-b="girar" aria-label="Girar">↻</button>`;
  el.appendChild(ctrl);
  const leg = document.createElement('div'); leg.className = 'ilha-leg';
  leg.innerHTML = `<div><i style="background:#F5C842"></i>trilhas do roteiro</div><div><i style="background:#fff;outline:1px solid #ccd"></i>outras trilhas</div><div style="opacity:.7">Relevo real · exagero ${EXAG}×</div>`;
  el.appendChild(leg);
  ctrl.addEventListener('click', e => {
    const b = e.target.closest('[data-b]'); if (!b) return;
    const k = b.dataset.b;
    if (k === 'casa') { voo = { t0: performance.now(), de: { p: camera.position.clone(), t: ctr.target.clone() }, para: { p: cam0.clone(), t: new THREE.Vector3() } }; }
    if (k === 'nomes') { const on = b.classList.toggle('on'); grupoPins.visible = on; }
    if (k === 'trilhas') { const on = b.classList.toggle('on'); grupoRede.visible = on; }
    if (k === 'girar') { ctr.autoRotate = !ctr.autoRotate; b.classList.toggle('on', ctr.autoRotate); }
  });

  /* ---------- chips das trilhas */
  let selecionada = null;
  if (chips) {
    chips.innerHTML = trilhas.map(t => `<button data-t="${t.id}" class="">${t.roteiro ? '⭐ ' : ''}${t.nome}</button>`).join('');
    chips.onclick = e => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      const t = trilhas.find(x => x.id === b.dataset.t);
      if (selecionada) for (const m of tubos[selecionada] || []) { m.material = trilhas.find(x => x.id === selecionada).roteiro ? matDest : matRede; m.visible = !!trilhas.find(x => x.id === selecionada).roteiro; }
      [...chips.children].forEach(x => x.classList.toggle('on', x === b));
      selecionada = t.id;
      const ms = tubos[t.id] || [];
      const box = new THREE.Box3();
      for (const m of ms) { m.visible = true; m.material = matSel; box.expandByObject(m); }
      if (!box.isEmpty()) { const ctrP = box.getCenter(new THREE.Vector3()); const tam = box.getSize(new THREE.Vector3()).length(); voar(ctrP, Math.max(60, tam * 1.3)); }
      abrirTrilha(t);
    };
  }

  /* ---------- loop */
  let vivo = true; let escPin = 1;
  let primeira = true;
  const ro = new ResizeObserver(() => {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // altura do alfinete ≈ 46 px na tela, qualquer que seja a distância
    escPin = 46 * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / h;
    if (primeira) {
      primeira = false;
      const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      // celular em pé: enquadra ~60% da largura da Ilha (o resto aparece girando)
      const dist = Math.min(420, (W * (camera.aspect < 0.8 ? 0.31 : 0.5)) / Math.tan(hf / 2));
      cam0.set(dist * 0.12, dist * 0.72, dist * 0.68); camera.position.copy(cam0);
      ctr.target.set(10, 0, 4);
      ctr.maxDistance = Math.max(560, dist * 1.6); camera.far = 4000; camera.updateProjectionMatrix();
      scene.fog.near = 500; scene.fog.far = 2200;
    }
  });
  ro.observe(el);
  const tmp = new THREE.Vector3(), proj = new THREE.Vector3();
  const ordemPins = sprites.slice().sort((a, b) => b.userData.prio - a.userData.prio);
  function loop(now) {
    if (!vivo) return;
    if (!el.isConnected) { parar(); return; }
    requestAnimationFrame(loop);
    if (voo) {
      const k = Math.min(1, (now - voo.t0) / 1100), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      camera.position.lerpVectors(voo.de.p, voo.para.p, e); ctr.target.lerpVectors(voo.de.t, voo.para.t, e);
      if (k >= 1) voo = null;
    }
    ctr.update();
    // alfinetes com tamanho constante na tela; esconde os menos importantes de longe
    // e esconde os que se sobrepõem (ficam os mais importantes; aparecem mais com zoom)
    const w = el.clientWidth, h = el.clientHeight, aceitos = [];
    for (const s of ordemPins) {
      const d = camera.position.distanceTo(tmp.copy(s.position));
      const esc = d * escPin; s.scale.set(esc * 3, esc, 1);
      proj.copy(s.position).project(camera);
      const x = (proj.x + 1) / 2 * w, y = (1 - proj.y) / 2 * h;
      const fora = proj.z > 1 || x < -40 || x > w + 40 || y < -10 || y > h + 40;
      const bate = aceitos.some(([ax, ay]) => Math.abs(ax - x) < 118 && Math.abs(ay - y) < 30);
      s.visible = !fora && !bate;
      if (s.visible) aceitos.push([x, y]);
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
  function parar() {
    vivo = false; ro.disconnect(); ctr.dispose(); renderer.dispose();
    geo.dispose(); scene.traverse(o => { o.geometry?.dispose?.(); });
    if (ativo && ativo.parar === parar) ativo = null;
  }
  ativo = { parar };
}
