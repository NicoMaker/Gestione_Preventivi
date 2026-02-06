// CONFIGURAZIONE
const API_URL = "/api";

let clienti = [];
let ordini = [];
let marche = [];
let modelli = [];
let utenti = [];
let allClienti = [];
let allOrdini = [];
let allMarche = [];
let allModelli = [];

// INIZIALIZZAZIONE
document.addEventListener("DOMContentLoaded", () => {
  const nomeUtente = localStorage.getItem("nomeUtente");
  if (!nomeUtente) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("currentUser").textContent = nomeUtente;

  const savedSection = localStorage.getItem("activeSection") || "clienti";
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.getElementById("sidebar");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      mobileMenuToggle.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (
          !sidebar.contains(e.target) &&
          !mobileMenuToggle.contains(e.target)
        ) {
          sidebar.classList.remove("mobile-open");
          mobileMenuToggle.classList.remove("active");
        }
      }
    });
  }

  // Setup navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;

      document
        .querySelectorAll(".nav-item")
        .forEach((i) => i.classList.remove("active"));
      document
        .querySelectorAll(".content-section")
        .forEach((s) => s.classList.remove("active"));

      item.classList.add("active");
      document.getElementById(`section-${section}`).classList.add("active");

      localStorage.setItem("activeSection", section);

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("mobile-open");
        mobileMenuToggle.classList.remove("active");
      }

      // Carica dati sezione
      if (section === "clienti") loadClienti();
      if (section === "ordini") loadOrdini();
      if (section === "marche") loadMarche();
      if (section === "modelli") loadModelli();
      if (section === "utenti") loadUtenti();
    });
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    if (item.dataset.section === savedSection) {
      item.click();
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("nomeUtente");
    localStorage.removeItem("utenteId");
    localStorage.removeItem("activeSection");
    window.location.href = "index.html";
  });

  // Sincronizzazione Marca / Modello negli ordini
  const ordineMarcaSelect = document.getElementById("ordineMarca");
  const ordineModelloSelect = document.getElementById("ordineModello");

  if (ordineMarcaSelect && ordineModelloSelect) {
    ordineMarcaSelect.addEventListener("change", () => {
      const marcaId = ordineMarcaSelect.value;
      populateOrdineModelliByMarca(marcaId);
      ordineModelloSelect.value = "";
    });

    ordineModelloSelect.addEventListener("change", () => {
      const modelloId = ordineModelloSelect.value;
      if (!modelloId) return;
      const modello = allModelli.find(
        (m) => String(m.id) === String(modelloId),
      );
      if (modello && modello.marche_id) {
        ordineMarcaSelect.value = String(modello.marche_id);
      }
    });
  }

  // 🔥 TOGGLE PASSWORD UTENTI
  const togglePassword = document.getElementById("toggleUtentePassword");
  const passwordInput = document.getElementById("utentePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.08 2.58" />
          <line x1="1" y1="1" x2="23" y2="23" />
        `;
        togglePassword.style.color = "#6366f1";
      } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        `;
        togglePassword.style.color = "#64748b";
      }
    });
  }
});

// ==================== CLIENTI ====================
async function loadClienti() {
  try {
    const res = await fetch(`${API_URL}/clienti`);
    allClienti = await res.json();
    clienti = allClienti;
    renderClienti();
  } catch (error) {
    console.error("Errore caricamento clienti:", error);
    showNotification("Errore caricamento clienti", "error");
  }
}

function renderClienti() {
  const tbody = document.getElementById("clientiTableBody");

  if (clienti.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">Nessun cliente presente</td></tr>';
    return;
  }

  tbody.innerHTML = clienti
    .map(
      (c) => `
    <tr>
      <td><strong>${c.nome}</strong></td>
      <td>
        ${
          c.num_tel
            ? `
          <div class="contact-buttons">
            <a href="tel:${c.num_tel}" class="btn-contact btn-phone" title="Chiama">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              ${c.num_tel}
            </a>
            <a href="https://wa.me/${c.num_tel.replace(/[^0-9]/g, "")}" class="btn-contact btn-whatsapp" target="_blank" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        `
            : "-"
        }
      </td>
      <td>
        ${
          c.email
            ? `<a href="mailto:${c.email}" class="btn-contact btn-email" title="Invia Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            ${c.email}
          </a>`
            : "-"
        }
      </td>
      <td>${c.data_passaggio ? formatDate(c.data_passaggio) : "-"}</td>
      <td style="text-align:center;">
        ${c.flag_ricontatto ? '<span class="badge-ricontatto" style="font-size:22px;" title="Ricontatto Social">📱</span>' : "-"}
      </td>
      <td style="text-align: center">
        <span class="badge-count">${c.ordini_count || 0}</span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editCliente(${c.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteCliente(${c.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

// Filtro testo clienti
document.getElementById("filterClienti")?.addEventListener("input", (e) => {
  applyClientiFilters();
});

// 🆕 FILTRO DATA PASSAGGIO
document
  .getElementById("filterDataPassaggio")
  ?.addEventListener("change", (e) => {
    applyClientiFilters();
  });

// Funzione per applicare tutti i filtri clienti
function applyClientiFilters() {
  const searchTerm =
    document.getElementById("filterClienti")?.value.toLowerCase() || "";
  const dataPassaggio =
    document.getElementById("filterDataPassaggio")?.value || "";

  clienti = allClienti.filter((c) => {
    // Filtro testo
    const matchesText =
      !searchTerm ||
      c.nome.toLowerCase().includes(searchTerm) ||
      (c.num_tel && c.num_tel.toLowerCase().includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.data_passaggio && c.data_passaggio.includes(searchTerm));

    // Filtro data passaggio
    const matchesData =
      !dataPassaggio ||
      (c.data_passaggio && c.data_passaggio.startsWith(dataPassaggio));

    return matchesText && matchesData;
  });

  renderClienti();
}

function openClienteModal(cliente = null) {
  const modal = document.getElementById("modalCliente");
  const title = document.getElementById("modalClienteTitle");
  const form = document.getElementById("formCliente");

  form.reset();

  if (cliente) {
    title.textContent = "Modifica Cliente";
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("clienteNome").value = cliente.nome;
    document.getElementById("clienteTel").value = cliente.num_tel || "";
    document.getElementById("clienteEmail").value = cliente.email || "";
    document.getElementById("clienteDataPassaggio").value =
      cliente.data_passaggio || "";
    document.getElementById("clienteFlagRicontatto").checked =
      cliente.flag_ricontatto == 1;
  } else {
    title.textContent = "Nuovo Cliente";
    document.getElementById("clienteId").value = "";
    document.getElementById("clienteDataPassaggio").value = "";
    document.getElementById("clienteFlagRicontatto").checked = false;
  }

  modal.classList.add("active");
}

function closeClienteModal() {
  document.getElementById("modalCliente").classList.remove("active");
}

function editCliente(id) {
  const cliente = clienti.find((c) => c.id === id);
  if (cliente) openClienteModal(cliente);
}

async function deleteCliente(id) {
  const conferma = await showConfirmModal(
    "Sei sicuro di voler eliminare questo cliente?",
    "Conferma Eliminazione",
  );

  if (!conferma) return;

  try {
    const res = await fetch(`${API_URL}/clienti/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      showNotification("Cliente eliminato con successo!", "success");
      loadClienti();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
}

document.getElementById("formCliente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("clienteId").value;
  const nome = document.getElementById("clienteNome").value.trim();
  const num_tel = document.getElementById("clienteTel").value.trim();
  const email = document.getElementById("clienteEmail").value.trim();
  const data_passaggio = document.getElementById("clienteDataPassaggio").value;
  const flag_ricontatto = document.getElementById(
    "clienteFlagRicontatto",
  ).checked;

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/clienti/${id}` : `${API_URL}/clienti`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        num_tel,
        email,
        data_passaggio,
        flag_ricontatto,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(
        id ? "Cliente aggiornato!" : "Cliente creato!",
        "success",
      );
      closeClienteModal();
      loadClienti();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
});

// ==================== PREVENTIVI (EX ORDINI) ====================
async function loadOrdini() {
  try {
    const res = await fetch(`${API_URL}/ordini`);
    allOrdini = await res.json();
    ordini = allOrdini;
    renderOrdini();
  } catch (error) {
    console.error("Errore caricamento preventivi:", error);
    showNotification("Errore caricamento preventivi", "error");
  }
}

function renderOrdini() {
  const tbody = document.getElementById("ordiniTableBody");

  if (ordini.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center">Nessun preventivo presente</td></tr>';
    return;
  }

  tbody.innerHTML = ordini
    .map(
      (o) => `
    <tr>
      <td>${formatDate(o.data_movimento)}</td>
      <td><strong>${o.cliente_nome}</strong></td>
      <td>${o.marca_nome || "-"}</td>
      <td>${o.modello_nome || "-"}</td>
      <td>${o.note || "-"}</td>
      <td class="text-right">
        <button class="btn-icon" onclick="editOrdine(${o.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteOrdine(${o.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

document.getElementById("filterOrdini")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  ordini = allOrdini.filter(
    (o) =>
      o.cliente_nome.toLowerCase().includes(searchTerm) ||
      (o.marca_nome && o.marca_nome.toLowerCase().includes(searchTerm)) ||
      (o.modello_nome && o.modello_nome.toLowerCase().includes(searchTerm)),
  );
  renderOrdini();
});

