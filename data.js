// Base de datos de MCs
//
// Las ligas de cada MC se sacan de las plantillas de FMS (ROSTERS), así que
// para meter una temporada nueva basta con añadir su lista de participantes.
// Los títulos y el país (cuando no coincide con el de su primera liga) van en INFO.
//
// Fuentes: freestylestats.com, Wikipedia, Mundo Freestyle, Infobae.
// Actualizado: noviembre de 2026.
// TODO: faltan las plantillas 2025/26 de todas las ligas menos Argentina.

const COUNTRIES = {
  es: { name: "España", region: "Europa" },
  ar: { name: "Argentina", region: "Cono Sur" },
  cl: { name: "Chile", region: "Cono Sur" },
  mx: { name: "México", region: "Centro y Norteamérica" },
  gt: { name: "Guatemala", region: "Centro y Norteamérica" },
  sv: { name: "El Salvador", region: "Centro y Norteamérica" },
  cr: { name: "Costa Rica", region: "Centro y Norteamérica" },
  pa: { name: "Panamá", region: "Centro y Norteamérica" },
  pe: { name: "Perú", region: "Andes" },
  co: { name: "Colombia", region: "Andes" },
  ec: { name: "Ecuador", region: "Andes" },
  ve: { name: "Venezuela", region: "Caribe" },
  cu: { name: "Cuba", region: "Caribe" },
  do: { name: "Rep. Dominicana", region: "Caribe" },
  pr: { name: "Puerto Rico", region: "Caribe" },
};

const LEAGUES = {
  ESP: { name: "España", country: "es" },
  ARG: { name: "Argentina", country: "ar" },
  MEX: { name: "México", country: "mx" },
  CHI: { name: "Chile", country: "cl" },
  PER: { name: "Perú", country: "pe" },
  COL: { name: "Colombia", country: "co" },
  CAR: { name: "Caribe", country: null },
};

