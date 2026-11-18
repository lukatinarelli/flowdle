(() => {
  "use strict";

  const MAX_TRIES = 8;
  const HINT1_AT = 3;
  const HINT2_AT = 6;
  const EPOCH = Date.UTC(2026, 10, 18); // Flowdle #1 = 18/11/2026
  const STORE = "flowdle:";

  const $ = (s) => document.querySelector(s);
  const input = $("#guessInput");
  const sugList = $("#suggestions");
  const board = $("#board");

  // utilidades
  const norm = (s) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const store = {
    get(k, fallback) {
      try {
        const v = localStorage.getItem(STORE + k);
        return v ? JSON.parse(v) : fallback;
      } catch { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch { /* sin storage */ }
    },
  };

  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(n, seed) {
    const rnd = mulberry32(seed);
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function todayNumber() {
    const d = new Date();
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5) + 1;
  }

  // el MC del día solo sale de los conocidos; en hardcore entra cualquiera
  const POOL = MCS.filter((m) => m.top);

  function dailyTarget(n) {
    const len = POOL.length;
    const k = n - 1;
    const cycle = Math.floor(k / len);
    const order = shuffled(len, 4207 + cycle * 7919);
    return POOL[order[((k % len) + len) % len]];
  }

  const hue = (name) => [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
  const initials = (name) => {
    const parts = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
  };
  const avatar = (mc) => `<span class="avatar" style="--h:${hue(mc.name)}">${initials(mc.name)}</span>`;
  const flag = (code, cls = "flag") =>
    `<img class="${cls}" src="https://flagcdn.com/${code}.svg" alt="${COUNTRIES[code].name}" loading="lazy">`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const rbRank = (mc) => (mc.rb > 0 ? 1 + mc.rb : mc.rbf ? 1 : 0);
  const rbLabel = (mc) => (mc.rb > 0 ? `Campeón${mc.rb > 1 ? " ×" + mc.rb : ""}` : mc.rbf ? "Finalista" : "—");

  const byName = new Map(MCS.map((m) => [m.name, m]));

  // comparación
  function numeric(g, t) {
    if (g === t) return { color: "green", arrow: "" };
    return { color: Math.abs(g - t) === 1 ? "yellow" : "red", arrow: t > g ? "▲" : "▼" };
  }

  function compare(g, t) {
    const sameCountry = g.c === t.c;
    const sameRegion = COUNTRIES[g.c].region === COUNTRIES[t.c].region;

    const gl = [...g.ligas].sort().join();
    const tl = [...t.ligas].sort().join();
    const overlap = g.ligas.some((l) => t.ligas.includes(l));

    const rbG = rbRank(g), rbT = rbRank(t);

    return {
      name: g === t ? "green" : "none",
      country: sameCountry ? "green" : sameRegion ? "yellow" : "red",
      ligas: gl === tl ? "green" : overlap ? "yellow" : "red",
      fms: numeric(g.fms, t.fms),
      intl: numeric(g.intl, t.intl),
      rb: rbG === rbT ? { color: "green", arrow: "" } : { color: "red", arrow: rbT > rbG ? "▲" : "▼" },
    };
  }

  // estado
  const day = todayNumber();
  let mode = "daily";
  let target;
  let guesses = [];
  let over = false;
  let won = false;
  let revealed = { h1: false, h2: false };
  let activeIdx = -1;
  let countdownTimer = null;
  let hardcore = store.get("hardcore", false);

  function loadDaily() {
    target = dailyTarget(day);
    const saved = store.get("day-" + day, null);
    guesses = saved ? saved.guesses.filter((n) => byName.has(n)) : [];
    revealed = saved?.revealed || { h1: false, h2: false };
  }

  function newFree() {
    let next;
    const pool = hardcore ? MCS : POOL;
    do { next = pool[Math.floor(Math.random() * pool.length)]; } while (next === target);
    target = next;
    guesses = [];
    revealed = { h1: false, h2: false };
  }

  function persist() {
    if (mode === "daily") store.set("day-" + day, { guesses, revealed });
  }

  // render
  function rowHTML(mc) {
    const r = compare(mc, target);
    const chips = mc.ligas.length
      ? `<div class="chips">${mc.ligas.map((l) => `<span class="chip">${LEAGUES[l].name}</span>`).join("")}</div>`
      : `<span class="big">—</span><span class="sub">Ninguna</span>`;
    const num = (v, c) =>
      `<div class="cell ${c.color}" style="--i:3"><span class="big">${v}</span>${c.arrow ? `<span class="arrow">${c.arrow}</span>` : ""}</div>`;

    return `
      <div class="cell name ${r.name === "green" ? "green" : ""}" style="--i:0">${avatar(mc)}<span>${esc(mc.name)}</span></div>
      <div class="cell ${r.country}" style="--i:1">${flag(mc.c, "flag country-flag")}<span class="sub">${COUNTRIES[mc.c].name}</span></div>
      <div class="cell ${r.ligas}" style="--i:2">${chips}</div>
      ${num(mc.fms, r.fms)}
      ${num(mc.intl, r.intl).replace("--i:3", "--i:4")}
      <div class="cell ${r.rb.color}" style="--i:5"><span class="sub" style="font-size:14px">${rbLabel(mc)}</span>${r.rb.arrow ? `<span class="arrow">${r.rb.arrow}</span>` : ""}</div>`;
  }

  function addRow(mc, animate) {
    const row = document.createElement("div");
    row.className = "row" + (animate ? " anim" : "");
    row.innerHTML = rowHTML(mc);
    // la última jugada arriba del todo, justo debajo de la cabecera
    board.children[0].after(row);
  }

  function renderBoard() {
    board.querySelectorAll(".row:not(.head)").forEach((r) => r.remove());
    guesses.forEach((n) => addRow(byName.get(n), false));
  }

  function renderMeta() {
    $("#attempts").innerHTML = `Intentos: <b>${guesses.length}</b>/${MAX_TRIES}`;
    $("#emptyMsg").hidden = guesses.length > 0;
    $("#dayNum").textContent = "#" + day;

    const h1 = $("#hint1"), h2 = $("#hint2");
    const left1 = HINT1_AT - guesses.length, left2 = HINT2_AT - guesses.length;
    h1.disabled = left1 > 0 && !over;
    h2.disabled = left2 > 0 && !over;
    h1.textContent = left1 > 0 && !over ? `🔒 Inicial (${left1})` : "💡 Inicial";
    h2.textContent = left2 > 0 && !over ? `🔒 Letras (${left2})` : "💡 Letras";

    const lines = [];
    if (revealed.h1) lines.push(`Empieza por <code>${target.name[0].toUpperCase()}</code>`);
    if (revealed.h2) {
      const pattern = [...target.name].map((ch, i, a) =>
        ch === " " ? "&nbsp;&nbsp;" : i === 0 || i === a.length - 1 ? esc(ch.toUpperCase()) : "_").join(" ");
      lines.push(`${[...target.name].filter((c) => /\p{L}|\p{N}/u.test(c)).length} caracteres: <code>${pattern}</code>`);
    }
    const ht = $("#hintText");
    ht.hidden = lines.length === 0;
    ht.innerHTML = lines.join("<br>");

    input.disabled = over;
    input.placeholder = over ? "Partida terminada" : "Escribe un MC… Chuty, Aczino, Kmbra…";
  }

  function emojiGrid() {
    const e = { green: "🟩", yellow: "🟨", red: "🟥" };
    return [...guesses].map((n) => {
      const r = compare(byName.get(n), target);
      return [r.country, r.ligas, r.fms.color, r.intl.color, r.rb.color].map((c) => e[c]).join("");
    }).join("\n");
  }

  function renderResult() {
    const box = $("#result");
    if (!over) { box.hidden = true; clearInterval(countdownTimer); return; }

    const facts = [
      COUNTRIES[target.c].name,
      target.ligas.length ? "FMS " + target.ligas.map((l) => LEAGUES[l].name).join(" / ") : "Sin FMS",
      target.fms ? `${target.fms} título${target.fms > 1 ? "s" : ""} FMS` : null,
      target.rb ? `${target.rb}× campeón Red Bull` : target.rbf ? "Finalista Red Bull" : null,
    ].filter(Boolean).join(" · ");

    const winMsgs = ["¡TÍTULO!", "¡SIN RÉPLICA!", "¡TRIPLETA!", "¡QUÉ BARRA!", "¡PUNCHLINE!"];
    const title = won ? winMsgs[guesses.length % winMsgs.length] : "¡RÉPLICA PERDIDA!";
    const sub = won
      ? `Lo sacaste en <b>${guesses.length}</b> ${guesses.length === 1 ? "intento" : "intentos"} 🔥`
      : "El público decide… y hoy no fue tu día. Era:";

    box.className = "result " + (won ? "win" : "lose");
    box.innerHTML = `
      <h2>${title}</h2>
      <p>${sub}</p>
      <div class="reveal">${avatar(target)} ${esc(target.name)} ${flag(target.c)}</div>
      <p class="facts">${facts}</p>
      <div class="actions">
        <button class="btn primary" id="btnShare">📋 Compartir</button>
        <button class="btn ghost" id="btnAgain">${mode === "daily" ? "🔁 Jugar en Libre" : "🔁 Otra partida"}</button>
      </div>
      ${mode === "daily" ? `<div class="countdown">Próximo MC en<b id="countdown">--:--:--</b></div>` : ""}`;
    box.hidden = false;

    $("#btnShare").onclick = share;
    $("#btnAgain").onclick = () => (mode === "daily" ? setMode("free") : startFree());

    clearInterval(countdownTimer);
    if (mode === "daily") {
      const tick = () => {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const s = Math.max(0, Math.floor((next - now) / 1000));
        if (s === 0) { location.reload(); return; }
        const pad = (x) => String(x).padStart(2, "0");
        const el = $("#countdown");
        if (el) el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      };
      tick();
      countdownTimer = setInterval(tick, 1000);
    }
  }

  function renderAll() {
    renderBoard();
    renderMeta();
    renderResult();
  }

  // jugar
  function submit(mc) {
    if (over || !mc || guesses.includes(mc.name)) return;
    guesses.push(mc.name);
    input.value = "";
    closeSug();
    addRow(mc, true);

    won = mc === target;
    over = won || guesses.length >= MAX_TRIES;
    persist();
    renderMeta();

    if (over) {
      const delay = 6 * 170 + 450;
      setTimeout(() => {
        if (mode === "daily") recordStats();
        renderResult();
        if (won) confetti();
        $("#result").scrollIntoView({ behavior: "smooth", block: "center" });
      }, delay);
    } else {
      input.focus();
    }
  }

  function recordStats() {
    const s = store.get("stats", { played: 0, wins: 0, streak: 0, best: 0, dist: Array(MAX_TRIES).fill(0), lastDay: 0, lastWinDay: 0 });
    if (s.lastDay === day) return;
    s.played++;
    if (won) {
      s.wins++;
      s.streak = s.lastWinDay === day - 1 ? s.streak + 1 : 1;
      s.best = Math.max(s.best, s.streak);
      s.dist[guesses.length - 1]++;
      s.lastWinDay = day;
    } else {
      s.streak = 0;
    }
    s.lastDay = day;
    store.set("stats", s);
  }

  async function share() {
    const head = mode === "daily"
      ? `FLOWDLE #${day} 🎤 ${won ? guesses.length : "X"}/${MAX_TRIES}`
      : `FLOWDLE (libre) 🎤 ${won ? guesses.length : "X"}/${MAX_TRIES}`;
    const text = `${head}\n${emojiGrid()}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("¡Copiado! Pégalo en el grupo 🔥");
    } catch {
      prompt("Copia tu resultado:", text);
    }
  }

  // autocompletado
  function matches(q) {
    const nq = norm(q);
    if (!nq) return [];
    return MCS
      .filter((m) => !guesses.includes(m.name))
      .map((m) => {
        const keys = [m.name, ...(m.alias || [])].map(norm);
        const starts = keys.some((k) => k.startsWith(nq));
        const word = m.name.split(/\s+/).some((w) => norm(w).startsWith(nq));
        const has = keys.some((k) => k.includes(nq));
        return { m, score: starts ? 0 : word ? 1 : has ? 2 : 9 };
      })
      .filter((x) => x.score < 9)
      .sort((a, b) => a.score - b.score || a.m.name.localeCompare(b.m.name))
      .slice(0, 8)
      .map((x) => x.m);
  }

  let current = [];
  function openSug() {
    current = matches(input.value);
    activeIdx = current.length ? 0 : -1;
    if (!current.length) {
      sugList.innerHTML = input.value.trim() ? `<li style="cursor:default;color:var(--muted)">Ese MC no está en la base… 🤔</li>` : "";
      sugList.hidden = !input.value.trim();
      return;
    }
    sugList.innerHTML = current.map((m, i) => `
      <li role="option" data-i="${i}" class="${i === activeIdx ? "active" : ""}">
        ${flag(m.c)}<span class="s-name">${esc(m.name)}</span>
        <span class="s-country">${COUNTRIES[m.c].name}</span>
      </li>`).join("");
    sugList.hidden = false;
  }
  function closeSug() { sugList.hidden = true; sugList.innerHTML = ""; current = []; activeIdx = -1; }
  function setActive(i) {
    activeIdx = (i + current.length) % current.length;
    sugList.querySelectorAll("li").forEach((li, k) => li.classList.toggle("active", k === activeIdx));
    sugList.children[activeIdx]?.scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", openSug);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && current.length) { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === "ArrowUp" && current.length) { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === "Escape") closeSug();
    else if (e.key === "Enter") {
      e.preventDefault();
      const exact = MCS.find((m) => [m.name, ...(m.alias || [])].some((k) => norm(k) === norm(input.value)));
      const pick = current[activeIdx] || exact;
      if (pick && guesses.includes(pick.name)) toast("Ya lo has probado 😅");
      else if (pick) submit(pick);
      else if (input.value.trim()) {
        input.parentElement.classList.remove("shake");
        void input.offsetWidth;
        input.parentElement.classList.add("shake");
      }
    }
  });
  sugList.addEventListener("mousedown", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) { e.preventDefault(); submit(current[+li.dataset.i]); }
  });
  input.addEventListener("blur", () => setTimeout(closeSug, 120));

  // pistas
  $("#hint1").onclick = () => { revealed.h1 = true; persist(); renderMeta(); };
  $("#hint2").onclick = () => { revealed.h2 = true; persist(); renderMeta(); };

  // modos
  function setMode(m) {
    mode = m;
    document.querySelectorAll(".mode").forEach((b) => b.classList.toggle("active", b.dataset.mode === m));
    $("#hardcoreWrap").hidden = m !== "free";
    if (m === "daily") loadDaily(); else newFree();
    const last = guesses.length ? byName.get(guesses[guesses.length - 1]) : null;
    won = last === target;
    over = won || guesses.length >= MAX_TRIES;
    renderAll();
    if (!over) input.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startFree() { setMode("free"); }

  const hc = $("#hardcore");
  hc.checked = hardcore;
  hc.onchange = () => {
    hardcore = hc.checked;
    store.set("hardcore", hardcore);
    toast(hardcore ? "Modo hardcore: puede salir cualquiera 💀" : "Solo MCs conocidos");
    startFree();
  };
  $("#mcCount").textContent = MCS.length;
  document.querySelectorAll(".mode").forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));

  // modales
  $("#btnHelp").onclick = () => $("#helpModal").showModal();
  $("#btnStats").onclick = () => {
    const s = store.get("stats", { played: 0, wins: 0, streak: 0, best: 0, dist: Array(MAX_TRIES).fill(0) });
    const max = Math.max(1, ...s.dist);
    const highlight = mode === "daily" && over && won ? guesses.length - 1 : -1;
    $("#statsBody").innerHTML = `
      <div class="stats-grid">
        <div><b>${s.played}</b><span>Jugadas</span></div>
        <div><b>${s.played ? Math.round((s.wins / s.played) * 100) : 0}%</b><span>Victorias</span></div>
        <div><b>${s.streak}</b><span>Racha</span></div>
        <div><b>${s.best}</b><span>Mejor racha</span></div>
      </div>
      <div class="dist">
        ${s.dist.map((v, i) => `
          <div class="dist-row"><span class="n">${i + 1}</span>
            <span class="bar ${i === highlight ? "hl" : ""}" style="width:${Math.max(8, (v / max) * 100)}%">${v}</span>
          </div>`).join("")}
      </div>`;
    $("#statsModal").showModal();
  };
  document.querySelectorAll(".modal").forEach((d) =>
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

  // efectos
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function confetti() {
    const box = $("#confetti");
    const colors = ["#ff2bd6", "#22e4ff", "#ffd60a", "#17c964", "#ffffff"];
    box.innerHTML = Array.from({ length: 110 }, () => {
      const dur = 2.2 + Math.random() * 2;
      return `<i style="left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration:${dur}s;animation-delay:${Math.random() * .6}s;transform:rotate(${Math.random() * 360}deg)"></i>`;
    }).join("");
    setTimeout(() => (box.innerHTML = ""), 4800);
  }

  // arranque
  setMode("daily");
  if (!store.get("seenHelp", false)) {
    store.set("seenHelp", true);
    $("#helpModal").showModal();
  }
})();