async function openOrdineModal(ordine = null) {
  const modal = document.getElementById("modalOrdine");
  const title = document.getElementById("modalOrdineTitle");
  const form = document.getElementById("formOrdine");

  await Promise.all([
    loadClientiForSelect(),
    loadMarcheForSelect(),
    loadModelliForSelect(),
  ]);

  form.reset();

  if (ordine) {
    title.textContent = "Modifica Preventivo";
    document.getElementById("ordineId").value = ordine.id;

    // Imposta cliente
    document.getElementById("ordineCliente").value = ordine.cliente_id;
    const cliente = allClienti.find((c) => c.id === ordine.cliente_id);
    if (cliente) {
      document.getElementById("ordineClienteSearch").value = cliente.nome;
    }

    document.getElementById("ordineData").value = formatDateForInput(
      ordine.data_movimento,
    );
    document.getElementById("ordineMarca").value = ordine.marca_id || "";

    // Imposta modello
    document.getElementById("ordineModello").value = ordine.modello_id || "";
    const modello = allModelli.find((m) => m.id === ordine.modello_id);
    if (modello) {
      document.getElementById("ordineModelloSearch").value = modello.nome;
    }

    document.getElementById("ordineNote").value = ordine.note || "";
  } else {
    title.textContent = "Nuovo Preventivo";
    document.getElementById("ordineId").value = "";
    document.getElementById("ordineData").value = formatDateForInput(
      new Date().toISOString(),
    );
    document.getElementById("ordineClienteSearch").value = "";
    document.getElementById("ordineModelloSearch").value = "";
  }

  modal.classList.add("active");

  // Setup autocomplete Cliente
  setupClienteAutocomplete();

  // Setup autocomplete Modello
  setupModelloAutocomplete();
}

function closeOrdineModal() {
  document.getElementById("modalOrdine").classList.remove("active");
}

async function loadClientiForSelect() {
  try {
    const res = await fetch(`${API_URL}/clienti`);
    allClienti = await res.json();
  } catch (error) {
    console.error("Errore caricamento clienti:", error);
  }
}

// 🔥 AUTOCOMPLETE CLIENTE
function setupClienteAutocomplete() {
  const searchInput = document.getElementById("ordineClienteSearch");
  const hiddenInput = document.getElementById("ordineCliente");
  const resultsDiv = document.getElementById("clienteSearchResults");

  if (!searchInput || !resultsDiv) return;

  // Rimuovi listener precedenti
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);

  newSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === "") {
      // Mostra tutti i clienti
      displayClienteResults(
        allClienti,
        resultsDiv,
        hiddenInput,
        newSearchInput,
      );
    } else {
      // Filtra clienti
      const filtered = allClienti.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchTerm) ||
          (c.email && c.email.toLowerCase().includes(searchTerm)) ||
          (c.num_tel && c.num_tel.includes(searchTerm)),
      );
      displayClienteResults(filtered, resultsDiv, hiddenInput, newSearchInput);
    }
  });

  newSearchInput.addEventListener("focus", () => {
    displayClienteResults(allClienti, resultsDiv, hiddenInput, newSearchInput);
  });

  // Chiudi risultati se clicco fuori
  document.addEventListener("click", (e) => {
    if (!newSearchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.classList.remove("show");
    }
  });
}

function displayClienteResults(clienti, resultsDiv, hiddenInput, searchInput) {
  if (clienti.length === 0) {
    resultsDiv.innerHTML = `
      <div class="search-no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <strong>Nessun cliente trovato</strong>
      </div>
    `;
    resultsDiv.classList.add("show");
    return;
  }

  resultsDiv.innerHTML = clienti
    .map(
      (c) => `
    <div class="search-result-item" data-id="${c.id}" data-nome="${c.nome}">
      <div class="search-result-name">${highlightMatch(c.nome, searchInput.value)}</div>
      <div class="search-result-meta">
        ${c.num_tel ? `📞 ${c.num_tel}` : ""}
        ${c.email ? `📧 ${c.email}` : ""}
      </div>
    </div>
  `,
    )
    .join("");

  resultsDiv.classList.add("show");

  // Click su risultato
  resultsDiv.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      const nome = item.dataset.nome;
      hiddenInput.value = id;
      searchInput.value = nome;
      searchInput.classList.add("has-selection");
      resultsDiv.classList.remove("show");
    });
  });
}

// 🔥 AUTOCOMPLETE MODELLO
function setupModelloAutocomplete() {
  const searchInput = document.getElementById("ordineModelloSearch");
  const hiddenInput = document.getElementById("ordineModello");
  const resultsDiv = document.getElementById("modelloSearchResults");
  const marcaSelect = document.getElementById("ordineMarca");

  if (!searchInput || !resultsDiv) return;

  // Rimuovi listener precedenti
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);

  newSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const marcaId = marcaSelect.value;

    let modelliToShow = allModelli;

    // Filtra per marca se selezionata
    if (marcaId) {
      modelliToShow = modelliToShow.filter(
        (m) => m.marche_id && String(m.marche_id) === String(marcaId),
      );
    }

    // Filtra per testo
    if (searchTerm !== "") {
      modelliToShow = modelliToShow.filter(
        (m) =>
          m.nome.toLowerCase().includes(searchTerm) ||
          (m.marca_nome && m.marca_nome.toLowerCase().includes(searchTerm)),
      );
    }

    displayModelloResults(
      modelliToShow,
      resultsDiv,
      hiddenInput,
      newSearchInput,
      marcaSelect,
    );
  });

  newSearchInput.addEventListener("focus", () => {
    const marcaId = marcaSelect.value;
    let modelliToShow = marcaId
      ? allModelli.filter(
          (m) => m.marche_id && String(m.marche_id) === String(marcaId),
        )
      : allModelli;
    displayModelloResults(
      modelliToShow,
      resultsDiv,
      hiddenInput,
      newSearchInput,
      marcaSelect,
    );
  });

  // Quando cambia marca, aggiorna lista modelli
  if (marcaSelect) {
    marcaSelect.addEventListener("change", () => {
      newSearchInput.value = "";
      hiddenInput.value = "";
      newSearchInput.classList.remove("has-selection");
      const marcaId = marcaSelect.value;
      const modelliToShow = marcaId
        ? allModelli.filter(
            (m) => m.marche_id && String(m.marche_id) === String(marcaId),
          )
        : allModelli;
      displayModelloResults(
        modelliToShow,
        resultsDiv,
        hiddenInput,
        newSearchInput,
        marcaSelect,
      );
    });
  }

  // Chiudi risultati se clicco fuori
  document.addEventListener("click", (e) => {
    if (!newSearchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.classList.remove("show");
    }
  });
}

