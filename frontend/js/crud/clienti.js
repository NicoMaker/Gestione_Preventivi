// ==================== CLIENTI ====================
// File: js/crud/clienti.js
// Dipende da: config.js, ui.js

// ---- Caricamento ----

async function loadClienti() {
  try {
    const res = await fetch(`${API_URL}/clienti`);
    allClienti = await res.json();
    clienti = allClienti;
    restoreClientiFilters();
  } catch (error) {
    console.error("Errore caricamento clienti:", error);
    showNotification("Errore caricamento clienti", "error");
  }
}

// ---- Rendering tabella ----

function renderClienti() {
  const tbody = document.getElementById("clientiTableBody");

  if (clienti.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">
          <div style="padding:40px 20px;color:var(--text-secondary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 style="width:48px;height:48px;margin:0 auto 16px;display:block;opacity:0.5;">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style="font-size:16px;font-weight:600;margin-bottom:8px;">Nessun cliente presente</p>
            <p style="font-size:14px;">Clicca su <strong>Nuovo Cliente</strong> per iniziare</p>
          </div>
        </td></tr>`;
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
            <a href="tel:${c.num_tel}" class="btn-contact btn-phone" title="Chiama ${formatPhoneNumber(c.num_tel)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              ${formatPhoneNumber(c.num_tel)}
            </a>
            <a href="https://wa.me/${c.num_tel.replace(/[^0-9]/g, "")}" class="btn-contact btn-whatsapp" target="_blank" title="WhatsApp con ${c.nome}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
            <a href="sms:${c.num_tel}" class="btn-contact btn-sms" title="SMS a ${c.nome}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Messaggio
            </a>
          </div>
        `
            : "No Cell"
        }
      </td>
      <td>
        ${
          c.email
            ? `<a href="mailto:${c.email}" class="btn-contact btn-email" title="Email a ${c.email}">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                 <polyline points="22,6 12,13 2,6" />
               </svg>
               ${c.email}
             </a>`
            : "No Mail"
        }
      </td>
      <td style="position: relative;">
        <div class="editable-date-cell" onclick="toggleDateEdit(${c.id}, '${c.data_passaggio || ""}', event)">
          <span class="date-display">${c.data_passaggio ? formatDate(c.data_passaggio) : "No"}</span>
          <svg class="edit-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="width:14px;height:14px;margin-left:6px;opacity:0.5;">
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
          style="display:none;width:100%;padding:4px;border:2px solid #6366f1;border-radius:4px;"
        />
      </td>
      <td style="text-align:center;">
        <button class="badge-ricontatto ${c.flag_ricontatto ? "si" : "no"}"
          onclick="toggleRicontatto(${c.id}, ${!c.flag_ricontatto})"
          title="Cambia stato ricontatto">
          ${c.flag_ricontatto ? "📱 Ricontattato" : "⏳ Da ricontattare"}
        </button>
      </td>
      <td style="min-width:220px;max-width:320px;">
        ${c.note
          ? `<span title="${c.note.replace(/"/g, '&quot;')}" style="font-size:13px;color:#334155;font-weight:500;display:block;white-space:pre-wrap;line-height:1.5;">${c.note}</span>`
          : `<span style="font-size:13px;color:#94a3b8;">-</span>`}
      </td>
      <td style="text-align:center;">
        <span class="prodotti-badge ${c.ordini_count > 0 ? "has-products" : "empty"}">
          ${c.ordini_count || 0}
        </span>
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

// ---- Filtri ----

function saveClientiFilters() {
  localStorage.setItem(
    "filter_clienti_search",
    document.getElementById("filterClienti")?.value || "",
  );
  localStorage.setItem(
    "filter_clienti_data",
    document.getElementById("filterDataPassaggio")?.value || "",
  );
  localStorage.setItem(
    "filter_clienti_ricontattato",
    document.getElementById("filterClientiRicontattato")?.value || "tutti",
  );
}

function restoreClientiFilters() {
  const savedSearch = localStorage.getItem("filter_clienti_search") || "";
  const savedData = localStorage.getItem("filter_clienti_data") || "";
  const savedRicontattato = localStorage.getItem("filter_clienti_ricontattato") || "tutti";

  const searchInput = document.getElementById("filterClienti");
  const dataInput = document.getElementById("filterDataPassaggio");
  const ricontattoSelect = document.getElementById("filterClientiRicontattato");

  if (searchInput) searchInput.value = savedSearch;
  if (dataInput) dataInput.value = savedData;
  if (ricontattoSelect) ricontattoSelect.value = savedRicontattato;

  applyClientiFilters();
}

function applyClientiFilters() {
  const searchTerm =
    document.getElementById("filterClienti")?.value.toLowerCase() || "";
  const dataPassaggio =
    document.getElementById("filterDataPassaggio")?.value || "";
  const ricontattoVal =
    document.getElementById("filterClientiRicontattato")?.value || "tutti";

  clienti = allClienti.filter((c) => {
    const matchesText =
      !searchTerm ||
      c.nome.toLowerCase().includes(searchTerm) ||
      (c.num_tel && c.num_tel.toLowerCase().includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.data_passaggio && c.data_passaggio.includes(searchTerm)) ||
      (c.note && c.note.toLowerCase().includes(searchTerm));

    const matchesData =
      !dataPassaggio ||
      (c.data_passaggio && c.data_passaggio.startsWith(dataPassaggio));

    const matchesRicontattato =
      ricontattoVal === "tutti" ||
      (ricontattoVal === "si" && c.flag_ricontatto == 1) ||
      (ricontattoVal === "no" && !c.flag_ricontatto);

    return matchesText && matchesData && matchesRicontattato;
  });

  renderClienti();
}

document.getElementById("filterClienti")?.addEventListener("input", () => {
  saveClientiFilters();
  applyClientiFilters();
});
document.getElementById("filterDataPassaggio")?.addEventListener("change", () => {
  saveClientiFilters();
  applyClientiFilters();
});
document.getElementById("filterClientiRicontattato")?.addEventListener("change", () => {
  saveClientiFilters();
  applyClientiFilters();
});

// ---- Reset Filtri ----

function resetClientiFilters() {
  document.getElementById("filterDataPassaggio").value = "";
  document.getElementById("filterClientiRicontattato").value = "tutti";
  localStorage.removeItem("filter_clienti_data");
  localStorage.removeItem("filter_clienti_ricontattato");
  applyClientiFilters();
}

// ---- Modal ----

function openClienteModal(cliente = null) {
  const modal = document.getElementById("modalCliente");
  document.getElementById("formCliente").reset();

  if (cliente) {
    document.getElementById("modalClienteTitle").textContent = "Modifica Cliente";
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("clienteNome").value = cliente.nome;
    document.getElementById("clienteTel").value = cliente.num_tel || "";
    document.getElementById("clienteEmail").value = cliente.email || "";
    document.getElementById("clienteDataPassaggio").value = cliente.data_passaggio || "";
    document.getElementById("clienteNote").value = cliente.note || "";
    setRicontattoModalState(cliente.flag_ricontatto == 1);
  } else {
    document.getElementById("modalClienteTitle").textContent = "Nuovo Cliente";
    document.getElementById("clienteId").value = "";
    document.getElementById("clienteDataPassaggio").value = "";
    document.getElementById("clienteNote").value = "";
    setRicontattoModalState(false);
  }

  modal.classList.add("active");
}

function closeClienteModal() {
  document.getElementById("modalCliente").classList.remove("active");
}

function setRicontattoModalState(isRicontattato) {
  const hiddenInput = document.getElementById("clienteFlagRicontatto");
  const btn = document.getElementById("btnToggleRicontattoModal");
  if (!hiddenInput || !btn) return;

  hiddenInput.value = isRicontattato ? "1" : "0";
  if (isRicontattato) {
    btn.textContent = "📱 Ricontattato";
    btn.classList.replace("no", "si");
  } else {
    btn.textContent = "⏳ Da ricontattare";
    btn.classList.replace("si", "no");
  }
}

function toggleRicontattoModal() {
  const hiddenInput = document.getElementById("clienteFlagRicontatto");
  if (!hiddenInput) return;
  setRicontattoModalState(hiddenInput.value !== "1");
}

function editCliente(id) {
  const cliente = clienti.find((c) => c.id === id);
  if (cliente) openClienteModal(cliente);
}

// ---- Azioni API ----

async function toggleRicontatto(clienteId, isChecked) {
  try {
    const res = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag_ricontatto: isChecked }),
    });
    const data = await res.json();

    if (res.ok) {
      [allClienti, clienti].forEach((arr) => {
        const c = arr.find((x) => x.id === clienteId);
        if (c) c.flag_ricontatto = isChecked ? 1 : 0;
      });
      showNotification(
        isChecked ? "📱 Cliente segnato come ricontattato" : "⏳ Flag ricontatto rimosso",
        "success",
      );
      renderClienti();
    } else {
      showNotification(data.error || "Errore durante l'aggiornamento", "error");
      renderClienti();
    }
  } catch {
    showNotification("Errore di connessione", "error");
    renderClienti();
  }
}

