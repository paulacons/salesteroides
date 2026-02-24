/**
 * Estado de transposición de regulación ESG por país.
 * Fuente objetivo: EUR-Lex. Actualizable (reemplazar o regenerar desde API/scraping).
 *
 * Estados: draft | approved | in_force
 * Riesgo: low | medium | high (respecto a plazos / cumplimiento)
 */

export const REGULATION_IDS = {
  CSRD: 'CSRD',
  CSDDD: 'CSDDD',
  TAXONOMY: 'Taxonomía EU',
  NFRD: 'NFRD',
};

export const STATUS_LABELS = {
  draft: 'Borrador',
  approved: 'Aprobado',
  in_force: 'En vigor',
};

export const RISK_LABELS = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

/** Países EU/EEA con códigos ISO 3166-1 alpha-2 usados en el mapa */
export const EUROPEAN_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', 'CH', 'UK', 'AL', 'ME', 'MK', 'RS', 'TR', 'XK',
];

/** Country names (ES) */
export const COUNTRY_NAMES = {
  AT: 'Austria', BE: 'Bélgica', BG: 'Bulgaria', HR: 'Croacia', CY: 'Chipre',
  CZ: 'Chequia', DK: 'Dinamarca', EE: 'Estonia', FI: 'Finlandia', FR: 'Francia',
  DE: 'Alemania', GR: 'Grecia', HU: 'Hungría', IE: 'Irlanda', IT: 'Italia',
  LV: 'Letonia', LT: 'Lituania', LU: 'Luxemburgo', MT: 'Malta', NL: 'Países Bajos',
  PL: 'Polonia', PT: 'Portugal', RO: 'Rumanía', SK: 'Eslovaquia', SI: 'Eslovenia',
  ES: 'España', SE: 'Suecia', IS: 'Islandia', LI: 'Liechtenstein', NO: 'Noruega',
  CH: 'Suiza', UK: 'Reino Unido', AL: 'Albania', ME: 'Montenegro', MK: 'Macedonia del Norte',
  RS: 'Serbia', TR: 'Turquía', XK: 'Kosovo',
};

/** Country names (EN) */
export const COUNTRY_NAMES_EN = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
  CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
  DE: 'Germany', GR: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
  ES: 'Spain', SE: 'Sweden', IS: 'Iceland', LI: 'Liechtenstein', NO: 'Norway',
  CH: 'Switzerland', UK: 'United Kingdom', AL: 'Albania', ME: 'Montenegro', MK: 'North Macedonia',
  RS: 'Serbia', TR: 'Turkey', XK: 'Kosovo', MD: 'Moldova', UA: 'Ukraine', BY: 'Belarus', RU: 'Russia', GE: 'Georgia', AZ: 'Azerbaijan', AM: 'Armenia',
};

/**
 * Por país: para cada regulación, { status, date, risk }.
 * Fechas en ISO (YYYY-MM-DD). risk opcional.
 */
export const REGULATION_BY_COUNTRY = {
  ES: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-05', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-12-28', risk: 'low' },
  },
  DE: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-16', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-04-19', risk: 'low' },
  },
  FR: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-11', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-19', risk: 'low' },
  },
  IT: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-15', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',     date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2016-12-30', risk: 'low' },
  },
  NL: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-03-21', risk: 'low' },
  },
  PT: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-06-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-11-23', risk: 'low' },
  },
  BE: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-05-14', risk: 'low' },
  },
  PL: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-09-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-10-12', risk: 'low' },
  },
  SE: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-01-01', risk: 'low' },
  },
  AT: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-03-01', risk: 'low' },
  },
  IE: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-06-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-05-22', risk: 'low' },
  },
  DK: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-12-19', risk: 'low' },
  },
  FI: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-28', risk: 'low' },
  },
  CZ: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-07-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-07-25', risk: 'low' },
  },
  RO: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-08-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-04-11', risk: 'low' },
  },
  HU: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-07-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-06-14', risk: 'low' },
  },
  GR: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-04-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-15', risk: 'low' },
  },
  BG: {
    [REGULATION_IDS.CSRD]:  { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-15', risk: 'low' },
  },
  SK: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-07-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-10-23', risk: 'low' },
  },
  EE: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-07-01', risk: 'low' },
  },
  LV: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-11-01', risk: 'low' },
  },
  LT: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-10-01', risk: 'low' },
  },
  SI: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'medium' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-04-20', risk: 'low' },
  },
  HR: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-07-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2019-04-05', risk: 'low' },
  },
  LU: {
    [REGULATION_IDS.CSRD]:  { status: 'in_force',  date: '2024-01-01', risk: 'low' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-18', risk: 'low' },
  },
  MT: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-06-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-12-21', risk: 'low' },
  },
  CY: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-06-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2017-12-15', risk: 'low' },
  },
  UK: {
    [REGULATION_IDS.CSRD]:  { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'approved', date: null,        risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2016-12-08', risk: 'low' },
  },
  NO: {
    [REGULATION_IDS.CSRD]:  { status: 'approved', date: '2024-07-01', risk: 'medium' },
    [REGULATION_IDS.CSDDD]: { status: 'approved',  date: '2024-12-12', risk: 'low' },
    [REGULATION_IDS.TAXONOMY]: { status: 'in_force', date: '2022-01-01', risk: 'low' },
    [REGULATION_IDS.NFRD]:  { status: 'in_force',  date: '2018-07-01', risk: 'low' },
  },
  CH: {
    [REGULATION_IDS.CSRD]:  { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.CSDDD]: { status: 'draft',    date: null,        risk: 'high' },
    [REGULATION_IDS.TAXONOMY]: { status: 'approved', date: null,        risk: 'medium' },
    [REGULATION_IDS.NFRD]:  { status: null,       date: null,        risk: 'low' },
  },
};
