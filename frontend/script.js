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

    // 🔥 Ripristina i filtri salvati
    restoreClientiFilters();
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
            : "NO"
        }
      </td>
      <td style="position: relative;">
        <div class="editable-date-cell" onclick="toggleDateEdit(${c.id}, '${c.data_passaggio || ""}', event)">
          <span class="date-display">${c.data_passaggio ? formatDate(c.data_passaggio) : "-"}</span>
          <svg class="edit-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-left: 6px; opacity: 0.5;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </div>
        <input 
          type="date" 
          class="inline-date-input" 
          id="dateInput_${c.id}"
          value="${c.data_passaggio || ""}"
          data-original-value="${c.data_passaggio || ""}"
          onblur="saveAndHideDateInput(${c.id})"
          onkeydown="handleDateKeydown(event, ${c.id})"
          style="display: none; width: 100%; padding: 4px; border: 2px solid #6366f1; border-radius: 4px;"
        />
      </td>
      <td style="text-align:center;">
        <input 
          type="checkbox" 
          ${c.flag_ricontatto ? "checked" : ""} 
          onchange="toggleRicontatto(${c.id}, this.checked)"
          style="cursor: pointer; width: 18px; height: 18px;"
          title="Ricontatto Cliente"
        />
      </td>
      <td style="text-align: center">
        <span class="badge-count">${c.ordini_count || 0}</span>
      </td>
      <td class="text-right">
        <button class="btn-icon" onclick="editCliente(${c.id})" title="Modifica cliente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteCliente(${c.id})" title="Elimina cliente">
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

// 🔥 SALVA E RIPRISTINA FILTRI CLIENTI
function saveClientiFilters() {
  const searchTerm = document.getElementById("filterClienti")?.value || "";
  const dataPassaggio =
    document.getElementById("filterDataPassaggio")?.value || "";

  localStorage.setItem("filter_clienti_search", searchTerm);
  localStorage.setItem("filter_clienti_data", dataPassaggio);
}

function restoreClientiFilters() {
  const savedSearch = localStorage.getItem("filter_clienti_search") || "";
  const savedData = localStorage.getItem("filter_clienti_data") || "";

  const searchInput = document.getElementById("filterClienti");
  const dataInput = document.getElementById("filterDataPassaggio");

  if (searchInput) searchInput.value = savedSearch;
  if (dataInput) dataInput.value = savedData;

  // Applica sempre i filtri (anche se vuoti) per mostrare i dati
  applyClientiFilters();
}

// Filtro testo clienti
document.getElementById("filterClienti")?.addEventListener("input", (e) => {
  saveClientiFilters();
  applyClientiFilters();
});

