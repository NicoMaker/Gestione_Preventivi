// ==================== CLIENTI: DATA / CRUD ====================
// File: js/crud/clienti/data.js
// Scopo: caricamento, toggle ricontatto, aggiornamento data passaggio,
//        eliminazione e submit del form.
// Stato condiviso: clienti, allClienti (config.js)

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
        isChecked
          ? "📱 Cliente segnato come ricontattato"
          : "⏳ Flag ricontatto rimosso",
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

// Aggiornamento inline data passaggio (stile preventivi)
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
      showNotification(
        newDate ? "Data passaggio aggiornata" : "Data passaggio rimossa",
        "success",
      );
    } else {
      showNotification(data.error || "Errore durante l'aggiornamento", "error");
      await loadClienti();
    }
  } catch {
    showNotification("Errore di connessione", "error");
    await loadClienti();
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
      body: JSON.stringify({
        nome,
        num_tel,
        email,
        data_passaggio,
        flag_ricontatto,
        note,
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
  } catch {
    showNotification("Errore di connessione", "error");
  }
});

// Esposizione globale (chiamate da onclick inline e altri moduli)
window.loadClienti = loadClienti;
window.toggleRicontatto = toggleRicontatto;
window.updateDataPassaggio = updateDataPassaggio;
window.deleteCliente = deleteCliente;
