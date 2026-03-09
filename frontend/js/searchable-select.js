// ==================== SELECT RICERCABILE (AUTOCOMPLETE) ====================
// File: js/searchable-select.js
// Dipende da: config.js, ui.js

// Istanze globali riutilizzate nei vari modal
let clienteSearchOrdine      = null;
let marcaModelloSearchOrdine = null;
let marcaSearchModello       = null;

/**
 * Crea un campo select con ricerca testuale in tempo reale.
 *
 * @param {string}   containerId  - ID del div contenitore
 * @param {string}   inputId      - ID dell'hidden input che riceve il valore
 * @param {string}   placeholder  - Testo segnaposto
 * @param {Function} getData      - async () => Array<{id, nome, extra?, email?, num_tel?}>
 * @param {Function} onSelect     - (id, nome) => void  callback alla selezione
 * @param {boolean}  required     - Abilita validazione obbligatoria
 * @returns {Object} API: { loadData, reset, setValue, getValue, getSelectedName, updateData, filterData }
 */
function createSearchableSelect(containerId, inputId, placeholder, getData, onSelect, required = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} non trovato`);
    return null;
  }

  container.innerHTML = `
    <div class="searchable-select-wrapper" style="position:relative;">
      <div class="searchable-input-wrapper" style="position:relative;">
        <input
          type="text"
          id="${inputId}_search"
          class="searchable-select-input"
          placeholder="${placeholder}"
          autocomplete="off"
          style="width:100%;padding:12px 50px 12px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;transition:all 0.25s ease;background:white;"
        />
        <button
          type="button"
          class="clear-selection-btn"
          style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:#ef4444;color:white;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:none;font-size:14px;font-weight:bold;transition:all 0.2s;"
        >×</button>
      </div>
      <input type="hidden" id="${inputId}" name="${inputId}" />
      <div class="searchable-select-results"
        style="position:absolute;top:100%;left:0;right:0;max-height:300px;overflow-y:auto;background:white;border:2px solid #6366f1;border-top:none;border-radius:0 0 12px 12px;box-shadow:0 8px 20px rgba(0,0,0,0.15);display:none;z-index:1000;margin-top:-2px;">
      </div>
      <div class="selection-display" style="margin-top:8px;display:none;">
        <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);padding:10px 14px;border-radius:8px;border-left:4px solid #10b981;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span style="font-size:11px;color:#065f46;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Selezionato</span>
              <div class="selected-value-display" style="font-size:15px;color:#065f46;font-weight:700;margin-top:2px;"></div>
              <div class="selected-extra-display" style="font-size:12px;color:#047857;font-weight:600;margin-top:3px;"></div>
            </div>
            <span style="font-size:24px;">✓</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const searchInput        = container.querySelector(`#${inputId}_search`);
  const hiddenInput        = container.querySelector(`#${inputId}`);
  const results            = container.querySelector(".searchable-select-results");
  const clearBtn           = container.querySelector(".clear-selection-btn");
  const selectionDisplay   = container.querySelector(".selection-display");
  const selectedValueDisplay = container.querySelector(".selected-value-display");

  let allData      = [];
  let currentData  = [];
  let selectedValue = null;
  let selectedName  = null;

  // ---- Caricamento dati ----
  async function loadData() {
    allData = await getData();
    currentData = allData;
  }

  // ---- Evidenzia il testo cercato ----
  function highlightText(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, '<mark style="background:#fef08a;color:#713f12;padding:2px 4px;border-radius:3px;font-weight:700;">$1</mark>');
  }

  // ---- Renderizza lista risultati ----
  function showResults(filteredData) {
    if (filteredData.length === 0) {
      results.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">Nessun risultato trovato</div>';
      results.style.display = "block";
      return;
    }

    results.innerHTML = filteredData.map((item) => `
      <div class="result-item" data-id="${item.id}" data-nome="${item.nome}"
        style="padding:12px 18px;cursor:pointer;transition:all 0.2s ease;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:600;color:#334155;">${highlightText(item.nome, searchInput.value)}</div>
        ${item.extra ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${highlightText(item.extra, searchInput.value)}</div>` : ""}
      </div>
    `).join("");

    results.style.display = "block";

    results.querySelectorAll(".result-item").forEach((el) => {
      el.addEventListener("mouseenter", () => { el.style.background = "#f8fafc"; el.style.paddingLeft = "22px"; });
      el.addEventListener("mouseleave", () => { el.style.background = "white";   el.style.paddingLeft = "18px"; });
      el.addEventListener("click",      () => selectItem(el.dataset.id, el.dataset.nome));
    });
  }

  // ---- Selezione di un elemento ----
  function selectItem(id, nome) {
    selectedValue = id;
    selectedName  = nome;

    searchInput.value        = "";
    hiddenInput.value        = id;
    results.style.display    = "none";
    searchInput.style.display   = "none";
    selectionDisplay.style.display = "block";
    selectedValueDisplay.textContent = nome;

    const extraDisplay = container.querySelector(".selected-extra-display");
    if (extraDisplay) {
      const item = currentData.find((d) => String(d.id) === String(id));
      extraDisplay.textContent = (item && item.extra) ? item.extra : "";
      extraDisplay.style.display = (item && item.extra) ? "block" : "none";
    }

    clearBtn.style.display = "block";
    if (onSelect) onSelect(id, nome);
  }

  // ---- Reset/Pulisci selezione ----
  function reset() {
    selectedValue = null;
    selectedName  = null;
    searchInput.value  = "";
    hiddenInput.value  = "";
    searchInput.style.display      = "block";
    selectionDisplay.style.display = "none";
    selectedValueDisplay.textContent = "";
    const extraDisplay = container.querySelector(".selected-extra-display");
    if (extraDisplay) extraDisplay.textContent = "";
    clearBtn.style.display    = "none";
    results.style.display     = "none";
    searchInput.setCustomValidity("");
    hiddenInput.setCustomValidity("");
  }

  // ---- Filtra la lista in base al testo ----
  function filterByText(term) {
    if (!term) return currentData;
    const t = term.toLowerCase();
    return currentData.filter((item) =>
      item.nome.toLowerCase().includes(t) ||
      (item.email   && item.email.toLowerCase().includes(t)) ||
      (item.num_tel && item.num_tel.toLowerCase().includes(t)) ||
      (item.extra   && item.extra.toLowerCase().includes(t))
    );
  }

  // ---- Event listeners ----
  clearBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); reset(); searchInput.focus(); });

  searchInput.addEventListener("input", async (e) => {
    if (allData.length === 0) await loadData();
    showResults(filterByText(e.target.value.trim()));
  });

  searchInput.addEventListener("focus", async () => {
    if (allData.length === 0) await loadData();
    showResults(filterByText(searchInput.value.trim()));
    searchInput.style.borderColor = "#6366f1";
    searchInput.style.boxShadow   = "0 0 0 4px rgba(99, 102, 241, 0.1)";
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      results.style.display     = "none";
      searchInput.style.borderColor = "#e2e8f0";
      searchInput.style.boxShadow   = "none";
    }, 200);
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) results.style.display = "none";
  });

  // Validazione obbligatoria
  if (required) {
    const form = container.closest("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        if (!hiddenInput.value) {
          e.preventDefault();
          e.stopImmediatePropagation();
          searchInput.style.borderColor = "#ef4444";
          searchInput.style.boxShadow   = "0 0 0 4px rgba(239, 68, 68, 0.1)";
          searchInput.placeholder = "⚠️ Campo obbligatorio!";
          searchInput.focus();
          setTimeout(() => {
            searchInput.style.borderColor = "#e2e8f0";
            searchInput.style.boxShadow   = "none";
            searchInput.placeholder = placeholder;
          }, 3000);
          return false;
        }
      }, true);
    }
  }

  return {
    loadData,
    reset,
    setValue: async (id) => {
      if (allData.length === 0) await loadData();
      const item = allData.find((d) => String(d.id) === String(id));
      if (item) selectItem(item.id, item.nome);
    },
    getValue:       () => selectedValue,
    getSelectedName:() => selectedName,
    updateData: (newData) => { allData = newData; currentData = newData; },
    filterData: (newData) => { currentData = newData; },
  };
}

// ---- Inizializzatori specifici per i vari modal ----

async function initOrdineSearchableSelects() {
  clienteSearchOrdine = createSearchableSelect(
    "ordineClienteSearch_container",
    "ordineCliente",
    "Cerca cliente...",
    async () => {
      const res = await fetch(`${API_URL}/clienti`);
      const list = await res.json();
      return list.map((c) => ({
        id: c.id, nome: c.nome,
        extra:   [c.num_tel ? `📞 ${c.num_tel}` : "", c.email ? `✉️ ${c.email}` : ""].filter(Boolean).join(" • "),
        num_tel: c.num_tel || "",
        email:   c.email   || "",
      }));
    },
    () => {},
    true,
  );

  marcaModelloSearchOrdine = createSearchableSelect(
    "ordineMarcaModelloSearch_container",
    "ordineModello",
    "Cerca marca o modello...",
    async () => {
      const res = await fetch(`${API_URL}/modelli`);
      const list = await res.json();
      allModelli = list;
      return list.map((m) => ({ id: m.id, nome: m.nome, extra: m.marca_nome || "", marche_id: m.marche_id }));
    },
    (id) => {
      const mod = allModelli.find((m) => String(m.id) === String(id));
      if (mod && mod.marche_id) {
        const marcaHidden = document.getElementById("ordineMarca");
        if (marcaHidden) marcaHidden.value = mod.marche_id;
      }
    },
    true,
  );

  if (clienteSearchOrdine)      await clienteSearchOrdine.loadData();
  if (marcaModelloSearchOrdine) await marcaModelloSearchOrdine.loadData();
}

async function initModelloSearchableSelects() {
  marcaSearchModello = createSearchableSelect(
    "modelloMarcaSearch_container",
    "modelloMarca",
    "Cerca marca...",
    async () => {
      const res = await fetch(`${API_URL}/marche`);
      const list = await res.json();
      return list.map((m) => ({ id: m.id, nome: m.nome }));
    },
    () => {},
    true,
  );

  if (marcaSearchModello) await marcaSearchModello.loadData();
}
