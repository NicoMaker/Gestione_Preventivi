// ==================== PREVENTIVI: MODALE ====================
// File: js/crud/preventivi/modal.js
// Scopo: apertura/chiusura del modal preventivo, toggle stato contratto,
//        caricamento clienti per la select.
// Stato condiviso: allClienti (config.js), clienteSearchOrdine,
//                  marcaModelloSearchOrdine (searchable-select.js)

// ---- Toggle contratto nel modal ----
function toggleContrattoModal() {
  const hidden = document.getElementById("ordineContrattoFinito");
  const isNowFinito = hidden.value !== "1";
  setContrattoModalState(isNowFinito);
}

function setContrattoModalState(value) {
  const hidden = document.getElementById("ordineContrattoFinito");
  const inner = document.getElementById("contrattoToggleInner");
  const icon = document.getElementById("contrattoIcon");
  const label = document.getElementById("contrattoLabel");
  if (!hidden || !inner) return;

  hidden.value = value ? "1" : "0";
  if (value) {
    inner.classList.add("is-finito");
    icon.textContent = "✅";
    label.textContent = "concluso";
  } else {
    inner.classList.remove("is-finito");
    icon.textContent = "🔴";
    label.textContent = "Non concluso";
  }
}

// ---- Apertura / chiusura modal ----
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
    document.getElementById("modalOrdineTitle").textContent =
      "Modifica Preventivo";
    document.getElementById("ordineId").value = ordine.id;
    document.getElementById("ordineData").value = formatDateForInput(
      ordine.data_movimento,
    );
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
    document.getElementById("modalOrdineTitle").textContent =
      "Nuovo Preventivo";
    document.getElementById("ordineId").value = "";
    document.getElementById("ordineData").value = new Date()
      .toISOString()
      .split("T")[0];
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

// Esposizione globale (chiamate da onclick inline)
window.toggleContrattoModal = toggleContrattoModal;
window.setContrattoModalState = setContrattoModalState;
window.closeOrdineModal = closeOrdineModal;
