// ==================== UI: DIALOG (CONFIRM / ALERT) ====================
// File: js/ui/dialogs.js
// Scopo: modali confirm/alert + override di window.alert/confirm + escapeHtml.
// Consolidamento: rispetta ESATTAMENTE le versioni attive nell'originale.
//   - showConfirmModal: versione DINAMICA (crea il modal al volo)  ← da ui.js
//   - closeConfirmModal / closeAlertModal: versioni semplici        ← da ui.js
//   - showAlertModal / escapeHtml: versione statica su #alertModal   ← da realtime.js

// escapeHtml usato anche da altri moduli
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── CONFIRM (dinamico: crea il modal al volo) ─────────────────
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
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}

// Chiude il modal di conferma statico (se presente nell'HTML)
function closeConfirmModal() {
  document.getElementById("confirmModal")?.classList.remove("active");
}

// Chiude il modal alert statico
function closeAlertModal() {
  const modal = document.getElementById("alertModal");
  if (!modal) return;
  modal.classList.remove("active", "show");
  if (window.alertModalBackdropHandler) {
    modal.removeEventListener("click", window.alertModalBackdropHandler);
    delete window.alertModalBackdropHandler;
  }
}

// ── ALERT (statico su #alertModal) ────────────────────────────
function showAlertModal(message, title = "Informazione", type = "info") {
  const modal = document.getElementById("alertModal");
  const titleEl = document.getElementById("alertModalTitle");
  const messageEl = document.getElementById("alertMessage");
  const iconEl = document.getElementById("alertIcon");

  titleEl.textContent = title;

  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  };
  iconEl.className = `alert-icon ${type in icons ? type : "info"}`;
  iconEl.innerHTML = icons[type] || icons.info;

  if (message.includes("\n") || message.length > 200) {
    const lines = message.split("\n");
    let formatted = "";
    lines.forEach((line) => {
      const t = line.trim();
      if (t.startsWith("━━")) {
        formatted += `<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border);">`;
      } else if (t.startsWith("✅") || t.startsWith("⚠️") || t.startsWith("❌")) {
        formatted += `<div style="margin: 8px 0; font-weight: 600;">${escapeHtml(line)}</div>`;
      } else if (t.startsWith("•") || t.startsWith("-")) {
        formatted += `<div style="margin: 4px 0; padding-left: 16px;">${escapeHtml(line)}</div>`;
      } else if (t === "") {
        formatted += "<br>";
      } else {
        formatted += `<div style="margin: 4px 0;">${escapeHtml(line)}</div>`;
      }
    });
    messageEl.innerHTML = formatted;
  } else {
    messageEl.textContent = message;
  }

  modal.classList.add("active", "show");

  const okBtn = document.getElementById("alertModalOkBtn");
  if (okBtn)
    okBtn.onclick = (e) => {
      e.stopPropagation();
      closeAlertModal();
    };

  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn)
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeAlertModal();
    };

  const handleBackdropClick = (e) => {
    if (e.target === modal) closeAlertModal();
  };
  modal.addEventListener("click", handleBackdropClick);
  window.alertModalBackdropHandler = handleBackdropClick;

  const modalContent = modal.querySelector(".modal-content");
  if (modalContent)
    modalContent.addEventListener("click", (e) => e.stopPropagation());
}

// ── Override window.alert / window.confirm ────────────────────
window.alert = function (message) {
  let type = "info";
  let title = "Informazione";
  const msgLower = String(message).toLowerCase();

  if (
    message.includes("✅") ||
    msgLower.includes("successo") ||
    msgLower.includes("creato") ||
    msgLower.includes("aggiornato") ||
    msgLower.includes("registrato") ||
    msgLower.includes("salvato")
  ) {
    type = "success";
    title = "Successo";
  } else if (
    message.includes("❌") ||
    msgLower.includes("errore") ||
    msgLower.includes("error")
  ) {
    type = "error";
    title = "Errore";
  } else if (
    message.includes("⚠️") ||
    msgLower.includes("attenzione") ||
    msgLower.includes("warning") ||
    msgLower.includes("compila") ||
    msgLower.includes("obbligatorio") ||
    msgLower.includes("seleziona")
  ) {
    type = "warning";
    title = "Attenzione";
  }

  showAlertModal(message, title, type);
};

window.confirm = function (message) {
  return showConfirmModal(message, "Conferma eliminazione");
};

// Esposizione globale
window.escapeHtml = escapeHtml;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.showAlertModal = showAlertModal;
window.closeAlertModal = closeAlertModal;