function displayModelloResults(
  modelli,
  resultsDiv,
  hiddenInput,
  searchInput,
  marcaSelect,
) {
  if (modelli.length === 0) {
    resultsDiv.innerHTML = `
      <div class="search-no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <strong>Nessun modello trovato</strong>
      </div>
    `;
    resultsDiv.classList.add("show");
    return;
  }

  resultsDiv.innerHTML = modelli
    .map(
      (m) => `
    <div class="search-result-item" data-id="${m.id}" data-nome="${m.nome}" data-marca-id="${m.marche_id || ""}">
      <div class="search-result-name">${highlightMatch(m.nome, searchInput.value)}</div>
      <div class="search-result-meta">
        ${m.marca_nome ? `<span class="search-result-marca">${m.marca_nome}</span>` : ""}
      </div>
    </div>
  `,
    )
    .join("");

  resultsDiv.classList.add("show");

  // Click su risultato
  resultsDiv.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      const nome = item.dataset.nome;
      const marcaId = item.dataset.marcaId;

      hiddenInput.value = id;
      searchInput.value = nome;
      searchInput.classList.add("has-selection");

      // Imposta anche la marca se presente
      if (marcaId && marcaSelect) {
        marcaSelect.value = marcaId;
      }

      resultsDiv.classList.remove("show");
    });
  });
}