// ---- Editing inline data passaggio ----

function toggleDateEdit(clienteId, currentDate, event) {
  event.stopPropagation();

  document.querySelectorAll(".inline-date-input").forEach((input) => {
    input.style.display = "none";
    const cell = input.closest("td")?.querySelector(".editable-date-cell");
    if (cell) cell.style.display = "flex";
  });

  const dateInput = document.getElementById(`dateInput_${clienteId}`);
  const dateCell = dateInput?.previousElementSibling;

  if (dateInput && dateCell) {
    dateCell.style.display = "none";
    dateInput.style.display = "block";
    dateInput.setAttribute("data-original-value", dateInput.value);
    setTimeout(() => {
      dateInput.focus();
      try { dateInput.showPicker(); } catch (e) { /* non supportato */ }
    }, 50);
  }
}

function handleDateKeydown(event, clienteId) {
  if (event.key === "Escape") {
    const dateInput = document.getElementById(`dateInput_${clienteId}`);
    if (dateInput) {
      dateInput.value = dateInput.getAttribute("data-original-value") || "";
      cancelDateEdit(clienteId);
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById(`dateInput_${clienteId}`)?.blur();
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

  if (newValue !== originalValue) {
    updateDataPassaggio(clienteId, newValue);
  } else {
    cancelDateEdit(clienteId);
  }
}

async function updateDataPassaggio(clienteId, newDate) {
  try {
    const res = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_passaggio: newDate || null }),
    });
    const data = await res.json();

    if (res.ok) {
      [allClienti, clienti].forEach((arr) => {
        const c = arr.find((x) => x.id === clienteId);
        if (c) c.data_passaggio = newDate || null;
      });

      const dateInput = document.getElementById(`dateInput_${clienteId}`);
      const dateCell = dateInput?.previousElementSibling;
      if (dateCell) {
        const span = dateCell.querySelector(".date-display");
        if (span) span.textContent = newDate ? formatDate(newDate) : "-";
      }

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
  } catch {
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
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----

document.getElementById("formCliente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("clienteId").value;
  const nome = document.getElementById("clienteNome").value.trim();
  const num_tel = document.getElementById("clienteTel").value.trim();
  const email = document.getElementById("clienteEmail").value.trim();
  const data_passaggio = document.getElementById("clienteDataPassaggio").value;
  const flag_ricontatto =
    document.getElementById("clienteFlagRicontatto").value === "1";
  const note = document.getElementById("clienteNote").value.trim();

  if (!num_tel && !email) {
    showNotification("Inserire almeno un contatto: cellulare o email", "error");
    return;
  }

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/clienti/${id}` : `${API_URL}/clienti`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, num_tel, email, data_passaggio, flag_ricontatto, note }),
    });
    const data = await res.json();

    if (res.ok) {
      showNotification(id ? "Cliente aggiornato!" : "Cliente creato!", "success");
      closeClienteModal();
      loadClienti();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
});