// 🆕 FILTRO DATA PASSAGGIO
document
  .getElementById("filterDataPassaggio")
  ?.addEventListener("change", (e) => {
    saveClientiFilters();
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

async function toggleRicontatto(clienteId, isChecked) {
  try {
    const res = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flag_ricontatto: isChecked,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Aggiorna i dati locali senza ricaricare tutta la tabella
      const cliente = allClienti.find((c) => c.id === clienteId);
      if (cliente) {
        cliente.flag_ricontatto = isChecked ? 1 : 0;
      }
      const clienteFiltered = clienti.find((c) => c.id === clienteId);
      if (clienteFiltered) {
        clienteFiltered.flag_ricontatto = isChecked ? 1 : 0;
      }
      showNotification(
        isChecked ? "Ricontatto attivato" : "Ricontatto disattivato",
        "success",
      );
    } else {
      // Ripristina il checkbox in caso di errore
      showNotification(data.error || "Errore durante l'aggiornamento", "error");
      renderClienti();
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
    renderClienti();
  }
}

// 📅 FUNZIONI PER EDITING INLINE DATA PASSAGGIO
function toggleDateEdit(clienteId, currentDate, event) {
  event.stopPropagation();

  // Nascondi tutti gli altri input date eventualmente aperti
  document.querySelectorAll(".inline-date-input").forEach((input) => {
    input.style.display = "none";
    const parentCell = input.closest("td");
    if (parentCell) {
      const dateCell = parentCell.querySelector(".editable-date-cell");
      if (dateCell) dateCell.style.display = "flex";
    }
  });

  const dateInput = document.getElementById(`dateInput_${clienteId}`);
  const dateCell = dateInput.previousElementSibling;

  if (dateInput && dateCell) {
    dateCell.style.display = "none";
    dateInput.style.display = "block";

    // Salva il valore originale per poterlo ripristinare con ESC
    dateInput.setAttribute("data-original-value", dateInput.value);

    // Focus sull'input e apri il calendar picker
    setTimeout(() => {
      dateInput.focus();
      try {
        dateInput.showPicker(); // Apre il calendar picker automaticamente (se supportato)
      } catch (e) {
        // showPicker non supportato su alcuni browser, ignora
      }
    }, 50);
  }
}

function handleDateKeydown(event, clienteId) {
  // ESC - Annulla la modifica
  if (event.key === "Escape") {
    const dateInput = document.getElementById(`dateInput_${clienteId}`);
    if (dateInput) {
      // Ripristina il valore originale
      dateInput.value = dateInput.getAttribute("data-original-value") || "";
      // Chiudi l'input senza salvare
      cancelDateEdit(clienteId);
    }
  }
  // ENTER - Salva la modifica
  else if (event.key === "Enter") {
    event.preventDefault();
    const dateInput = document.getElementById(`dateInput_${clienteId}`);
    if (dateInput) {
      dateInput.blur(); // Attiva il salvataggio tramite onblur
    }
  }
}

function cancelDateEdit(clienteId) {
  const dateInput = document.getElementById(`dateInput_${clienteId}`);
  const dateCell = dateInput?.previousElementSibling;

  if (dateInput && dateCell) {
    dateInput.style.display = "none";
    dateCell.style.display = "flex";
  }
}

function saveAndHideDateInput(clienteId) {
  const dateInput = document.getElementById(`dateInput_${clienteId}`);
  const originalValue = dateInput?.getAttribute("data-original-value") || "";
  const newValue = dateInput?.value || "";

  // Salva solo se il valore è cambiato
  if (newValue !== originalValue) {
    updateDataPassaggio(clienteId, newValue);
  } else {
    // Nascondi l'input senza salvare
    cancelDateEdit(clienteId);
  }
}

async function updateDataPassaggio(clienteId, newDate) {
  try {
    const res = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data_passaggio: newDate || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Aggiorna i dati locali senza ricaricare tutta la tabella
      const cliente = allClienti.find((c) => c.id === clienteId);
      if (cliente) {
        cliente.data_passaggio = newDate || null;
      }
      const clienteFiltered = clienti.find((c) => c.id === clienteId);
      if (clienteFiltered) {
        clienteFiltered.data_passaggio = newDate || null;
      }

      // Aggiorna la visualizzazione della data
      const dateInput = document.getElementById(`dateInput_${clienteId}`);
      const dateCell = dateInput?.previousElementSibling;
      if (dateCell) {
        const dateDisplay = dateCell.querySelector(".date-display");
        if (dateDisplay) {
          dateDisplay.textContent = newDate ? formatDate(newDate) : "-";
        }
      }

      // Nascondi l'input
      cancelDateEdit(clienteId);

      showNotification(
        newDate ? "Data passaggio aggiornata" : "Data passaggio rimossa",
        "success",
      );
    } else {
      showNotification(data.error || "Errore durante l'aggiornamento", "error");
      cancelDateEdit(clienteId);
      renderClienti();
    }
  } catch (error) {
    showNotification("Errore di connessione", "error");
    cancelDateEdit(clienteId);
    renderClienti();
  }
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

    // 🔥 Ripristina il filtro salvato
    restoreOrdiniFilter();
  } catch (error) {
    console.error("Errore caricamento preventivi:", error);
    showNotification("Errore caricamento preventivi", "error");
  }
}


