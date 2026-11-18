// Base de datos de MCs
// Datos actualizados a noviembre de 2026.
// Fuentes: Wikipedia (Freestyle Master Series, Red Bull Batalla de los Gallos) + prensa (Red Bull, Portafolio).
//
// Campos:
//   name   nombre artístico
//   alias  otros nombres para el buscador (opcional)
//   c      código de país (ISO 3166-1 alfa-2)
//   ligas  ligas nacionales FMS en las que ha competido como participante fijo
//   fms    títulos de liga nacional FMS
//   intl   títulos FMS Internacional + FMS World Series
//   rb     títulos de Red Bull Batalla Internacional
//   rbf    true si ha sido finalista de la Internacional sin ganarla

const COUNTRIES = {
  es: { name: "España", region: "Europa" },
  ar: { name: "Argentina", region: "Cono Sur" },
  cl: { name: "Chile", region: "Cono Sur" },
  mx: { name: "México", region: "Norteamérica" },
  pe: { name: "Perú", region: "Andes" },
  co: { name: "Colombia", region: "Andes" },
  ve: { name: "Venezuela", region: "Caribe" },
  cu: { name: "Cuba", region: "Caribe" },
  do: { name: "Rep. Dominicana", region: "Caribe" },
  pr: { name: "Puerto Rico", region: "Caribe" },
};

const LEAGUES = {
  ESP: "España",
  ARG: "Argentina",
  MEX: "México",
  CHI: "Chile",
  PER: "Perú",
  COL: "Colombia",
  CAR: "Caribe",
};

const MCS = [
  // España
  { name: "Chuty", c: "es", ligas: ["ESP", "MEX"], fms: 5, intl: 2, rb: 2 },
  { name: "Bnet", c: "es", ligas: ["ESP"], fms: 1, intl: 0, rb: 1 },
  { name: "Skone", c: "es", ligas: ["ESP", "MEX"], fms: 0, intl: 0, rb: 1 },
  { name: "Arkano", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 1 },
  { name: "Rayden", c: "es", ligas: [], fms: 0, intl: 0, rb: 1 },
  { name: "Invert", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 1 },
  { name: "Noult", c: "es", ligas: [], fms: 0, intl: 0, rb: 1 },
  { name: "Zasko", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Blon", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Mnak", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Sweet Pain", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Errecé", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Hander", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Walls", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Force", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Mr. Ego", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Sara Socas", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Tirpa", c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Kmbra", alias: ["Kambra"], c: "es", ligas: ["ESP"], fms: 0, intl: 0, rb: 0 },
  { name: "Sawi Elekipo", alias: ["Elekipo"], c: "es", ligas: ["ESP", "CHI"], fms: 0, intl: 0, rb: 0 },

  // Argentina
  { name: "Wos", c: "ar", ligas: ["ARG"], fms: 1, intl: 0, rb: 1 },
  { name: "Trueno", c: "ar", ligas: ["ARG"], fms: 1, intl: 0, rb: 0 },
  { name: "Dtoke", c: "ar", ligas: ["ARG"], fms: 0, intl: 0, rb: 1 },
  { name: "Papo", alias: ["Papo MC"], c: "ar", ligas: ["ARG"], fms: 1, intl: 0, rb: 0 },
  { name: "Klan", c: "ar", ligas: ["ARG"], fms: 0, intl: 0, rb: 0 },
  { name: "Replik", c: "ar", ligas: ["ARG"], fms: 0, intl: 0, rb: 0 },
  { name: "Mecha", c: "ar", ligas: ["ARG", "ESP"], fms: 1, intl: 0, rb: 0 },
  { name: "Larrix", c: "ar", ligas: ["ARG"], fms: 1, intl: 1, rb: 0 },
  { name: "Stuart", c: "ar", ligas: ["ARG", "CHI"], fms: 2, intl: 0, rb: 0 },
  { name: "Frescolate", c: "ar", ligas: [], fms: 0, intl: 0, rb: 1 },

  // México
  { name: "Aczino", c: "mx", ligas: ["MEX", "COL"], fms: 2, intl: 3, rb: 3 },
  { name: "Rapder", c: "mx", ligas: ["MEX"], fms: 2, intl: 0, rb: 1 },
  { name: "Jony Beltrán", alias: ["Jony B"], c: "mx", ligas: ["MEX"], fms: 1, intl: 0, rb: 0, rbf: true },
  { name: "Lobo Estepario", c: "mx", ligas: ["MEX"], fms: 1, intl: 0, rb: 0 },
  { name: "RC", c: "mx", ligas: ["MEX"], fms: 0, intl: 0, rb: 0 },
  { name: "Azuky", c: "mx", ligas: ["MEX"], fms: 0, intl: 0, rb: 0 },

  // Chile
  { name: "El Menor", alias: ["Menor", "Elmenor"], c: "cl", ligas: ["CHI", "ESP"], fms: 3, intl: 0, rb: 1 },
  { name: "Kaiser", c: "cl", ligas: ["CHI"], fms: 0, intl: 0, rb: 0, rbf: true },
  { name: "Teorema", c: "cl", ligas: ["CHI"], fms: 1, intl: 0, rb: 0 },
  { name: "Nitro", c: "cl", ligas: ["CHI"], fms: 2, intl: 0, rb: 0 },

  // Perú
  { name: "Jaze", c: "pe", ligas: ["PER"], fms: 2, intl: 0, rb: 0 },
  { name: "Skill", c: "pe", ligas: ["PER"], fms: 2, intl: 0, rb: 0 },
  { name: "KG", c: "pe", ligas: ["PER"], fms: 1, intl: 0, rb: 0 },
  { name: "Jota", c: "pe", ligas: ["PER"], fms: 0, intl: 0, rb: 0, rbf: true },
  { name: "Choque", c: "pe", ligas: ["PER"], fms: 0, intl: 0, rb: 0 },

  // Colombia
  { name: "Valles-T", alias: ["Valles T"], c: "co", ligas: ["COL"], fms: 2, intl: 0, rb: 0, rbf: true },
  { name: "Fat N", alias: ["Fat-N"], c: "co", ligas: ["COL"], fms: 0, intl: 0, rb: 1 },
  { name: "Marithea", c: "co", ligas: ["COL", "ESP"], fms: 0, intl: 0, rb: 0 },

  // Caribe
  { name: "Chang", c: "ve", ligas: ["COL"], fms: 1, intl: 0, rb: 0 },
  { name: "Letra", c: "ve", ligas: ["CAR"], fms: 1, intl: 0, rb: 0 },
  { name: "Mcklopedia", alias: ["MC Klopedia"], c: "ve", ligas: [], fms: 0, intl: 0, rb: 0, rbf: true },
  { name: "Reverse", c: "cu", ligas: ["COL"], fms: 0, intl: 0, rb: 0 },
  { name: "Exodo Lirical", c: "do", ligas: ["CAR", "COL"], fms: 1, intl: 0, rb: 0 },
  { name: "Link One", c: "pr", ligas: [], fms: 0, intl: 0, rb: 1 },
];
