/* TripYaCa — dados iniciais (vêm do cronograma da viagem; tudo é editável no app) */
export const VIAGEM = {
  nome: 'TripYaCa',
  destino: 'Ilha Grande, RJ',
  inicio: '2026-11-19',
  fim: '2026-11-22',
  dias: ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'],
  lat: -23.1414, lon: -44.1675
};

const R = (id, dia, hora, titulo, extra = {}) => ({ col: 'roteiro', id, d: { dia, hora, titulo, tipo: 'outro', critico: false, feito: false, nota: '', curto: '', lugar: '', ...extra } });
const d1 = '2026-11-19', d2 = '2026-11-20', d3 = '2026-11-21', d4 = '2026-11-22';

const roteiro = [
  R('r1-01', d1, '13:40', 'Estar no ponto da van em Itaguaí', { tipo: 'transporte' }),
  R('r1-02', d1, '14:00', 'Van Itaguaí → Conceição de Jacareí', { tipo: 'transporte', critico: true, curto: 'a van' }),
  R('r1-03', d1, '16:00', 'Chegada em Conceição de Jacareí', { tipo: 'transporte', nota: 'Horário aproximado (depende do trânsito na Rio-Santos).' }),
  R('r1-04', d1, '18:30', 'FlexBoat Conceição de Jacareí → Abraão', { tipo: 'transporte', critico: true, curto: 'o FlexBoat', nota: 'Embarque na Marina Porto Real (km 455). ⚠️ As lanchas saem de hora em hora só até ~18h — confirmem o horário e reservem.' }),
  R('r1-05', d1, '19:00', 'Chegada em Abraão', { tipo: 'transporte', lugar: 'abraao' }),
  R('r1-06', d1, '19:15', 'Montar a barraca no camping Sombra dos Coqueirais', { tipo: 'camping', lugar: 'camping' }),
  R('r1-07', d1, '20:30', 'Passear pelo centrinho', { tipo: 'passeio', lugar: 'abraao' }),
  R('r1-08', d1, '21:00', 'Orçar passeios de barco', { tipo: 'passeio', nota: 'Para o passeio de sábado (Lagoa Azul, Lagoa Verde, Gruta do Acaiá).' }),

  R('r2-01', d2, '07:00', 'Acordar e preparar os lanches do dia', { tipo: 'camping' }),
  R('r2-02', d2, '08:00', 'Saída do camping para a trilha de Palmas', { tipo: 'trilha', critico: true, curto: 'a trilha de Palmas', lugar: 'palmas' }),
  R('r2-03', d2, '09:40', 'Chegada em Palmas', { tipo: 'trilha', lugar: 'palmas', nota: 'No cronograma estava "Chegada em Abraão" — confiram.' }),
  R('r2-04', d2, '10:00', 'Mergulho de apneia no canto direito', { tipo: 'passeio', nota: 'Maré ~0,8 m.', lugar: 'palmas' }),
  R('r2-05', d2, '11:15', 'Almoço no Bar do Alexandre', { tipo: 'comida' }),
  R('r2-06', d2, '12:00', 'Saída para Lopes Mendes', { tipo: 'trilha', curto: 'partir para Lopes Mendes', lugar: 'lopes' }),
  R('r2-07', d2, '13:30', 'Chegada em Lopes Mendes', { tipo: 'trilha', lugar: 'lopes' }),
  R('r2-08', d2, '16:00', 'Retorno de barco', { tipo: 'transporte', critico: true, curto: 'o barco de volta', lugar: 'pouso' }),
  R('r2-09', d2, '16:45', 'Descansar do passeio', { tipo: 'camping' }),
  R('r2-10', d2, '19:00', 'Centrinho', { tipo: 'passeio', lugar: 'abraao' }),

  R('r3-01', d3, '07:00', 'Acordar e preparar os lanches para o passeio', { tipo: 'camping' }),
  R('r3-02', d3, '09:30', 'Passeio de barco: Lagoa Azul, Lagoa Verde, Gruta do Acaiá…', { tipo: 'passeio', critico: true, curto: 'o passeio de barco', lugar: 'lagoaazul', nota: 'Confirmar o horário de saída com a agência.' }),
  R('r3-03', d3, '17:00', 'Retorno do passeio e descanso', { tipo: 'camping' }),
  R('r3-04', d3, '19:30', 'Centrinho: última noite, presentes e lembranças', { tipo: 'passeio', lugar: 'abraao' }),

  R('r4-01', d4, '08:00', 'Acordar, preparar lanches e arrumar as malas', { tipo: 'camping' }),
  R('r4-02', d4, '09:00', 'Trilha para a Cachoeira da Feiticeira', { tipo: 'trilha', critico: true, curto: 'a trilha da Feiticeira', lugar: 'cachoeira' }),
  R('r4-03', d4, '10:30', 'Chegada na cachoeira', { tipo: 'trilha', lugar: 'cachoeira' }),
  R('r4-04', d4, '12:00', 'Sair para a Praia da Feiticeira', { tipo: 'trilha', lugar: 'feiticeira' }),
  R('r4-05', d4, '12:20', 'Chegada na Praia da Feiticeira 🍹', { tipo: 'passeio', lugar: 'feiticeira', nota: 'Piña colada!' }),
  R('r4-06', d4, '15:00', 'Retorno de barco', { tipo: 'transporte', critico: true, curto: 'o barco de volta', lugar: 'feiticeira' }),
  R('r4-07', d4, '15:30', 'Desarmar a barraca', { tipo: 'camping', lugar: 'camping', nota: 'O check-out do camping é até 16h.' }),
  R('r4-08', d4, '17:30', 'Barca Abraão → Mangaratiba', { tipo: 'transporte', critico: true, curto: 'a barca', lugar: 'abraao', nota: 'Barcas Rio · R$ 20,50 · 80 a 110 min. Domingo lota: cheguem cedo ao cais.' }),
  R('r4-09', d4, '19:00', 'Pegar o Uber agendado', { tipo: 'transporte', critico: true, curto: 'o Uber', nota: 'Confirmar o horário certo do Uber.' })
];

