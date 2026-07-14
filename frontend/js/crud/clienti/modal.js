// ==================== CLIENTI: MODALE ====================
// File: js/crud/clienti/modal.js
// Scopo: apertura/chiusura modal cliente, toggle stato ricontatto, edit.
// Stato condiviso: clienti (config.js)

function openClienteModal(cliente = null) {
  const modal = document.getElementById("modalCliente");
  document.getElementById("formCliente").reset();

  if (cliente) {
    document.getElementById("modalClienteTitle").textContent =
      "Modifica Cliente";
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("clienteNome").value = cliente.nome;
    document.getElementById("clienteTel").value = cliente.num_tel || "";
    document.getElementById("clienteEmail").value = cliente.email || "";
    document.getElementById("clienteDataPassaggio").value =
      cliente.data_passaggio || "";
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

// Esposizione globale (chiamate da onclick inline)
window.openClienteModal = openClienteModal;
window.closeClienteModal = closeClienteModal;
window.setRicontattoModalState = setRicontattoModalState;
window.toggleRicontattoModal = toggleRicontattoModal;
window.editCliente = editCliente;