const ROSTERS = {
  ESP: {
    "2017": ["Arkano", "Blon", "BTA", "Chuty", "Errecé", "Hander", "Invert", "Mr. Ego", "Skone", "Zasko"],
    "2018": ["Arkano", "BTA", "Blon", "Chuty", "Errecé", "Force", "Hander", "Skone", "Walls", "Zasko"],
    "2019": ["BTA", "Blon", "Bnet", "Chuty", "Errecé", "Force", "Mr. Ego", "Skone", "Walls", "Zasko"],
    "2020/21": ["Blon", "Bnet", "Errecé", "Gazir", "Khan", "Mnak", "Mr. Ego", "Sweet Pain", "Tirpa", "Zasko"],
    "2022": ["Blon", "Chuty", "Gazir", "Hander", "Mnak", "Mr. Ego", "Sara Socas", "Sawi Elekipo", "Skone", "Sweet Pain", "Tirpa", "Zasko"],
    "2023": ["Blon", "Chuty", "Gazir", "Jesús LC", "LE33", "Mecha", "Mnak", "Mounts", "Skone", "Sweet Pain", "Tirpa", "Zasko"],
    "2024": ["Alek", "Chuty", "Gazir", "Kmbra", "LE33", "Michu", "Mnak", "Sawi Elekipo", "Sweet Pain", "Zasko"],
    "2026/27": ["Arkano", "Babi", "Bélico", "El Menor", "Gazir", "Ibán", "Marithea", "Navas", "Sara Socas", "Sweet Pain"],
  },
  ARG: {
    "2018": ["Cacha", "Dani", "Dtoke", "Klan", "MKS", "Papo", "Replik", "Stuart", "Trueno", "Wos"],
    "2019": ["Cacha", "Dtoke", "Klan", "MKS", "Nacho", "Papo", "Replik", "Stuart", "Sub", "Trueno"],
    "2020/21": ["Cacha", "Dtoke", "Klan", "Mecha", "MKS", "Nacho", "Papo", "Stuart", "Sub", "Wolf"],
    "2022": ["Katra", "Klan", "Larrix", "Mecha", "MP", "Nacho", "Naista", "Papo", "Stuart", "Tata", "Wolf", "Zaina"],
    "2023": ["CTZ", "Dac", "Dtoke", "Dybbuk", "G Sony", "Jaff", "Jesse Pungaz", "Larrix", "Mito", "MP", "Naista", "Rapder"],
    "2024": ["Barto", "CTZ", "Dybbuk", "Jesse Pungaz", "Klan", "Larrix", "Mecha", "Nasir Catriel", "Stuart", "Teorema"],
    "2025/26": ["Abel", "Dybbuk", "Exe", "Facu HDR", "Mecha", "MP", "Replik", "Sophia", "Stuart", "Teorema"],
    "2026/27": ["Abel", "Dybbuk", "Exe", "Facu HDR", "Larrix", "Mecha", "Replik", "Rife", "Sophia", "1Tobi"],
  },
  MEX: {
    "2019": ["Aczino", "Jack Adrenalina", "Jony Beltrán", "Lobo Estepario", "Mcklopedia", "Potencia", "Rapder", "RC", "Yoiker", "Zticma"],
    "2020/21": ["B One", "Garza", "Jony Beltrán", "Lobo Estepario", "Potencia", "Rapder", "RC", "Skiper", "Yoiker", "Zticma"],
    "2022": ["Aczino", "Dante", "Dominic", "Garza", "Jony Beltrán", "Lancer Lirical", "Lobo Estepario", "Rapder", "RC", "Skiper", "Yoiker", "Zticma"],
    "2023": ["Ari Carrillo", "Chang", "Dante", "Dominic", "Kaiser", "Lancer Lirical", "Lobo Estepario", "Lobo López", "Majestic", "RC", "Skiper", "Zticma"],
    "2024": ["Azuky", "Cacha", "Danger AK", "Dominic", "Lobo Estepario", "Maquiavélico", "Rapder", "RC", "Skone", "Valles-T", "Xhavez"],
    "2026/27": ["Azuky", "Chuty", "Dalia Castella", "Jony Beltrán", "Kodigo", "Lobo Estepario", "Nota Roja", "Rapder", "Skone", "Xhavez"],
  },
  CHI: {
    "2019": ["Acertijo", "Drose", "El Menor", "Kaiser", "Nitro", "Pepe Grillo", "Ricto Metriklan", "Stigma", "Teorema", "Tom Crowley"],
    "2020/21": ["Acertijo", "El Menor", "Esezeta", "Jokker", "Joqerr", "Nitro", "Pepe Grillo", "Ricto Metriklan", "Teorema", "Tom Crowley"],
    "2022": ["Acertijo", "Anubis", "Basek", "Erreka", "JNO", "Jokker", "Joqerr", "Metalingüística", "Nitro", "Rodamiento", "Teorema", "Tom Crowley"],
    "2023": ["Acertijo", "Anubis", "Basek", "El Menor", "Jair Wong", "Joqerr", "Klan", "Nasho", "Rodamiento", "Satim", "Sawi Elekipo", "Teorema"],
    "2024": ["99", "Acertijo", "Anubis", "Blade", "Drose", "El Menor", "Joqerr", "Nitro", "Racso", "Rodamiento"],
    "2026/27": ["Animus", "BTI", "Destello", "Drose", "Fusok", "Kaiser", "Metalingüística", "Nitro", "Stuart", "Teorema"],
  },
  PER: {
    "2020/21": ["Choque", "Jaze", "Jota", "Litzen DC", "Nekroos", "Ramset", "Skill", "Stick", "Strike", "Vijay Kesh"],
    "2022": ["Black Code", "Diego MC", "Ghost", "Jair Wong", "Jaze", "Jota", "Kian", "Nekroos", "Skill", "Stick", "Strike", "Vijay Kesh"],
    "2023": ["Black Code", "Cacha", "Filósofo", "Jota", "Kian", "Litzen DC", "Nekroos", "Piero Pistas", "Racso", "Skill", "Stick", "Vijay Kesh"],
    "2024": ["Arkano", "Black Code", "El Menor", "Jota", "KG", "Letras", "MP", "Nekroos", "Skill", "Vijay Kesh", "Xplain"],
  },
  COL: {
    "2022": ["Airon", "Big Killa", "Carpe Diem", "Chang", "Elevn", "Filósofo", "Gavyria", "Letra", "Lokillo", "Ñko", "RBN", "Valles-T"],
    "2023": ["Airon", "Carpe Diem", "Coloso", "Diego MC", "Ken Zingle", "Lokillo", "Marithea", "Nitro", "Puppy", "RBN", "Stuart", "Valles-T"],
    "2024": ["Airon", "Chang", "Coloso", "Fat N", "Filósofo", "G Sony", "Lokillo", "Marithea", "Puppy", "RBN"],
    "2026/27": ["Aczino", "Dima", "Éxodo Lirical", "Fat N", "Filósofo", "Pandora", "Puppy", "Reverse", "Valles-T", "Visionario"],
  },
  CAR: {
    "2023": ["Aldahir", "Éxodo Lirical", "Jony Beltrán", "Letra", "Metalingüística", "Replik", "Reverse", "Ritmodelia", "SNK", "Switch", "Yartzi", "Zaki"],
    "2024": ["Eros EQ", "Éxodo Lirical", "Ghetto", "Jony Beltrán", "Kodigo", "Letra", "Metalingüística", "Replik", "Reverse", "SNK", "Zaki"],
  },
};