function renderOrdini() {
  const tbody = document.getElementById("ordiniTableBody");

  if (ordini.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="10" class="text-center">Nessun preventivo presente</td></tr>';
    return;
  }

  tbody.innerHTML = ordini
    .map(
      (o) => {
        const telefono = o.cliente_tel || "-";
        const email = o.cliente_email || "NO MAIL";
        const dataPassaggio = o.cliente_data_passaggio || "";
        const flagRicontatto = o.cliente_flag_ricontatto || 0;
        
        const whatsappLink = telefono !== "-" 
          ? `<a href="https://wa.me/${telefono.replace(/[^0-9]/g, '')}" target="_blank" class="contact-link whatsapp" title="Apri WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>`
          : "-";
        
        const emailLink = email !== "NO MAIL"
          ? `<a href="mailto:${email}" class="contact-link email" title="Invia Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>`
          : "NO MAIL";
        
        const telLink = telefono !== "-"
          ? `<a href="tel:${telefono}" class="contact-link phone" title="Chiama">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>`
          : "-";

        return `
    <tr>
      <td>${formatDate(o.data_movimento)}</td>
      <td><strong>${o.cliente_nome}</strong></td>
      <td class="contact-cell">
        ${whatsappLink}
        ${telLink}
        <span class="tel-number">${telefono}</span>
      </td>
      <td class="contact-cell">
        ${emailLink}
        ${email !== "NO MAIL" ? `<span class="email-text">${email}</span>` : ""}
      </td>
      <td>
        <input 
          type="date" 
          class="inline-date-input" 
          value="${dataPassaggio}" 
          onchange="updateClienteDataPassaggio(${o.cliente_id}, this.value)"
          title="Modifica data passaggio"
        />
      </td>
      <td class="text-center">
        <input 
          type="checkbox" 
          class="inline-checkbox" 
          ${flagRicontatto ? 'checked' : ''} 
          onchange="updateClienteFlagRicontatto(${o.cliente_id}, this.checked)"
          title="Ricontatto cliente"
        />
      </td>
      <td>${o.marca_nome || "-"}</td>
      <td>${o.modello_nome || "-"}</td>
      <td>${o.note || "-"}</td>
      <td class="text-right">
        <button class="btn-icon" onclick="editOrdine(${o.id})" title="Modifica preventivo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteOrdine(${o.id})" title="Elimina preventivo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </td>
    </tr>
  `;
      }
    )
    .join("");
}

async function updateClienteDataPassaggio(clienteId, newDate) {
  try {
    const response = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data_passaggio: newDate })
    });

    if (!response.ok) {
      throw new Error('Errore aggiornamento data passaggio');
    }

    showNotification('Data passaggio aggiornata', 'success');
    await loadOrdini();
  } catch (error) {
    console.error('Errore:', error);
    showNotification('Errore aggiornamento data passaggio', 'error');
    await loadOrdini();
  }
}

async function updateClienteFlagRicontatto(clienteId, checked) {
  try {
    const response = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag_ricontatto: checked })
    });

    if (!response.ok) {
      throw new Error('Errore aggiornamento flag ricontatto');
    }

    showNotification(
      checked ? 'Cliente da ricontattare' : 'Flag ricontatto rimosso', 
      'success'
    );
    await loadOrdini();
  } catch (error) {
    console.error('Errore:', error);
    showNotification('Errore aggiornamento flag ricontatto', 'error');
    await loadOrdini();
  }
}

function saveOrdiniFilter() {
  const searchTerm = document.getElementById("filterOrdini")?.value || "";
  const dataPassaggio = document.getElementById("filterOrdiniDataPassaggio")?.value || "";
  localStorage.setItem("filter_ordini_search", searchTerm);
  localStorage.setItem("filter_ordini_data_passaggio", dataPassaggio);
}

function restoreOrdiniFilter() {
  const savedSearch = localStorage.getItem("filter_ordini_search") || "";
  const savedDataPassaggio = localStorage.getItem("filter_ordini_data_passaggio") || "";
  
  const searchInput = document.getElementById("filterOrdini");
  const dataPassaggioInput = document.getElementById("filterOrdiniDataPassaggio");

  if (searchInput) {
    searchInput.value = savedSearch;
  }
  
  if (dataPassaggioInput) {
    dataPassaggioInput.value = savedDataPassaggio;
  }

  applyOrdiniFilter(savedSearch.toLowerCase(), savedDataPassaggio);
}

