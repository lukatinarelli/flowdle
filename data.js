// Base de datos de MCs
//
// Las ligas de cada MC se sacan de las plantillas de FMS (ROSTERS), así que
// para meter una temporada nueva basta con añadir su lista de participantes.
// Los títulos y el país (cuando no coincide con el de su primera liga) van en INFO.
//
// Fuentes: freestylestats.com, Wikipedia, Mundo Freestyle, Infobae.
// Actualizado: noviembre de 2026.
// Perú y Caribe no tuvieron liga en 2025/26 (fueron torneos clasificatorios).

const COUNTRIES = {
  es: { name: "España", region: "Europa" },
  ar: { name: "Argentina", region: "Cono Sur" },
  cl: { name: "Chile", region: "Cono Sur" },
  uy: { name: "Uruguay", region: "Cono Sur" },
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

// Cada lista va en el orden de la clasificación final de esa temporada (de ahí
// sale el mejor puesto de cada MC). En las temporadas de 2023 con grupos y
// playoffs no hay tabla única: van campeón y subcampeón, luego los que cayeron
// en semis si se sabe, y el resto por su puesto en el grupo.
// La temporada en curso (ONGOING) no cuenta para el mejor puesto.
const ONGOING = "2026/27";

const ROSTERS = {
  ESP: {
    "2017": ["Chuty", "Skone", "Blon", "BTA", "Errecé", "Zasko", "Arkano", "Hander", "Invert", "Mr. Ego"],
    "2018": ["Chuty", "Walls", "Skone", "Blon", "Errecé", "Zasko", "Arkano", "BTA", "Force", "Hander"],
    "2019": ["Chuty", "Skone", "Bnet", "Blon", "Errecé", "Walls", "Mr. Ego", "Zasko", "Force", "BTA"],
    "2020/21": ["Bnet", "Gazir", "Sweet Pain", "Mnak", "Zasko", "Tirpa", "Blon", "Mr. Ego", "Errecé", "Khan"],
    "2022": ["Gazir", "Chuty", "Mnak", "Skone", "Blon", "Zasko", "Sweet Pain", "Sawi Elekipo", "Tirpa", "Sara Socas", "Mr. Ego", "Hander"],
    "2023": ["Gazir", "Chuty", "Mnak", "Sweet Pain", "Mecha", "Mounts", "Zasko", "Skone", "Tirpa", "Blon", "Jesús LC", "LE33"],
    "2024": ["Chuty", "Gazir", "Zasko", "Mnak", "Sawi Elekipo", "Alek", "Sweet Pain", "LE33", "Kmbra", "Michu"],
    "2025/26": ["Chuty", "Arkano", "Sweet Pain", "Dani VK", "Zasko", "Barón", "Alek", "Nez", "Fabiuki", "Nitro"],
    "2026/27": ["Arkano", "Babi", "Bélico", "El Menor", "Gazir", "Ibán", "Marithea", "Navas", "Sara Socas", "Sweet Pain"],
  },
  ARG: {
    "2018": ["Wos", "Papo", "MKS", "Replik", "Dtoke", "Dani", "Stuart", "Klan", "Cacha", "Trueno"],
    "2019": ["Trueno", "MKS", "Papo", "Stuart", "Cacha", "Dtoke", "Klan", "Nacho", "Sub", "Replik"],
    "2020/21": ["Stuart", "Papo", "Mecha", "Klan", "Nacho", "Wolf", "Dtoke", "MKS", "Cacha", "Sub"],
    "2022": ["Papo", "Mecha", "Larrix", "Klan", "Stuart", "Naista", "MP", "Nacho", "Zaina", "Katra", "Wolf", "Tata"],
    "2023": ["Larrix", "MP", "Rapder", "Dac", "Mito", "Dybbuk", "CTZ", "Naista", "G Sony", "Jesse Pungaz", "Dtoke", "Jaff"],
    "2024": ["Mecha", "Larrix", "Dybbuk", "Teorema", "Klan", "Stuart", "Jesse Pungaz", "CTZ", "Nasir Catriel", "Barto"],
    "2025/26": ["Stuart", "Teorema", "Mecha", "Dybbuk", "Abel", "Exe", "Replik", "MP", "Facu HDR", "Sophia"],
    "2026/27": ["Abel", "Dybbuk", "Exe", "Facu HDR", "Larrix", "Mecha", "Replik", "Rife", "Sophia", "1Tobi"],
  },
  MEX: {
    "2019": ["Aczino", "RC", "Jony Beltrán", "Zticma", "Rapder", "Yoiker", "Potencia", "Lobo Estepario", "Jack Adrenalina", "Mcklopedia"],
    "2020/21": ["Rapder", "RC", "Skiper", "Lobo Estepario", "Garza", "Yoiker", "Zticma", "Jony Beltrán", "Potencia", "B One"],
    "2022": ["Aczino", "Lobo Estepario", "Skiper", "Rapder", "RC", "Yoiker", "Dante", "Zticma", "Garza", "Lancer Lirical", "Jony Beltrán", "Dominic"],
    "2023": ["Lobo Estepario", "Chang", "Lancer Lirical", "Dante", "Ari Carrillo", "RC", "Zticma", "Kaiser", "Majestic", "Dominic", "Skiper", "Lobo López"],
    "2024": ["Rapder", "Skone", "Lobo Estepario", "Azuky", "Valles-T", "RC", "Xhavez", "Danger AK", "Cacha", "Maquiavélico", "Dominic"],
    "2025/26": ["Jony Beltrán", "Marithea", "Rapder", "Skone", "Azuky", "KG", "Lobo Estepario", "Artil", "Xhavez", "Nota Roja"],
    "2026/27": ["Azuky", "Chuty", "Dalia Castella", "Jony Beltrán", "Kodigo", "Lobo Estepario", "Nota Roja", "Rapder", "Skone", "Xhavez"],
  },
  CHI: {
    "2019": ["Teorema", "Acertijo", "Nitro", "Ricto Metriklan", "El Menor", "Tom Crowley", "Pepe Grillo", "Drose", "Kaiser", "Stigma"],
    "2020/21": ["Nitro", "Acertijo", "Pepe Grillo", "Jokker", "Tom Crowley", "Joqerr", "Ricto Metriklan", "Teorema", "El Menor", "Esezeta"],
    "2022": ["Nitro", "Basek", "Joqerr", "Acertijo", "Teorema", "Rodamiento", "Metalingüística", "Anubis", "Tom Crowley", "JNO", "Jokker", "Erreka"],
    "2023": ["El Menor", "Acertijo", "Rodamiento", "Teorema", "Basek", "Klan", "Jair Wong", "Joqerr", "Satim", "Sawi Elekipo", "Anubis", "Nasho"],
    "2024": ["El Menor", "Nitro", "Rodamiento", "Drose", "Acertijo", "Joqerr", "Anubis", "Racso", "99", "Blade"],
    "2025/26": ["El Menor", "Acertijo", "Kodigo", "CTZ", "Mnak", "Basek", "Drose", "Elemece", "Metalingüística", "Pepe Grillo"],
    "2026/27": ["Animus", "BTI", "Destello", "Drose", "Fusok", "Kaiser", "Metalingüística", "Nitro", "Stuart", "Teorema"],
  },
  PER: {
    "2020/21": ["Jaze", "Stick", "Strike", "Jota", "Skill", "Nekroos", "Vijay Kesh", "Ramset", "Choque", "Litzen DC"],
    "2022": ["Jaze", "Nekroos", "Stick", "Black Code", "Jota", "Skill", "Kian", "Vijay Kesh", "Diego MC", "Jair Wong", "Ghost", "Strike"],
    "2023": ["Skill", "Stick", "Nekroos", "Cacha", "Black Code", "Filósofo", "Racso", "Jota", "Kian", "Piero Pistas", "Litzen DC", "Vijay Kesh"],
    "2024": ["Skill", "Black Code", "KG", "El Menor", "Nekroos", "MP", "Xplain", "Vijay Kesh", "Jota", "Letras", "Arkano"],
  },
  COL: {
    "2022": ["Valles-T", "Chang", "Lokillo", "Filósofo", "Airon", "Letra", "RBN", "Carpe Diem", "Elevn", "Big Killa", "Ñko", "Gavyria"],
    "2023": ["Valles-T", "Marithea", "Puppy", "Nitro", "RBN", "Airon", "Coloso", "Diego MC", "Stuart", "Ken Zingle", "Carpe Diem", "Lokillo"],
    "2024": ["Chang", "Marithea", "Lokillo", "Puppy", "Filósofo", "Fat N", "Airon", "G Sony", "RBN", "Coloso"],
    "2025/26": ["Gazir", "Valles-T", "Larrix", "Chang", "Puppy", "Filósofo", "Fat N", "Pandora", "Skill", "Lil White"],
    "2026/27": ["Aczino", "Dima", "Éxodo Lirical", "Fat N", "Filósofo", "Pandora", "Puppy", "Reverse", "Valles-T", "Visionario"],
  },
  CAR: {
    "2023": ["Letra", "Metalingüística", "Aldahir", "SNK", "Ritmodelia", "Reverse", "Switch", "Jony Beltrán", "Éxodo Lirical", "Zaki", "Replik", "Yartzi"],
    "2024": ["Kodigo", "Reverse", "SNK", "Replik", "Eros EQ", "Jony Beltrán", "Zaki", "Metalingüística", "Letra", "Ghetto", "Éxodo Lirical"],
  },
};

// c      país, si no es el de la primera liga en la que compitió
// fms    títulos de liga nacional FMS
// intl   títulos de FMS Internacional + World Series
// rb     títulos de la Final Internacional de Red Bull Batalla
// final  finalista de la Internacional de Red Bull sin haberla ganado
const INFO = {
  // España
  "Barón": { c: "uy" },
  "Chuty": { fms: 5, intl: 2, rb: 2 },
  "Gazir": { fms: 3, intl: 2, rb: 1 },
  "Bnet": { fms: 1, rb: 1 },
  "Skone": { rb: 1 },
  "Arkano": { rb: 1 },
  "Invert": { rb: 1 },
  "Kmbra": { alias: ["Kambra"] },
  "Sawi Elekipo": { c: "es", alias: ["Elekipo"] },
  "Rayden": { c: "es", rb: 1 },
  "Noult": { c: "es", rb: 1 },
  "Piezas": { c: "es" },

  // Argentina
  "Wos": { fms: 1, rb: 1 },
  "Trueno": { fms: 1 },
  "Dtoke": { rb: 1 },
  "Papo": { fms: 1, alias: ["Papo MC"] },
  "Mecha": { c: "ar", fms: 1 },
  "Larrix": { fms: 1, intl: 1 },
  "Stuart": { fms: 2 },
  "Facu HDR": { alias: ["HDR"] },
  "G Sony": { c: "ar", alias: ["Sony"] },
  "Kodigo": { c: "ar", fms: 1 },
  "Acru": { c: "ar" },
  "Frescolate": { c: "ar", rb: 1 },

  // México
  "Aczino": { fms: 2, intl: 3, rb: 3 },
  "Rapder": { c: "mx", fms: 2, rb: 1 },
  "Jony Beltrán": { fms: 1, final: true, alias: ["Jony B"] },
  "Lobo Estepario": { fms: 1 },
  "Hadrian": { c: "mx", rb: 1 },

  // Chile
  "El Menor": { c: "cl", fms: 3, rb: 1, alias: ["Menor", "Elmenor"] },
  "Teorema": { c: "cl", fms: 1 },
  "Nitro": { fms: 2 },
  "Kaiser": { c: "cl", final: true },
  "Tom Crowley": { final: true },
  "Metalingüística": { c: "cl", alias: ["Meta", "Metalinguistica"] },
  "Racso": { c: "cl" },

  // Perú
  "Jaze": { fms: 2 },
  "Skill": { fms: 2 },
  "KG": { fms: 1 },
  "Jota": { final: true },
  "Vijay Kesh": { alias: ["Vijay", "New Era"] },
  "Jair Wong": { c: "pe" },
  "Diego MC": { c: "pe" },

  // Colombia
  "Valles-T": { c: "co", fms: 2, final: true, alias: ["Valles T"] },
  "Fat N": { rb: 1, alias: ["Fat-N"] },
  "Marithea": { c: "co" },
  "Filósofo": { c: "co" },

  // Caribe
  "Chang": { c: "ve", fms: 1 },
  "Letra": { c: "ve", fms: 1 },
  "Lancer Lirical": { c: "ve" },
  "Black Code": { c: "ve", alias: ["Blackcode"] },
  "Mcklopedia": { c: "ve", final: true, alias: ["MC Klopedia"] },
  "Gavyria": { c: "ve", alias: ["Gaviria"] },
  "Ken Zingle": { c: "ve" },
  "Reverse": { c: "cu" },
  "Éxodo Lirical": { c: "do", fms: 1, alias: ["Exodo"] },
  "Yartzi": { c: "pr" },
  "Link One": { c: "pr", rb: 1 },
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
    for (const [season, players] of Object.entries(seasons)) {
      const year = parseInt(season);
      for (const name of players) {
        if (!byName.has(name)) byName.set(name, { name, ligas: [], c: null, since: Infinity, seasons: 0, best: Infinity });
        const mc = byName.get(name);
        if (!mc.ligas.includes(league)) mc.ligas.push(league);
        mc.seasons++;
        if (season !== ONGOING) mc.best = Math.min(mc.best, players.indexOf(name) + 1);
        // por defecto, el país de la primera liga en la que compitió
        if (year < mc.since) {
          mc.since = year;
          mc.c = LEAGUES[league].country;
        }
      }
    }
  }

  // leyendas de Red Bull y gente que no ha pisado FMS
  for (const name of Object.keys(INFO)) {
    if (!byName.has(name)) byName.set(name, { name, ligas: [], c: null, since: Infinity, seasons: 0, best: Infinity });
  }

  return [...byName.values()].map((mc) => {
    const info = INFO[mc.name] || {};
    return {
      name: mc.name,
      alias: info.alias || [],
      c: info.c || mc.c,
      ligas: mc.ligas,
      debut: mc.since === Infinity ? null : mc.since, // primer año en FMS
      seasons: mc.seasons, // temporadas jugadas, sumando todas las ligas
      best: mc.best === Infinity ? null : mc.best, // mejor puesto final en una temporada
      fms: info.fms || 0,
      intl: info.intl || 0,
      rb: info.rb || 0,
      rbf: !!info.final,
    };
  });
})();
