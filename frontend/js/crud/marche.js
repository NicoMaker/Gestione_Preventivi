// ==================== MARCHE ====================
// File: js/marche.js
// Dipende da: config.js, ui.js

async function loadMarche() {
  try {
    const res = await fetch(`${API_URL}/marche`);
    allMarche = await res.json();
    marche    = allMarche;
    restoreMarcheFilter();
  } catch (error) {
    console.error("Errore caricamento marche:", error);
  }
}

function renderMarche() {
  const tbody = document.getElementById("marcheTableBody");

  if (marche.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nessuna marca presente</td></tr>';
    return;
  }

  tbody.innerHTML = marche.map((m) => `
    <tr>
      <td><strong>${m.nome}</strong></td>
      <td class="text-center-badge">
        <span class="prodotti-badge ${m.prodotti_count > 0 ? "has-products" : "empty"}">
          ${m.prodotti_count || 0}
        </span>
      </td>
      <td class="text-center-badge">
        <span class="prodotti-badge ${m.preventivi_count > 0 ? "has-products" : "empty"}">
          ${m.preventivi_count || 0}
        </span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editMarca(${m.id})" title="Modifica marca">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteMarca(${m.id})" title="Elimina marca">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join("");
}

// ---- Filtri ----

function saveMarcheFilter() {
  localStorage.setItem("filter_marche_search", document.getElementById("filterMarche")?.value || "");
}

function restoreMarcheFilter() {
  const savedSearch = localStorage.getItem("filter_marche_search") || "";
  const input = document.getElementById("filterMarche");
  if (input) input.value = savedSearch;
  applyMarcheFilter(savedSearch.toLowerCase());
}

function applyMarcheFilter(searchTerm) {
  marche = allMarche.filter((m) => m.nome.toLowerCase().includes(searchTerm));
  renderMarche();
}

document.getElementById("filterMarche")?.addEventListener("input", (e) => {
  saveMarcheFilter();
  applyMarcheFilter(e.target.value.toLowerCase());
});

// ---- Modal ----

function openMarcaModal(marca = null) {
  const form = document.getElementById("formMarca");
  form.reset();

  if (marca) {
    document.getElementById("modalMarcaTitle").textContent = "Modifica Marca";
    document.getElementById("marcaId").value   = marca.id;
    document.getElementById("marcaNome").value = marca.nome;
  } else {
    document.getElementById("modalMarcaTitle").textContent = "Nuova Marca";
    document.getElementById("marcaId").value   = "";
  }

  document.getElementById("modalMarca").classList.add("active");
}

function closeMarcaModal() {
  document.getElementById("modalMarca").classList.remove("active");
}

function editMarca(id) {
  const marca = marche.find((m) => m.id === id);
  if (marca) openMarcaModal(marca);
}

async function deleteMarca(id) {
  const conferma = await showConfirmModal("Sei sicuro di voler eliminare questa marca?", "Conferma Eliminazione");
  if (!conferma) return;

  try {
    const res  = await fetch(`${API_URL}/marche/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      showNotification("Marca eliminata con successo!", "success");
      loadMarche();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----

document.getElementById("formMarca").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id   = document.getElementById("marcaId").value;
  const nome = document.getElementById("marcaNome").value.trim();

  const method = id ? "PUT" : "POST";
  const url    = id ? `${API_URL}/marche/${id}` : `${API_URL}/marche`;

  try {
    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    const data = await res.json();

    if (res.ok) {
      showNotification(id ? "Marca aggiornata!" : "Marca creata!", "success");
      closeMarcaModal();
      loadMarche();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
});
