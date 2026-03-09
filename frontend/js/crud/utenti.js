// ==================== UTENTI ====================
// File: js/utenti.js
// Dipende da: config.js, ui.js

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
    tbody.innerHTML = '<tr><td colspan="2" class="text-center">Nessun utente presente</td></tr>';
    return;
  }

  tbody.innerHTML = utenti.map((u) => `
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
  `).join("");
}

function openUtenteModal(utente = null) {
  const modal         = document.getElementById("modalUtente");
  const passwordInput = document.getElementById("utentePassword");
  const passwordLabel = document.getElementById("utentePasswordLabel");
  const passwordHelp  = document.getElementById("passwordHelp");

  document.getElementById("formUtente").reset();

  if (utente) {
    document.getElementById("modalUtenteTitle").textContent = "Modifica Utente";
    document.getElementById("utenteId").value   = utente.id;
    document.getElementById("utenteNome").value = utente.nome;
    passwordInput.removeAttribute("required");
    passwordInput.placeholder = "Lascia vuoto per non cambiare";
    if (passwordLabel) passwordLabel.textContent = "Password";
    if (passwordHelp)  passwordHelp.textContent  = "Lascia vuoto per mantenere la password attuale";
  } else {
    document.getElementById("modalUtenteTitle").textContent = "Nuovo Utente";
    document.getElementById("utenteId").value = "";
    passwordInput.setAttribute("required", "");
    passwordInput.placeholder = "password";
    if (passwordLabel) passwordLabel.textContent = "Password *";
    if (passwordHelp)  passwordHelp.textContent  = "Minimo 8 caratteri, una maiuscola, una minuscola e un numero";
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
  const conferma = await showConfirmModal("Sei sicuro di voler eliminare questo utente?", "Conferma Eliminazione");
  if (!conferma) return;

  try {
    const res  = await fetch(`${API_URL}/utenti/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      showNotification("Utente eliminato con successo!", "success");
      loadUtenti();
    } else {
      showNotification(data.error || "Errore durante l'eliminazione", "error");
    }
  } catch {
    showNotification("Errore di connessione", "error");
  }
}

// ---- Submit form ----

document.getElementById("formUtente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id       = document.getElementById("utenteId").value;
  const nome     = document.getElementById("utenteNome").value.trim();
  const password = document.getElementById("utentePassword").value;

  const method = id ? "PUT" : "POST";
  const url    = id ? `${API_URL}/utenti/${id}` : `${API_URL}/utenti`;

  const body = { nome };
  if (password) body.password = password;

  try {
    const res  = await fetch(url, {
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
  } catch {
    showNotification("Errore di connessione", "error");
  }
});
