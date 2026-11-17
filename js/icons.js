/* Ícones de linha (traço 1.8, cantos arredondados) — um só estilo em todo o app */
const s = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

export const IC = {
  home: s('<path d="M3.5 10.5 12 3.8l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.8H9.2v5.8H5A1.5 1.5 0 0 1 3.5 19z"/>'),
  roteiro: s('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4M8 13.5h3M8 16.8h6"/>'),
  ilha: s('<path d="M2.5 18.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.1 1.2"/><path d="m4.5 15 4.6-7.2 3 4.4 2.3-3.2 5.1 6"/>'),
  comer: s('<path d="M6.5 3v7.5M4 3v4.6a2.5 2.5 0 0 0 5 0V3M6.5 10.5V21M17.5 21V3c-2.4 1.3-3.6 3.8-3.6 7.2V14h3.6"/>'),
  mais: s('<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>'),

  transporte: s('<path d="M3.5 16.5V8a2 2 0 0 1 2-2h9.2a2 2 0 0 1 1.6.8l3.2 4.2a2 2 0 0 1 .5 1.3v4.2a1 1 0 0 1-1 1h-1.2M3.5 16.5a1 1 0 0 0 1 1h1.3M10.2 17.5h4.6M3.5 11h16.3M9.5 6v5"/><circle cx="8" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>'),
  barco: s('<path d="M3.5 14.5h17l-2.3 4a2 2 0 0 1-1.7 1H7.5a2 2 0 0 1-1.7-1zM6.5 14.5V11h11v3.5M9 11V8h5l2 3"/>'),
  trilha: s('<path d="M13.5 4.5a1.8 1.8 0 1 0 0-.01M10.2 21l1.6-6-2.3-2.2.9-4.3 3.1 2.9 2.5 1"/><path d="m9.4 8.5-2.6 1.4-.8 3.3M15.2 14.8 16.8 21"/>'),
  passeio: s('<path d="M12 3.5v2M5.6 6.1l1.4 1.4M3.5 12.5h2M18.5 12.5h2M17 7.5l1.4-1.4"/><path d="M8 12.5a4 4 0 0 1 8 0"/><path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/>'),
  comida: s('<path d="M6.5 3v7.5M4 3v4.6a2.5 2.5 0 0 0 5 0V3M6.5 10.5V21M17.5 21V3c-2.4 1.3-3.6 3.8-3.6 7.2V14h3.6"/>'),
  camping: s('<path d="M12 4 3 19.5h18zM12 4l1.6 2.7M12 4l-1.6 2.7M9 19.5l3-5.5 3 5.5"/>'),
  outro: s('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),

  check: s('<path d="m5 12.5 4.3 4.3L19 7.2"/>', 'stroke-width="2.4"'),
  plus: s('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.2"'),
  x: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  voltar: s('<path d="M15 5l-7 7 7 7"/>', 'stroke-width="2.2"'),
  seta: s('<path d="m9 5 7 7-7 7"/>'),
  alca: s('<circle cx="9" cy="6" r=".9" fill="currentColor"/><circle cx="15" cy="6" r=".9" fill="currentColor"/><circle cx="9" cy="12" r=".9" fill="currentColor"/><circle cx="15" cy="12" r=".9" fill="currentColor"/><circle cx="9" cy="18" r=".9" fill="currentColor"/><circle cx="15" cy="18" r=".9" fill="currentColor"/>'),
  pin: s('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  sino: s('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5zM10 21h4"/>'),
  alerta: s('<path d="M12 4 2.8 19.5h18.4zM12 10v4.2M12 17.2v.1"/>'),
  relogio: s('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  mochila: s('<path d="M6 9a6 6 0 0 1 12 0v10.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5zM9.5 3.8v2M14.5 3.8v2M9 14h6M9 14v2.5"/>'),
  lista: s('<path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10M4.5 6.5l1 1 2-2M4.5 12l1 1 2-2M4.5 17.5l1 1 2-2"/>'),
  carteira: s('<path d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5V6a2 2 0 0 1 2-2h10v3.5"/><circle cx="15.8" cy="13.8" r="1.1" fill="currentColor"/>'),
  boia: s('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="m6 6 3.4 3.4M18 6l-3.4 3.4M6 18l3.4-3.4M18 18l-3.4-3.4"/>'),
  clima: s('<path d="M7.5 18.5h9.8a3.7 3.7 0 0 0 .4-7.4 5.2 5.2 0 0 0-10-.6 4 4 0 0 0-.2 8z"/>'),
  diario: s('<path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H7.2A2.2 2.2 0 0 1 5 18.3V4.5a1 1 0 0 1 1-1zM5 18.3a2.2 2.2 0 0 1 2.2-2.2H19M9 8h6"/>'),
  stories: s('<rect x="6" y="3.5" width="12" height="17" rx="2.5"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>'),
  ajustes: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20.6a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3.4a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3.4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"/>'),
  telefone: s('<path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>'),
  conversa: s('<path d="M4.5 19.5 6 15.8A7.5 7.5 0 1 1 9 19z"/>'),
  link: s('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  estrela: s('<path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>'),
  sol: s('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  lua: s('<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>'),
  onda: s('<path d="M2.5 15c1.6 0 1.6-1.3 3.2-1.3s1.6 1.3 3.2 1.3 1.6-1.3 3.1-1.3 1.6 1.3 3.2 1.3 1.6-1.3 3.2-1.3 1.6 1.3 3.1 1.3M2.5 19c1.6 0 1.6-1.3 3.2-1.3s1.6 1.3 3.2 1.3 1.6-1.3 3.1-1.3 1.6 1.3 3.2 1.3 1.6-1.3 3.2-1.3 1.6 1.3 3.1 1.3M12 4v6M9.5 7.5 12 10l2.5-2.5"/>'),
  sync: s('<path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5M4 13a8 8 0 0 0 14.3 4.3L20 15.5M4 4v4.5h4.5M20 20v-4.5h-4.5"/>'),
  copiar: s('<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/>'),
  camadas: s('<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8zM3.5 12.2l8.5 4.5 8.5-4.5M3.5 16.4l8.5 4.5 8.5-4.5"/>'),
  texto: s('<path d="M5 6.5V5h14v1.5M12 5v14M9.5 19h5"/>'),
  girar: s('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5"/>'),
  centro: s('<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><circle cx="12" cy="12" r="2.2"/>'),
  calendario: s('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4"/><path d="m9 14.8 2 2 4-4"/>'),
  usuario: s('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>')
};

/* Clima: ícones de linha a partir do código WMO */
export function icClima(c) {
  if (c == null) return IC.clima;
  if (c === 0) return IC.sol;
  if (c <= 2) return s('<path d="M12 3v1.5M5.6 5.6l1 1M3 12h1.5M17.4 5.6l-1 1"/><path d="M8 11a4 4 0 0 1 7.6-1.7"/><path d="M9.5 20h8.3a3.2 3.2 0 0 0 .3-6.4 4.4 4.4 0 0 0-8.5-.5 3.5 3.5 0 0 0-.1 6.9z"/>');
  if (c === 3) return IC.clima;
  if (c <= 48) return s('<path d="M4 9h16M3 13h18M5 17h14"/>');
  if (c <= 67 || (c >= 80 && c <= 82)) return s('<path d="M7.5 15.5h9.8a3.7 3.7 0 0 0 .4-7.4 5.2 5.2 0 0 0-10-.6 4 4 0 0 0-.2 8z"/><path d="m9 18.5-.8 2M13 18.5l-.8 2M17 18.5l-.8 2"/>');
  return s('<path d="M7.5 15.5h9.8a3.7 3.7 0 0 0 .4-7.4 5.2 5.2 0 0 0-10-.6 4 4 0 0 0-.2 8z"/><path d="m12.5 15.5-2 3.5h3l-2 3.5"/>');
}
