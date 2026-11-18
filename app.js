(() => {
  "use strict";

  const MAX_TRIES = 8;
  const FACE_TRIES = 6;
  const FACE_BLUR = [26, 18, 12, 8, 5, 2]; // px de desenfoque según los fallos
  const FIRST_DAY = Date.UTC(2026, 10, 18); // flowdle #1

  const $ = (s) => document.querySelector(s);
  const input = $("#guessInput");
  const list = $("#suggestions");
  const board = $("#board");

  const byName = new Map(MCS.map((m) => [m.name, m]));

  // quita tildes, espacios y símbolos para poder buscar "valles t" o "exodo"
  const simplify = (s) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ]/g, "");

  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // localStorage puede fallar en modo incógnito, así que mejor no romper nada
  function load(key, fallback) {
    try {
      const v = localStorage.getItem("flowdle:" + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try {
      localStorage.setItem("flowdle:" + key, JSON.stringify(value));
    } catch (e) {}
  }

  function flag(code) {
    return `<img class="flag" src="https://flagcdn.com/${code}.svg" alt="${COUNTRIES[code].name}">`;
  }

  // ---- fotos ----
  // tools/fotos.py deja las fotos en img/mcs/ y la lista en photos.js

  const slug = (name) =>
    name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const photos = new Set(typeof PHOTOS !== "undefined" ? PHOTOS : []);
  const hasPhoto = (mc) => photos.has(slug(mc.name));
  const photoUrl = (mc) => `img/mcs/${slug(mc.name)}.webp`;

  function face(mc, cls = "face") {
    return hasPhoto(mc) ? `<img class="${cls}" src="${photoUrl(mc)}" alt="" loading="lazy">` : "";
  }

  // el modo caras necesita unas cuantas fotos para tener gracia
  const FACES_MIN = 5;
  const withPhoto = MCS.filter(hasPhoto);

  const maxTries = () => (mode === "faces" ? FACE_TRIES : MAX_TRIES);

  // ---- MC del día ----

  function today() {
    const d = new Date();
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - FIRST_DAY) / 86400000) + 1;
  }

  // generador pseudoaleatorio con semilla para que todos tengan el mismo MC
  function random(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // se baraja la lista y se va recorriendo; al acabarla se vuelve a barajar
  function mcOfDay(day) {
    const n = MCS.length;
    const round = Math.floor((day - 1) / n);
    const rnd = random(1234 + round);
    const order = MCS.map((_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return MCS[order[(((day - 1) % n) + n) % n]];
  }

  // ---- comparar ----

  function rbLevel(mc) {
    if (mc.rb > 0) return 1 + mc.rb;
    return mc.rbf ? 1 : 0;
  }

  function rbText(mc) {
    if (mc.rb > 1) return `Campeón x${mc.rb}`;
    if (mc.rb === 1) return "Campeón";
    return mc.rbf ? "Finalista" : "—";
  }

  function compareNumber(guess, real) {
    if (guess === real) return { color: "green", arrow: "" };
    return {
      color: Math.abs(guess - real) === 1 ? "yellow" : "red",
      arrow: real > guess ? "▲" : "▼",
    };
  }

  function compare(g, t) {
    let country = "red";
    if (g.c === t.c) country = "green";
    else if (COUNTRIES[g.c].region === COUNTRIES[t.c].region) country = "yellow";

    let ligas = "red";
    if ([...g.ligas].sort().join() === [...t.ligas].sort().join()) ligas = "green";
    else if (g.ligas.some((l) => t.ligas.includes(l))) ligas = "yellow";

    const rb = rbLevel(g) === rbLevel(t)
      ? { color: "green", arrow: "" }
      : { color: "red", arrow: rbLevel(t) > rbLevel(g) ? "▲" : "▼" };

    return {
      country,
      ligas,
      fms: compareNumber(g.fms, t.fms),
      intl: compareNumber(g.intl, t.intl),
      rb,
    };
  }

  // ---- estado ----

  const day = today();
  let mode = "daily";
  let target = null;
  let guesses = [];
  let hints = { initial: false, letters: false };
  let finished = false;
  let won = false;
  let timer = null;

  function startDaily() {
    target = mcOfDay(day);
    const saved = load("day-" + day, null);
    guesses = saved ? saved.guesses.filter((n) => byName.has(n)) : [];
    hints = saved && saved.hints ? saved.hints : { initial: false, letters: false };
  }

  function startRandom(pool) {
    let next = pool[Math.floor(Math.random() * pool.length)];
    while (next === target && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
    target = next;
    guesses = [];
    hints = { initial: false, letters: false };
  }

  function saveDay() {
    if (mode === "daily") save("day-" + day, { guesses, hints });
  }

  // ---- pintar ----

  function rowHtml(mc) {
    const r = compare(mc, target);
    const isTarget = mc === target;

    const ligas = mc.ligas.length
      ? `<div class="chips">${mc.ligas.map((l) => `<span class="chip">${LEAGUES[l].name}</span>`).join("")}</div>`
      : "Ninguna";

    const number = (value, res, i) => `
      <div class="cell ${res.color}" style="--i:${i}">
        <span class="num">${value}</span>
        ${res.arrow ? `<span class="arrow">${res.arrow}</span>` : ""}
      </div>`;

    return `
      <div class="cell name ${isTarget ? "green" : ""}" style="--i:0">${face(mc)}<span>${escapeHtml(mc.name)}</span></div>
      <div class="cell ${r.country}" style="--i:1">${flag(mc.c)}${COUNTRIES[mc.c].name}</div>
      <div class="cell ${r.ligas}" style="--i:2">${ligas}</div>
      ${number(mc.fms, r.fms, 3)}
      ${number(mc.intl, r.intl, 4)}
      <div class="cell ${r.rb.color}" style="--i:5">
        ${rbText(mc)}
        ${r.rb.arrow ? `<span class="arrow">${r.rb.arrow}</span>` : ""}
      </div>`;
  }

  function addRow(mc, animate) {
    if (mode === "faces") {
      const li = document.createElement("li");
      li.className = mc === target ? "ok" : "";
      li.textContent = mc.name;
      $("#faceGuesses").append(li);
      return;
    }
    const row = document.createElement("div");
    row.className = animate ? "row new" : "row";
    row.innerHTML = rowHtml(mc);
    board.querySelector(".head").after(row); // el último intento siempre arriba
  }

  function drawBoard() {
    board.querySelectorAll(".row:not(.head)").forEach((r) => r.remove());
    $("#faceGuesses").innerHTML = "";
    guesses.forEach((name) => addRow(byName.get(name), false));
  }

  function drawFace() {
    if (mode !== "faces") return;
    const img = $("#faceImg");
    if (img.dataset.mc !== target.name) {
      img.dataset.mc = target.name;
      img.src = photoUrl(target);
    }
    const blur = finished ? 0 : FACE_BLUR[Math.min(guesses.length, FACE_BLUR.length - 1)];
    img.style.filter = `blur(${blur}px)`;
  }

  function drawInfo() {
    drawFace();
    $("#attempts").textContent = `Intento ${guesses.length}/${maxTries()}`;
    $("#dayNum").textContent = "#" + day;

    const h1 = $("#hint1");
    const h2 = $("#hint2");
    h1.disabled = !finished && guesses.length < 3;
    h2.disabled = !finished && guesses.length < 6;
    h1.title = h1.disabled ? "Disponible al tercer intento" : "";
    h2.title = h2.disabled ? "Disponible al sexto intento" : "";

    const lines = [];
    if (hints.initial) lines.push(`Empieza por <b>${target.name[0].toUpperCase()}</b>`);
    if (hints.letters) {
      const letters = [...target.name].filter((c) => /[\p{L}\p{N}]/u.test(c)).length;
      const pattern = [...target.name].map((c) => (c === " " ? " / " : "_")).join("");
      lines.push(`${letters} caracteres: <b>${pattern}</b>`);
    }
    const box = $("#hintText");
    box.hidden = lines.length === 0;
    box.innerHTML = lines.join("<br>");

    input.disabled = finished;
    input.placeholder = finished ? "Partida terminada" : "Escribe un MC";
  }

  function drawResult() {
    const box = $("#result");
    clearInterval(timer);
    if (!finished) {
      box.hidden = true;
      return;
    }

    const facts = [];
    facts.push(target.ligas.length ? "FMS " + target.ligas.map((l) => LEAGUES[l].name).join(", ") : "Nunca estuvo en FMS");
    if (target.fms) facts.push(`${target.fms} ${target.fms === 1 ? "título" : "títulos"} FMS`);
    if (target.rb) facts.push(target.rb === 1 ? "campeón de Red Bull" : `${target.rb} veces campeón de Red Bull`);
    else if (target.rbf) facts.push("finalista de Red Bull");

    const title = won
      ? guesses.length === 1 ? "¡A la primera!" : `¡Bien! En ${guesses.length} intentos`
      : "Esta vez no";

    box.innerHTML = `
      <h2>${title}</h2>
      <div class="who">${face(target, "face big")} ${flag(target.c)} ${escapeHtml(target.name)}</div>
      <p class="facts">${facts.join(" · ")}</p>
      <div class="actions">
        <button class="btn primary" id="btnShare">Compartir</button>
        <button class="btn" id="btnAgain">${mode === "daily" ? "Jugar en libre" : "Otro"}</button>
      </div>
      ${mode === "daily" ? `<p class="next">Siguiente MC en <b id="countdown"></b></p>` : ""}`;
    box.hidden = false;

    $("#btnShare").onclick = share;
    $("#btnAgain").onclick = () => setMode(mode === "daily" ? "free" : mode);

    if (mode === "daily") {
      const tick = () => {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const secs = Math.floor((midnight - now) / 1000);
        if (secs <= 0) return location.reload();
        const two = (n) => String(n).padStart(2, "0");
        $("#countdown").textContent = `${two(Math.floor(secs / 3600))}:${two(Math.floor(secs / 60) % 60)}:${two(secs % 60)}`;
      };
      tick();
      timer = setInterval(tick, 1000);
    }
  }

  // ---- jugar ----

  function guess(mc) {
    if (finished || !mc) return;
    if (guesses.includes(mc.name)) {
      toast("Ese ya lo has puesto");
      return;
    }

    guesses.push(mc.name);
    input.value = "";
    closeList();
    addRow(mc, true);

    won = mc === target;
    finished = won || guesses.length >= maxTries();
    saveDay();
    drawInfo();

    if (finished) {
      // esperar a que termine la animación de la fila
      setTimeout(() => {
        if (mode === "daily") updateStats();
        drawResult();
      }, mode === "faces" ? 400 : 1100);
    } else {
      input.focus();
    }
  }

  function updateStats() {
    const s = load("stats", { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0, 0, 0], lastDay: 0, lastWin: 0 });
    if (s.lastDay === day) return;

    s.played++;
    s.lastDay = day;
    if (won) {
      s.wins++;
      s.streak = s.lastWin === day - 1 ? s.streak + 1 : 1;
      s.best = Math.max(s.best, s.streak);
      s.dist[guesses.length - 1]++;
      s.lastWin = day;
    } else {
      s.streak = 0;
    }
    save("stats", s);
  }

  function share() {
    const colors = { green: "🟩", yellow: "🟨", red: "🟥" };
    let rows;
    if (mode === "faces") {
      rows = [guesses.map((name) => (name === target.name ? "🟩" : "🟥")).join("")];
    } else {
      rows = guesses.map((name) => {
        const r = compare(byName.get(name), target);
        return [r.country, r.ligas, r.fms.color, r.intl.color, r.rb.color].map((c) => colors[c]).join("");
      });
    }
    const score = `${won ? guesses.length : "X"}/${maxTries()}`;
    const titles = { daily: `Flowdle #${day}`, free: "Flowdle (libre)", faces: "Flowdle Caras" };
    const head = `${titles[mode]} ${score}`;
    const text = `${head}\n${rows.join("\n")}\n${location.href.split("#")[0]}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast("Copiado"), () => prompt("Cópialo:", text));
    } else {
      prompt("Cópialo:", text);
    }
  }

  // ---- buscador ----

  let options = [];
  let selected = -1;

  function search(text) {
    const q = simplify(text);
    if (!q) return [];
    const results = [];
    // en caras solo tiene sentido proponer MCs que tengan foto
    for (const mc of mode === "faces" ? withPhoto : MCS) {
      if (guesses.includes(mc.name)) continue;
      const names = [mc.name, ...mc.alias].map(simplify);
      const words = mc.name.split(" ").map(simplify);
      let score = -1;
      if (names.some((n) => n.startsWith(q))) score = 0;
      else if (words.some((w) => w.startsWith(q))) score = 1;
      else if (names.some((n) => n.includes(q))) score = 2;
      if (score >= 0) results.push({ mc, score });
    }
    results.sort((a, b) => a.score - b.score || a.mc.name.localeCompare(b.mc.name));
    return results.slice(0, 8).map((r) => r.mc);
  }

  function openList() {
    options = search(input.value);
    selected = options.length ? 0 : -1;

    if (!input.value.trim()) return closeList();
    if (!options.length) {
      list.innerHTML = `<li class="none">No está en la lista</li>`;
      list.hidden = false;
      return;
    }

    list.innerHTML = options
      .map((mc, i) => `
        <li data-i="${i}" class="${i === 0 ? "active" : ""}">
          ${mode === "faces" ? "" : face(mc)} ${flag(mc.c)} ${escapeHtml(mc.name)}
          <span class="s-country">${COUNTRIES[mc.c].name}</span>
        </li>`)
      .join("");
    list.hidden = false;
  }

  function closeList() {
    list.hidden = true;
    list.innerHTML = "";
    options = [];
    selected = -1;
  }

  function select(i) {
    selected = (i + options.length) % options.length;
    list.querySelectorAll("li").forEach((li, k) => li.classList.toggle("active", k === selected));
    list.children[selected].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", openList);
  input.addEventListener("blur", () => setTimeout(closeList, 150));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      select(selected + 1);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      select(selected - 1);
    } else if (e.key === "Escape") {
      closeList();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[selected]) {
        guess(options[selected]);
      } else if (input.value.trim()) {
        input.classList.remove("shake");
        void input.offsetWidth; // reinicia la animación
        input.classList.add("shake");
      }
    }
  });
  list.addEventListener("mousedown", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    e.preventDefault();
    guess(options[Number(li.dataset.i)]);
  });

  // ---- pistas, modos y ventanas ----

  $("#hint1").onclick = () => {
    hints.initial = true;
    saveDay();
    drawInfo();
  };
  $("#hint2").onclick = () => {
    hints.letters = true;
    saveDay();
    drawInfo();
  };

  function setMode(m) {
    mode = m;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === m));
    if (m === "daily") startDaily();
    else if (m === "faces") startRandom(withPhoto);
    else startRandom(MCS);

    $(".board-wrap").hidden = m === "faces";
    $("#faceGame").hidden = m !== "faces";
    $(".hints").hidden = m === "faces";

    won = guesses.includes(target.name);
    finished = won || guesses.length >= maxTries();
    drawBoard();
    drawInfo();
    drawResult();
    if (!finished) input.focus();
  }

  document.querySelectorAll(".tab").forEach((t) => {
    t.onclick = () => setMode(t.dataset.mode);
  });

  $("#btnHelp").onclick = () => $("#helpModal").showModal();
  $("#btnStats").onclick = () => {
    const s = load("stats", { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0, 0, 0] });
    const max = Math.max(1, ...s.dist);
    const last = mode === "daily" && won ? guesses.length - 1 : -1;
    $("#statsBody").innerHTML = `
      <div class="stats">
        <div><b>${s.played}</b><span>Jugadas</span></div>
        <div><b>${s.played ? Math.round((s.wins / s.played) * 100) : 0}</b><span>% victorias</span></div>
        <div><b>${s.streak}</b><span>Racha</span></div>
        <div><b>${s.best}</b><span>Mejor racha</span></div>
      </div>
      <div class="dist">
        ${s.dist.map((v, i) => `<div>${i + 1} <span class="bar ${i === last ? "hl" : ""}" style="width:${(v / max) * 90 + 5}%">${v}</span></div>`).join("")}
      </div>`;
    $("#statsModal").showModal();
  };

  document.querySelectorAll(".modal").forEach((m) => {
    m.querySelector(".close").onclick = () => m.close();
    m.addEventListener("click", (e) => {
      if (e.target === m) m.close();
    });
  });

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  $("#mcCount").textContent = MCS.length;
  $("#tabFaces").hidden = withPhoto.length < FACES_MIN;
  setMode("daily");

  if (!load("seenHelp", false)) {
    save("seenHelp", true);
    $("#helpModal").showModal();
  }
})();