function applyOrdiniFilter(searchTerm = '', dataPassaggio = '') {
  ordini = allOrdini.filter((o) => {
    const matchText = !searchTerm || 
      o.cliente_nome.toLowerCase().includes(searchTerm) ||
      (o.cliente_tel && o.cliente_tel.toLowerCase().includes(searchTerm)) ||
      (o.cliente_email && o.cliente_email.toLowerCase().includes(searchTerm)) ||
      (o.marca_nome && o.marca_nome.toLowerCase().includes(searchTerm)) ||
      (o.modello_nome && o.modello_nome.toLowerCase().includes(searchTerm));
    
    const matchData = !dataPassaggio || 
      (o.cliente_data_passaggio && o.cliente_data_passaggio === dataPassaggio);
    
    return matchText && matchData;
  });
  
  renderOrdini();
}

document.getElementById("filterOrdini")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const dataPassaggio = document.getElementById("filterOrdiniDataPassaggio")?.value || '';
  saveOrdiniFilter();
  applyOrdiniFilter(searchTerm, dataPassaggio);
});

document.getElementById("filterOrdiniDataPassaggio")?.addEventListener("change", (e) => {
  const searchTerm = document.getElementById("filterOrdini")?.value.toLowerCase() || '';
  const dataPassaggio = e.target.value;
  saveOrdiniFilter();
  applyOrdiniFilter(searchTerm, dataPassaggio);
});

async function openOrdineModal(ordine = null) {
  await loadClientiForSelect();
  await loadMarcheForSelect();
  await loadModelliForSelect();

  const modal = document.getElementById("modalOrdine");
  const title = document.getElementById("modalOrdineTitle");
  const form = document.getElementById("formOrdine");

  form.reset();

  if (ordine) {
    title.textContent = "Modifica Preventivo";
    document.getElementById("ordineId").value = ordine.id;
    
    document.getElementById("ordineCliente").value = ordine.cliente_id;
    document.getElementById("ordineData").value = formatDateForInput(ordine.data_movimento);
    document.getElementById("ordineMarca").value = ordine.marca_id || "";
    document.getElementById("ordineModello").value = ordine.modello_id || "";
    document.getElementById("ordineNote").value = ordine.note || "";
    
    setTimeout(() => {
      initSelectSearch(
        'ordineClienteSearch',
        allClienti.map(c => ({ value: c.id, label: c.nome })),
        'ordineCliente',
        ordine.cliente_id
      );
      
      const marche = allModelli
        .map(m => ({ id: m.marche_id, nome: m.marca_nome }))
        .filter((m, i, arr) => m.id && arr.findIndex(x => x.id === m.id) === i);
      
      initSelectSearch(
        'ordineMarcaSearch',
        marche.map(m => ({ value: m.id, label: m.nome })),
        'ordineMarca',
        ordine.marca_id
      );
      
      const modelliFiltered = allModelli.filter(m => m.marche_id == ordine.marca_id);
      
      initSelectSearch(
        'ordineModelloSearch',
        modelliFiltered.map(m => ({ value: m.id, label: m.nome })),
        'ordineModello',
        ordine.modello_id
      );
    }, 100);
    
  } else {
    title.textContent = "Nuovo Preventivo";
    document.getElementById("ordineId").value = "";

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("ordineData").value = today;
    
    setTimeout(() => {
      initSelectSearch(
        'ordineClienteSearch',
        allClienti.map(c => ({ value: c.id, label: c.nome })),
        'ordineCliente'
      );
      
      const marche = allModelli
        .map(m => ({ id: m.marche_id, nome: m.marca_nome }))
        .filter((m, i, arr) => m.id && arr.findIndex(x => x.id === m.id) === i);
      
      initSelectSearch(
        'ordineMarcaSearch',
        marche.map(m => ({ value: m.id, label: m.nome })),
        'ordineMarca'
      );
      
      initSelectSearch(
        'ordineModelloSearch',
        [],
        'ordineModello'
      );
    }, 100);
  }

  modal.classList.add("active");
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

  // DEBUG: Verifica valori
  console.log("=== DEBUG SUBMIT ORDINE ===");
  console.log("modello_id:", modello_id);
  console.log("marca_id:", marca_id);
  console.log("allModelli:", allModelli);
  console.log("allModelli.length:", allModelli?.length);

  const note = document.getElementById("ordineNote").value.trim();

  // Validazione cliente
  if (!cliente_id) {
    showNotification("Seleziona un cliente dalla lista", "warning");
    return;
  }

  // Validazione modello (solo se allModelli è caricato)
  if (modello_id && Array.isArray(allModelli) && allModelli.length > 0) {
    const modello = allModelli.find((m) => String(m.id) === String(modello_id));
    if (!modello) {
      console.warn("Modello non trovato in allModelli, ma procedo comunque con il salvataggio");
      // Non blocchiamo il salvataggio, il backend farà la validazione finale
    } else if (marca_id && modello.marche_id) {
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

    // 🔥 Ripristina il filtro salvato
    restoreMarcheFilter();
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
  `,
    )
    .join("");
}

// 🔥 SALVA E RIPRISTINA FILTRI MARCHE
function saveMarcheFilter() {
  const searchTerm = document.getElementById("filterMarche")?.value || "";
  localStorage.setItem("filter_marche_search", searchTerm);
}

function restoreMarcheFilter() {
  const savedSearch = localStorage.getItem("filter_marche_search") || "";
  const searchInput = document.getElementById("filterMarche");

  if (searchInput) {
    searchInput.value = savedSearch;
  }

  // Applica sempre i filtri (anche se vuoti) per mostrare i dati
  applyMarcheFilter(savedSearch.toLowerCase());
}

function applyMarcheFilter(searchTerm) {
  marche = allMarche.filter((m) => m.nome.toLowerCase().includes(searchTerm));
  renderMarche();
}

document.getElementById("filterMarche")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  saveMarcheFilter();
  applyMarcheFilter(searchTerm);
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

    // 🔥 Ripristina il filtro salvato
    restoreModelliFilter();
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
  `,
    )
    .join("");
}

// 🔥 SALVA E RIPRISTINA FILTRI MODELLI
function saveModelliFilter() {
  const searchTerm = document.getElementById("filterModelli")?.value || "";
  localStorage.setItem("filter_modelli_search", searchTerm);
}

function restoreModelliFilter() {
  const savedSearch = localStorage.getItem("filter_modelli_search") || "";
  const searchInput = document.getElementById("filterModelli");

  if (searchInput) {
    searchInput.value = savedSearch;
  }

  // Applica sempre i filtri (anche se vuoti) per mostrare i dati
  applyModelliFilter(savedSearch.toLowerCase());
}

function applyModelliFilter(searchTerm) {
  modelli = allModelli.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm) ||
      (m.marca_nome && m.marca_nome.toLowerCase().includes(searchTerm)),
  );
  renderModelli();
}