const O = (id, dia, desc, valor) => ({ col: 'orc', id, d: { dia, desc, valor } });
const orc = [
  O('o1-1', d1, 'Transporte', 50), O('o1-4', d1, 'Taxa de turismo (TTS)', 50), O('o1-2', d1, 'Janta', 50), O('o1-3', d1, 'Lanches para os próximos dias', 50),
  O('o2-1', d2, 'Almoço', 50), O('o2-2', d2, 'Barco', 60), O('o2-3', d2, 'Janta', 50),
  O('o3-1', d3, 'Passeio de barco', 150), O('o3-2', d3, 'Janta', 50), O('o3-3', d3, 'Bugigangas', 100),
  O('o4-1', d4, 'Piña colada', 30), O('o4-2', d4, 'Barca', 20.5), O('o4-3', d4, 'Uber', 106)
];

let nC = 0;
const C = (grupo, texto, dono = 'comum') => ({ col: 'check', id: 'c' + String(++nC).padStart(3, '0'), d: { grupo, texto, dono, ok: false } });
const pessoais = ['Roupas de banho', 'Shorts e camisetas', 'Roupa íntima', 'Casaco leve para a noite', 'Toalha de banho', 'Escova e pasta de dente', 'Desodorante', 'Remédios pessoais', 'Documento com foto', 'Carregador do celular', 'Chinelo', 'Tênis ou papete de trilha'];
const check = [
  ...['Barraca', 'Lona ou forro para a barraca', 'Isolante ou colchonete', 'Lençol / saco de dormir', 'Travesseiros', 'Lanterna de cabeça', 'Powerbank carregado', 'Pilhas extras', 'Varal e prendedores', 'Sacos de lixo', 'Canivete', 'Isqueiro'].map(t => C('Camping', t)),
  ...['Protetor solar', 'Repelente', 'Saco estanque', 'Garrafas de água', 'Máscara de mergulho', 'Snorkel', 'Canga / toalha de praia', 'Boné ou chapéu', 'Óculos de sol', 'Capa de chuva', 'Kit primeiros socorros', 'Lanches para as trilhas', 'Dinheiro em espécie'].map(t => C('Praia e trilha', t)),
  ...pessoais.map(t => C('Mala', t, 'caio')),
  ...pessoais.map(t => C('Mala', t, 'yasmin'))
];

let nP = 0;
const P = (texto, extra = {}) => ({ col: 'pend', id: 'p' + String(++nP).padStart(2, '0'), d: { texto, ok: false, ...extra } });
const pend = [
  P('Reservar o camping Sombra dos Coqueirais'),
  P('Garantir a van Itaguaí → Conceição de Jacareí (14h)'),
  P('Reservar a lancha em Conceição de Jacareí (última costuma ser ~18h!)'),
  P('Pagar a taxa de turismo TTS no Viva Angra (R$ 50 cada) e salvar o comprovante do camping'),
  P('Confirmar o horário da barca de volta no domingo'),
  P('Agendar o Uber da volta'),
  P('Baixar o mapa offline da Ilha Grande no Google Maps'),
  P('Sacar dinheiro em espécie'),
  P('Comprar lanches para os primeiros dias'),
  P('Carregar os powerbanks'),
  P('Instalar o TripYaCa nos dois celulares')
];

export const SEED = [...roteiro, ...orc, ...check, ...pend];
