// ==================== DASHBOARD ====================
// File: js/features/dashboard/dashboard.js
// Scopo: mostra a colpo d'occhio dove intervenire ("Da fare adesso": ricontatti
//        scaduti, preventivi aperti, dati da sistemare), i numeri chiave,
//        l'andamento dei preventivi e gli ultimi inseriti.
//        Ogni riquadro porta direttamente alla sezione giusta.

const _dash = { timer: null, caricamento: false };
const _num = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 });
const _e = (t) =>
  String(t ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

async function loadDashboard() {
  const box = document.getElementById("dashboardContent");
  if (!box || _dash.caricamento) return;
  _dash.caricamento = true;
  try {
    const res = await fetch(`${API_URL}/dashboard`);
    if (!res.ok) throw new Error(`Errore HTTP ${res.status}`);
    renderDashboard(await res.json());
  } catch (err) {
    console.error("❌ Errore caricamento dashboard:", err);
    box.innerHTML = `<div class="dash-empty">Impossibile caricare la dashboard.
      <button type="button" class="dash-go" onclick="loadDashboard()">Riprova</button></div>`;
  } finally {
    _dash.caricamento = false;
  }
}

// Naviga a una sezione dell'app come se si cliccasse la voce di menu
function dashGoTo(sezione) {
  document.querySelector(`.nav-item[data-section="${sezione}"]`)?.click();
}

// Aggiorna la dashboard dopo modifiche in tempo reale (solo se visibile)
function refreshDashboardIfActive() {
  const sez = document.getElementById("section-dashboard");
  if (!sez || !sez.classList.contains("active")) return;
  clearTimeout(_dash.timer);
  _dash.timer = setTimeout(loadDashboard, 500);
}

function renderDashboard(d) {
  const box = document.getElementById("dashboardContent");
  if (!box) return;
  box.innerHTML = `
    ${_dashAzioni(d.azioni)}
    ${_dashKpi(d.kpi)}
    <div class="dash-grid">
      ${_dashGrafico(d.andamento)}
      ${_dashTopMarche(d.top_marche)}
    </div>
    ${_dashUltimi(d.ultimi_preventivi)}
    <p class="dash-updated">Aggiornato alle ${new Date(d.generato_il).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</p>`;

  box
    .querySelectorAll("[data-go]")
    .forEach((el) =>
      el.addEventListener("click", () => dashGoTo(el.dataset.go)),
    );
}

// ── Da fare adesso ───────────────────────────────────────────
function _dashAzioni(azioni = []) {
  if (azioni.length === 0) {
    return `<section class="dash-block">
      <h2>Da fare adesso</h2>
      <div class="dash-ok"><strong>Tutto in ordine.</strong> Nessun ricontatto in sospeso, nessun preventivo fermo e nessun dato da sistemare.</div>
    </section>`;
  }
  const voci = azioni
    .map((a) => {
      const resto = a.conteggio - a.esempi.length;
      const chips =
        a.esempi.map((x) => `<li>${_e(x)}</li>`).join("") +
        (resto > 0 ? `<li class="dash-chip-more">+${resto}</li>` : "");
      return `
      <article class="dash-todo dash-sev-${_e(a.gravita)}">
        <div class="dash-todo-count" aria-label="${a.conteggio} elementi">${a.conteggio}</div>
        <div class="dash-todo-main">
          <h3>${_e(a.titolo)}</h3>
          <p>${_e(a.descrizione)}</p>
          <ul class="dash-chips">${chips}</ul>
        </div>
        <button type="button" class="dash-go" data-go="${_e(a.sezione)}">${_e(a.azione)}</button>
      </article>`;
    })
    .join("");
  return `<section class="dash-block">
    <h2>Da fare adesso <span class="dash-badge">${azioni.length}</span></h2>
    <div class="dash-todo-list">${voci}</div>
  </section>`;
}

// ── Numeri chiave ────────────────────────────────────────────
function _dashKpi(k) {
  const tile = (label, valore, sezione, evidenzia = false) => `
    <button type="button" class="dash-kpi${evidenzia ? " is-alert" : ""}" data-go="${sezione}">
      <span class="dash-kpi-value">${valore}</span>
      <span class="dash-kpi-label">${label}</span>
    </button>`;
  return `<section class="dash-block">
    <h2>In numeri</h2>
    <div class="dash-kpis">
      ${tile("Clienti", k.clienti, "clienti")}
      ${tile("Da ricontattare", k.da_ricontattare, "clienti", k.da_ricontattare > 0)}
      ${tile("Preventivi totali", k.preventivi, "ordini")}
      ${tile("Preventivi aperti", k.preventivi_aperti, "ordini")}
      ${tile("Contratti conclusi", `${k.preventivi_conclusi} <small>(${k.tasso_conclusione}%)</small>`, "ordini")}
      ${tile("Preventivi negli ultimi 30 giorni", k.preventivi_30gg, "ordini")}
    </div>
  </section>`;
}

// ── Grafico preventivi creati / conclusi (SVG, nessuna libreria) ──
function _dashGrafico(serie = []) {
  const max = Math.max(0, ...serie.flatMap((s) => [s.creati, s.conclusi]));
  const titolo = `<h2>Preventivi, ultimi 6 mesi</h2>`;
  if (max === 0) {
    return `<section class="dash-block">${titolo}
      <div class="dash-empty">Ancora nessun preventivo negli ultimi 6 mesi.</div></section>`;
  }
  const tetto = Math.max(4, Math.ceil(max / 4) * 4);
  const W = 560,
    H = 230,
    L = 36,
    B = 28,
    T = 10,
    R = 8;
  const area = { w: W - L - R, h: H - T - B };
  const gruppo = area.w / serie.length;
  const barra = Math.min(26, gruppo / 3);
  const y = (v) => T + area.h - (v / tetto) * area.h;

  let svg = "";
  for (let i = 0; i <= 4; i++) {
    const v = (tetto / 4) * i;
    svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="dash-grid-line"/>
            <text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${_num.format(v)}</text>`;
  }
  serie.forEach((s, i) => {
    const cx = L + gruppo * i + gruppo / 2;
    svg += `
      <rect x="${cx - barra - 1}" y="${y(s.creati)}" width="${barra}" height="${T + area.h - y(s.creati)}" rx="3" class="dash-bar-neutral"><title>${_e(s.etichetta)}: creati ${s.creati}</title></rect>
      <rect x="${cx + 1}" y="${y(s.conclusi)}" width="${barra}" height="${T + area.h - y(s.conclusi)}" rx="3" class="dash-bar-in"><title>${_e(s.etichetta)}: conclusi ${s.conclusi}</title></rect>
      <text x="${cx}" y="${H - 8}" text-anchor="middle">${_e(s.etichetta)}</text>`;
  });
  return `<section class="dash-block">${titolo}
    <div class="dash-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="dash-chart" role="img" aria-label="Preventivi creati e conclusi per mese">${svg}</svg>
    </div>
    <p class="dash-legend"><span class="dash-dot dash-dot-neutral"></span>Creati <span class="dash-dot dash-dot-in"></span>Conclusi</p>
  </section>`;
}

// ── Marche più richieste ─────────────────────────────────────
function _dashTopMarche(top = []) {
  const titolo = `<h2>Marche più richieste</h2>`;
  if (top.length === 0) {
    return `<section class="dash-block">${titolo}<div class="dash-empty">Nessun preventivo con una marca.</div></section>`;
  }
  const max = Math.max(...top.map((t) => t.preventivi));
  const righe = top
    .map(
      (t) => `<li>
        <div class="dash-top-row"><span class="dash-top-name" title="${_e(t.nome)}">${_e(t.nome)}</span>
        <span class="dash-top-val">${t.preventivi} ${t.preventivi === 1 ? "preventivo" : "preventivi"}</span></div>
        <div class="dash-top-bar"><span style="width:${Math.max(4, (t.preventivi / max) * 100)}%"></span></div>
      </li>`,
    )
    .join("");
  return `<section class="dash-block">${titolo}<ol class="dash-top">${righe}</ol></section>`;
}

// ── Ultimi preventivi ────────────────────────────────────────
function _dashUltimi(preventivi = []) {
  const titolo = `<h2>Ultimi preventivi
    <button type="button" class="dash-link" data-go="ordini">Vedi tutti</button></h2>`;
  if (preventivi.length === 0) {
    return `<section class="dash-block">${titolo}<div class="dash-empty">Nessun preventivo registrato.
      <button type="button" class="dash-go" data-go="ordini">Crea un preventivo</button></div></section>`;
  }
  const righe = preventivi
    .map((p) => {
      const chiuso = Number(p.contratto_finito) === 1;
      return `<li>
        <span class="badge ${chiuso ? "badge-success" : "badge-warning"}">${chiuso ? "CONCLUSO" : "APERTO"}</span>
        <span class="dash-mov-name">${_e(p.cliente_nome)}${p.modello_nome ? " · " + _e(p.modello_nome) : ""}</span>
        <span class="dash-mov-qty">${_e(p.marca_nome || "")}</span>
        <span class="dash-mov-date">${new Date(p.data_movimento).toLocaleDateString("it-IT")}</span>
      </li>`;
    })
    .join("");
  return `<section class="dash-block">${titolo}<ul class="dash-mov">${righe}</ul></section>`;
}

window.loadDashboard = loadDashboard;
window.refreshDashboardIfActive = refreshDashboardIfActive;
