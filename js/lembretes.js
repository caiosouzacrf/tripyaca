/* Lembretes no Calendário do iPhone (.ics): o próprio iPhone avisa, mesmo sem sinal e com o app fechado. */

const pad = n => String(n).padStart(2, '0');
const utc = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const txt = s => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
const quando = (dia, hora) => new Date(`${dia}T${hora || '00:00'}:00-03:00`);

function evento({ uid, ini, min = 30, titulo, desc, alarmes }) {
  const L = ['BEGIN:VEVENT', `UID:${uid}@tripyaca`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(ini)}`, `DTEND:${utc(new Date(ini.getTime() + min * 60e3))}`,
    `SUMMARY:${txt(titulo)}`];
  if (desc) L.push(`DESCRIPTION:${txt(desc)}`);
  for (const a of alarmes) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(titulo)}`, `TRIGGER:-PT${a}M`, 'END:VALARM');
  L.push('END:VEVENT');
  return L;
}

// quebra linhas longas (regra do formato .ics)
const dobrar = l => { const out = []; while (l.length > 74) { out.push(l.slice(0, 74)); l = ' ' + l.slice(74); } out.push(l); return out; };

export function gerarICS(roteiro, VIAGEM) {
  const ev = [];
  const importantes = roteiro.filter(i => i.critico && !i.feito);
  for (const i of importantes) {
    ev.push(...evento({
      uid: 'r-' + i.id, ini: quando(i.dia, i.hora), titulo: '🏝️ ' + i.titulo,
      desc: [i.nota, 'TripYaCa'].filter(Boolean).join(' — '), alarmes: [60, 15]
    }));
  }
  // véspera e começo de cada dia
  const v = new Date(quando(VIAGEM.inicio, '00:00').getTime() - 4 * 3600e3); // 20:00 da véspera
  ev.push(...evento({ uid: 'vespera', ini: v, min: 15, titulo: 'Amanhã é Ilha Grande! Conferir pendências e checklist', desc: 'Abra o TripYaCa: pendências, mala, taxa TTS e lancha.', alarmes: [0] }));
  VIAGEM.dias.forEach((d, k) => {
    const prim = roteiro.filter(i => i.dia === d).sort((a, b) => a.hora.localeCompare(b.hora))[0];
    if (!prim) return;
    const ini = new Date(quando(d, prim.hora).getTime() - 30 * 60e3);
    ev.push(...evento({ uid: 'dia-' + d, ini, min: 10, titulo: `Dia ${k + 1} na Ilha — abra o roteiro`, desc: `Primeiro compromisso: ${prim.hora} ${prim.titulo}`, alarmes: [0] }));
  });
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TripYaCa//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:TripYaCa', ...ev, 'END:VCALENDAR'];
  return linhas.flatMap(dobrar).join('\r\n');
}

export async function baixarLembretes(roteiro, VIAGEM) {
  try {
    const ics = gerarICS(roteiro, VIAGEM);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tripyaca-lembretes.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch { return false; }
}
