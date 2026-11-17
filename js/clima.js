/* Previsão do tempo e maré (Open-Meteo, grátis e sem chave). Fica salva para usar sem sinal. */
import { VIAGEM } from './seed.js';

const K = 'tripyaca_clima';
export function climaCache() { try { return JSON.parse(localStorage.getItem(K)); } catch { return null; } }

export async function carregarClima(forcar) {
  const c = climaCache();
  if (!forcar && c && Date.now() - c.t < 3 * 3600e3) return true;
  if (!navigator.onLine) return false;
  const { lat, lon, inicio, fim } = VIAGEM;
  const base = `latitude=${lat}&longitude=${lon}&timezone=America%2FSao_Paulo&start_date=${inicio}&end_date=${fim}`;
  try {
    const [w, m] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${base}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timeformat=unixtime`).then(r => r.json()),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=-23.13&longitude=-44.15&timezone=America%2FSao_Paulo&start_date=${inicio}&end_date=${fim}&hourly=sea_level_height_msl&daily=wave_height_max&timeformat=unixtime&cell_selection=sea`).then(r => r.json()).catch(() => null)
    ]);
    if (!w || !w.daily) return false;
    const dias = w.daily.time.map((t, i) => ({
      dia: VIAGEM.dias[i] || new Date((t - 3 * 3600) * 1000).toISOString().slice(0, 10),
      code: w.daily.weather_code[i], max: w.daily.temperature_2m_max[i], min: w.daily.temperature_2m_min[i],
      chuva: w.daily.precipitation_probability_max?.[i], uv: w.daily.uv_index_max?.[i] != null ? Math.round(w.daily.uv_index_max[i]) : null,
      nascer: w.daily.sunrise?.[i] * 1000, por: w.daily.sunset?.[i] * 1000,
      onda: m?.daily?.wave_height_max?.[i] ?? null
    }));
    // marés: picos e vales da altura do mar (hora a hora, refinado por parábola)
    const mare = [];
    const h = m?.hourly?.sea_level_height_msl, ts = m?.hourly?.time;
    if (h && ts) {
      for (let i = 1; i < h.length - 1; i++) {
        if (h[i] == null || h[i - 1] == null || h[i + 1] == null) continue;
        const alta = h[i] >= h[i - 1] && h[i] > h[i + 1], baixa = h[i] <= h[i - 1] && h[i] < h[i + 1];
        if (!alta && !baixa) continue;
        const den = h[i - 1] - 2 * h[i] + h[i + 1]; const off = den ? 0.5 * (h[i - 1] - h[i + 1]) / den : 0;
        mare.push({ t: Math.round((ts[i] + off * 3600) * 1000), tipo: alta ? 'alta' : 'baixa', h: h[i] });
      }
    }
    localStorage.setItem(K, JSON.stringify({ t: Date.now(), dias, mare }));
    return true;
  } catch { return false; }
}

export function emojiClima(c) {
  if (c == null) return '—';
  if (c === 0) return '☀️'; if (c <= 2) return '🌤️'; if (c === 3) return '☁️'; if (c <= 48) return '🌫️';
  if (c <= 57) return '🌦️'; if (c <= 67) return '🌧️'; if (c <= 77) return '🌨️'; if (c <= 82) return '🌧️'; return '⛈️';
}
export function descClima(c) {
  if (c == null) return '';
  if (c === 0) return 'Céu limpo'; if (c <= 2) return 'Sol com nuvens'; if (c === 3) return 'Nublado'; if (c <= 48) return 'Neblina';
  if (c <= 57) return 'Garoa'; if (c <= 67) return 'Chuva'; if (c <= 77) return 'Neve?!'; if (c <= 82) return 'Pancadas de chuva'; return 'Tempestade';
}