// Funzione per evidenziare il testo cercato
function highlightMatch(text, search) {
  if (!search || search.trim() === "") return text;
  const regex = new RegExp(`(${escapeRegex(search)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadMarcheForSelect() {
  try {
    const res = await fetch(`${API_URL}/marche`);
    const marche = await res.json();
    const selects = [
      document.getElementById("ordineMarca"),
      document.getElementById("modelloMarca"),
    ];
    selects.forEach((select) => {
      if (select) {
        select.innerHTML =
          '<option value="">Seleziona marca</option>' +
          marche
            .map((m) => `<option value="${m.id}">${m.nome}</option>`)
            .join("");
      }
    });
  } catch (error) {
    console.error("Errore caricamento marche:", error);
  }
}

async function loadModelliForSelect() {
  try {
    const res = await fetch(`${API_URL}/modelli`);
    allModelli = await res.json();
    const currentMarcaId = document.getElementById("ordineMarca")?.value || "";
    populateOrdineModelliByMarca(currentMarcaId);
  } catch (error) {
    console.error("Errore caricamento modelli:", error);
  }
}

function populateOrdineModelliByMarca(marcaId) {
  const select = document.getElementById("ordineModello");
  if (!select) return;

  const source = Array.isArray(allModelli) ? allModelli : [];
  const filtered =
    marcaId && marcaId !== ""
      ? source.filter(
          (m) => m.marche_id && String(m.marche_id) === String(marcaId),
        )
      : source;

  select.innerHTML =
    '<option value="">Seleziona modello</option>' +
    filtered
      .map(
        (m) =>
          `<option value="${m.id}">${m.nome}${
            m.marca_nome ? ` (${m.marca_nome})` : ""
          }</option>`,
      )
      .join("");
}

function editOrdine(id) {
  const ordine = ordini.find((o) => o.id === id);
  if (ordine) openOrdineModal(ordine);
}

async function deleteOrdine(id) {
  const conferma = await showConfirmModal(
    "Sei sicuro di voler eliminare questo preventivo?",
    "Conferma Eliminazione",
  );

  if (!conferma) return;

  try {
    const res = await fetch(`${API_URL}/ordini/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      showNotification("Preventivo eliminato con successo!", "success");
      loadOrdini();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
}

document.getElementById("formOrdine").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("ordineId").value;
  const cliente_id = document.getElementById("ordineCliente").value; // Hidden input
  const data_movimento = document.getElementById("ordineData").value;
  const marca_id = document.getElementById("ordineMarca").value || null;
  const modello_id = document.getElementById("ordineModello").value || null; // Hidden input
  const note = document.getElementById("ordineNote").value.trim();

  // Validazione cliente
  if (!cliente_id) {
    showNotification("Seleziona un cliente dalla lista", "warning");
    return;
  }

  if (modello_id) {
    const modello = allModelli.find((m) => String(m.id) === String(modello_id));
    if (!modello) {
      showNotification("Modello selezionato non valido.", "error");
      return;
    }
    if (marca_id && modello.marche_id) {
      if (String(modello.marche_id) !== String(marca_id)) {
        showNotification(
          "Il modello selezionato non appartiene alla marca indicata.",
          "error",
        );
        return;
      }
    }
  }

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/ordini/${id}` : `${API_URL}/ordini`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id,
        data_movimento: data_movimento
          ? new Date(data_movimento).toISOString()
          : new Date().toISOString(),
        marca_id,
        modello_id,
        note,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(
        id ? "Preventivo aggiornato!" : "Preventivo creato!",
        "success",
      );
      closeOrdineModal();
      loadOrdini();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
});

// ==================== MARCHE ====================
async function loadMarche() {
  try {
    const res = await fetch(`${API_URL}/marche`);
    allMarche = await res.json();
    marche = allMarche;
    renderMarche();
  } catch (error) {
    console.error("Errore caricamento marche:", error);
  }
}

function renderMarche() {
  const tbody = document.getElementById("marcheTableBody");

  if (marche.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center">Nessuna marca presente</td></tr>';
    return;
  }

  tbody.innerHTML = marche
    .map(
      (m) => `
    <tr>
      <td><strong>${m.nome}</strong></td>
      <td class="text-center-badge">
        <span class="prodotti-badge ${
          m.prodotti_count > 0 ? "has-products" : "empty"
        }">
          ${m.prodotti_count || 0}
        </span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editMarca(${m.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteMarca(${m.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

document.getElementById("filterMarche")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  marche = allMarche.filter((m) => m.nome.toLowerCase().includes(searchTerm));
  renderMarche();
});

function openMarcaModal(marca = null) {
  const modal = document.getElementById("modalMarca");
  const title = document.getElementById("modalMarcaTitle");
  const form = document.getElementById("formMarca");

  form.reset();

  if (marca) {
    title.textContent = "Modifica Marca";
    document.getElementById("marcaId").value = marca.id;
    document.getElementById("marcaNome").value = marca.nome;
  } else {
    title.textContent = "Nuova Marca";
    document.getElementById("marcaId").value = "";
  }

  modal.classList.add("active");
}

function closeMarcaModal() {
  document.getElementById("modalMarca").classList.remove("active");
}

function editMarca(id) {
  const marca = marche.find((m) => m.id === id);
  if (marca) openMarcaModal(marca);
}

async function deleteMarca(id) {
  const conferma = await showConfirmModal(
    "Sei sicuro di voler eliminare questa marca?",
    "Conferma Eliminazione",
  );

  if (!conferma) return;

  try {
    const res = await fetch(`${API_URL}/marche/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      showNotification("Marca eliminata con successo!", "success");
      loadMarche();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
}

document.getElementById("formMarca").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("marcaId").value;
  const nome = document.getElementById("marcaNome").value.trim();

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/marche/${id}` : `${API_URL}/marche`;

  try {
    const res = await fetch(url, {
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
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
});

// ==================== MODELLI ====================
async function loadModelli() {
  try {
    const res = await fetch(`${API_URL}/modelli`);
    allModelli = await res.json();
    modelli = allModelli;
    renderModelli();
  } catch (error) {
    console.error("Errore caricamento modelli:", error);
  }
}

function renderModelli() {
  const tbody = document.getElementById("modelliTableBody");

  if (modelli.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">Nessun modello presente</td></tr>';
    return;
  }

  tbody.innerHTML = modelli
    .map(
      (m) => `
    <tr>
      <td><strong>${m.nome}</strong></td>
      <td>${m.marca_nome || "-"}</td>
      <td class="text-center-badge">
        <span class="prodotti-badge ${
          m.ordini_count > 0 ? "has-products" : "empty"
        }">
          ${m.ordini_count || 0}
        </span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editModello(${m.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteModello(${m.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

document.getElementById("filterModelli")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  modelli = allModelli.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm) ||
      (m.marca_nome && m.marca_nome.toLowerCase().includes(searchTerm)),
  );
  renderModelli();
});

async function openModelloModal(modello = null) {
  const modal = document.getElementById("modalModello");
  const title = document.getElementById("modalModelloTitle");
  const form = document.getElementById("formModello");

  // Inizializza il campo di ricerca searchable per la marca
  await initModelloSearchableSelect();

  form.reset();

  if (modello) {
    title.textContent = "Modifica Modello";
    document.getElementById("modelloId").value = modello.id;
    document.getElementById("modelloNome").value = modello.nome;
    
    // Imposta la marca selezionata nel campo searchable
    if (modello.marche_id && marcaSearchModello) {
      marcaSearchModello.setValue(modello.marche_id);
    }
  } else {
    title.textContent = "Nuovo Modello";
    document.getElementById("modelloId").value = "";
  }

  modal.classList.add("active");
}

function closeModelloModal() {
  document.getElementById("modalModello").classList.remove("active");
}

function editModello(id) {
  const modello = modelli.find((m) => m.id === id);
  if (modello) openModelloModal(modello);
}

async function deleteModello(id) {
  const conferma = await showConfirmModal(
    "Sei sicuro di voler eliminare questo modello?",
    "Conferma Eliminazione",
  );

  if (!conferma) return;

  try {
    const res = await fetch(`${API_URL}/modelli/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok) {
      showNotification("Modello eliminato con successo!", "success");
      loadModelli();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
}

document.getElementById("formModello").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("modelloId").value;
  const nome = document.getElementById("modelloNome").value.trim();
  const marche_id = document.getElementById("modelloMarca").value || null;

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/modelli/${id}` : `${API_URL}/modelli`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, marche_id }),
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(
        id ? "Modello aggiornato!" : "Modello creato!",
        "success",
      );
      closeModelloModal();
      loadModelli();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
});

// ==================== UTENTI ====================
async function loadUtenti() {
  try {
    const res = await fetch(`${API_URL}/utenti`);
    utenti = await res.json();
    renderUtenti();
  } catch (error) {
    console.error("Errore caricamento utenti:", error);
  }
}

function renderUtenti() {
  const tbody = document.getElementById("utentiTableBody");

  if (utenti.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="2" class="text-center">Nessun utente presente</td></tr>';
    return;
  }

  tbody.innerHTML = utenti
    .map(
      (u) => `
    <tr>
      <td><strong>${u.nome}</strong></td>
      <td class="text-right">
        <button class="btn-icon" onclick="editUtente(${u.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteUtente(${u.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function openUtenteModal(utente = null) {
  const modal = document.getElementById("modalUtente");
  const title = document.getElementById("modalUtenteTitle");
  const form = document.getElementById("formUtente");
  const passwordInput = document.getElementById("utentePassword");

  form.reset();

  if (utente) {
    title.textContent = "Modifica Utente";
    document.getElementById("utenteId").value = utente.id;
    document.getElementById("utenteNome").value = utente.nome;
    passwordInput.removeAttribute("required");
  } else {
    title.textContent = "Nuovo Utente";
    document.getElementById("utenteId").value = "";
    passwordInput.setAttribute("required", "");
  }

  modal.classList.add("active");
}

function closeUtenteModal() {
  document.getElementById("modalUtente").classList.remove("active");
}

function editUtente(id) {
  const utente = utenti.find((u) => u.id === id);
  if (utente) openUtenteModal(utente);
}

async function deleteUtente(id) {
  const conferma = await showConfirmModal(
    "Sei sicuro di voler eliminare questo utente?",
    "Conferma Eliminazione",
  );

  if (!conferma) return;

  try {
    const res = await fetch(`${API_URL}/utenti/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      showNotification("Utente eliminato con successo!", "success");
      loadUtenti();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
}

document.getElementById("formUtente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("utenteId").value;
  const nome = document.getElementById("utenteNome").value.trim();
  const password = document.getElementById("utentePassword").value;

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/utenti/${id}` : `${API_URL}/utenti`;

  const body = { nome };
  if (password) body.password = password;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      showNotification(id ? "Utente aggiornato!" : "Utente creato!", "success");
      closeUtenteModal();
      loadUtenti();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
  }
});

// ==================== UTILITY ====================
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notificationContainer");
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
}

function showConfirmModal(message, title = "Conferma") {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.style.zIndex = "10000";
    
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 450px;">
        <div class="modal-header">
          <h2>${title}</h2>
        </div>
        <div class="modal-body">
          <p style="font-size: 16px; line-height: 1.6; color: #334155;">${message}</p>
        </div>
        <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn-cancel" style="padding: 10px 24px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Annulla
          </button>
          <button type="button" class="btn-confirm" style="padding: 10px 24px; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Conferma
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const btnCancel = modal.querySelector(".btn-cancel");
    const btnConfirm = modal.querySelector(".btn-confirm");
    
    btnCancel.addEventListener("click", () => {
      modal.remove();
      resolve(false);
    });
    
    btnConfirm.addEventListener("click", () => {
      modal.remove();
      resolve(true);
    });
    
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}

// ==================== STAMPA PREVENTIVI PER CLIENTE ====================
let companyInfoPrintCache = null;

async function loadCompanyInfoForPrint() {
  try {
    if (companyInfoPrintCache) return companyInfoPrintCache;
    if (typeof companyInfo !== "undefined" && companyInfo) {
      companyInfoPrintCache = companyInfo;
      return companyInfoPrintCache;
    }
    const response = await fetch("company-info.json");
    if (!response.ok) throw new Error(`Errore caricamento: ${response.status}`);
    companyInfoPrintCache = await response.json();
    return companyInfoPrintCache;
  } catch (error) {
    console.error("Errore caricamento company-info.json:", error);
    companyInfoPrintCache = {
      company: {
        name: "Magazzino Moto",
        address: "Via prova 123",
        city: "Milano",
        cap: "20100",
        province: "MI",
        country: "Italia",
        piva: "1234567890",
        phone: "+39 02 1234567",
        email: "info@magazzinomoto.it",
        logo: "img/Logo.png",
      },
      settings: { currency: "EUR", currencySymbol: "€" },
    };
    return companyInfoPrintCache;
  }
}

function groupOrdiniByCliente(ordini) {
  return ordini.reduce((groups, ordine) => {
    const clienteId = ordine.cliente_id;
    if (!groups[clienteId]) groups[clienteId] = [];
    groups[clienteId].push(ordine);
    return groups;
  }, {});
}

function sortOrdiniByDateDesc(ordini) {
  return [...ordini].sort(
    (a, b) => new Date(b.data_movimento) - new Date(a.data_movimento),
  );
}

function generatePrintHeader(company) {
  const logoPath = company.logo || "img/Logo.png";
  return `
    <div class="print-header" style="text-align:center;margin-bottom:30px;border-bottom:3px solid #333;padding-bottom:25px;">
      <img src="${logoPath}" alt="Logo Azienda" style="max-width:200px;height:auto;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
      <h1 style="margin:10px 0 5px 0;font-size:26px;font-weight:bold;color:#2c3e50;">${company.name || "MAGAZZINO"}</h1>
      <p style="margin:3px 0;font-size:13px;color:#555;">${company.address || ""}, ${company.cap || ""} ${company.city || ""} (${company.province || ""})</p>
      <p style="margin:3px 0;font-size:12px;color:#555;">${company.country || "Italia"}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>P.IVA:</strong> ${company.piva || ""}</p>
        <p style="margin:3px 0;font-size:11px;color:#666;"><strong>Tel:</strong> ${company.phone || ""} | <strong>Email:</strong> ${company.email || ""}</p>
      </div>
    </div>
  `;
}

function generateClienteSection(cliente, ordiniCliente) {
  const ordiniOrdinati = sortOrdiniByDateDesc(ordiniCliente);
  return `
    <div class="cliente-section" style="margin-bottom:30px;page-break-inside:avoid;">
      <div style="background:#f5f5f5;padding:15px;border-radius:6px;margin-bottom:15px;border-left:5px solid #2980b9;">
        <h2 style="margin:0 0 8px 0;font-size:17px;color:#2980b9;font-weight:bold;">${cliente.nome || "N/A"}</h2>
        <p style="margin:4px 0;font-size:12px;color:#555;">
          <strong>📱 Cellulare:</strong> ${cliente.num_tel || "-"}
        </p>
        <p style="margin:4px 0;font-size:12px;color:#555;">
          <strong>✉️ Email:</strong> ${cliente.email || "-"}
        </p>
        <p style="margin:8px 0 0 0;font-size:11px;color:#777;font-style:italic;">
          Totale preventivi: <strong>${ordiniOrdinati.length}</strong>
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#ecf0f1;border-bottom:2px solid #34495e;">
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Data</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Marca</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Modello</th>
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${ordiniOrdinati
            .map(
              (o, i) => `
            <tr style="border-bottom:1px solid #ecf0f1;${i % 2 === 0 ? "background:#fafafa;" : ""}">
              <td style="padding:10px;border:1px solid #ecf0f1;font-weight:bold;white-space:nowrap;">${formatDate(o.data_movimento)}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.marca_nome || "-"}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.modello_nome || "-"}</td>
              <td style="padding:10px;border:1px solid #ecf0f1;">${o.note || "-"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generatePrintDocumentOrdiniPerCliente(ordini, companyWrapper) {
  const company = companyWrapper.company || companyWrapper;
  const gruppi = groupOrdiniByCliente(ordini);
  const clientiUnici = Array.from(
    new Set(
      ordini.map((o) =>
        JSON.stringify({
          id: o.cliente_id,
          nome: o.cliente_nome,
          num_tel: o.cliente_tel,
          email: o.cliente_email,
        }),
      ),
    ),
  )
    .map((s) => JSON.parse(s))
    .sort((a, b) => a.nome.localeCompare(b.nome, "it"));

  const header = generatePrintHeader(company);
  const bodyClienti = clientiUnici
    .map((c) => generateClienteSection(c, gruppi[c.id] || []))
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <title>Stampa Preventivi per Cliente</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .print-container { max-width: 210mm; margin: 0 auto; padding: 20mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-container { max-width: 100%; padding: 0; margin: 0; }
            .cliente-section { page-break-inside: avoid; margin-bottom: 40px; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${header}
          ${bodyClienti}
          <div style="margin-top:20px;text-align:center;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:10px;">
            Documento generato il: ${new Date().toLocaleString("it-IT")}
          </div>
        </div>
      </body>
    </html>
  `;
}

async function printOrdiniDiretta() {
  try {
    if (!allOrdini || !allOrdini.length) {
      showNotification("Nessun preventivo da stampare", "warning");
      return;
    }
    companyInfo = await loadCompanyInfoForPrint();
    const htmlPrint = generatePrintDocumentOrdiniPerCliente(
      allOrdini,
      companyInfo,
    );
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.left = "-9999px";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);
    printFrame.contentDocument.open();
    printFrame.contentDocument.write(htmlPrint);
    printFrame.contentDocument.close();
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    };
    showNotification("Dialog stampa aperto!", "success");
  } catch (err) {
    console.error("Errore stampa:", err);
    showNotification("Errore nella stampa", "error");
  }
}

window.printOrdiniDiretta = printOrdiniDiretta;

document.addEventListener("DOMContentLoaded", () => {
  const savedSection = localStorage.getItem("activeSection") || "clienti";
  if (savedSection === "ordini") {
    setTimeout(() => {
      loadOrdini();
    }, 500);
  }
});
// ==================== RICERCA AUTOCOMPLETE NEI SELECT ====================
// Aggiungi questo codice DOPO le funzioni esistenti in script.js

/**
 * Trasforma un <select> in un campo di ricerca con autocomplete
 * @param {string} selectId - ID del select
 * @param {Array} data - Array di oggetti con id e nome
 * @param {string} placeholder - Testo placeholder
 */
function makeSelectSearchable(selectId, data, placeholder = "Cerca...") {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return;

  // Crea wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "select-search-wrapper";
  wrapper.style.position = "relative";

  // Crea input di ricerca
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "select-search-input";
  searchInput.placeholder = placeholder;
  searchInput.style.cssText = `
    width: 100%;
    padding: 12px 40px 12px 18px;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.25s ease;
    background: white;
  `;

  // Icona lente di ricerca
  const searchIcon = document.createElement("span");
  searchIcon.innerHTML = "🔍";
  searchIcon.style.cssText = `
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 16px;
  `;

  // Dropdown risultati
  const resultsDropdown = document.createElement("div");
  resultsDropdown.className = "select-search-results";
  resultsDropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 2px solid #6366f1;
    border-top: none;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    display: none;
    z-index: 1000;
    margin-top: -2px;
  `;

  // Hidden input per valore
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.id = `${selectId}_value`;

  // Nascondi select originale
  selectElement.style.display = "none";

  // Inserisci wrapper
  selectElement.parentNode.insertBefore(wrapper, selectElement);
  wrapper.appendChild(searchInput);
  wrapper.appendChild(searchIcon);
  wrapper.appendChild(resultsDropdown);
  wrapper.appendChild(hiddenInput);
  wrapper.appendChild(selectElement);

  // Dati completi
  let allData = data;
  let selectedValue = null;

  // Funzione per popolare dropdown
  function populateResults(filteredData) {
    resultsDropdown.innerHTML = "";

    if (filteredData.length === 0) {
      resultsDropdown.innerHTML = `
        <div style="padding:20px;text-align:center;color:#64748b;">
          Nessun risultato trovato
        </div>
      `;
      resultsDropdown.style.display = "block";
      return;
    }

    filteredData.forEach((item) => {
      const resultItem = document.createElement("div");
      resultItem.className = "select-search-result-item";
      resultItem.textContent = item.nome;
      resultItem.dataset.value = item.id;
      resultItem.style.cssText = `
        padding: 12px 18px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid #f1f5f9;
      `;

      resultItem.addEventListener("mouseenter", () => {
        resultItem.style.background = "#f8fafc";
        resultItem.style.paddingLeft = "22px";
      });

      resultItem.addEventListener("mouseleave", () => {
        resultItem.style.background = "white";
        resultItem.style.paddingLeft = "18px";
      });

      resultItem.addEventListener("click", () => {
        selectValue(item.id, item.nome);
      });

      resultsDropdown.appendChild(resultItem);
    });

    resultsDropdown.style.display = "block";
  }

  // Funzione per selezionare valore
  function selectValue(id, nome) {
    selectedValue = id;
    searchInput.value = nome;
    hiddenInput.value = id;
    selectElement.value = id;

    console.log("[v0] selectValue called - ID:", id, "Nome:", nome);
    console.log("[v0] selectElement.value after set:", selectElement.value);
    console.log("[v0] selectElement.id:", selectElement.id);

    // Trigger change event sul select originale
    const event = new Event("change", { bubbles: true });
    selectElement.dispatchEvent(event);

    resultsDropdown.style.display = "none";

    // Stile selezionato
    searchInput.style.background =
      "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)";
    searchInput.style.borderColor = "#10b981";
    searchInput.style.fontWeight = "600";
    searchInput.style.color = "#065f46";
  }

  // Funzione per resettare
  function resetSearch() {
    searchInput.value = "";
    hiddenInput.value = "";
    selectedValue = null;
    selectElement.value = "";
    searchInput.style.background = "white";
    searchInput.style.borderColor = "var(--border)";
    searchInput.style.fontWeight = "500";
    searchInput.style.color = "var(--text-primary)";
    resultsDropdown.style.display = "none";
  }

  // Event listener input
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === "") {
      // Se vuoto, mostra tutti
      populateResults(allData);
      resetSearch();
    } else {
      // Filtra risultati
      const filtered = allData.filter((item) =>
        item.nome.toLowerCase().includes(searchTerm),
      );
      populateResults(filtered);
    }
  });

  // Focus mostra tutti
  searchInput.addEventListener("focus", () => {
    if (searchInput.value === "") {
      populateResults(allData);
    }
    searchInput.style.borderColor = "#6366f1";
    searchInput.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)";
  });

  // Blur nasconde dropdown
  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      resultsDropdown.style.display = "none";
      searchInput.style.borderColor = "var(--border)";
      searchInput.style.boxShadow = "none";
    }, 200);
  });

  // Click fuori chiude dropdown
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      resultsDropdown.style.display = "none";
    }
  });

  // Metodo pubblico per aggiornare dati
  wrapper.updateData = (newData) => {
    allData = newData;
    if (resultsDropdown.style.display === "block") {
      populateResults(newData);
    }
  };

  // Metodo pubblico per resettare
  wrapper.reset = resetSearch;

  // Metodo pubblico per impostare valore
  wrapper.setValue = (id) => {
    const item = allData.find((d) => d.id == id);
    if (item) {
      selectValue(item.id, item.nome);
    }
  };

  return wrapper;
}