document.getElementById("filterModelli")?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  saveModelliFilter();
  applyModelliFilter(searchTerm);
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
        <button class="btn-icon" onclick="editUtente(${u.id})" title="Modifica utente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deleteUtente(${u.id})" title="Elimina utente">
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
      <h1 style="margin:10px 0 5px 0;font-size:26px;font-weight:bold;color:#2c3e50;">${company.name || "Riepilogo Preventivi"}</h1>
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
  <strong>✉️ Email:</strong> ${cliente.email || "NO"}
  </p>
  <p style="margin:4px 0;font-size:12px;color:#555;">
  <strong>📅 Data Passaggio/Ricontatto:</strong> ${cliente.data_passaggio ? formatDate(cliente.data_passaggio) : "-"}
  </p>
  <p style="margin:4px 0;font-size:12px;color:#555;">
  <strong>📞 Ricontatto:</strong> ${cliente.flag_ricontatto == 1 ? "Si" : "No"}
  </p>
  <p style="margin:8px 0 0 0;font-size:11px;color:#777;font-style:italic;">
  Totale preventivi: <strong>${ordiniOrdinati.length}</strong>
  </p>
  </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#ecf0f1;border-bottom:2px solid #34495e;">
            <th style="padding:10px;text-align:left;border:1px solid #bdc3c7;">Data Preventivo</th>
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
          data_passaggio: o.cliente_data_passaggio,
          flag_ricontatto: o.cliente_flag_ricontatto,
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
    // Usa 'ordini' (array filtrato) invece di 'allOrdini' per stampare solo ciò che è visibile
    if (!ordini || !ordini.length) {
      showNotification(
        "Nessun preventivo da stampare. Controlla i filtri applicati.",
        "warning",
      );
      return;
    }
    companyInfo = await loadCompanyInfoForPrint();
    const htmlPrint = generatePrintDocumentOrdiniPerCliente(
      ordini,
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

// ==================== SELECT SEARCHABLE PER MARCA E MODELLO ====================

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
        ${item.extra ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${highlightText(item.extra, searchInput.value)}</div>` : ""}
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
      const filtered = currentData.filter((item) => {
        // Cerca nel nome
        if (item.nome.toLowerCase().includes(searchTerm)) return true;

        // Cerca nell'email se presente
        if (item.email && item.email.toLowerCase().includes(searchTerm))
          return true;

        // Cerca nel numero di telefono se presente
        if (item.num_tel && item.num_tel.toLowerCase().includes(searchTerm))
          return true;

        return false;
      });
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
        : currentData.filter((item) => {
            // Cerca nel nome
            if (item.nome.toLowerCase().includes(searchTerm)) return true;

            // Cerca nell'email se presente
            if (item.email && item.email.toLowerCase().includes(searchTerm))
              return true;

            // Cerca nel numero di telefono se presente
            if (item.num_tel && item.num_tel.toLowerCase().includes(searchTerm))
              return true;

            return false;
          });

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
let clienteSearchOrdine = null;
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
  // SELECT CLIENTE nel form Ordine
  clienteSearchOrdine = createSearchableSelect(
    "ordineClienteSearch_container",
    "ordineCliente",
    "Cerca cliente...",
    async () => {
      const res = await fetch(`${API_URL}/clienti`);
      const clienti = await res.json();
      return clienti.map((c) => {
        // Costruisci l'extra con telefono e email
        const extraParts = [];
        if (c.num_tel) extraParts.push(`📞 ${c.num_tel}`);
        if (c.email) extraParts.push(`✉️ ${c.email}`);

        return {
          id: c.id,
          nome: c.nome,
          extra: extraParts.join(" • "),
          num_tel: c.num_tel || "",
          email: c.email || "",
        };
      });
    },
    (id, nome) => {
      // Cliente selezionato
    },
    true, // required
  );

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
  if (clienteSearchOrdine) await clienteSearchOrdine.loadData();
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
      // Marca selezionata
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
  if (!clienteSearchOrdine || !marcaSearchOrdine || !modelloSearchOrdine) {
    await initOrdineSearchableSelects();
  } else {
    // Reset se già esistono
    clienteSearchOrdine.reset();
    marcaSearchOrdine.reset();
    modelloSearchOrdine.reset();
    await clienteSearchOrdine.loadData();
    await marcaSearchOrdine.loadData();
    await modelloSearchOrdine.loadData();
  }

  if (ordine) {
    title.textContent = "Modifica Preventivo";
    document.getElementById("ordineId").value = ordine.id;
    document.getElementById("ordineData").value = formatDateForInput(
      ordine.data_movimento,
    );
    document.getElementById("ordineNote").value = ordine.note || "";

    // Imposta valori nei searchable selects
    if (ordine.cliente_id && clienteSearchOrdine) {
      await clienteSearchOrdine.loadData();
      clienteSearchOrdine.setValue(ordine.cliente_id);
    }
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
      document.getElementById("ordineCliente").value = id;
    };
  }

  // 2. Inizializza Ricerca MARCA
  if (window.marcaSearchOrdine) {
    window.marcaSearchOrdine.onSelect = (id) => {
      document.getElementById("ordineMarca").value = id;
      // Quando cambi marca, filtra i modelli
      if (window.modelloSearchOrdine) {
        window.modelloSearchOrdine.setFilter((m) => m.marche_id == id);
      }
    };
  }

  // 3. Inizializza Ricerca MODELLO
  if (window.modelloSearchOrdine) {
    window.modelloSearchOrdine.onSelect = (id) => {
      document.getElementById("ordineModello").value = id;
    };
  }
}
// Funzioni per gestire i modali statici
function closeConfirmModal() {
  document.getElementById("confirmModal").classList.remove("active");
}

function closeAlertModal() {
  document.getElementById("alertModal").classList.remove("active");
}