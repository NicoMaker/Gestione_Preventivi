// ==================== PREVENTIVI: DATA / CRUD ====================
// File: js/crud/preventivi/data.js
// Scopo: caricamento, eliminazione, aggiornamenti inline (data passaggio,
//        flag ricontatto, contratto finito) e submit del form.
// Stato condiviso: ordini, allOrdini, allModelli (config.js)

// ---- Caricamento ----
async function loadOrdini() {
  try {
    const res = await fetch(`${API_URL}/ordini`);
    allOrdini = await res.json();
    ordini = allOrdini;
    restoreOrdiniFilter();
  } catch (error) {
    console.error("Errore caricamento preventivi:", error);
    showNotification("Errore caricamento preventivi", "error");
  }
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
      arr
        .filter((x) => x.cliente_id === clienteId)
        .forEach((x) => {
          x.cliente_flag_ricontatto = checked ? 1 : 0;
        }),
    );

    showNotification(
      checked
        ? "📱 Cliente segnato come ricontattato"
        : "⏳ Flag ricontatto rimosso",
      "success",
    );
    renderOrdini();
  } catch {
    showNotification("Errore aggiornamento flag ricontatto", "error");
    await loadOrdini();
  }
}

async function updateContrattoFinito(ordineId, newValue) {
  try {
    const ordine = allOrdini.find((o) => o.id === ordineId);
    if (!ordine) {
      showNotification("Preventivo non trovato", "error");
      return;
    }

    const response = await fetch(`${API_URL}/ordini/${ordineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente_id: ordine.cliente_id,
        data_movimento: ordine.data_movimento,
        marca_id: ordine.marca_id || null,
        modello_id: ordine.modello_id || null,
        note: ordine.note || null,
        contratto_finito: newValue,
      }),
    });
    if (!response.ok) throw new Error("Errore aggiornamento contratto finito");

    [allOrdini, ordini].forEach((arr) => {
      const o = arr.find((x) => x.id === ordineId);
      if (o) o.contratto_finito = newValue ? 1 : 0;
    });

    showNotification(
      newValue ? "✅ Contratto concluso!" : "🔴 Contratto non concluso",
      "success",
    );
    renderOrdini();
  } catch {
    showNotification("Errore aggiornamento contratto finito", "error");
    await loadOrdini();
  }
}

// ---- Modifica / eliminazione ----
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
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----
document.getElementById("formOrdine").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("ordineId").value;
  const cliente_id = document.getElementById("ordineCliente").value;
  const data_movimento = document.getElementById("ordineData").value;
  const marca_id = document.getElementById("ordineMarca").value || null;
  const modello_id = document.getElementById("ordineModello").value || null;
  const note = document.getElementById("ordineNote").value.trim();
  const contratto_finito =
    document.getElementById("ordineContrattoFinito").value === "1";

  if (!cliente_id) {
    showNotification("Seleziona un cliente dalla lista", "warning");
    return;
  }

  if (modello_id && Array.isArray(allModelli) && allModelli.length > 0) {
    const modello = allModelli.find((m) => String(m.id) === String(modello_id));
    if (
      modello &&
      marca_id &&
      modello.marche_id &&
      String(modello.marche_id) !== String(marca_id)
    ) {
      showNotification(
        "Il modello selezionato non appartiene alla marca indicata.",
        "error",
      );
      return;
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
        contratto_finito,
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
  } catch {
    showNotification("Errore di connessione", "error");
  }
});

// Esposizione globale (chiamate da onclick inline e altri moduli)
window.loadOrdini = loadOrdini;
window.updateClienteDataPassaggio = updateClienteDataPassaggio;
window.updateClienteFlagRicontatto = updateClienteFlagRicontatto;
window.updateContrattoFinito = updateContrattoFinito;
window.editOrdine = editOrdine;
window.deleteOrdine = deleteOrdine;