// ==================== APPLICA RICERCA AI SELECT ====================

// Variabili globali per i wrapper
let clienteSearchWrapper = null;
let modelloSearchWrapper = null;

// Funzione per inizializzare ricerca select
async function initSelectSearch() {
  // Aspetta che i dati siano caricati
  if (!allClienti.length) await loadClienti();
  if (!allModelli.length) await loadModelli();

  // Applica ricerca al select Cliente
  if (document.getElementById("ordineCliente")) {
    clienteSearchWrapper = makeSelectSearchable(
      "ordineCliente",
      allClienti.map((c) => ({ id: c.id, nome: c.nome })),
      "Cerca cliente...",
    );
  }

  // Applica ricerca al select Modello
  if (document.getElementById("ordineModello")) {
    modelloSearchWrapper = makeSelectSearchable(
      "ordineModello",
      allModelli.map((m) => ({
        id: m.id,
        nome: m.marca_nome ? `${m.nome} (${m.marca_nome})` : m.nome,
      })),
      "Cerca modello...",
    );
  }
}

// Override della funzione openOrdineModal per supportare ricerca
const originalOpenOrdineModal = openOrdineModal;
openOrdineModal = async function (ordine = null) {
  await originalOpenOrdineModal(ordine);

  // Inizializza ricerca se non già fatto
  if (!clienteSearchWrapper || !modelloSearchWrapper) {
    await initSelectSearch();
  }

  // Se in modifica, imposta valori
  if (ordine) {
    if (clienteSearchWrapper && ordine.cliente_id) {
      clienteSearchWrapper.setValue(ordine.cliente_id);
    }
    if (modelloSearchWrapper && ordine.modello_id) {
      modelloSearchWrapper.setValue(ordine.modello_id);
    }
  } else {
    // Reset in creazione
    if (clienteSearchWrapper) clienteSearchWrapper.reset();
    if (modelloSearchWrapper) modelloSearchWrapper.reset();
  }
};

