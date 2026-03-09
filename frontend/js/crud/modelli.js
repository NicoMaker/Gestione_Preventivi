// ==================== MODELLI ====================
// File: js/modelli.js
// Dipende da: config.js, ui.js, searchable-select.js

async function loadModelli() {
  try {
    const res = await fetch(`${API_URL}/modelli`);
    allModelli = await res.json();
    modelli    = allModelli;
    restoreModelliFilter();
  } catch (error) {
    console.error("Errore caricamento modelli:", error);
  }
}

function renderModelli() {
  const tbody = document.getElementById("modelliTableBody");

  if (modelli.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nessun modello presente</td></tr>';
    return;
  }

  tbody.innerHTML = modelli.map((m) => `
    <tr>
      <td><strong>${m.nome}</strong></td>
      <td>${m.marca_nome || "-"}</td>
      <td class="text-center-badge">
        <span class="prodotti-badge ${m.ordini_count > 0 ? "has-products" : "empty"}">
          ${m.ordini_count || 0}
        </span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editModello(${m.id})" title="Modifica modello">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteModello(${m.id})" title="Elimina modello">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join("");
}

// ---- Filtri ----

function saveModelliFilter() {
  localStorage.setItem("filter_modelli_search", document.getElementById("filterModelli")?.value || "");
}

function restoreModelliFilter() {
  const savedSearch = localStorage.getItem("filter_modelli_search") || "";
  const input = document.getElementById("filterModelli");
  if (input) input.value = savedSearch;
  applyModelliFilter(savedSearch.toLowerCase());
}

function applyModelliFilter(searchTerm) {
  modelli = allModelli.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm) ||
    (m.marca_nome && m.marca_nome.toLowerCase().includes(searchTerm))
  );
  renderModelli();
}

document.getElementById("filterModelli")?.addEventListener("input", (e) => {
  saveModelliFilter();
  applyModelliFilter(e.target.value.toLowerCase());
});

// ---- Modal ----

window.openModelloModal = async function (modello = null) {
  const modal = document.getElementById("modalModello");
  document.getElementById("formModello").reset();

  if (!marcaSearchModello) {
    await initModelloSearchableSelects();
  } else {
    marcaSearchModello.reset();
    await marcaSearchModello.loadData();
  }

  if (modello) {
    document.getElementById("modalModelloTitle").textContent = "Modifica Modello";
    document.getElementById("modelloId").value   = modello.id;
    document.getElementById("modelloNome").value = modello.nome;

    if (modello.marche_id && marcaSearchModello) {
      await marcaSearchModello.loadData();
      marcaSearchModello.setValue(modello.marche_id);
    }
  } else {
    document.getElementById("modalModelloTitle").textContent = "Nuovo Modello";
    document.getElementById("modelloId").value = "";
  }

  modal.classList.add("active");
};

function closeModelloModal() {
  document.getElementById("modalModello").classList.remove("active");
}

function editModello(id) {
  const modello = modelli.find((m) => m.id === id);
  if (modello) openModelloModal(modello);
}

async function deleteModello(id) {
  const conferma = await showConfirmModal("Sei sicuro di voler eliminare questo modello?", "Conferma Eliminazione");
  if (!conferma) return;

  try {
    const res  = await fetch(`${API_URL}/modelli/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      showNotification("Modello eliminato con successo!", "success");
      loadModelli();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----

document.getElementById("formModello").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id       = document.getElementById("modelloId").value;
  const nome     = document.getElementById("modelloNome").value.trim();
  const marche_id= document.getElementById("modelloMarca").value;

  if (!marche_id || marche_id === "" || marche_id === "null") {
    showNotification("Seleziona una marca per il modello", "error");
    return;
  }

  const method = id ? "PUT" : "POST";
  const url    = id ? `${API_URL}/modelli/${id}` : `${API_URL}/modelli`;

  try {
    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, marche_id }),
    });
    const data = await res.json();

    if (res.ok) {
      showNotification(id ? "Modello aggiornato!" : "Modello creato!", "success");
      closeModelloModal();
      loadModelli();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
});
