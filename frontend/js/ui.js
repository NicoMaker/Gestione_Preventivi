// ==================== UI / NOTIFICHE / MODALI GENERICI ====================
// File: js/ui.js
// Dipende da: config.js

/**
 * Mostra una notifica toast nell'angolo dello schermo.
 * @param {string} message  - Testo del messaggio
 * @param {string} type     - "success" | "error" | "warning" | "info"
 * @param {number} duration - Millisecondi prima che scompaia
 */
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = message;

  container.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Mostra un modal di conferma dinamico (non usa il #confirmModal statico).
 * @param {string} message - Domanda da porre all'utente
 * @param {string} title   - Titolo del modal
 * @returns {Promise<boolean>}
 */
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
          <button type="button" class="btn-cancel"
            style="padding: 10px 24px; border: 2px solid #e2e8f0; background: white;
                   color: #64748b; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Annulla
          </button>
          <button type="button" class="btn-confirm"
            style="padding: 10px 24px; border: none; background: #ef4444;
                   color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Conferma
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".btn-cancel").addEventListener("click", () => {
      modal.remove();
      resolve(false);
    });
    modal.querySelector(".btn-confirm").addEventListener("click", () => {
      modal.remove();
      resolve(true);
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) { modal.remove(); resolve(false); }
    });
  });
}

// Chiude il modal di conferma statico (se presente nell'HTML)
function closeConfirmModal() {
  document.getElementById("confirmModal")?.classList.remove("active");
}

// Chiude il modal alert statico (se presente nell'HTML)
function closeAlertModal() {
  document.getElementById("alertModal")?.classList.remove("active");
}
