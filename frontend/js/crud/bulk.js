// ==================== ELIMINAZIONE MULTIPLA ====================
// File: js/crud/bulk.js
// Scopo: selezione con checkbox + "Elimina selezionati" per Clienti,
//        Preventivi, Marche, Modelli e Utenti. Vengono eliminati solo gli
//        elementi eliminabili; gli altri vengono saltati e mostrati con il
//        motivo (es. cliente con preventivi, marca con modelli, ecc.).

const BULK_CONFIG = {
  clienti: {
    endpoint: "clienti",
    singolare: "cliente",
    plurale: "clienti",
    ricarica: ["loadClienti", "loadOrdini"],
  },
  ordini: {
    endpoint: "ordini",
    singolare: "preventivo",
    plurale: "preventivi",
    ricarica: ["loadOrdini", "loadClienti", "loadMarche", "loadModelli"],
  },
  marche: {
    endpoint: "marche",
    singolare: "marca",
    plurale: "marche",
    ricarica: ["loadMarche", "loadModelli"],
  },
  modelli: {
    endpoint: "modelli",
    singolare: "modello",
    plurale: "modelli",
    ricarica: ["loadModelli", "loadMarche"],
  },
  utenti: {
    endpoint: "utenti",
    singolare: "utente",
    plurale: "utenti",
    ricarica: ["loadUtenti"],
  },
};

function bulkChecked(entity) {
  return Array.from(
    document.querySelectorAll(`.bulk-cb[data-entity="${entity}"]:checked`),
  ).map((cb) => parseInt(cb.dataset.id));
}

// Cella checkbox da inserire come prima colonna di ogni riga
function bulkCheckboxCell(entity, id) {
  return `<td class="bulk-col"><input type="checkbox" class="bulk-cb" data-entity="${entity}" data-id="${id}" onchange="bulkUpdateToolbar('${entity}')" title="Seleziona"></td>`;
}

function bulkUpdateToolbar(entity) {
  const toolbar = document.getElementById(`bulkToolbar-${entity}`);
  const countEl = document.getElementById(`bulkCount-${entity}`);
  const selAll = document.getElementById(`bulkAll-${entity}`);
  const all = document.querySelectorAll(`.bulk-cb[data-entity="${entity}"]`);
  const n = bulkChecked(entity).length;
  if (toolbar) toolbar.style.display = n > 0 ? "flex" : "none";
  if (countEl)
    countEl.textContent = n + (n === 1 ? " selezionato" : " selezionati");
  if (selAll) {
    selAll.checked = n > 0 && n === all.length;
    selAll.indeterminate = n > 0 && n < all.length;
  }
}

function bulkToggleAll(entity, source) {
  document
    .querySelectorAll(`.bulk-cb[data-entity="${entity}"]`)
    .forEach((cb) => (cb.checked = source.checked));
  bulkUpdateToolbar(entity);
}

function bulkClear(entity) {
  document
    .querySelectorAll(`.bulk-cb[data-entity="${entity}"]`)
    .forEach((cb) => (cb.checked = false));
  bulkUpdateToolbar(entity);
}

async function bulkDelete(entity) {
  const cfg = BULK_CONFIG[entity];
  const ids = bulkChecked(entity);
  if (ids.length === 0) return;

  const plurale = ids.length === 1 ? cfg.singolare : cfg.plurale;
  const confermato = await showConfirmModal(
    `Stai per eliminare <strong>${ids.length}</strong> ${plurale}.<br><br>` +
      `Verranno eliminati solo quelli eliminabili: gli altri verranno saltati.<br>Confermi?`,
    `Elimina ${cfg.plurale}`,
  );
  if (!confermato) return;

  try {
    const body = { ids };
    if (entity === "utenti")
      body.current_user = localStorage.getItem("nomeUtente") || "";

    const res = await fetch(`${API_URL}/${cfg.endpoint}/elimina-multiple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore eliminazione multipla");

    if (typeof ignoreNextSocketUpdate === "function") ignoreNextSocketUpdate();

    const ok = data.eliminati.length;
    const ko = data.saltati.length;
    const righe = [];
    if (ok > 0)
      righe.push(`✅ Eliminati ${ok} ${ok === 1 ? cfg.singolare : cfg.plurale}.`);
    if (ko > 0) {
      righe.push(`⚠️ ${ko} non eliminabil${ko === 1 ? "e" : "i"}:`);
      data.saltati.forEach((s) => righe.push(`• ${s.nome} — ${s.motivo}`));
    }
    showAlertModal(
      righe.join("\n"),
      "Eliminazione multipla",
      ok > 0 ? (ko > 0 ? "warning" : "success") : "error",
    );

    bulkClear(entity);
    for (const fn of cfg.ricarica) {
      if (typeof window[fn] === "function") await window[fn]();
    }
  } catch (error) {
    showNotification(error.message || "Errore di connessione", "error");
  }
}

// Da chiamare a fine render: la selezione si azzera, riallinea la toolbar
function bulkAfterRender(entity) {
  bulkUpdateToolbar(entity);
}

window.bulkCheckboxCell = bulkCheckboxCell;
window.bulkUpdateToolbar = bulkUpdateToolbar;
window.bulkToggleAll = bulkToggleAll;
window.bulkClear = bulkClear;
window.bulkDelete = bulkDelete;
window.bulkAfterRender = bulkAfterRender;