// c      país, si no es el de su primera liga
// fms    títulos de liga nacional FMS
// intl   títulos de FMS Internacional + World Series
// rb     títulos de la Final Internacional de Red Bull Batalla
// final  finalista de la Internacional de Red Bull sin haberla ganado
// extra  ligas que no salen en ROSTERS (temporadas que aún no tengo)
// top    MC conocido: puede salir como MC del día
const INFO = {
  // España
  "Chuty": { fms: 5, intl: 2, rb: 2, top: true },
  "Gazir": { fms: 3, intl: 2, rb: 1, extra: ["COL"], top: true },
  "Bnet": { fms: 1, rb: 1, top: true },
  "Skone": { rb: 1, top: true },
  "Arkano": { rb: 1, top: true },
  "Invert": { rb: 1, top: true },
  "Zasko": { top: true },
  "Blon": { top: true },
  "Mnak": { top: true },
  "Sweet Pain": { top: true },
  "Errecé": { top: true },
  "Hander": { top: true },
  "Walls": { top: true },
  "Force": { top: true },
  "BTA": { top: true },
  "Mr. Ego": { top: true },
  "Sara Socas": { top: true },
  "Tirpa": { top: true },
  "Kmbra": { alias: ["Kambra"], top: true },
  "Sawi Elekipo": { c: "es", alias: ["Elekipo"], top: true },
  "Rayden": { c: "es", rb: 1, top: true },
  "Noult": { c: "es", rb: 1, top: true },
  "Piezas": { c: "es", top: true },

  // Argentina
  "Wos": { fms: 1, rb: 1, top: true },
  "Trueno": { fms: 1, top: true },
  "Dtoke": { rb: 1, top: true },
  "Papo": { fms: 1, alias: ["Papo MC"], top: true },
  "Mecha": { c: "ar", fms: 1, top: true },
  "Larrix": { fms: 1, intl: 1, top: true },
  "Stuart": { fms: 2, top: true },
  "Klan": { top: true },
  "Replik": { top: true },
  "MKS": { top: true },
  "Nacho": { top: true },
  "Sub": { top: true },
  "CTZ": { top: true },
  "Jesse Pungaz": { top: true },
  "Cacha": { top: true },
  "MP": { top: true },
  "Dybbuk": { top: true },
  "Exe": { top: true },
  "Sophia": { top: true },
  "Facu HDR": { alias: ["HDR"], top: true },
  "Abel": { c: "ec", top: true },
  "G Sony": { c: "ar", alias: ["Sony"], top: true },
  "Kodigo": { c: "ar", fms: 1, top: true },
  "Acru": { c: "ar", top: true },
  "Frescolate": { c: "ar", rb: 1, top: true },

  // México
  "Aczino": { fms: 2, intl: 3, rb: 3, top: true },
  "Rapder": { c: "mx", fms: 2, rb: 1, top: true },
  "Jony Beltrán": { fms: 1, final: true, alias: ["Jony B"], top: true },
  "Lobo Estepario": { fms: 1, top: true },
  "RC": { top: true },
  "Skiper": { top: true },
  "Yoiker": { top: true },
  "Zticma": { top: true },
  "Azuky": { top: true },
  "Hadrian": { c: "mx", rb: 1 },

  // Chile
  "El Menor": { c: "cl", fms: 3, rb: 1, alias: ["Menor", "Elmenor"], top: true },
  "Teorema": { c: "cl", fms: 1, top: true },
  "Nitro": { fms: 2, top: true },
  "Kaiser": { c: "cl", final: true, top: true },
  "Tom Crowley": { final: true, top: true },
  "Acertijo": { top: true },
  "Basek": { top: true },
  "Metalingüística": { c: "cl", alias: ["Meta", "Metalinguistica"], top: true },
  "Racso": { c: "cl" },

  // Perú
  "Jaze": { fms: 2, top: true },
  "Skill": { fms: 2, top: true },
  "KG": { fms: 1, top: true },
  "Jota": { final: true, top: true },
  "Choque": { top: true },
  "Nekroos": { top: true },
  "Strike": { top: true },
  "Kian": { top: true },
  "Vijay Kesh": { alias: ["Vijay", "New Era"], top: true },
  "Stick": { top: true },
  "Jair Wong": { c: "pe" },
  "Diego MC": { c: "pe" },

  // Colombia
  "Valles-T": { c: "co", fms: 2, final: true, alias: ["Valles T"], top: true },
  "Fat N": { rb: 1, alias: ["Fat-N"], top: true },
  "Marithea": { c: "co", top: true },
  "Lokillo": { top: true },
  "Filósofo": { c: "co" },

  // Caribe
  "Chang": { c: "ve", fms: 1, top: true },
  "Letra": { c: "ve", fms: 1, top: true },
  "Lancer Lirical": { c: "ve", top: true },
  "Black Code": { c: "ve", alias: ["Blackcode"], top: true },
  "Mcklopedia": { c: "ve", final: true, alias: ["MC Klopedia"], top: true },
  "Gavyria": { c: "ve", alias: ["Gaviria"] },
  "Ken Zingle": { c: "ve" },
  "Reverse": { c: "cu", top: true },
  "Éxodo Lirical": { c: "do", fms: 1, alias: ["Exodo"], top: true },
  "Yartzi": { c: "pr" },
  "Link One": { c: "pr", rb: 1, top: true },
  "Aldahir": { c: "pa" },
  "Ritmodelia": { c: "gt" },
  "Ghetto": { c: "gt" },
  "SNK": { c: "cr" },
  "Eros EQ": { c: "cr" },
  "Zaki": { c: "sv" },
  "Switch": { c: "ec" },
};

const MCS = (() => {
  const byName = new Map();

  for (const [league, seasons] of Object.entries(ROSTERS)) {
    for (const players of Object.values(seasons)) {
      for (const name of players) {
        if (!byName.has(name)) byName.set(name, { name, ligas: [], c: LEAGUES[league].country });
        const mc = byName.get(name);
        if (!mc.ligas.includes(league)) mc.ligas.push(league);
      }
    }
  }

  // leyendas de Red Bull y gente que no ha pisado FMS
  for (const name of Object.keys(INFO)) {
    if (!byName.has(name)) byName.set(name, { name, ligas: [], c: null });
  }

  return [...byName.values()].map((mc) => {
    const info = INFO[mc.name] || {};
    const ligas = [...mc.ligas, ...(info.extra || [])].filter((l, i, a) => a.indexOf(l) === i);
    return {
      name: mc.name,
      alias: info.alias || [],
      c: info.c || mc.c,
      ligas,
      fms: info.fms || 0,
      intl: info.intl || 0,
      rb: info.rb || 0,
      rbf: !!info.final,
      top: !!info.top,
    };
  });
})();
