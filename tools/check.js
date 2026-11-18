#!/usr/bin/env node
// Revisa data.js y photos.js antes de publicar: países, nombres duplicados,
// entradas de INFO que no apuntan a nadie, fotos huérfanas...
//
//   node tools/check.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const ctx = {};
vm.createContext(ctx);
for (const file of ["data.js", "photos.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
}
const { MCS, COUNTRIES, LEAGUES, ROSTERS, INFO, PHOTOS } = vm.runInContext(
  "({ MCS, COUNTRIES, LEAGUES, ROSTERS, INFO, PHOTOS })",
  ctx
);

const errors = [];
const warnings = [];

const slug = (name) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ligas y temporadas
for (const [league, seasons] of Object.entries(ROSTERS)) {
  if (!LEAGUES[league]) errors.push(`Liga desconocida en ROSTERS: ${league}`);
  for (const [season, players] of Object.entries(seasons)) {
    const dupes = players.filter((p, i) => players.indexOf(p) !== i);
    if (dupes.length) errors.push(`${league} ${season}: repetidos ${dupes.join(", ")}`);
  }
}

// MCs
const slugs = new Map();
for (const mc of MCS) {
  if (!COUNTRIES[mc.c]) errors.push(`${mc.name}: país desconocido (${mc.c})`);
  for (const k of ["fms", "intl", "rb"]) {
    if (!Number.isInteger(mc[k]) || mc[k] < 0) errors.push(`${mc.name}: ${k} no válido`);
  }
  const s = slug(mc.name);
  if (slugs.has(s)) errors.push(`"${mc.name}" y "${slugs.get(s)}" se confunden (mismo slug: ${s})`);
  slugs.set(s, mc.name);
}

// INFO con nombres que no están en ninguna plantilla: puede ser a propósito
// (leyendas de Red Bull), pero también una errata
const inRosters = new Set(Object.values(ROSTERS).flatMap((s) => Object.values(s).flat()));
for (const name of Object.keys(INFO)) {
  if (!inRosters.has(name) && !INFO[name].c) {
    errors.push(`INFO["${name}"] no está en ninguna plantilla y no tiene país (¿errata?)`);
  }
}

// fotos
for (const p of PHOTOS) {
  if (!slugs.has(p)) warnings.push(`Foto sin MC: img/mcs/${p}.webp`);
  if (!fs.existsSync(path.join(root, "img", "mcs", `${p}.webp`))) errors.push(`photos.js cita ${p} pero no existe el archivo`);
}

const withPhoto = MCS.filter((m) => PHOTOS.includes(slug(m.name))).length;
console.log(`${MCS.length} MCs, ${withPhoto} con foto`);
warnings.forEach((w) => console.warn("aviso:", w));
errors.forEach((e) => console.error("error:", e));
process.exit(errors.length ? 1 : 0);
