/**
 * Mapeo ISO 3166-1 numérico (id en world-atlas) → ISO 3166-1 alpha-2
 * para países europeos mostrados en el mapa.
 */
export const NUMERIC_TO_ISO2 = {
  '008': 'AL', '040': 'AT', '056': 'BE', '100': 'BG', '191': 'HR', '196': 'CY',
  '203': 'CZ', '208': 'DK', '233': 'EE', '246': 'FI', '250': 'FR', '276': 'DE',
  '300': 'GR', '348': 'HU', '372': 'IE', '380': 'IT', '428': 'LV', '440': 'LT',
  '442': 'LU', '470': 'MT', '528': 'NL', '616': 'PL', '620': 'PT', '642': 'RO',
  '703': 'SK', '705': 'SI', '724': 'ES', '752': 'SE', '826': 'UK', '352': 'IS',
  '438': 'LI', '578': 'NO', '756': 'CH', '498': 'MD', '807': 'MK', '688': 'RS',
  '499': 'ME', '792': 'TR', '268': 'GE', '031': 'AZ', '643': 'RU', '112': 'BY',
  '804': 'UA', '400': 'JO', '376': 'IL', '784': 'AE', '414': 'KW', '368': 'IQ',
  '512': 'OM', '051': 'AM', '496': 'MN', '156': 'CN',
};

/** Códigos ISO2 de países que queremos mostrar en el mapa (Europa + cercanos) */
export const EUROPE_MAP_ISO2 = new Set([
  'AL', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI',
  'ES', 'SE', 'IS', 'LI', 'NO', 'CH', 'UK', 'MD', 'MK', 'RS', 'ME', 'TR', 'UA',
  'BY', 'RU', 'GE', 'AZ', 'AM',
]);

export function getIso2FromGeography(geography) {
  const id = geography.id && String(geography.id).padStart(3, '0');
  return NUMERIC_TO_ISO2[id] || null;
}
