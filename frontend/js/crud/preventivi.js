// ==================== PREVENTIVI ====================
// File: js/preventivi.js
// Dipende da: config.js, ui.js, searchable-select.js

// ---- Caricamento ----

async function loadOrdini() {
  try {
    const res = await fetch(`${API_URL}/ordini`);
    allOrdini = await res.json();
    ordini    = allOrdini;
    restoreOrdiniFilter();
  } catch (error) {
    console.error("Errore caricamento preventivi:", error);
    showNotification("Errore caricamento preventivi", "error");
  }
}

// ---- Rendering tabella ----

function renderOrdini() {
  const tbody = document.getElementById("ordiniTableBody");

  if (ordini.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center">Nessun preventivo presente</td></tr>';
    return;
  }

  tbody.innerHTML = ordini.map((o) => {
    const telefono      = o.cliente_tel           || "No Cell";
    const email         = o.cliente_email         || "No Mail";
    const dataPassaggio = o.cliente_data_passaggio || "";
    const flagRicontatto= o.cliente_flag_ricontatto || 0;

    return `
      <tr>
        <td>${formatDate(o.data_movimento)}</td>
        <td><strong>${o.cliente_nome}</strong></td>
        <td>
          ${telefono !== "No Cell" ? `
            <div class="contact-buttons">
              <a href="tel:${telefono}" class="btn-contact btn-phone" title="Chiama ${formatPhoneNumber(telefono)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                ${formatPhoneNumber(telefono)}
              </a>
              <a href="https://wa.me/${telefono.replace(/[^0-9]/g, "")}" class="btn-contact btn-whatsapp" target="_blank" title="WhatsApp con ${o.cliente_nome}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
              <a href="sms:${telefono}" class="btn-contact btn-sms" title="SMS a ${o.cliente_nome}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Messaggio
              </a>
            </div>
          ` : "No Cell"}
        </td>
        <td>
          ${email !== "No Mail"
            ? `<a href="mailto:${email}" class="btn-contact btn-email" title="Email a ${email}">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                   <polyline points="22,6 12,13 2,6"/>
                 </svg>
                 ${email}
               </a>`
            : "No Mail"
          }
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
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <button class="badge-ricontatto ${flagRicontatto ? "si" : "no"}"
              onclick="updateClienteFlagRicontatto(${o.cliente_id}, ${!flagRicontatto})"
              title="Cambia stato ricontatto">
              ${flagRicontatto ? "📱 Ricontattato" : "⏳ Da ricontattare"}
            </button>
            <button class="badge-contratto ${o.contratto_finito ? "si" : "no"}"
              onclick="updateContrattoFinito(${o.id}, ${!o.contratto_finito})"
              title="Cambia stato contratto">
              ${o.contratto_finito ? "✅ concluso" : "🔴 Non concluso"}
            </button>
          </div>
        </td>
        <td>${o.marca_nome   || "-"}</td>
        <td>${o.modello_nome || "-"}</td>
        <td>${o.note         || "-"}</td>
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
  }).join("");
}

// ---- Aggiornamenti inline ----

async function updateClienteDataPassaggio(clienteId, newDate) {
  try {
    const response = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_passaggio: newDate }),
    });
    if (!response.ok) throw new Error("Errore aggiornamento data passaggio");
    showNotification("Data passaggio aggiornata", "success");
    await loadOrdini();
  } catch {
    showNotification("Errore aggiornamento data passaggio", "error");
    await loadOrdini();
  }
}

async function updateClienteFlagRicontatto(clienteId, checked) {
  try {
    const response = await fetch(`${API_URL}/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag_ricontatto: checked }),
    });
    if (!response.ok) throw new Error("Errore aggiornamento flag ricontatto");

    [allOrdini, ordini].forEach((arr) =>
      arr.filter((x) => x.cliente_id === clienteId)
         .forEach((x) => { x.cliente_flag_ricontatto = checked ? 1 : 0; })
    );

    showNotification(checked ? "📱 Cliente segnato come ricontattato" : "⏳ Flag ricontatto rimosso", "success");
    renderOrdini();
  } catch {
    showNotification("Errore aggiornamento flag ricontatto", "error");
    await loadOrdini();
  }
}