// Override populateOrdineModelliByMarca per supportare ricerca
const originalPopulateOrdineModelliByMarca = populateOrdineModelliByMarca;
populateOrdineModelliByMarca = function (marcaId) {
  // Prima esegui la funzione originale
  originalPopulateOrdineModelliByMarca(marcaId);

  // Poi aggiorna i dati del wrapper se esiste
  if (modelloSearchWrapper) {
    const filtered =
      marcaId && marcaId !== ""
        ? allModelli.filter(
            (m) => m.marche_id && String(m.marche_id) === String(marcaId),
          )
        : allModelli;

    modelloSearchWrapper.updateData(
      filtered.map((m) => ({
        id: m.id,
        nome: m.marca_nome ? `${m.nome} (${m.marca_nome})` : m.nome,
      })),
    );
  }
};

// Inizializza al caricamento
document.addEventListener("DOMContentLoaded", () => {
  // Aspetta un po' prima di inizializzare (per dare tempo ai dati di caricarsi)
  setTimeout(initSelectSearch, 1000);
  });

// ==================== 🆕 SELECT SEARCHABLE PER MARCA E MODELLO ====================

/**
 * Crea un campo di ricerca searchable per select
 * Versione migliorata con validazione e visual feedback
 */
function createSearchableSelect(
  containerId,
  inputId,
  placeholder,
  getData,
  onSelect,
  required = false,
) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} non trovato`);
    return null;
  }

  // Crea struttura HTML
  container.innerHTML = `
    <div class="searchable-select-wrapper" style="position:relative;">
      <div class="searchable-input-wrapper" style="position:relative;">
        <input 
          type="text" 
          id="${inputId}_search"
          class="searchable-select-input" 
          placeholder="${placeholder}"
          autocomplete="off"
          style="width:100%;padding:12px 80px 12px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:15px;transition:all 0.25s ease;background:white;"
        />
        <span class="search-icon" style="position:absolute;right:50px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:16px;color:#94a3b8;">🔍</span>
        <button 
          type="button"
          class="clear-selection-btn" 
          style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:#ef4444;color:white;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:none;font-size:14px;font-weight:bold;transition:all 0.2s;"
        >×</button>
      </div>
      <input type="hidden" id="${inputId}" name="${inputId}" />
      <div class="searchable-select-results" style="position:absolute;top:100%;left:0;right:0;max-height:300px;overflow-y:auto;background:white;border:2px solid #6366f1;border-top:none;border-radius:0 0 12px 12px;box-shadow:0 8px 20px rgba(0,0,0,0.15);display:none;z-index:1000;margin-top:-2px;"></div>
      <div class="selection-display" style="margin-top:8px;display:none;">
        <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);padding:10px 14px;border-radius:8px;border-left:4px solid #10b981;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span style="font-size:11px;color:#065f46;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Selezionato</span>
              <div class="selected-value-display" style="font-size:15px;color:#065f46;font-weight:700;margin-top:2px;"></div>
            </div>
            <span style="font-size:24px;">✓</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector(`#${inputId}_search`);
  const hiddenInput = container.querySelector(`#${inputId}`);
  const results = container.querySelector(".searchable-select-results");
  const clearBtn = container.querySelector(".clear-selection-btn");
  const selectionDisplay = container.querySelector(".selection-display");
  const selectedValueDisplay = container.querySelector(
    ".selected-value-display",
  );

  let allData = [];
  let currentData = [];
  let selectedValue = null;
  let selectedName = null;

  // Carica dati
  async function loadData() {
    allData = await getData();
    currentData = allData;
  }

  // Mostra risultati
  function showResults(filteredData) {
    if (filteredData.length === 0) {
      results.innerHTML =
        '<div style="padding:20px;text-align:center;color:#64748b;">Nessun risultato trovato</div>';
      results.style.display = "block";
      return;
    }

    results.innerHTML = filteredData
      .map(
        (item) => `
      <div class="result-item" data-id="${item.id}" data-nome="${item.nome}" style="padding:12px 18px;cursor:pointer;transition:all 0.2s ease;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:600;color:#334155;">${highlightText(item.nome, searchInput.value)}</div>
        ${item.extra ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${item.extra}</div>` : ""}
      </div>
    `,
      )
      .join("");

    results.style.display = "block";

    // Event listeners sui risultati
    results.querySelectorAll(".result-item").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        el.style.background = "#f8fafc";
        el.style.paddingLeft = "22px";
      });
      el.addEventListener("mouseleave", () => {
        el.style.background = "white";
        el.style.paddingLeft = "18px";
      });
      el.addEventListener("click", () => {
        selectItem(el.dataset.id, el.dataset.nome);
      });
    });
  }

  // Evidenzia testo cercato
  function highlightText(text, search) {
    if (!search) return text;
    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(
      regex,
      '<mark style="background:#fef08a;color:#713f12;padding:2px 4px;border-radius:3px;font-weight:700;">$1</mark>',
    );
  }

  // Seleziona item
  function selectItem(id, nome) {
    selectedValue = id;
    selectedName = nome;

    // Aggiorna campi
    searchInput.value = "";
    hiddenInput.value = id;
    results.style.display = "none";

    // Mostra selezione
    searchInput.style.display = "none";
    selectionDisplay.style.display = "block";
    selectedValueDisplay.textContent = nome;
    clearBtn.style.display = "block";

    // Nascondi icona ricerca
    container.querySelector(".search-icon").style.display = "none";

    // Callback
    if (onSelect) onSelect(id, nome);
  }

  // Reset/Clear
  function reset() {
    selectedValue = null;
    selectedName = null;
    searchInput.value = "";
    hiddenInput.value = "";
    searchInput.style.display = "block";
    selectionDisplay.style.display = "none";
    selectedValueDisplay.textContent = "";
    clearBtn.style.display = "none";
    results.style.display = "none";
    container.querySelector(".search-icon").style.display = "block";

    // Reset validazione
    searchInput.setCustomValidity("");
    hiddenInput.setCustomValidity("");
  }

  // Click sul pulsante clear
  clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    reset();
    searchInput.focus();
  });

  // Event input
  searchInput.addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Carica dati se necessario
    if (allData.length === 0) await loadData();

    if (searchTerm === "") {
      showResults(currentData);
    } else {
      const filtered = currentData.filter((item) =>
        item.nome.toLowerCase().includes(searchTerm),
      );
      showResults(filtered);
    }
  });

  // Focus
  searchInput.addEventListener("focus", async () => {
    if (allData.length === 0) await loadData();

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered =
      searchTerm === ""
        ? currentData
        : currentData.filter((item) =>
            item.nome.toLowerCase().includes(searchTerm),
          );

    showResults(filtered);
    searchInput.style.borderColor = "#6366f1";
    searchInput.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)";
  });

  // Blur
  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      results.style.display = "none";
      searchInput.style.borderColor = "#e2e8f0";
      searchInput.style.boxShadow = "none";
    }, 200);
  });

  // Click fuori
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      results.style.display = "none";
    }
  });

  // Validazione custom per campo required
  if (required) {
    // Gestisci validazione manuale sul form submit
    const form = container.closest("form");
    if (form) {
      form.addEventListener(
        "submit",
        (e) => {
          if (!hiddenInput.value) {
            e.preventDefault();
            e.stopImmediatePropagation();

            // Mostra messaggio di errore
            searchInput.style.borderColor = "#ef4444";
            searchInput.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";
            searchInput.placeholder = "⚠️ Campo obbligatorio!";
            searchInput.focus();

            // Ripristina dopo 3 secondi
            setTimeout(() => {
              searchInput.style.borderColor = "#e2e8f0";
              searchInput.style.boxShadow = "none";
              searchInput.placeholder = placeholder;
            }, 3000);

            return false;
          }
        },
        true,
      );
    }

    // Reset validazione su selezione
    searchInput.addEventListener("input", () => {
      if (hiddenInput.value) {
        searchInput.style.borderColor = "#e2e8f0";
        searchInput.style.boxShadow = "none";
      }
    });
  }

  return {
    loadData,
    reset,
    setValue: (id) => {
      const item = allData.find((d) => String(d.id) === String(id));
      if (item) selectItem(item.id, item.nome);
    },
    getValue: () => selectedValue,
    updateData: (newData) => {
      currentData = newData;
      allData = newData;
    },
    filterData: (newData) => {
      currentData = newData;
    },
    getSelectedName: () => selectedName,
  };
}

// Variabili globali per i searchable selects
let marcaSearchOrdine = null;
let modelloSearchOrdine = null;
let marcaSearchModello = null;

// Inizializza SELECT searchable per il form Modello
async function initModelloSearchableSelect() {
  // SELECT MARCA nel form Modello
  marcaSearchModello = createSearchableSelect(
    "modelloMarcaSearch_container",
    "modelloMarca",
    "Cerca marca...",
    async () => {
      const res = await fetch(`${API_URL}/marche`);
      const marche = await res.json();
      return marche.map((m) => ({ id: m.id, nome: m.nome }));
    },
    (id, nome) => {
      console.log("Marca selezionata per modello:", nome);
    },
    true, // required
  );

  // Carica i dati
  if (marcaSearchModello) {
    await marcaSearchModello.refreshData();
  }
}

// Inizializza SELECT searchable per il form Ordine
async function initOrdineSearchableSelects() {
  // SELECT MARCA nel form Ordine
  marcaSearchOrdine = createSearchableSelect(
    "ordineMarcaSearch_container",
    "ordineMarca",
    "Cerca marca...",
    async () => {
      const res = await fetch(`${API_URL}/marche`);
      const marche = await res.json();
      return marche.map((m) => ({ id: m.id, nome: m.nome }));
    },
    async (id, nome) => {
      console.log("Marca selezionata:", nome);
      // Quando seleziono una marca, filtro i modelli
      if (modelloSearchOrdine) {
        await updateModelloByMarca(id);
      }
    },
    true, // required
  );

  // SELECT MODELLO nel form Ordine
  modelloSearchOrdine = createSearchableSelect(
    "ordineModelloSearch_container",
    "ordineModello",
    "Cerca modello...",
    async () => {
      const res = await fetch(`${API_URL}/modelli`);
      const modelli = await res.json();
      return modelli.map((m) => ({
        id: m.id,
        nome: m.nome,
        extra: m.marca_nome || "",
        marche_id: m.marche_id,
      }));
    },
    (id, nome) => {
      console.log("Modello selezionato:", nome);
      // Quando seleziono un modello, aggiorno la marca se non già selezionata
      const modelloCompleto = allModelli.find(
        (m) => String(m.id) === String(id),
      );
      if (
        modelloCompleto &&
        modelloCompleto.marche_id &&
        marcaSearchOrdine &&
        !marcaSearchOrdine.getValue()
      ) {
        marcaSearchOrdine.setValue(modelloCompleto.marche_id);
      }
    },
    true, // required
  );

  // Carica dati iniziali
  if (marcaSearchOrdine) await marcaSearchOrdine.loadData();
  if (modelloSearchOrdine) await modelloSearchOrdine.loadData();
}

// Funzione per aggiornare modelli in base alla marca selezionata
async function updateModelloByMarca(marcaId) {
  if (!modelloSearchOrdine) return;

  const res = await fetch(`${API_URL}/modelli`);
  const modelli = await res.json();

  const filtered = marcaId
    ? modelli.filter((m) => String(m.marche_id) === String(marcaId))
    : modelli;

  console.log(`Filtrati ${filtered.length} modelli per marca ${marcaId}`);

  modelloSearchOrdine.filterData(
    filtered.map((m) => ({
      id: m.id,
      nome: m.nome,
      extra: m.marca_nome || "",
      marche_id: m.marche_id,
    })),
  );

  // Reset selezione modello se cambia marca
  modelloSearchOrdine.reset();
}

// Inizializza SELECT searchable per il form Modello
async function initModelloSearchableSelects() {
  marcaSearchModello = createSearchableSelect(
    "modelloMarcaSearch_container",
    "modelloMarca",
    "Cerca marca...",
    async () => {
      const res = await fetch(`${API_URL}/marche`);
      const marche = await res.json();
      return marche.map((m) => ({ id: m.id, nome: m.nome }));
    },
    (id, nome) => {
      console.log("Marca selezionata nel modello:", nome);
    },
    true, // required
  );

  if (marcaSearchModello) await marcaSearchModello.loadData();
}

// Override openOrdineModal per inizializzare i searchable selects
const _originalOpenOrdineModal = window.openOrdineModal;
window.openOrdineModal = async function (ordine = null) {
  await loadClientiForSelect();

  const modal = document.getElementById("modalOrdine");
  const title = document.getElementById("modalOrdineTitle");
  const form = document.getElementById("formOrdine");

  form.reset();

  // Inizializza searchable selects se non già fatto
  if (!marcaSearchOrdine || !modelloSearchOrdine) {
    await initOrdineSearchableSelects();
  } else {
    // Reset se già esistono
    marcaSearchOrdine.reset();
    modelloSearchOrdine.reset();
    await marcaSearchOrdine.loadData();
    await modelloSearchOrdine.loadData();
  }

  if (ordine) {
    title.textContent = "Modifica Preventivo";
    document.getElementById("ordineId").value = ordine.id;
    document.getElementById("ordineCliente").value = ordine.cliente_id;
    document.getElementById("ordineData").value = formatDateForInput(
      ordine.data_movimento,
    );
    document.getElementById("ordineNote").value = ordine.note || "";

    // Imposta valori nei searchable selects
    if (ordine.marca_id && marcaSearchOrdine) {
      await marcaSearchOrdine.loadData();
      marcaSearchOrdine.setValue(ordine.marca_id);
    }
    if (ordine.modello_id && modelloSearchOrdine) {
      await modelloSearchOrdine.loadData();
      modelloSearchOrdine.setValue(ordine.modello_id);
    }
  } else {
    title.textContent = "Nuovo Preventivo";
    document.getElementById("ordineId").value = "";

    // Imposta data odierna
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("ordineData").value = today;
  }

  modal.classList.add("active");
};

// Override openModelloModal per inizializzare searchable select marca
const _originalOpenModelloModal = window.openModelloModal;
window.openModelloModal = async function (modello = null) {
  const modal = document.getElementById("modalModello");
  const title = document.getElementById("modalModelloTitle");
  const form = document.getElementById("formModello");

  form.reset();

  // Inizializza searchable select se non già fatto
  if (!marcaSearchModello) {
    await initModelloSearchableSelects();
  } else {
    marcaSearchModello.reset();
    await marcaSearchModello.loadData();
  }

  if (modello) {
    title.textContent = "Modifica Modello";
    document.getElementById("modelloId").value = modello.id;
    document.getElementById("modelloNome").value = modello.nome;

    if (modello.marche_id && marcaSearchModello) {
      await marcaSearchModello.loadData();
      marcaSearchModello.setValue(modello.marche_id);
    }
  } else {
    title.textContent = "Nuovo Modello";
    document.getElementById("modelloId").value = "";
  }

  modal.classList.add("active");
};

// Funzione da chiamare quando apri il modal
async function initOrdineSelects() {
    // 1. Inizializza Ricerca CLIENTE (come concetto Marca)
    if (window.clienteSearchOrdine) {
        window.clienteSearchOrdine.onSelect = (id) => {
            document.getElementById('ordineCliente').value = id;
        };
    }

    // 2. Inizializza Ricerca MARCA
    if (window.marcaSearchOrdine) {
        window.marcaSearchOrdine.onSelect = (id) => {
            document.getElementById('ordineMarca').value = id;
            // Quando cambi marca, filtra i modelli
            if (window.modelloSearchOrdine) {
                window.modelloSearchOrdine.setFilter(m => m.marche_id == id);
            }
        };
    }

    // 3. Inizializza Ricerca MODELLO
    if (window.modelloSearchOrdine) {
        window.modelloSearchOrdine.onSelect = (id) => {
            document.getElementById('ordineModello').value = id;
        };
    }
}

// GESTIONE INVIO (ANTI-DUPLICATO)
document.getElementById('formOrdine').addEventListener('submit', async function(e) {
    // Blocca l'invio standard del browser per evitare il doppio invio
    e.preventDefault();
    e.stopPropagation();

    const btnSalva = this.querySelector('button[type="submit"]');
    
    // Recupero ID dai campi hidden
    const payload = {
        id: document.getElementById('ordineId').value || null,
        cliente_id: document.getElementById('ordineCliente').value,
        marche_id: document.getElementById('ordineMarca').value,
        modelli_id: document.getElementById('ordineModello').value,
        data_ordine: document.getElementById('ordineData').value,
        note: document.getElementById('ordineNote').value
    };

    // VALIDAZIONE: Se mancano i dati fondamentali, non inviare NULLA
    if (!payload.cliente_id || !payload.marche_id || !payload.modelli_id) {
        alert("⚠️ Seleziona Cliente, Marca e Modello dai suggerimenti!");
        return;
    }

    try {
        btnSalva.disabled = true; // Disabilita bottone per sicurezza extra
        
        const response = await fetch(`${API_URL}/ordini`, {
            method: payload.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("✅ Preventivo salvato!");
            closeOrdineModal();
            loadOrdini(); 
        } else {
            const err = await response.json();
            alert("❌ Errore: " + err.error);
        }
    } catch (error) {
        console.error("Errore invio:", error);
    } finally {
        btnSalva.disabled = false;
    }
});

// Funzione per gestire l'invio unico e validato
function setupOrdineForm() {
    const form = document.getElementById('formOrdine');
    const btnSalva = document.getElementById('btnSalvaOrdine');

    // Rimuoviamo eventuali listener precedenti per evitare invii multipli
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Recuperiamo i dati dagli input HIDDEN
        const payload = {
            id: document.getElementById('ordineId').value || null,
            cliente_id: document.getElementById('ordineCliente').value,
            marche_id: document.getElementById('ordineMarca').value,
            modelli_id: document.getElementById('ordineModello').value,
            data_ordine: document.getElementById('ordineData').value,
            note: document.getElementById('ordineNote').value
        };

        // BLOCCANTE: Se mancano i dati, non fa la chiamata al server
        if (!payload.cliente_id || !payload.marche_id || !payload.modelli_id) {
            alert("⚠️ Errore: Devi selezionare Cliente, Marca e Modello dai suggerimenti!");
            return;
        }

        try {
            btnSalva.disabled = true; // Impedisce click multipli
            
            const method = payload.id ? 'PUT' : 'POST';
            const response = await fetch(`${API_URL}/ordini`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("✅ Preventivo salvato con successo!");
                closeOrdineModal();
                loadOrdini(); 
            } else {
                const err = await response.json();
                alert("❌ Errore: " + err.error);
            }
        } catch (error) {
            console.error("Errore invio:", error);
        } finally {
            btnSalva.disabled = false;
        }
    });
}