async function updateContrattoFinito(ordineId, newValue) {
  try {
    const ordine = allOrdini.find((o) => o.id === ordineId);
    if (!ordine) { showNotification("Preventivo non trovato", "error"); return; }

    const response = await fetch(`${API_URL}/ordini/${ordineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id:     ordine.cliente_id,
        data_movimento: ordine.data_movimento,
        marca_id:       ordine.marca_id   || null,
        modello_id:     ordine.modello_id || null,
        note:           ordine.note       || null,
        contratto_finito: newValue,
      }),
    });
    if (!response.ok) throw new Error("Errore aggiornamento contratto finito");

    [allOrdini, ordini].forEach((arr) => {
      const o = arr.find((x) => x.id === ordineId);
      if (o) o.contratto_finito = newValue ? 1 : 0;
    });

    showNotification(newValue ? "✅ Contratto concluso!" : "🔴 Contratto non concluso", "success");
    renderOrdini();
  } catch {
    showNotification("Errore aggiornamento contratto finito", "error");
    await loadOrdini();
  }
}

// ---- Toggle contratto nel modal ----

function toggleContrattoModal() {
  const hidden = document.getElementById("ordineContrattoFinito");
  const isNowFinito = hidden.value !== "1";
  setContrattoModalState(isNowFinito);
}

function setContrattoModalState(value) {
  const hidden = document.getElementById("ordineContrattoFinito");
  const inner  = document.getElementById("contrattoToggleInner");
  const icon   = document.getElementById("contrattoIcon");
  const label  = document.getElementById("contrattoLabel");
  if (!hidden || !inner) return;

  hidden.value = value ? "1" : "0";
  if (value) {
    inner.classList.add("is-finito");
    icon.textContent  = "✅";
    label.textContent = "concluso";
  } else {
    inner.classList.remove("is-finito");
    icon.textContent  = "🔴";
    label.textContent = "Non concluso";
  }
}

// ---- Filtri ----

function saveOrdiniFilter() {
  localStorage.setItem("filter_ordini_search",          document.getElementById("filterOrdini")?.value || "");
  localStorage.setItem("filter_ordini_data_passaggio",  document.getElementById("filterOrdiniDataPassaggio")?.value || "");
  localStorage.setItem("filter_ordini_data_preventivo", document.getElementById("filterOrdiniDataPreventivo")?.value || "");
}

function restoreOrdiniFilter() {
  const savedSearch          = localStorage.getItem("filter_ordini_search")          || "";
  const savedDataPassaggio   = localStorage.getItem("filter_ordini_data_passaggio")  || "";
  const savedDataPreventivo  = localStorage.getItem("filter_ordini_data_preventivo") || "";

  const si = document.getElementById("filterOrdini");
  const sp = document.getElementById("filterOrdiniDataPassaggio");
  const sd = document.getElementById("filterOrdiniDataPreventivo");

  if (si) si.value = savedSearch;
  if (sp) sp.value = savedDataPassaggio;
  if (sd) sd.value = savedDataPreventivo;

  applyOrdiniFilter(savedSearch.toLowerCase(), savedDataPassaggio, savedDataPreventivo);
}

function applyOrdiniFilter(searchTerm = "", dataPassaggio = "", dataPreventivo = "") {
  ordini = allOrdini.filter((o) => {
    const matchText = !searchTerm ||
      o.cliente_nome.toLowerCase().includes(searchTerm) ||
      (o.cliente_tel   && o.cliente_tel.toLowerCase().includes(searchTerm)) ||
      (o.cliente_email && o.cliente_email.toLowerCase().includes(searchTerm)) ||
      (o.marca_nome    && o.marca_nome.toLowerCase().includes(searchTerm))   ||
      (o.modello_nome  && o.modello_nome.toLowerCase().includes(searchTerm));

    const matchDataPassaggio  = !dataPassaggio  || (o.cliente_data_passaggio && o.cliente_data_passaggio === dataPassaggio);
    const matchDataPreventivo = !dataPreventivo || (o.data_movimento && o.data_movimento.startsWith(dataPreventivo));

    return matchText && matchDataPassaggio && matchDataPreventivo;
  });
  renderOrdini();
}

function getOrdiniFilterValues() {
  return {
    searchTerm:    document.getElementById("filterOrdini")?.value.toLowerCase() || "",
    dataPassaggio: document.getElementById("filterOrdiniDataPassaggio")?.value  || "",
    dataPreventivo:document.getElementById("filterOrdiniDataPreventivo")?.value || "",
  };
}

document.getElementById("filterOrdini")?.addEventListener("input", () => {
  const { searchTerm, dataPassaggio, dataPreventivo } = getOrdiniFilterValues();
  saveOrdiniFilter();
  applyOrdiniFilter(searchTerm, dataPassaggio, dataPreventivo);
});
document.getElementById("filterOrdiniDataPassaggio")?.addEventListener("change", () => {
  const { searchTerm, dataPassaggio, dataPreventivo } = getOrdiniFilterValues();
  saveOrdiniFilter();
  applyOrdiniFilter(searchTerm, dataPassaggio, dataPreventivo);
});
document.getElementById("filterOrdiniDataPreventivo")?.addEventListener("change", () => {
  const { searchTerm, dataPassaggio, dataPreventivo } = getOrdiniFilterValues();
  saveOrdiniFilter();
  applyOrdiniFilter(searchTerm, dataPassaggio, dataPreventivo);
});

// ---- Modal ----

window.openOrdineModal = async function (ordine = null) {
  await loadClientiForSelect();

  const modal = document.getElementById("modalOrdine");
  document.getElementById("formOrdine").reset();
  setContrattoModalState(false);

  if (!clienteSearchOrdine || !marcaModelloSearchOrdine) {
    await initOrdineSearchableSelects();
  } else {
    clienteSearchOrdine.reset();
    marcaModelloSearchOrdine.reset();
    await clienteSearchOrdine.loadData();
    await marcaModelloSearchOrdine.loadData();
  }

  if (ordine) {
    document.getElementById("modalOrdineTitle").textContent = "Modifica Preventivo";
    document.getElementById("ordineId").value   = ordine.id;
    document.getElementById("ordineData").value = formatDateForInput(ordine.data_movimento);
    document.getElementById("ordineNote").value = ordine.note || "";
    setContrattoModalState(ordine.contratto_finito == 1);

    if (ordine.cliente_id && clienteSearchOrdine) {
      await clienteSearchOrdine.loadData();
      clienteSearchOrdine.setValue(ordine.cliente_id);
    }
    if (ordine.modello_id && marcaModelloSearchOrdine) {
      await marcaModelloSearchOrdine.loadData();
      marcaModelloSearchOrdine.setValue(ordine.modello_id);
      if (ordine.marca_id) {
        const marcaHidden = document.getElementById("ordineMarca");
        if (marcaHidden) marcaHidden.value = ordine.marca_id;
      }
    }
  } else {
    document.getElementById("modalOrdineTitle").textContent = "Nuovo Preventivo";
    document.getElementById("ordineId").value   = "";
    document.getElementById("ordineData").value = new Date().toISOString().split("T")[0];
  }

  modal.classList.add("active");
};

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

function editOrdine(id) {
  const ordine = ordini.find((o) => o.id === id);
  if (ordine) openOrdineModal(ordine);
}

async function deleteOrdine(id) {
  const conferma = await showConfirmModal("Sei sicuro di voler eliminare questo preventivo?", "Conferma Eliminazione");
  if (!conferma) return;

  try {
    const res  = await fetch(`${API_URL}/ordini/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      showNotification("Preventivo eliminato con successo!", "success");
      loadOrdini();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----

document.getElementById("formOrdine").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id              = document.getElementById("ordineId").value;
  const cliente_id      = document.getElementById("ordineCliente").value;
  const data_movimento  = document.getElementById("ordineData").value;
  const marca_id        = document.getElementById("ordineMarca").value   || null;
  const modello_id      = document.getElementById("ordineModello").value || null;
  const note            = document.getElementById("ordineNote").value.trim();
  const contratto_finito= document.getElementById("ordineContrattoFinito").value === "1";

  if (!cliente_id) {
    showNotification("Seleziona un cliente dalla lista", "warning");
    return;
  }

  if (modello_id && Array.isArray(allModelli) && allModelli.length > 0) {
    const modello = allModelli.find((m) => String(m.id) === String(modello_id));
    if (modello && marca_id && modello.marche_id && String(modello.marche_id) !== String(marca_id)) {
      showNotification("Il modello selezionato non appartiene alla marca indicata.", "error");
      return;
    }
  }

  const method = id ? "PUT" : "POST";
  const url    = id ? `${API_URL}/ordini/${id}` : `${API_URL}/ordini`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id,
        data_movimento: data_movimento ? new Date(data_movimento).toISOString() : new Date().toISOString(),
        marca_id,
        modello_id,
        note,
        contratto_finito,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      showNotification(id ? "Preventivo aggiornato!" : "Preventivo creato!", "success");
      closeOrdineModal();
      loadOrdini();
    } else {
      showNotification(data.error || "Errore durante il salvataggio", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
});
